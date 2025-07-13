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
 * 积分规则实体类
 * 定义不同行为的积分获取规则
 */
@Entity
@Table(name = "point_rule")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointRule {
    
    /**
     * 规则ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 规则名称
     */
    @Column(nullable = false)
    private String name;
    
    /**
     * 规则类型
     * 1-消费获取，2-评价获取，3-首次注册，4-每日签到，6-邀请注册
     */
    @Column(nullable = false)
    private Integer type;
    
    /**
     * 积分获取公式说明
     */
    private String formula;
    
    /**
     * 是否为消费金额比例 (仅适用于消费积分)
     * 1表示按比例，每消费1元获得多少积分
     * 0表示按订单，每笔订单获得固定积分
     */
    private Boolean isRatio;
    
    /**
     * 积分比例/值
     * 对于消费积分：如果isRatio=true，则表示每消费1元获得的积分；如果isRatio=false，则表示每笔订单获得的固定积分
     * 对于其他类型：表示该行为获得的固定积分值
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal pointValue;
    
    /**
     * 最低消费金额 (仅适用于消费积分)
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal minAmount;
    
    /**
     * 最高获取积分 (仅适用于消费积分)
     */
    private Integer maxPoints;
    
    /**
     * 描述
     */
    private String description;
    
    /**
     * 启用状态：0禁用，1启用
     */
    @Column(nullable = false)
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