package com.cxy.milktea.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券实体类
 */
@Entity
@Table(name = "coupon")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {
    
    /**
     * 优惠券ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 优惠券名称
     */
    @Column(nullable = false)
    private String name;
    
    /**
     * 优惠券类型：1满减券，2折扣券
     */
    @Column(nullable = false)
    private Integer type;
    
    /**
     * 优惠券金额（满减券为减免金额，折扣券为折扣比例，如8.5表示85折）
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    /**
     * 最低消费金额（达到这个金额才可使用）
     */
    @Column(name = "min_consumption", nullable = false, precision = 10, scale = 2)
    private BigDecimal minPoint;
    
    /**
     * 使用范围：0全场通用，1指定商品
     */
    @Column(nullable = false)
    private Integer useScope;
    
    /**
     * 会员等级限制：0所有会员，1-3分别对应会员等级
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer memberLevel = 0;
    
    /**
     * 发放总量（null表示不限制）
     */
    private Integer total;
    
    /**
     * 已发放数量
     */
    @Builder.Default
    private Integer issued = 0;
    
    /**
     * 已使用数量
     */
    @Builder.Default
    private Integer used = 0;
    
    /**
     * 每人限领数量（null表示不限制）
     */
    private Integer perLimit;
    
    /**
     * 有效期开始时间
     */
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    /**
     * 有效期结束时间
     */
    @Column(nullable = false)
    private LocalDateTime endTime;
    
    /**
     * 使用说明
     */
    private String description;
    
    /**
     * 状态：0禁用，1启用
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer status = 1;
    
    /**
     * 创建时间
     */
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;
} 