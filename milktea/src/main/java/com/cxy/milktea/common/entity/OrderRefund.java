package com.cxy.milktea.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单退款实体
 */
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "order_refund")
@EntityListeners(AuditingEntityListener.class)
public class OrderRefund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 关联的订单
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * 退款金额
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal refundAmount;
    
    /**
     * 订单金额
     */
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * 退款原因
     */
    @Column(length = 255)
    private String reason;

    /**
     * 备注
     */
    @Column(length = 500)
    private String remark;

    /**
     * 退款状态：0-待处理，1-已退款，2-已拒绝
     */
    @Column(nullable = false)
    private Integer status;

    /**
     * 处理说明
     */
    @Column(length = 500)
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
     * 创建时间
     */
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
} 