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
import java.util.ArrayList;
import java.util.List;

/**
 * 订单实体类
 * 存储用户订单的基本信息、支付信息、状态和订单明细等
 */
@Entity
@Table(name = "`order`")  // 因为order是SQL关键字，需要用反引号
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    /**
     * 订单ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 订单编号，唯一标识
     */
    @Column(nullable = false, unique = true)
    private String orderNo;

    /**
     * 订单所属用户
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 订单商品总金额（未优惠前）
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    /**
     * 会员折扣金额
     */
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal memberDiscountAmount = BigDecimal.ZERO;

    /**
     * 优惠券折扣金额
     */
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal couponDiscountAmount = BigDecimal.ZERO;

    /**
     * 总优惠金额，默认为0
     */
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    /**
     * 实际支付金额（优惠后）
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal paymentAmount;

    /**
     * 支付方式，如微信、支付宝等
     */
    private String paymentMethod;

    /**
     * 支付时间
     */
    private LocalDateTime paymentTime;

    /**
     * 订单状态：
     * 0待支付，1已支付，2已完成，3退款中，4已退款，5已取消
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer status = 0;

    /**
     * 取餐号
     */
    private String takeNo;

    /**
     * 订单备注信息
     */
    private String remark;

    /**
     * 使用的优惠券ID
     */
    private Long userCouponId;

    /**
     * 订单明细列表，级联保存和删除
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderDetail> orderDetails = new ArrayList<>();

    /**
     * 创建时间，自动生成
     */
    @CreationTimestamp
    private LocalDateTime createdAt;

    /**
     * 更新时间，自动更新
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    /**
     * 添加订单明细的方法
     * 同时设置明细与订单的双向关联
     * 
     * @param orderDetail 要添加的订单明细对象
     */
    public void addOrderDetail(OrderDetail orderDetail) {
        orderDetails.add(orderDetail);
        orderDetail.setOrder(this);
    }
} 