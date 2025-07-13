package com.cxy.milktea.client.service;

import com.cxy.milktea.client.dto.OrderDTO;
import com.cxy.milktea.client.dto.OrderRequest;
import com.cxy.milktea.client.dto.RefundDTO;
import com.cxy.milktea.client.dto.RefundRequestDTO;
import org.springframework.data.domain.Page;

public interface OrderService {
    
    /**
     * 创建订单
     * @param orderRequest 订单请求
     * @return 创建的订单
     */
    OrderDTO createOrder(OrderRequest orderRequest);
    
    /**
     * 支付订单
     * @param orderNo 订单编号
     * @param paymentMethod 支付方式
     * @return 支付后的订单
     */
    OrderDTO payOrder(String orderNo, String paymentMethod);
    
    /**
     * 取消订单
     * @param orderNo 订单编号
     * @return 取消的订单
     */
    OrderDTO cancelOrder(String orderNo);
    
    /**
     * 获取订单详情
     * @param orderNo 订单编号
     * @return 订单详情
     */
    OrderDTO getOrderDetail(String orderNo);
    
    /**
     * 获取用户订单列表
     * @param status 订单状态，为null时查询所有状态
     * @param page 页码
     * @param size 每页大小
     * @return 订单分页结果
     */
    Page<OrderDTO> getUserOrders(Integer status, int page, int size);
    
    /**
     * 删除订单
     * @param orderNo 订单编号
     * @return 是否删除成功
     */
    boolean deleteOrder(String orderNo);
    
    /**
     * 申请订单退款
     * @param refundRequest 退款请求
     * @return 退款详情
     */
    RefundDTO applyRefund(RefundRequestDTO refundRequest);
    
    /**
     * 获取退款详情
     * @param refundId 退款ID
     * @return 退款详情
     */
    RefundDTO getRefundDetail(Long refundId);
    
    /**
     * 获取用户退款列表
     * @param status 退款状态，为null时查询所有状态
     * @param page 页码
     * @param size 每页大小
     * @return 退款分页结果
     */
    Page<RefundDTO> getUserRefunds(Integer status, int page, int size);
} 