package com.cxy.milktea.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 会员等级DTO
 * 用于管理端会员等级管理
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberLevelDTO {
    
    /**
     * 等级ID
     */
    private Long id;
    
    /**
     * 等级值
     */
    private Integer level;
    
    /**
     * 等级名称
     */
    private String name;
    
    /**
     * 等级图标
     */
    private String icon;
    
    /**
     * 升级所需积分
     */
    private Integer pointThreshold;
    
    /**
     * 消费金额门槛
     */
    private BigDecimal amountThreshold;
    
    /**
     * 积分倍率
     */
    private BigDecimal pointRate;
    
    /**
     * 折扣率
     */
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
     * 状态文本
     */
    private String statusText;
    
    /**
     * 会员人数统计
     */
    private Integer memberCount;
    
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