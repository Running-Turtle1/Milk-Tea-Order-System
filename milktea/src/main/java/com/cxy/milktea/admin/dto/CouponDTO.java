package com.cxy.milktea.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券数据传输对象
 * 用于管理端的优惠券管理功能
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponDTO {
    
    /**
     * 优惠券ID
     */
    private Long id;
    
    /**
     * 优惠券名称
     */
    private String name;
    
    /**
     * 优惠券类型：1满减券，2折扣券
     */
    private Integer type;
    
    /**
     * 优惠券类型文本描述
     */
    private String typeText;
    
    /**
     * 优惠券金额/折扣
     */
    private BigDecimal amount;
    
    /**
     * 最低消费金额
     */
    private BigDecimal minConsumption;
    
    /**
     * 使用范围：0全场通用，1指定商品
     */
    private Integer useScope;
    
    /**
     * 使用范围文本描述
     */
    private String useScopeText;
    
    /**
     * 会员等级限制：0所有会员，1-3分别对应会员等级
     */
    private Integer memberLevel;
    
    /**
     * 会员等级文本描述
     */
    private String memberLevelText;
    
    /**
     * 发放总量
     */
    private Integer total;
    
    /**
     * 已发放数量
     */
    private Integer issued;
    
    /**
     * 已使用数量
     */
    private Integer used;
    
    /**
     * 每人限领数量
     */
    private Integer perLimit;
    
    /**
     * 有效期开始时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    /**
     * 有效期结束时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    /**
     * 使用说明
     */
    private String description;
    
    /**
     * 状态：0禁用，1启用
     */
    private Integer status;
    
    /**
     * 状态文本描述
     */
    private String statusText;
    
    /**
     * 是否过期
     */
    private Boolean expired;
    
    /**
     * 剩余数量
     */
    private Integer remaining;
    
    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
} 