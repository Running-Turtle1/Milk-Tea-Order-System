package com.cxy.milktea.client.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单数据传输对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    /**
     * 订单ID
     */
    private Long id;
    
    /**
     * 订单编号
     */
    private String orderNo;
    
    /**
     * 订单总金额
     */
    private BigDecimal totalAmount;
    
    /**
     * 会员折扣金额
     */
    private BigDecimal memberDiscountAmount;
    
    /**
     * 优惠券折扣金额
     */
    private BigDecimal couponDiscountAmount;
    
    /**
     * 订单折扣金额
     */
    private BigDecimal discountAmount;
    
    /**
     * 实际支付金额
     */
    private BigDecimal paymentAmount;
    
    /**
     * 支付方式
     */
    private String paymentMethod;
    
    /**
     * 支付时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime paymentTime;
    
    /**
     * 订单状态：0待支付，1已支付，2制作中，3待取餐，4已完成，5已取消
     */
    private Integer status;
    
    /**
     * 订单状态文本描述
     */
    private String statusText;
    
    /**
     * 取餐号
     */
    private String takeNo;
    
    /**
     * 订单备注
     */
    private String remark;
    
    /**
     * 使用的优惠券ID
     */
    private Long userCouponId;
    
    /**
     * 订单详情列表
     */
    private List<OrderDetailDTO> orderDetails;
    
    /**
     * 订单创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
} 