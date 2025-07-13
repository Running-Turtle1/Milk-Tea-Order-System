package com.cxy.milktea.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 用户优惠券关联实体类
 * 记录用户领取和使用优惠券的信息
 */
@Entity
@Table(name = "user_coupon")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCoupon {
    
    /**
     * ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 用户ID
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    /**
     * 优惠券ID
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;
    
    /**
     * 状态：0未使用，1已使用，2已过期
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer status = 0;
    
    /**
     * 使用时间
     */
    private LocalDateTime usedTime;
    
    /**
     * 使用的订单ID
     */
    private Long orderId;
    
    /**
     * 创建时间（领取时间）
     */
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;
} 