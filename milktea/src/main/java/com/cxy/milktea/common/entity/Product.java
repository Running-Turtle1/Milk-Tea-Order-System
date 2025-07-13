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
 * 商品实体类
 * 存储奶茶商品的基本信息、价格、库存和状态等
 */
@Entity
@Table(name = "product")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    /**
     * 商品ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 商品所属分类
     * 延迟加载以提高性能
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /**
     * 商品名称
     */
    @Column(nullable = false)
    private String name;

    /**
     * 商品图片URL
     */
    private String image;

    /**
     * 商品描述，使用TEXT类型存储长文本
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 商品价格，精确到两位小数
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * 商品库存数量
     */
    private Integer stock;

    /**
     * 商品销量，默认为0
     */
    @Builder.Default
    private Integer sales = 0;

    /**
     * 是否推荐：0否，1是
     * 推荐商品会在首页展示
     */
    @Builder.Default
    private Integer isRecommend = 0;

    /**
     * 是否支持定制：0否，1是
     * 支持定制的商品可以选择配料和规格
     */
    @Builder.Default
    private Integer supportCustom = 1;

    /**
     * 商品排序值，越大排序越靠前
     */
    private Integer sort;

    /**
     * 商品状态：0下架，1上架
     */
    @Builder.Default
    private Integer status = 1;

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
} 