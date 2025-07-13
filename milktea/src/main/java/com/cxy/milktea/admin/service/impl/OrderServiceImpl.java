package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.OrderDTO;
import com.cxy.milktea.admin.dto.OrderDetailDTO;
import com.cxy.milktea.admin.dto.OrderQueryDTO;
import com.cxy.milktea.admin.dto.OrderStatusUpdateDTO;
import com.cxy.milktea.admin.dto.RefundOrderDTO;
import com.cxy.milktea.admin.dto.RefundProcessDTO;
import com.cxy.milktea.admin.dto.RefundQueryDTO;
import com.cxy.milktea.admin.dto.OrderRefundDTO;
import com.cxy.milktea.admin.service.OrderService;
import com.cxy.milktea.common.entity.Order;
import com.cxy.milktea.common.entity.OrderDetail;
import com.cxy.milktea.common.entity.OrderRefund;
import com.cxy.milktea.common.entity.User;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.OrderDetailRepository;
import com.cxy.milktea.common.repository.OrderRepository;
import com.cxy.milktea.common.repository.OrderRefundRepository;
import com.cxy.milktea.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service("adminOrderServiceImpl")
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final OrderRefundRepository orderRefundRepository;
    
    private static final String ORDER_TAKE_NUMBER_KEY = "order:take_number";
    
    @Override
    public Page<OrderDTO> getOrders(OrderQueryDTO queryDTO, int page, int size) {
        // 防止空对象异常
        if (queryDTO == null) {
            queryDTO = new OrderQueryDTO();
        }
        
        LocalDateTime startDateTime = queryDTO.getStartDate() != null 
                ? queryDTO.getStartDate().atStartOfDay() 
                : null;
        
        LocalDateTime endDateTime = queryDTO.getEndDate() != null 
                ? queryDTO.getEndDate().atTime(LocalTime.MAX) 
                : null;
        
        // 处理空字符串，转换为null
        String orderNo = (queryDTO.getOrderNo() == null || queryDTO.getOrderNo().trim().isEmpty()) ? null : queryDTO.getOrderNo().trim();
        String keyword = (queryDTO.getKeyword() == null || queryDTO.getKeyword().trim().isEmpty()) ? null : queryDTO.getKeyword().trim();
        String takeNo = (queryDTO.getTakeNo() == null || queryDTO.getTakeNo().trim().isEmpty()) ? null : queryDTO.getTakeNo().trim();
        
        // 构建查询条件并执行查询
        Page<Order> orderPage = orderRepository.findWithFilters(
                orderNo,
                keyword,
                queryDTO.getStatus(),
                takeNo,
                startDateTime,
                endDateTime,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        
        // 转换为DTO
        List<OrderDTO> orderDTOs = orderPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return new PageImpl<>(orderDTOs, orderPage.getPageable(), orderPage.getTotalElements());
    }
    
    @Override
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));
        
        return convertToDto(order);
    }
    
    @Override
    public List<OrderDetailDTO> getOrderDetails(Long orderId) {
        List<OrderDetail> details = orderDetailRepository.findByOrderId(orderId);
        
        return details.stream()
                .map(this::convertToDetailDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public Map<String, Object> getTodayOrderStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        // 今日总订单数
        long totalOrders = orderRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        
        // 今日待处理订单数（状态为已支付）
        long pendingOrders = orderRepository.countByStatusAndCreatedAtBetween(
                1, startOfDay, endOfDay);
        
        // 今日已取消订单数
        long canceledOrders = orderRepository.countByStatusAndCreatedAtBetween(
                5, startOfDay, endOfDay);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("canceledOrders", canceledOrders);
        
        return stats;
    }
    
    @Override
    public Map<String, Object> getOrderStatsByDateRange(LocalDate startDate, LocalDate endDate) {
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
        
        // 计算日期范围内的总体统计数据
        long totalOrders = orderRepository.countByCreatedAtBetween(startDateTime, endDateTime);
        long pendingOrders = orderRepository.countByStatusAndCreatedAtBetween(
                1, startDateTime, endDateTime);
        long canceledOrders = orderRepository.countByStatusAndCreatedAtBetween(
                5, startDateTime, endDateTime);
        
        // 主要统计结果
        Map<String, Object> result = new HashMap<>();
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("totalOrders", totalOrders);
        result.put("pendingOrders", pendingOrders);
        result.put("canceledOrders", canceledOrders);
        
        // 计算每日订单数量的趋势数据
        Map<String, Long> dailyOrderCounts = new HashMap<>();
        
        // 遍历日期范围内的每一天
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            LocalDateTime dayStart = currentDate.atStartOfDay();
            LocalDateTime dayEnd = currentDate.atTime(LocalTime.MAX);
            
            // 统计当天的订单数量
            long dailyCount = orderRepository.countByCreatedAtBetween(dayStart, dayEnd);
            dailyOrderCounts.put(currentDate.toString(), dailyCount);
            
            // 移动到下一天
            currentDate = currentDate.plusDays(1);
        }
        
        result.put("dailyOrderCounts", dailyOrderCounts);
        
        return result;
    }
    
    @Override
    public Map<String, Object> getIncomeStats(LocalDate startDate, LocalDate endDate) {
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
        
        // 获取日期范围内的总收入
        BigDecimal totalIncome = orderRepository.sumIncomeByDateRange(startDateTime, endDateTime);
        if (totalIncome == null) {
            totalIncome = BigDecimal.ZERO;
        }
        
        // 获取每日收入数据
        List<Object[]> dailyIncomeData = orderRepository.sumDailyIncomeByDateRange(startDateTime, endDateTime);
        
        // 转换每日收入数据为Map格式
        Map<String, BigDecimal> dailyIncome = new HashMap<>();
        for (Object[] data : dailyIncomeData) {
            String date = data[0].toString();
            BigDecimal income = (BigDecimal) data[1];
            dailyIncome.put(date, income);
        }
        
        // 填充没有数据的日期为0
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            String dateStr = currentDate.toString();
            if (!dailyIncome.containsKey(dateStr)) {
                dailyIncome.put(dateStr, BigDecimal.ZERO);
            }
            currentDate = currentDate.plusDays(1);
        }
        
        // 构建结果Map
        Map<String, Object> result = new HashMap<>();
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("totalIncome", totalIncome);
        result.put("dailyIncome", dailyIncome);
        
        return result;
    }
    
    @Override
    public String generateTakeNumber() {
        ValueOperations<String, Object> ops = redisTemplate.opsForValue();
        
        // 获取当前日期
        String today = LocalDate.now().toString().replace("-", "");
        String key = ORDER_TAKE_NUMBER_KEY + ":" + today;
        
        try {
        // 自增并获取序号
        Long sequence = ops.increment(key);
            
            // 处理sequence为null的情况
            if (sequence == null) {
                // Redis操作失败，使用随机数作为备选方案
                sequence = Math.abs(new Random().nextLong() % 900) + 100; // 生成100-999之间的随机数
                ops.set(key, sequence);
            }
        
        // 确保key在当天结束时过期
            if (sequence == 1 || !redisTemplate.hasKey(key)) {
            LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
            Date expiryDate = Date.from(endOfDay.atZone(ZoneId.systemDefault()).toInstant());
            redisTemplate.expireAt(key, expiryDate);
        }
        
        // 格式化为3位数的取餐号，例如：001, 012, 123
        return String.format("%03d", sequence);
        } catch (Exception e) {
            // 出现异常时使用时间戳后三位作为应急取餐号
            String emergencyNumber = String.valueOf(System.currentTimeMillis()).substring(10);
            return emergencyNumber;
        }
    }
    
    /**
     * 将订单实体转换为DTO
     */
    private OrderDTO convertToDto(Order order) {
        // 获取用户名和手机号
        String username = "";
        String phone = "";
        
        try {
            if (order.getUser() != null && order.getUser().getId() != null) {
                User user = userRepository.findById(order.getUser().getId()).orElse(null);
                if (user != null) {
                    username = user.getUsername();
                    phone = user.getPhone();
                }
            }
        } catch (Exception e) {
            // 忽略用户查询异常
        }
        
        return OrderDTO.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .username(username)
                .phone(phone)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .paymentAmount(order.getPaymentAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentTime(order.getPaymentTime())
                .status(order.getStatus())
                .statusText(getStatusText(order.getStatus()))
                .takeNo(order.getTakeNo())
                .remark(order.getRemark())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
    
    /**
     * 将订单详情实体转换为DTO
     */
    private OrderDetailDTO convertToDetailDto(OrderDetail detail) {
        return OrderDetailDTO.builder()
                .id(detail.getId())
                .orderId(detail.getOrder() != null ? detail.getOrder().getId() : null)
                .productId(detail.getProductId())
                .productName(detail.getProductName())
                .productImage(detail.getProductImage())
                .price(detail.getPrice())
                .quantity(detail.getQuantity())
                .temperature(detail.getTemperature())
                .sweetness(detail.getSweetness())
                .ingredients(detail.getIngredients())
                .totalPrice(detail.getTotalPrice())
                .build();
    }
    
    /**
     * 根据状态代码获取状态文本
     */
    private String getStatusText(Integer status) {
        if (status == null) return "";
        
        return switch (status) {
            case 0 -> "待支付";
            case 1 -> "已支付";
            case 2 -> "已完成";
            case 3 -> "退款中";
            case 4 -> "已退款";
            case 5 -> "已取消";
            case 6 -> "拒绝退款";
            default -> "未知状态";
        };
    }
    
    @Override
    @Transactional
    public OrderDTO updateOrderStatus(OrderStatusUpdateDTO statusUpdateDTO) {
        // 由于订单状态简化，管理端不再需要手动更改订单状态
        // 此方法保留为空实现，但前端应该不再调用此方法
        throw new BusinessException(400, "订单状态无需手动更新，系统已自动处理");
    }
    
    /**
     * 订单退款功能实现
     */
    @Override
    @Transactional
    public OrderDTO refundOrder(RefundOrderDTO refundDTO) {
        // 获取订单
        Order order = orderRepository.findById(refundDTO.getOrderId())
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));
        
        // 验证订单状态
        if (order.getStatus() != 1) {
            throw new BusinessException(400, "只有已支付的订单可以退款");
        }
        
        // 创建退款记录
        OrderRefund refund = OrderRefund.builder()
                .order(order)
                .refundAmount(order.getPaymentAmount()) // 全额退款
                .reason(refundDTO.getReason())
                .remark(refundDTO.getRemark())
                .processor(refundDTO.getOperatorName())
                .status(0) // 待处理状态
                .build();
        
        // 保存退款记录
        orderRefundRepository.save(refund);
        
        // 更新订单状态为退款中
        order.setStatus(3); // 退款中状态
        orderRepository.save(order);
        
        // 对接第三方支付平台的退款逻辑应在此处，但示例中省略
        // 实际情况下应当调用支付平台的退款API，等待回调后再更新订单状态
        
        // 返回更新后的订单
        return convertToDto(order);
    }
    
    @Override
    @Transactional
    public OrderRefundDTO processRefund(RefundProcessDTO refundProcessDTO) {
        // 获取退款记录
        OrderRefund refund = orderRefundRepository.findById(refundProcessDTO.getRefundId())
                .orElseThrow(() -> new BusinessException(404, "退款记录不存在"));
        
        // 检查退款记录状态
        if (refund.getStatus() != 0) {
            throw new BusinessException(400, "该退款申请已处理，不能重复处理");
        }
        
        // 获取关联订单
        Order order = refund.getOrder();
        if (order == null) {
            throw new BusinessException(404, "关联订单不存在");
        }
        
        // 验证退款金额不超过订单支付金额的三倍（仅针对管理端）
        if (refund.getRefundAmount().compareTo(order.getPaymentAmount().multiply(new BigDecimal("3"))) > 0) {
            throw new BusinessException(400, "管理端退款金额不能超过订单支付金额的三倍");
        }
        
        // 处理退款
        if (refundProcessDTO.getResult() == 1) {
            // 同意退款
            refund.setStatus(1); // 已退款
            
            // 更新订单状态为已退款
            order.setStatus(4); // 已退款状态
            orderRepository.save(order);
            
            // 实际业务中，这里应该调用支付平台的退款API
        } else if (refundProcessDTO.getResult() == 2) {
            // 拒绝退款
            refund.setStatus(2); // 已拒绝
            
            // 更新订单状态为拒绝退款
            order.setStatus(6); // 拒绝退款状态
            orderRepository.save(order);
        } else {
            throw new BusinessException(400, "无效的处理结果");
        }
        
        // 更新处理信息
        refund.setComment(refundProcessDTO.getComment());
        refund.setProcessor(refundProcessDTO.getProcessor());
        refund.setProcessTime(LocalDateTime.now());
        
        // 保存退款记录
        OrderRefund updatedRefund = orderRefundRepository.save(refund);
        
        return convertToRefundDTO(updatedRefund);
    }
    
    @Override
    public OrderRefundDTO getRefundById(Long refundId) {
        OrderRefund refund = orderRefundRepository.findById(refundId)
                .orElseThrow(() -> new BusinessException(404, "退款记录不存在"));
                
        return convertToRefundDTO(refund);
    }
    
    @Override
    public List<OrderRefundDTO> getRefundsByOrderId(Long orderId) {
        List<OrderRefund> refunds = orderRefundRepository.findByOrderId(orderId);
        
        return refunds.stream()
                .map(this::convertToRefundDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<OrderRefundDTO> getRefunds(RefundQueryDTO queryDTO, int page, int size) {
        // 防止空对象异常
        if (queryDTO == null) {
            queryDTO = new RefundQueryDTO();
        }
        
        LocalDateTime startDateTime = queryDTO.getStartDate() != null 
                ? queryDTO.getStartDate().atStartOfDay() 
                : null;
        
        LocalDateTime endDateTime = queryDTO.getEndDate() != null 
                ? queryDTO.getEndDate().atTime(LocalTime.MAX) 
                : null;
        
        // 处理空字符串，转换为null
        String orderNo = (queryDTO.getOrderNo() == null || queryDTO.getOrderNo().trim().isEmpty()) ? null : queryDTO.getOrderNo().trim();
        String keyword = (queryDTO.getKeyword() == null || queryDTO.getKeyword().trim().isEmpty()) ? null : queryDTO.getKeyword().trim();
        
        // 构建查询条件并执行查询
        Page<OrderRefund> refundPage = orderRefundRepository.findWithFilters(
                orderNo,
                keyword,
                queryDTO.getStatus(),
                startDateTime,
                endDateTime,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        
        // 转换为DTO
        List<OrderRefundDTO> refundDTOs = refundPage.getContent().stream()
                .map(this::convertToRefundDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(refundDTOs, refundPage.getPageable(), refundPage.getTotalElements());
    }
    
    /**
     * 将退款实体转换为DTO
     */
    private OrderRefundDTO convertToRefundDTO(OrderRefund refund) {
        // 获取用户信息
        Long userId = null;
        String username = "";
        String phone = "";
        
        try {
            if (refund.getOrder() != null && refund.getOrder().getUser() != null) {
                User user = refund.getOrder().getUser();
                userId = user.getId();
                username = user.getUsername();
                phone = user.getPhone();
            }
        } catch (Exception e) {
            // 忽略用户查询异常
        }
        
        return OrderRefundDTO.builder()
                .id(refund.getId())
                .orderId(refund.getOrder() != null ? refund.getOrder().getId() : null)
                .orderNo(refund.getOrder() != null ? refund.getOrder().getOrderNo() : null)
                .userId(userId)
                .username(username)
                .phone(phone)
                .refundAmount(refund.getRefundAmount())
                .orderAmount(refund.getOrder() != null ? refund.getOrder().getPaymentAmount() : null)
                .reason(refund.getReason())
                .remark(refund.getRemark())
                .status(refund.getStatus())
                .statusText(getRefundStatusText(refund.getStatus()))
                .comment(refund.getComment())
                .processTime(refund.getProcessTime())
                .processor(refund.getProcessor())
                .refundMethod(refund.getRefundMethod())
                .refundMethodText(getRefundMethodText(refund.getRefundMethod()))
                .createdAt(refund.getCreatedAt())
                .build();
    }
    
    /**
     * 获取退款状态文本
     */
    private String getRefundStatusText(Integer status) {
        if (status == null) return "";
        
        return switch (status) {
            case 0 -> "待处理";
            case 1 -> "已退款";
            case 2 -> "已拒绝";
            default -> "未知状态";
        };
    }
    
    /**
     * 获取退款方式文本
     */
    private String getRefundMethodText(Integer method) {
        if (method == null) return "";
        
        return switch (method) {
            case 1 -> "原路返回";
            case 2 -> "退到余额";
            default -> "未知方式";
        };
    }
} 