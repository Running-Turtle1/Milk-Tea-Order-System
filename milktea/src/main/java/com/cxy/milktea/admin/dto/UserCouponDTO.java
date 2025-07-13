package com.cxy.milktea.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户优惠券数据传输对象
 * 用于管理端的会员优惠券管理功能
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCouponDTO {
    
    /**
     * 用户优惠券ID
     */
    private Long id;
    
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
     * 优惠券ID
     */
    private Long couponId;
    
    /**
     * 优惠券名称
     */
    private String couponName;
    
    /**
     * 优惠券类型: 0满减券 1折扣券 2现金券
     */
    private Integer couponType;
    
    /**
     * 优惠券类型文本描述
     */
    private String couponTypeText;
    
    /**
     * 优惠金额或折扣
     */
    private BigDecimal amount;
    
    /**
     * 最低消费金额
     */
    private BigDecimal minConsumption;
    
    /**
     * 使用范围：0全场通用 1指定分类 2指定商品
     */
    private Integer useScope;
    
    /**
     * 使用范围文本描述
     */
    private String useScopeText;
    
    /**
     * 优惠券有效期开始时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    /**
     * 优惠券有效期结束时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    /**
     * 状态：0未使用，1已使用，2已过期
     */
    private Integer status;
    
    /**
     * 状态文本描述
     */
    private String statusText;
    
    /**
     * 使用的订单ID
     */
    private Long orderId;
    
    /**
     * 使用的订单编号
     */
    private String orderNo;
    
    /**
     * 使用时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime usedTime;
    
    /**
     * 是否已过期
     */
    private Boolean expired;
    
    /**
     * 领取时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
} 