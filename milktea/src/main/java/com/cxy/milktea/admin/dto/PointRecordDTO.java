package com.cxy.milktea.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 积分记录DTO
 * 用于管理端会员积分管理功能展示积分记录
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointRecordDTO {
    
    /**
     * 记录ID
     */
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 积分变动数量
     */
    private Integer point;
    
    /**
     * 类型：1消费获得，2使用积分，3活动获得，4过期，5管理员调整
     */
    private Integer type;
    
    /**
     * 类型文本
     */
    private String typeText;
    
    /**
     * 关联订单ID
     */
    private Long orderId;
    
    /**
     * 变动描述
     */
    private String description;
    
    /**
     * 记录创建时间
     */
    private LocalDateTime createdAt;
} 