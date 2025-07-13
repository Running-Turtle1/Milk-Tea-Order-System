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
 * 会员等级实体类
 * 定义奶茶店的会员等级体系及相关特权
 */
@Entity
@Table(name = "member_level")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberLevel {
    
    /**
     * 等级ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 等级值
     */
    @Column(nullable = false, unique = true)
    private Integer level;
    
    /**
     * 等级名称
     */
    @Column(nullable = false)
    private String name;
    
    /**
     * 等级图标
     */
    private String icon;
    
    /**
     * 升级所需积分
     */
    @Column(nullable = false)
    private Integer pointThreshold;
    
    /**
     * 消费金额门槛
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal amountThreshold;
    
    /**
     * 积分倍率
     */
    @Column(precision = 5, scale = 2)
    private BigDecimal pointRate;
    
    /**
     * 折扣率
     */
    @Column(precision = 5, scale = 2)
    private BigDecimal discount;
    
    /**
     * 是否免配送费
     */
    private Boolean freeShipping;
    
    /**
     * 是否有生日特权
     */
    private Boolean birthdayPrivilege;
    
    /**
     * 是否优先制作
     */
    private Boolean priorityProduction;
    
    /**
     * 等级描述
     */
    private String description;
    
    /**
     * 状态：0禁用，1启用
     */
    private Integer status;
    
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