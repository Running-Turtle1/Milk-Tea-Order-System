package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.*;
import com.cxy.milktea.admin.service.MemberLevelService;
import com.cxy.milktea.admin.service.UserService;
import com.cxy.milktea.common.entity.PointRecord;
import com.cxy.milktea.common.entity.User;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.OrderRepository;
import com.cxy.milktea.common.repository.PointRecordRepository;
import com.cxy.milktea.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service("adminUserServiceImpl")
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PointRecordRepository pointRecordRepository;
    private final OrderRepository orderRepository;
    private final MemberLevelService memberLevelService;

    @Override
    public Page<UserDTO> getUsers(UserQueryDTO queryDTO, int page, int size) {
        LocalDateTime startDateTime = queryDTO.getStartDate() != null 
                ? queryDTO.getStartDate().atStartOfDay() 
                : null;
        
        LocalDateTime endDateTime = queryDTO.getEndDate() != null 
                ? queryDTO.getEndDate().atTime(LocalTime.MAX) 
                : null;
        
        // 执行分页查询
        Page<User> userPage = userRepository.findWithFilters(
                queryDTO.getKeyword(),
                queryDTO.getMemberLevel(),
                queryDTO.getStatus(),
                queryDTO.getMinPoints(),
                queryDTO.getMaxPoints(),
                startDateTime,
                endDateTime,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        
        // 转换为DTO
        List<UserDTO> userDTOs = userPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return new PageImpl<>(userDTOs, userPage.getPageable(), userPage.getTotalElements());
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "会员不存在"));
        
        return convertToDto(user);
    }

    @Override
    @Transactional
    public UserDTO updateUserStatus(Long id, Integer status) {
        if (status != 0 && status != 1) {
            throw new BusinessException(400, "状态值无效");
        }
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "会员不存在"));
        
        user.setStatus(status);
        User savedUser = userRepository.save(user);
        
        return convertToDto(savedUser);
    }

    @Override
    @Transactional
    public UserDTO adjustUserPoints(PointAdjustDTO pointAdjustDTO) {
        User user = userRepository.findById(pointAdjustDTO.getUserId())
                .orElseThrow(() -> new BusinessException(404, "会员不存在"));
        
        // 调整积分
        Integer newPoints = user.getTotalPoints() + pointAdjustDTO.getPoint();
        if (newPoints < 0) {
            throw new BusinessException(400, "积分不足，无法扣减");
        }
        
        user.setTotalPoints(newPoints);
        
        // 创建积分记录
        PointRecord pointRecord = PointRecord.builder()
                .user(user)
                .point(pointAdjustDTO.getPoint())
                .type(5) // 5表示管理员调整
                .description(pointAdjustDTO.getDescription())
                .build();
        
        // 保存积分记录
        pointRecordRepository.save(pointRecord);
        
        // 计算并更新会员等级
        updateUserMemberLevel(user);
        
        // 保存用户
        User savedUser = userRepository.save(user);
        
        return convertToDto(savedUser);
    }

    @Override
    public Page<PointRecordDTO> getUserPointRecords(Long userId, Integer type, int page, int size) {
        // 如果提供了会员ID，则查询指定会员的积分记录
        Page<PointRecord> pointRecordPage;
        if (userId != null) {
            if (type != null) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new BusinessException(404, "会员不存在"));
                pointRecordPage = pointRecordRepository.findByUserAndTypeOrderByCreatedAtDesc(
                        user, type, PageRequest.of(page, size));
            } else {
                pointRecordPage = pointRecordRepository.findByUserIdOrderByCreatedAtDesc(
                        userId, PageRequest.of(page, size));
            }
        } else {
            // 否则使用多条件查询
            pointRecordPage = pointRecordRepository.findWithFilters(
                    null, null, type, null, null,
                    PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
            );
        }
        
        // 转换为DTO
        List<PointRecordDTO> pointRecordDTOs = pointRecordPage.getContent().stream()
                .map(this::convertToPointRecordDto)
                .collect(Collectors.toList());
        
        return new PageImpl<>(pointRecordDTOs, pointRecordPage.getPageable(), pointRecordPage.getTotalElements());
    }

    @Override
    public Map<String, Object> getUserStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        // 总会员数
        long totalUsers = userRepository.count();
        
        // 各等级会员数
        long normalUsers = userRepository.countByMemberLevel(0);
        long silverUsers = userRepository.countByMemberLevel(1);
        long goldUsers = userRepository.countByMemberLevel(2);
        long blackUsers = userRepository.countByMemberLevel(3);
        
        // 今日新增会员数
        long newUsers = userRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("normalUsers", normalUsers);
        stats.put("silverUsers", silverUsers);
        stats.put("goldUsers", goldUsers);
        stats.put("blackUsers", blackUsers);
        stats.put("newUsers", newUsers);
        
        return stats;
    }
    
    @Override
    public Map<String, Object> getUserStatsByDateRange(LocalDate startDate, LocalDate endDate) {
        // 如果没有提供开始日期，默认使用一个月前的日期
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        
        // 如果没有提供结束日期，默认使用今天
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        // 确保开始日期不晚于结束日期
        if (startDate.isAfter(endDate)) {
            LocalDate temp = startDate;
            startDate = endDate;
            endDate = temp;
        }
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        // 获取当前总会员数
        long totalUsers = userRepository.count();
        
        // 获取时间范围内的新增会员数
        long newUsers = userRepository.countByCreatedAtBetween(startDateTime, endDateTime);
        
        // 获取各等级会员数量
        long normalUsers = userRepository.countByMemberLevel(0);
        long silverUsers = userRepository.countByMemberLevel(1);
        long goldUsers = userRepository.countByMemberLevel(2);
        long blackUsers = userRepository.countByMemberLevel(3);
        
        // 构建结果Map
        Map<String, Object> result = new HashMap<>();
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("totalUsers", totalUsers);
        result.put("normalUsers", normalUsers);
        result.put("silverUsers", silverUsers);
        result.put("goldUsers", goldUsers);
        result.put("blackUsers", blackUsers);
        result.put("newUsersInRange", newUsers);
        
        // 计算每日新增会员数据
        Map<String, Long> dailyNewUsers = new HashMap<>();
        
        // 遍历日期范围内的每一天
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            LocalDateTime dayStart = currentDate.atStartOfDay();
            LocalDateTime dayEnd = currentDate.atTime(LocalTime.MAX);
            
            // 统计当天的新增会员数
            long dailyCount = userRepository.countByCreatedAtBetween(dayStart, dayEnd);
            dailyNewUsers.put(currentDate.toString(), dailyCount);
            
            // 移动到下一天
            currentDate = currentDate.plusDays(1);
        }
        
        result.put("dailyNewUsers", dailyNewUsers);
        
        return result;
    }
    
    /**
     * 计算并更新用户会员等级
     */
    private void updateUserMemberLevel(User user) {
        // 获取用户消费总金额
        BigDecimal totalAmount = orderRepository.sumPaymentAmountByUserId(user.getId());
        Double amount = totalAmount != null ? totalAmount.doubleValue() : 0.0;
        
        // 计算适用的会员等级
        MemberLevelDTO memberLevelDTO = memberLevelService.getMemberLevelByPoints(user.getTotalPoints());
        Integer newLevel = memberLevelDTO.getLevel();
        
        // 如果等级有变更，更新用户等级
        if (!newLevel.equals(user.getMemberLevel())) {
            user.setMemberLevel(newLevel);
        }
    }

    /**
     * 将User实体转换为UserDTO
     */
    private UserDTO convertToDto(User user) {
        // 获取用户的订单统计信息
        Long orderCount = orderRepository.countByUserId(user.getId());
        LocalDateTime lastOrderTime = orderRepository.findLastOrderTimeByUserId(user.getId());
        BigDecimal totalAmount = orderRepository.sumPaymentAmountByUserId(user.getId());
        
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .gender(user.getGender())
                .genderText(getGenderText(user.getGender()))
                .birthday(user.getBirthday())
                .totalPoints(user.getTotalPoints())
                .memberLevel(user.getMemberLevel())
                .memberLevelText(getMemberLevelText(user.getMemberLevel()))
                .status(user.getStatus())
                .statusText(user.getStatus() == 1 ? "启用" : "禁用")
                .createdAt(user.getCreatedAt())
                .lastOrderTime(lastOrderTime)
                .orderCount(orderCount)
                .totalAmount(totalAmount != null ? totalAmount.doubleValue() : 0.0)
                .build();
    }

    /**
     * 将PointRecord实体转换为PointRecordDTO
     */
    private PointRecordDTO convertToPointRecordDto(PointRecord pointRecord) {
        return PointRecordDTO.builder()
                .id(pointRecord.getId())
                .userId(pointRecord.getUser().getId())
                .username(pointRecord.getUser().getUsername())
                .point(pointRecord.getPoint())
                .type(pointRecord.getType())
                .typeText(getPointTypeText(pointRecord.getType()))
                .orderId(pointRecord.getOrderId())
                .description(pointRecord.getDescription())
                .createdAt(pointRecord.getCreatedAt())
                .build();
    }

    /**
     * 获取性别文本描述
     */
    private String getGenderText(Integer gender) {
        if (gender == null) return "";
        
        return switch (gender) {
            case 1 -> "男";
            case 2 -> "女";
            default -> "未知";
        };
    }

    /**
     * 获取会员等级文本描述
     */
    private String getMemberLevelText(Integer memberLevel) {
        if (memberLevel == null) return "";
        
        try {
            // 使用MemberLevelService获取会员等级信息
            List<MemberLevelDTO> allLevels = memberLevelService.getAllMemberLevels();
            
            // 根据level查找对应的会员等级名称
            return allLevels.stream()
                    .filter(level -> level.getLevel().equals(memberLevel))
                    .map(MemberLevelDTO::getName)
                    .findFirst()
                    .orElse(switch (memberLevel) {
                        case 1 -> "银卡会员";
                        case 2 -> "金卡会员";
                        case 3 -> "黑卡会员";
                        default -> "普通会员";
                    });
        } catch (Exception e) {
            // 如果获取失败，使用默认值
            return switch (memberLevel) {
                case 1 -> "银卡会员";
                case 2 -> "金卡会员";
                case 3 -> "黑卡会员";
                default -> "普通会员";
            };
        }
    }

    /**
     * 获取积分类型文本描述
     */
    private String getPointTypeText(Integer type) {
        if (type == null) return "";
        
        return switch (type) {
            case 1 -> "消费获得";
            case 2 -> "使用积分";
            case 3 -> "活动获得";
            case 4 -> "签到获得";
            case 5 -> "管理员调整";
            default -> "未知类型";
        };
    }
} 