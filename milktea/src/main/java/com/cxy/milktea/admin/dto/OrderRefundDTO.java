package com.cxy.milktea.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 退款详情DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRefundDTO {

    /**
     * 退款ID
     */
    private Long id;

    /**
     * 订单ID
     */
    private Long orderId;

    /**
     * 订单编号
     */
    private String orderNo;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 用户手机号
     */
    private String phone;

    /**
     * 退款金额
     */
    private BigDecimal refundAmount;

    /**
     * 订单总金额
     */
    private BigDecimal orderAmount;

    /**
     * 退款原因
     */
    private String reason;

    /**
     * 备注
     */
    private String remark;

    /**
     * 退款状态：0-待处理，1-已退款，2-已拒绝
     */
    private Integer status;

    /**
     * 退款状态文本
     */
    private String statusText;

    /**
     * 处理说明
     */
    private String comment;

    /**
     * 处理时间
     */
    private LocalDateTime processTime;
    
    /**
     * 处理人
     */
    private String processor;

    /**
     * 退款方式：1-原路返回，2-退到余额
     */
    private Integer refundMethod;

    /**
     * 退款方式文本
     */
    private String refundMethodText;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
} 