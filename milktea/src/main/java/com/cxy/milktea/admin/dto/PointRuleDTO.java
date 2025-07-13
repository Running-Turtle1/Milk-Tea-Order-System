package com.cxy.milktea.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 积分规则DTO
 * 用于管理端积分规则管理
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointRuleDTO {
    
    /**
     * 规则ID
     */
    private Long id;
    
    /**
     * 规则名称
     */
    private String name;
    
    /**
     * 规则类型
     * 1-消费获取，2-评价获取，3-首次注册，4-每日签到，6-邀请注册
     */
    private Integer type;
    
    /**
     * 规则类型文本
     */
    private String typeText;
    
    /**
     * 积分获取公式说明
     */
    private String formula;
    
    /**
     * 是否为消费金额比例 (仅适用于消费积分)
     */
    private Boolean isRatio;
    
    /**
     * 积分比例/值
     */
    private BigDecimal pointValue;
    
    /**
     * 最低消费金额 (仅适用于消费积分)
     */
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
    private Integer status;
    
    /**
     * 状态文本
     */
    private String statusText;
    
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