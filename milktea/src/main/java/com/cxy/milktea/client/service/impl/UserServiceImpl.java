package com.cxy.milktea.client.service.impl;

import com.cxy.milktea.client.dto.*;
import com.cxy.milktea.client.service.UserService;
import com.cxy.milktea.common.entity.*;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.*;
import com.cxy.milktea.common.response.JwtResponse;
import com.cxy.milktea.common.util.JwtTokenProvider;
import com.cxy.milktea.client.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cxy.milktea.admin.dto.MemberLevelDTO;
import com.cxy.milktea.admin.dto.PointRuleDTO;
import com.cxy.milktea.admin.service.MemberLevelService;
import com.cxy.milktea.client.dto.UserInfoDTO;
import com.cxy.milktea.common.entity.Checkin;
import com.cxy.milktea.common.repository.CheckinRepository;
import com.cxy.milktea.admin.service.PointRuleService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.util.Optional;
import java.util.ArrayList;

@Service("clientUserServiceImpl")
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final PointRecordRepository pointRecordRepository;
    private final CouponRepository couponRepository;
    private final UserCouponRepository userCouponRepository;
    private final com.cxy.milktea.common.repository.OrderRepository orderRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final CheckinRepository checkinRepository;
    private final MemberLevelService memberLevelService;
    private final PointRuleService pointRuleService;

    @Override
    @Transactional
    public UserDTO register(RegisterRequest request) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(400, "用户名已存在");
        }
        
        // 检查手机号是否已存在
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException(400, "手机号已被注册");
        }
        
        // 创建新用户
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .gender(request.getGender())
                .build();
        
        User savedUser = userRepository.save(user);
        
        return convertToDto(savedUser);
    }

    @Override
    public JwtResponse login(LoginRequest request) {
        try {
            // 直接使用UserDetailsService加载用户，避免使用AuthenticationManager
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            
            // 手动验证密码
            if (!passwordEncoder.matches(request.getPassword(), userDetails.getPassword())) {
                throw new BadCredentialsException("密码不正确");
            }
            
            // 创建认证对象
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        
            // 设置安全上下文
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
            // 生成JWT令牌
        String jwt = tokenProvider.generateToken(authentication);
        
            // 获取用户信息
            User user = (User) userDetails;
        
        return JwtResponse.builder()
                .token(jwt)
                .user(convertToDto(user))
                .build();
        } catch (UsernameNotFoundException e) {
            throw new BadCredentialsException("用户名或密码不正确");
        }
    }

    @Override
    public UserDTO getCurrentUser() {
        User user = getCurrentUserEntity();
        return convertToDto(user);
    }

    @Override
    @Transactional
    public UserDTO updateUserInfo(UpdateUserRequest request) {
        User user = getCurrentUserEntity();
        
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        
        if (request.getBirthday() != null) {
            user.setBirthday(request.getBirthday());
        }
        
        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            // 检查手机号是否已被其他用户使用
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new BusinessException(400, "手机号已被注册");
            }
            user.setPhone(request.getPhone());
        }
        
        User updatedUser = userRepository.save(user);
        
        return convertToDto(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUserEntity();
        
        // 验证旧密码是否正确
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException(400, "旧密码不正确");
        }
        
        // 检查新旧密码是否相同
        if (request.getOldPassword().equals(request.getNewPassword())) {
            throw new BusinessException(400, "新密码不能与旧密码相同");
        }
        
        // 更新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public Integer getUserPoints() {
        User user = getCurrentUserEntity();
        return user.getTotalPoints();
    }
    
    @Override
    public com.cxy.milktea.client.dto.MemberLevelDTO getMemberLevelInfo() {
        User user = getCurrentUserEntity();
        Integer totalPoints = user.getTotalPoints();
        
        // 从数据库获取当前会员等级信息
        MemberLevelDTO currentLevelInfo = memberLevelService.getMemberLevelByPoints(totalPoints);
        
        // 获取所有会员等级
        List<MemberLevelDTO> allLevels = memberLevelService.getActiveMemberLevels();
        
        // 查找下一等级
        MemberLevelDTO nextLevel = allLevels.stream()
                .filter(level -> level.getPointThreshold() > totalPoints)
                .min((a, b) -> a.getPointThreshold().compareTo(b.getPointThreshold()))
                .orElse(null);
        
        // 计算下一等级所需积分
        Integer nextLevelPoints = null;
        Integer pointsToNextLevel = null;
        
        if (nextLevel != null) {
            nextLevelPoints = nextLevel.getPointThreshold();
            pointsToNextLevel = nextLevelPoints - totalPoints;
        }
        
        return com.cxy.milktea.client.dto.MemberLevelDTO.builder()
                .currentLevel(currentLevelInfo.getLevel())
                .levelName(currentLevelInfo.getName())
                .currentPoints(totalPoints)
                .nextLevelPoints(nextLevelPoints)
                .pointsToNextLevel(pointsToNextLevel)
                // 使用数据库中的字段，而不是硬编码
                .discount(currentLevelInfo.getDiscount().doubleValue())
                .benefits(currentLevelInfo.getDescription())
                .build();
    }
    
    @Override
    public Page<PointRecordDTO> getPointRecords(Integer type, int page, int size) {
        User user = getCurrentUserEntity();
        Pageable pageable = PageRequest.of(page, size);
        Page<PointRecord> recordPage;
        
        if (type != null) {
            recordPage = pointRecordRepository.findByUserAndTypeOrderByCreatedAtDesc(user, type, pageable);
        } else {
            recordPage = pointRecordRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        }
        
        List<PointRecordDTO> recordDTOs = recordPage.getContent().stream()
                .map(this::convertToPointRecordDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(recordDTOs, pageable, recordPage.getTotalElements());
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "userCoupons", allEntries = true)
    public Page<UserCouponDTO> getUserCoupons(Integer status, int page, int size) {
        User user = getCurrentUserEntity();
        
        // 先更新过期的优惠券状态
        userCouponRepository.updateExpiredCoupons(LocalDateTime.now());
        
        Pageable pageable = PageRequest.of(page, size);
        Page<UserCoupon> couponPage;
        
        if (status != null) {
            couponPage = userCouponRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status, pageable);
        } else {
            couponPage = userCouponRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        }
        
        List<UserCouponDTO> couponDTOs = couponPage.getContent().stream()
                .map(this::convertToUserCouponDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(couponDTOs, pageable, couponPage.getTotalElements());
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "userCoupons", allEntries = true)
    public List<UserCouponDTO> getAvailableCoupons(BigDecimal amount) {
        User user = getCurrentUserEntity();
        
        // 先更新过期的优惠券状态
        userCouponRepository.updateExpiredCoupons(LocalDateTime.now());
        
        LocalDateTime now = LocalDateTime.now();
        List<UserCoupon> coupons = userCouponRepository.findAvailableCouponsByUser(user.getId(), now, amount);
        
        return coupons.stream()
                .map(this::convertToUserCouponDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 获取可领取的优惠券列表
     * 返回当前用户可领取但尚未领取的优惠券
     */
    @Override
    @Transactional
    @CacheEvict(value = "userCoupons", allEntries = true)
    public List<CouponDTO> getReceivableCoupons() {
        User user = getCurrentUserEntity();
        
        // 先更新过期的优惠券状态
        userCouponRepository.updateExpiredCoupons(LocalDateTime.now());
        
        LocalDateTime now = LocalDateTime.now();
        
        // 获取所有可用的优惠券
        List<Coupon> availableCoupons = couponRepository.findAvailableCoupons(now);
        
        // 过滤出用户尚未领取的优惠券
        return availableCoupons.stream()
                .filter(coupon -> !userCouponRepository.existsByUserAndCouponId(user, coupon.getId()))
                .map(this::convertToCouponDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "userCoupons", allEntries = true)
    public UserCouponDTO receiveCoupon(Long couponId) {
        User user = getCurrentUserEntity();
        
        // 检查优惠券是否存在
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new BusinessException(404, "优惠券不存在"));
        
        // 检查优惠券是否可用
        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStatus() != 1 || now.isBefore(coupon.getStartTime()) || now.isAfter(coupon.getEndTime())) {
            throw new BusinessException(400, "优惠券不可用");
        }
        
        // 检查优惠券数量是否已达上限
        if (coupon.getTotal() != null && coupon.getIssued() >= coupon.getTotal()) {
            throw new BusinessException(400, "优惠券已领完");
        }
        
        // 检查用户是否已领取过该优惠券
        if (userCouponRepository.existsByUserAndCouponId(user, couponId)) {
            throw new BusinessException(400, "已领取过该优惠券");
        }
        
        // 创建用户优惠券记录
        UserCoupon userCoupon = UserCoupon.builder()
                .user(user)
                .coupon(coupon)
                .status(0) // 未使用状态
                .build();
        
        UserCoupon savedUserCoupon = userCouponRepository.save(userCoupon);
        
        // 更新优惠券已发放数量
        coupon.setIssued(coupon.getIssued() + 1);
        couponRepository.save(coupon);
        
        return convertToUserCouponDTO(savedUserCoupon);
    }
    
    @Override
    @Transactional
    public Integer addUserPoints(Long userId, Integer points, Integer type, Long orderId, String description) {
        // 获取用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        
        // 创建积分记录
        PointRecord pointRecord = PointRecord.builder()
                .user(user)
                .point(points)
                .type(type)
                .orderId(orderId)
                .description(description)
                .build();
        
        pointRecordRepository.save(pointRecord);
        
        // 更新用户总积分
        user.setTotalPoints(user.getTotalPoints() + points);
        userRepository.save(user);
        
        // 检查并更新会员等级
        updateMemberLevel(userId);
        
        return user.getTotalPoints();
    }

    @Override
    @Transactional
    @CacheEvict(value = "userCoupons", allEntries = true)
    public boolean useUserCoupon(Long userCouponId, Long orderId) {
        // 获取用户优惠券
        UserCoupon userCoupon = userCouponRepository.findById(userCouponId)
                .orElseThrow(() -> new BusinessException(404, "优惠券不存在"));
        
        // 检查优惠券状态
        if (userCoupon.getStatus() != 0) {
            throw new BusinessException(400, "优惠券不可用");
        }
        
        // 更新优惠券状态
        userCoupon.setStatus(1); // 已使用
        userCoupon.setOrderId(orderId);
        userCoupon.setUsedTime(LocalDateTime.now());
        
        userCouponRepository.save(userCoupon);
        
        // 更新优惠券的使用数量
        Coupon coupon = userCoupon.getCoupon();
        coupon.setUsed(coupon.getUsed() + 1);
        couponRepository.save(coupon);
        
        return true;
    }

    @Override
    @Transactional
    public Integer updateMemberLevel(Long userId) {
        // 获取用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        
        Integer totalPoints = user.getTotalPoints();
        Integer currentLevel = user.getMemberLevel();
        
        // 使用MemberLevelService获取会员等级，确保与数据库配置一致
        MemberLevelDTO memberLevelDTO = memberLevelService.getMemberLevelByPoints(totalPoints);
        Integer newLevel = memberLevelDTO.getLevel();
        
        // 如果等级有变化，更新用户等级
        if (!newLevel.equals(currentLevel)) {
            user.setMemberLevel(newLevel);
            userRepository.save(user);
        }
        
        return newLevel;
    }
    
    /**
     * 获取当前登录用户实体
     */
    public User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(401, "用户未登录");
        }
        
        return (User) authentication.getPrincipal();
    }
    
    /**
     * 将用户实体转换为DTO
     */
    private UserDTO convertToDto(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .gender(user.getGender())
                .birthday(user.getBirthday())
                .totalPoints(user.getTotalPoints())
                .memberLevel(user.getMemberLevel())
                .createdAt(user.getCreatedAt())
                .build();
    }
    
    /**
     * 将积分记录实体转换为DTO
     */
    private PointRecordDTO convertToPointRecordDTO(PointRecord record) {
        String orderNo = null;
        
        // 如果有关联订单，获取订单号
        if (record.getOrderId() != null) {
            try {
                // 直接查询订单号
                orderNo = orderRepository.findById(record.getOrderId())
                        .map(Order::getOrderNo)
                        .orElse(null);
            } catch (Exception e) {
                // 忽略异常
            }
        }
        
        return PointRecordDTO.builder()
                .id(record.getId())
                .point(record.getPoint())
                .type(record.getType())
                .typeText(getPointTypeText(record.getType()))
                .orderId(record.getOrderId())
                .orderNo(orderNo)
                .description(record.getDescription())
                .createdAt(record.getCreatedAt())
                .build();
    }
    
    /**
     * 获取积分类型文本
     */
    private String getPointTypeText(Integer type) {
        switch (type) {
            case 1: return "消费获得";
            case 2: return "使用积分";
            case 3: return "活动获得";
            case 4: return "每日签到";
            case 5: return "积分过期";
            default: return "未知类型";
        }
    }
    
    /**
     * 将用户优惠券实体转换为DTO
     */
    private UserCouponDTO convertToUserCouponDTO(UserCoupon userCoupon) {
        String orderNo = null;
        
        // 如果有关联订单，获取订单号
        if (userCoupon.getOrderId() != null) {
            try {
                // 直接查询订单号
                orderNo = orderRepository.findById(userCoupon.getOrderId())
                        .map(Order::getOrderNo)
                        .orElse(null);
            } catch (Exception e) {
                // 忽略异常
            }
        }
        
        // 判断优惠券是否可用
        LocalDateTime now = LocalDateTime.now();
        boolean canUse = userCoupon.getStatus() == 0 && 
                userCoupon.getCoupon().getStatus() == 1 && 
                now.isAfter(userCoupon.getCoupon().getStartTime()) && 
                now.isBefore(userCoupon.getCoupon().getEndTime());
        
        // 如果优惠券未使用但已过期，则更新状态为已过期
        if (userCoupon.getStatus() == 0 && 
                (userCoupon.getCoupon().getStatus() != 1 || now.isAfter(userCoupon.getCoupon().getEndTime()))) {
            userCoupon.setStatus(2); // 设置为已过期状态
            userCouponRepository.save(userCoupon);
        }
        
        return UserCouponDTO.builder()
                .id(userCoupon.getId())
                .coupon(convertToCouponDTO(userCoupon.getCoupon()))
                .status(userCoupon.getStatus())
                .statusText(getCouponStatusText(userCoupon.getStatus()))
                .orderId(userCoupon.getOrderId())
                .orderNo(orderNo)
                .usedTime(userCoupon.getUsedTime())
                .createdAt(userCoupon.getCreatedAt())
                .canUse(canUse)
                .build();
    }
    
    /**
     * 获取优惠券状态文本
     */
    private String getCouponStatusText(Integer status) {
        switch (status) {
            case 0: return "未使用";
            case 1: return "已使用";
            case 2: return "已过期";
            default: return "未知状态";
        }
    }
    
    /**
     * 将优惠券实体转换为DTO
     */
    private CouponDTO convertToCouponDTO(Coupon coupon) {
        LocalDateTime now = LocalDateTime.now();
        boolean available = coupon.getStatus() == 1 && 
                now.isAfter(coupon.getStartTime()) && 
                now.isBefore(coupon.getEndTime());
        
        return CouponDTO.builder()
                .id(coupon.getId())
                .name(coupon.getName())
                .type(coupon.getType())
                .typeText(getCouponTypeText(coupon.getType()))
                .amount(coupon.getAmount())
                .minConsumption(coupon.getMinPoint())
                .startTime(coupon.getStartTime())
                .endTime(coupon.getEndTime())
                .available(available)
                .status(coupon.getStatus())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
    
    /**
     * 获取优惠券类型文本
     */
    private String getCouponTypeText(Integer type) {
        switch (type) {
            case 1: return "满减券";
            case 2: return "折扣券";
            default: return "未知类型";
        }
    }

    @Override
    public UserInfoDTO getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        
        // 获取会员等级信息
        MemberLevelDTO memberLevel = memberLevelService.getMemberLevelByPoints(user.getTotalPoints());
        
        // 检查今日是否签到
        boolean checkedInToday = hasCheckedInToday(userId);
        
        // 构建特权列表
        String[] privileges = buildPrivilegesList(memberLevel);
        
        return UserInfoDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .gender(user.getGender())
                .genderText(getGenderText(user.getGender()))
                .birthday(user.getBirthday())
                .totalPoints(user.getTotalPoints())
                .memberLevel(user.getMemberLevel())
                .memberLevelName(memberLevel.getName())
                .discount(memberLevel.getDiscount().doubleValue())
                .pointRate(memberLevel.getPointRate().doubleValue())
                .privileges(privileges)
                .createdAt(user.getCreatedAt())
                .checkedInToday(checkedInToday)
                .build();
    }

    /**
     * 构建会员特权列表
     */
    private String[] buildPrivilegesList(MemberLevelDTO memberLevel) {
        List<String> privileges = new ArrayList<>();
        
        if (memberLevel.getFreeShipping()) {
            privileges.add("免配送费");
        }
        
        if (memberLevel.getBirthdayPrivilege()) {
            privileges.add("生日特权");
        }
        
        if (memberLevel.getPriorityProduction()) {
            privileges.add("优先制作");
        }
        
        if (memberLevel.getDiscount().doubleValue() < 1.0) {
            String discount = String.format("%.1f折", memberLevel.getDiscount().doubleValue() * 10);
            privileges.add(discount);
        }
        
        if (memberLevel.getPointRate().doubleValue() > 1.0) {
            String pointRate = String.format("积分%.1f倍", memberLevel.getPointRate().doubleValue());
            privileges.add(pointRate);
        }
        
        return privileges.toArray(new String[0]);
    }

    @Override
    public boolean hasCheckedInToday(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        
        LocalDate today = LocalDate.now();
        return checkinRepository.findByUserAndCheckinDate(user, today).isPresent();
    }

    @Override
    @Transactional
    public Checkin recordCheckin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        
        // 检查今日是否已签到
        LocalDate today = LocalDate.now();
        if (checkinRepository.findByUserAndCheckinDate(user, today).isPresent()) {
            throw new BusinessException(400, "今日已签到");
        }
        
        // 查询用户最近一次签到记录，计算连续签到天数
        Optional<Checkin> lastCheckin = checkinRepository.findFirstByUserOrderByCheckinDateDesc(user);
        int consecutiveDays = 1; // 默认为1天
        
        if (lastCheckin.isPresent()) {
            LocalDate lastDate = lastCheckin.get().getCheckinDate();
            // 如果最近一次签到是昨天，则连续签到天数加1
            if (lastDate.equals(today.minusDays(1))) {
                consecutiveDays = lastCheckin.get().getConsecutiveDays() + 1;
            }
        }
        
        // 获取签到积分规则
        PointRuleDTO checkinRule = pointRuleService.getPointRulesByType(4).stream()
                .filter(rule -> rule.getStatus() == 1)
                .findFirst()
                .orElse(null);
        
        int points = 0;
        if (checkinRule != null) {
            points = checkinRule.getPointValue().intValue();
        }
        
        // 创建签到记录
        Checkin checkin = Checkin.builder()
                .user(user)
                .checkinDate(today)
                .consecutiveDays(consecutiveDays)
                .points(points)
                .build();
        
        // 保存签到记录
        Checkin savedCheckin = checkinRepository.save(checkin);
        
        // 增加用户积分
        if (points > 0) {
            addUserPoints(userId, points, 4, null, "每日签到奖励");
        }
        
        return savedCheckin;
    }

    /**
     * 获取性别文本
     */
    private String getGenderText(Integer gender) {
        if (gender == null) return "未知";
        switch (gender) {
            case 1: return "男";
            case 2: return "女";
            default: return "未知";
        }
    }

    /**
     * 获取用户签到记录
     *
     * @param userId 用户ID
     * @param year 年份
     * @param month 月份
     * @return 签到记录DTO
     */
    @Override
    public CheckinRecordDTO getUserCheckinRecords(Long userId, int year, int month) {
        // 获取用户实体
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        
        // 获取指定月份的第一天和最后一天
        LocalDate firstDayOfMonth = LocalDate.of(year, month, 1);
        LocalDate lastDayOfMonth = firstDayOfMonth.withDayOfMonth(firstDayOfMonth.lengthOfMonth());
        
        // 查询该用户在指定月份的所有签到记录
        List<Checkin> checkins = checkinRepository.findByUserAndCheckinDateBetween(
                user, firstDayOfMonth, lastDayOfMonth);
        
        // 提取签到日期的天数
        List<Integer> days = checkins.stream()
                .map(checkin -> checkin.getCheckinDate().getDayOfMonth())
                .sorted()
                .collect(Collectors.toList());
        
        // 计算连续签到天数
        int continuesDays = calculateContinuesDays(userId);
        
        // 构建并返回DTO
        return CheckinRecordDTO.builder()
                .days(days)
                .continuesDays(continuesDays)
                .currentMonthDays(lastDayOfMonth.getDayOfMonth())
                .build();
    }
    
    /**
     * 计算用户的连续签到天数
     *
     * @param userId 用户ID
     * @return 连续签到天数
     */
    private int calculateContinuesDays(Long userId) {
        // 获取用户实体
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        
        // 获取今天的日期
        LocalDate today = LocalDate.now();
        
        // 从今天开始往前查找连续签到的天数
        int days = 0;
        LocalDate checkDate = today;
        
        while (true) {
            // 检查该日期是否有签到记录
            Optional<Checkin> checkinOpt = checkinRepository.findByUserAndCheckinDate(user, checkDate);
            
            if (checkinOpt.isPresent()) {
                days++;
                checkDate = checkDate.minusDays(1); // 检查前一天
            } else {
                break; // 一旦有一天没签到，就中断循环
            }
        }
        
        return days;
    }

    @Override
    public Checkin updateCheckin(Checkin checkin) {
        return checkinRepository.save(checkin);
    }

    @Override
    public Integer getConsecutiveDays(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        
        Optional<Checkin> lastCheckin = checkinRepository.findFirstByUserOrderByCheckinDateDesc(user);
        return lastCheckin.map(Checkin::getConsecutiveDays).orElse(0);
    }
} 