package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.*;
import com.cxy.milktea.admin.service.CouponService;
import com.cxy.milktea.client.service.CacheService;
import com.cxy.milktea.common.entity.Coupon;
import com.cxy.milktea.common.entity.User;
import com.cxy.milktea.common.entity.UserCoupon;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.CouponRepository;
import com.cxy.milktea.common.repository.OrderRepository;
import com.cxy.milktea.common.repository.UserCouponRepository;
import com.cxy.milktea.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final UserCouponRepository userCouponRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CacheService cacheService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public Page<CouponDTO> getCoupons(CouponQueryDTO queryDTO, int page, int size) {
        LocalDateTime startDateTime = queryDTO.getStartDate() != null 
                ? queryDTO.getStartDate().atStartOfDay() 
                : null;
        
        LocalDateTime endDateTime = queryDTO.getEndDate() != null 
                ? queryDTO.getEndDate().atTime(LocalTime.MAX) 
                : null;
        
        // 关键词搜索转换
        String keyword = queryDTO.getKeyword() != null && !queryDTO.getKeyword().trim().isEmpty()
                ? queryDTO.getKeyword().trim()
                : null;
        
        // 执行分页查询
        Page<Coupon> couponPage = couponRepository.findWithFilters(
                keyword,
                queryDTO.getType(),
                queryDTO.getStatus(),
                startDateTime,
                endDateTime,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        
        // 转换为DTO
        List<CouponDTO> couponDTOs = couponPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return new PageImpl<>(couponDTOs, couponPage.getPageable(), couponPage.getTotalElements());
    }

    @Override
    public CouponDTO getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "优惠券不存在"));
        
        return convertToDto(coupon);
    }

    @Override
    @Transactional
    public CouponDTO createCoupon(CouponUpdateDTO couponDTO) {
        validateCouponData(couponDTO);
        
        // 创建新的优惠券
        Coupon coupon = new Coupon();
        updateCouponFromDto(coupon, couponDTO);
        
        // 初始化已发放和已使用数量
        coupon.setIssued(0);
        coupon.setUsed(0);
        
        // 保存到数据库
        Coupon savedCoupon = couponRepository.save(coupon);
        
        return convertToDto(savedCoupon);
    }

    @Override
    @Transactional
    public CouponDTO updateCoupon(Long id, CouponUpdateDTO couponDTO) {
        validateCouponData(couponDTO);
        
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "优惠券不存在"));
        
        // 检查是否已有用户领取该优惠券，有则不允许修改某些字段
        if (coupon.getIssued() > 0) {
            // 已发放的优惠券不允许修改类型、金额和会员等级限制
            if (!coupon.getType().equals(couponDTO.getType())) {
                throw new BusinessException(400, "已发放的优惠券不允许修改类型");
            }
            if (!coupon.getAmount().equals(couponDTO.getAmount())) {
                throw new BusinessException(400, "已发放的优惠券不允许修改金额/折扣");
            }
            if (!coupon.getMemberLevel().equals(couponDTO.getMemberLevel())) {
                throw new BusinessException(400, "已发放的优惠券不允许修改会员等级限制");
            }
        }
        
        updateCouponFromDto(coupon, couponDTO);
        
        // 保存到数据库
        Coupon updatedCoupon = couponRepository.save(coupon);
        
        return convertToDto(updatedCoupon);
    }

    @Override
    @Transactional
    public CouponDTO updateCouponStatus(Long id, Integer status) {
        if (status != 0 && status != 1) {
            throw new BusinessException(400, "状态值无效");
        }
        
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "优惠券不存在"));
        
        coupon.setStatus(status);
        Coupon updatedCoupon = couponRepository.save(coupon);
        
        return convertToDto(updatedCoupon);
    }

    @Override
    @Transactional
    public boolean deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "优惠券不存在"));
        
        // 检查是否已有用户领取该优惠券
        if (coupon.getIssued() > 0) {
            throw new BusinessException(400, "已发放的优惠券不允许删除");
        }
        
        couponRepository.delete(coupon);
        return true;
    }

    @Override
    public Map<String, Object> getCouponStats() {
        LocalDateTime now = LocalDateTime.now();
        
        // 获取所有优惠券
        List<Coupon> allCoupons = couponRepository.findAll();
        
        // 统计有效的优惠券
        long validCoupons = allCoupons.stream()
                .filter(c -> c.getStatus() == 1 && c.getStartTime().isBefore(now) && c.getEndTime().isAfter(now))
                .count();
        
        // 统计已过期的优惠券
        long expiredCoupons = allCoupons.stream()
                .filter(c -> c.getEndTime().isBefore(now))
                .count();
        
        // 统计未开始的优惠券
        long notStartedCoupons = allCoupons.stream()
                .filter(c -> c.getStartTime().isAfter(now))
                .count();
        
        // 按类型统计
        long discountCoupons = allCoupons.stream().filter(c -> c.getType() == 2).count();
        long cashCoupons = allCoupons.stream().filter(c -> c.getType() == 1).count();
        
        // 总发放数和使用数 - 处理null值
        int totalIssued = allCoupons.stream()
                .mapToInt(c -> c.getIssued() != null ? c.getIssued() : 0)
                .sum();
        
        int totalUsed = allCoupons.stream()
                .mapToInt(c -> c.getUsed() != null ? c.getUsed() : 0)
                .sum();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCoupons", allCoupons.size());
        stats.put("validCoupons", validCoupons);
        stats.put("expiredCoupons", expiredCoupons);
        stats.put("notStartedCoupons", notStartedCoupons);
        stats.put("discountCoupons", discountCoupons);
        stats.put("cashCoupons", cashCoupons);
        stats.put("totalIssued", totalIssued);
        stats.put("totalUsed", totalUsed);
        stats.put("usageRate", totalIssued > 0 ? (double) totalUsed / totalIssued : 0);
        
        return stats;
    }

    @Override
    public Page<UserCouponDTO> getUserCoupons(UserCouponQueryDTO queryDTO, int page, int size) {
        LocalDateTime startDateTime = queryDTO.getStartDate() != null 
                ? queryDTO.getStartDate().atStartOfDay() 
                : null;
        
        LocalDateTime endDateTime = queryDTO.getEndDate() != null 
                ? queryDTO.getEndDate().atTime(LocalTime.MAX) 
                : null;
        
        // 执行分页查询
        Page<UserCoupon> userCouponPage = userCouponRepository.findWithFilters(
                queryDTO.getUserId(),
                queryDTO.getCouponId(),
                queryDTO.getStatus(),
                startDateTime,
                endDateTime,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        
        // 转换为DTO
        List<UserCouponDTO> userCouponDTOs = userCouponPage.getContent().stream()
                .map(this::convertToUserCouponDto)
                .collect(Collectors.toList());
        
        return new PageImpl<>(userCouponDTOs, userCouponPage.getPageable(), userCouponPage.getTotalElements());
    }

    @Override
    public UserCouponDTO getUserCouponById(Long id) {
        UserCoupon userCoupon = userCouponRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "用户优惠券不存在"));
        
        return convertToUserCouponDto(userCoupon);
    }

    @Override
    @Transactional
    public UserCouponDTO issueCouponToUser(Long userId, Long couponId) {
        // 获取用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        
        // 获取优惠券
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new BusinessException(404, "优惠券不存在"));
        
        // 检查优惠券是否可用
        validateCouponAvailability(coupon);
        
        // 检查用户是否已领取过该优惠券
        if (userCouponRepository.existsByUserAndCoupon(user, coupon)) {
            throw new BusinessException(400, "该用户已领取过此优惠券");
        }
        
        // 检查每人限领数量
        if (coupon.getPerLimit() != null) {
            int count = userCouponRepository.countUnusedCouponByUserAndCouponId(userId, couponId);
            if (count >= coupon.getPerLimit()) {
                throw new BusinessException(400, "该用户已达优惠券领取上限");
            }
        }
        
        // 创建用户优惠券记录
        UserCoupon userCoupon = UserCoupon.builder()
                .user(user)
                .coupon(coupon)
                .status(0) // 未使用状态
                .build();
        
        UserCoupon savedUserCoupon = userCouponRepository.save(userCoupon);
        
        // 更新优惠券已发放数量
        Integer currentIssued = coupon.getIssued() != null ? coupon.getIssued() : 0;
        coupon.setIssued(currentIssued + 1);
        couponRepository.save(coupon);
        
        // 清除用户优惠券缓存
        clearUserCouponCaches(userId);
        
        return convertToUserCouponDto(savedUserCoupon);
    }

    @Override
    @Transactional
    public BatchIssueCouponResultDTO batchIssueCoupon(List<Long> userIds, Long couponId) {
        if (userIds == null || userIds.isEmpty()) {
            throw new BusinessException(400, "用户列表不能为空");
        }
        
        // 获取优惠券
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new BusinessException(404, "优惠券不存在"));
        
        // 检查优惠券是否可用
        validateCouponAvailability(coupon);
        
        // 检查剩余数量是否足够
        if (coupon.getTotal() != null && coupon.getIssued() + userIds.size() > coupon.getTotal()) {
            throw new BusinessException(400, "优惠券剩余数量不足");
        }
        
        // 批量发放
        int successCount = 0;
        List<UserCoupon> userCoupons = new ArrayList<>();
        List<Map<String, Object>> alreadyReceived = new ArrayList<>();
        List<Map<String, Object>> failedUsers = new ArrayList<>();
        List<Long> successUserIds = new ArrayList<>();
        
        for (Long userId : userIds) {
            try {
                // 获取用户
                User user = userRepository.findById(userId).orElse(null);
                if (user == null) {
                    Map<String, Object> failedInfo = new HashMap<>();
                    failedInfo.put("userId", userId);
                    failedInfo.put("reason", "用户不存在");
                    failedUsers.add(failedInfo);
                    continue;
                }
                
                // 检查用户是否已领取过该优惠券
                if (userCouponRepository.existsByUserAndCoupon(user, coupon)) {
                    Map<String, Object> alreadyReceivedInfo = new HashMap<>();
                    alreadyReceivedInfo.put("userId", userId);
                    alreadyReceivedInfo.put("username", user.getUsername());
                    alreadyReceivedInfo.put("phone", user.getPhone());
                    alreadyReceived.add(alreadyReceivedInfo);
                    continue;
                }
                
                // 检查每人限领数量
                if (coupon.getPerLimit() != null) {
                    int count = userCouponRepository.countUnusedCouponByUserAndCouponId(userId, couponId);
                    if (count >= coupon.getPerLimit()) {
                        Map<String, Object> failedInfo = new HashMap<>();
                        failedInfo.put("userId", userId);
                        failedInfo.put("username", user.getUsername());
                        failedInfo.put("reason", "已达到每人限领数量");
                        failedUsers.add(failedInfo);
                        continue;
                    }
                }
                
                // 创建用户优惠券记录
                UserCoupon userCoupon = UserCoupon.builder()
                        .user(user)
                        .coupon(coupon)
                        .status(0) // 未使用状态
                        .build();
                
                userCoupons.add(userCoupon);
                successUserIds.add(userId);
                successCount++;
            } catch (Exception e) {
                // 记录发放失败的用户
                Map<String, Object> failedInfo = new HashMap<>();
                failedInfo.put("userId", userId);
                failedInfo.put("reason", "发放失败: " + e.getMessage());
                failedUsers.add(failedInfo);
            }
        }
        
        // 批量保存
        if (!userCoupons.isEmpty()) {
            userCouponRepository.saveAll(userCoupons);
            
            // 更新优惠券已发放数量
            Integer currentIssued = coupon.getIssued() != null ? coupon.getIssued() : 0;
            coupon.setIssued(currentIssued + successCount);
            couponRepository.save(coupon);
            
            // 清除所有成功发放的用户的优惠券缓存
            for (Long userId : successUserIds) {
                clearUserCouponCaches(userId);
            }
            
            // 清理全局优惠券缓存
            clearGlobalCouponCaches(couponId);
        }
        
        // 构建并返回结果
        return BatchIssueCouponResultDTO.builder()
                .totalSelected(userIds.size())
                .successCount(successCount)
                .alreadyReceived(alreadyReceived)
                .failedUsers(failedUsers)
                .build();
    }
    
    /**
     * 清除用户优惠券相关缓存
     */
    private void clearUserCouponCaches(Long userId) {
        // 使用缓存服务清除用户的优惠券缓存
        cacheService.clearUserCouponCaches(userId);
        
        // 清除可能存在的其他相关缓存
        String keyPattern = "user:" + userId + ":*";
        redisTemplate.delete(redisTemplate.keys(keyPattern));
        
        // 清除购物车缓存，因为购物车中可能有优惠券相关信息
        redisTemplate.delete("carts::user_" + userId);
        
        // 清除用户可领优惠券的缓存 - 扩展匹配模式确保全部清理
        redisTemplate.delete("availableCoupons:user_" + userId);
        redisTemplate.delete("availableCoupons:eligible_" + userId);
        redisTemplate.delete("coupon:available:" + userId);
        redisTemplate.delete("coupon:list:" + userId);
        redisTemplate.delete("coupons:available:" + userId);
        redisTemplate.delete("user_coupons:" + userId);
        
        // 使用通配符匹配所有可能的用户优惠券缓存
        Set<String> userCouponKeys = redisTemplate.keys("*coupon*:" + userId + "*");
        if (userCouponKeys != null && !userCouponKeys.isEmpty()) {
            redisTemplate.delete(userCouponKeys);
        }
        
        // 使用通配符匹配所有可能的可领优惠券缓存
        Set<String> availableKeys = redisTemplate.keys("*available*:" + userId + "*");
        if (availableKeys != null && !availableKeys.isEmpty()) {
            redisTemplate.delete(availableKeys);
        }
        
        log.info("已清除用户ID为{}的优惠券相关缓存（包含可领取优惠券）", userId);
    }
    
    /**
     * 清除全局优惠券缓存
     */
    private void clearGlobalCouponCaches(Long couponId) {
        // 清除全局优惠券列表缓存
        redisTemplate.delete("availableCoupons");
        redisTemplate.delete("availableCoupons:all");
        redisTemplate.delete("coupons:available");
        redisTemplate.delete("coupon:list");
        redisTemplate.delete("coupon:" + couponId);
        
        // 使用通配符匹配所有与优惠券相关的缓存
        Set<String> couponKeys = redisTemplate.keys("*coupon*");
        if (couponKeys != null && !couponKeys.isEmpty()) {
            redisTemplate.delete(couponKeys);
            log.info("已清除{}个全局优惠券相关缓存", couponKeys.size());
        }
        
        // 清除可能的首页缓存、推荐缓存等
        redisTemplate.delete("home:coupons");
        redisTemplate.delete("recommend:coupons");
        
        log.info("已清除全局优惠券缓存，包括优惠券ID为{}的相关缓存", couponId);
    }
    
    /**
     * 将Coupon实体转换为DTO
     */
    private CouponDTO convertToDto(Coupon coupon) {
        LocalDateTime now = LocalDateTime.now();
        boolean expired = now.isAfter(coupon.getEndTime());
        
        // 计算剩余数量
        Integer remaining = null;
        if (coupon.getTotal() != null) {
            // 确保issued不为null
            Integer issued = coupon.getIssued() != null ? coupon.getIssued() : 0;
            remaining = coupon.getTotal() - issued;
            if (remaining < 0) remaining = 0;
        }
        
        // 防止null指针异常
        Integer issued = coupon.getIssued() != null ? coupon.getIssued() : 0;
        Integer used = coupon.getUsed() != null ? coupon.getUsed() : 0;
        
        return CouponDTO.builder()
                .id(coupon.getId())
                .name(coupon.getName())
                .type(coupon.getType())
                .typeText(getCouponTypeText(coupon.getType()))
                .amount(coupon.getAmount())
                .minConsumption(coupon.getMinPoint())
                .useScope(coupon.getUseScope())
                .useScopeText(getUseScopeText(coupon.getUseScope()))
                .memberLevel(coupon.getMemberLevel())
                .memberLevelText(getMemberLevelText(coupon.getMemberLevel()))
                .total(coupon.getTotal())
                .issued(issued)
                .used(used)
                .perLimit(coupon.getPerLimit())
                .startTime(coupon.getStartTime())
                .endTime(coupon.getEndTime())
                .description(coupon.getDescription())
                .status(coupon.getStatus())
                .statusText(coupon.getStatus() == 1 ? "启用" : "禁用")
                .expired(expired)
                .remaining(remaining)
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }
    
    /**
     * 将UserCoupon实体转换为DTO
     */
    private UserCouponDTO convertToUserCouponDto(UserCoupon userCoupon) {
        Coupon coupon = userCoupon.getCoupon();
        User user = userCoupon.getUser();
        
        LocalDateTime now = LocalDateTime.now();
        boolean expired = now.isAfter(coupon.getEndTime());
        
        return UserCouponDTO.builder()
                .id(userCoupon.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .phone(user.getPhone())
                .couponId(coupon.getId())
                .couponName(coupon.getName())
                .couponType(coupon.getType())
                .couponTypeText(getCouponTypeText(coupon.getType()))
                .amount(coupon.getAmount())
                .minConsumption(coupon.getMinPoint())
                .useScope(coupon.getUseScope())
                .useScopeText(getUseScopeText(coupon.getUseScope()))
                .startTime(coupon.getStartTime())
                .endTime(coupon.getEndTime())
                .status(userCoupon.getStatus())
                .statusText(getUserCouponStatusText(userCoupon.getStatus()))
                .usedTime(userCoupon.getUsedTime())
                .orderId(userCoupon.getOrderId())
                .expired(expired)
                .createdAt(userCoupon.getCreatedAt())
                .build();
    }
    
    /**
     * 根据DTO更新Coupon实体
     */
    private void updateCouponFromDto(Coupon coupon, CouponUpdateDTO dto) {
        coupon.setName(dto.getName());
        coupon.setType(dto.getType());
        coupon.setAmount(dto.getAmount());
        coupon.setMinPoint(dto.getMinConsumption());
        coupon.setUseScope(dto.getUseScope());
        coupon.setMemberLevel(dto.getMemberLevel());
        coupon.setTotal(dto.getTotal());
        coupon.setPerLimit(dto.getPerLimit());
        coupon.setStartTime(dto.getStartTime());
        coupon.setEndTime(dto.getEndTime());
        coupon.setDescription(dto.getDescription());
        coupon.setStatus(dto.getStatus());
    }
    
    /**
     * 验证优惠券数据的合法性
     */
    private void validateCouponData(CouponUpdateDTO dto) {
        // 检查结束时间是否晚于开始时间
        if (dto.getEndTime().isBefore(dto.getStartTime())) {
            throw new BusinessException(400, "结束时间必须晚于开始时间");
        }
        
        // 检查折扣券折扣率是否合法(0.1-9.9之间)
        if (dto.getType() == 2) {
            if (dto.getAmount().doubleValue() <= 0 || dto.getAmount().doubleValue() >= 10) {
                throw new BusinessException(400, "折扣券折扣率必须在0.1-9.9之间");
            }
        }
    }
    
    /**
     * 验证优惠券是否可用于发放
     */
    private void validateCouponAvailability(Coupon coupon) {
        LocalDateTime now = LocalDateTime.now();
        
        // 检查状态
        if (coupon.getStatus() != 1) {
            throw new BusinessException(400, "优惠券当前状态不可用");
        }
        
        // 检查是否在有效期内
        if (now.isBefore(coupon.getStartTime()) || now.isAfter(coupon.getEndTime())) {
            throw new BusinessException(400, "优惠券不在有效期内");
        }
        
        // 检查发放总量 - 安全处理null值
        if (coupon.getTotal() != null) {
            Integer issued = coupon.getIssued() != null ? coupon.getIssued() : 0;
            if (issued >= coupon.getTotal()) {
                throw new BusinessException(400, "优惠券已达发放上限");
            }
        }
    }
    
    /**
     * 获取优惠券类型文本
     */
    private String getCouponTypeText(Integer type) {
        if (type == null) return "";
        
        return switch (type) {
            case 1 -> "满减券";
            case 2 -> "折扣券";
            default -> "未知类型";
        };
    }
    
    /**
     * 获取使用范围文本
     */
    private String getUseScopeText(Integer useScope) {
        if (useScope == null) return "";
        
        return switch (useScope) {
            case 0 -> "全场通用";
            case 1 -> "指定商品";
            default -> "未知范围";
        };
    }
    
    /**
     * 获取会员等级文本
     */
    private String getMemberLevelText(Integer memberLevel) {
        if (memberLevel == null) return "";
        
        return switch (memberLevel) {
            case 0 -> "所有会员";
            case 1 -> "银卡及以上";
            case 2 -> "金卡及以上";
            case 3 -> "黑卡会员";
            default -> "未知等级";
        };
    }
    
    /**
     * 获取优惠券状态文本
     */
    private String getUserCouponStatusText(Integer status) {
        if (status == null) return "";
        
        return switch (status) {
            case 0 -> "未使用";
            case 1 -> "已使用";
            case 2 -> "已过期";
            default -> "未知状态";
        };
    }
} 