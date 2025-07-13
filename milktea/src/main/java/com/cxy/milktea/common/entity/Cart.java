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

@Entity
@Table(name = "cart")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    private String temperature;

    private String sweetness;

    // 配料JSON格式，包含ID和名称
    @Column(columnDefinition = "TEXT")
    private String ingredients;
    
    // 添加属性哈希值字段
    @Column(length = 64)
    private String attributesHash;
    
    // 添加配料哈希值字段
    @Column(length = 64)
    private String ingredientsHash;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;
    
    // 添加选中标志，用于结算时选择
    @Column(nullable = false)
    private Boolean selected = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
} 