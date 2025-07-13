package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.OrderDTO;
import com.cxy.milktea.admin.dto.OrderDetailDTO;
import com.cxy.milktea.admin.dto.OrderQueryDTO;
import com.cxy.milktea.admin.dto.OrderStatusUpdateDTO;
import com.cxy.milktea.admin.dto.RefundOrderDTO;
import com.cxy.milktea.admin.dto.OrderRefundDTO;
import com.cxy.milktea.admin.dto.RefundProcessDTO;
import com.cxy.milktea.admin.dto.RefundQueryDTO;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface OrderService {
    
    /**
     * 分页查询订单列表
     */
    Page<OrderDTO> getOrders(OrderQueryDTO queryDTO, int page, int size);
    
    /**
     * 根据ID获取订单详情
     */
    OrderDTO getOrderById(Long id);
    
    /**
     * 获取订单的商品详情
     */
    List<OrderDetailDTO> getOrderDetails(Long orderId);
    
    /**
     * 更新订单状态
     * 注：在新的订单流程中，此方法已不再需要，保留接口但实现会抛出异常
     */
    OrderDTO updateOrderStatus(OrderStatusUpdateDTO statusUpdateDTO);
    
    /**
     * 订单退款功能
     * @param refundDTO 包含退款信息的DTO
     * @return 退款后的订单信息
     */
    OrderDTO refundOrder(RefundOrderDTO refundDTO);
    
    /**
     * 获取今日订单统计
     * @return 返回包含总订单数、待处理订单数、已取消订单数的统计信息
     */
    Map<String, Object> getTodayOrderStats();
    
    /**
     * 获取指定日期范围内的订单统计
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 返回包含每日订单数量、状态分布等统计信息的Map
     */
    Map<String, Object> getOrderStatsByDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取收入统计
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 返回包含总收入和每日收入分布的统计信息
     */
    Map<String, Object> getIncomeStats(LocalDate startDate, LocalDate endDate);
    
    /**
     * 生成取餐号
     * @return 返回生成的取餐号
     */
    String generateTakeNumber();
    
    /**
     * 处理退款申请
     * @param refundProcessDTO 退款处理DTO
     * @return 处理后的退款信息
     */
    OrderRefundDTO processRefund(RefundProcessDTO refundProcessDTO);
    
    /**
     * 获取退款信息
     * @param refundId 退款ID
     * @return 退款详情
     */
    OrderRefundDTO getRefundById(Long refundId);
    
    /**
     * 获取订单的退款记录
     * @param orderId 订单ID
     * @return 退款记录列表
     */
    List<OrderRefundDTO> getRefundsByOrderId(Long orderId);
    
    /**
     * 分页查询退款记录
     * @param queryDTO 查询条件
     * @param page 页码
     * @param size 每页大小
     * @return 退款记录分页结果
     */
    Page<OrderRefundDTO> getRefunds(RefundQueryDTO queryDTO, int page, int size);
} 