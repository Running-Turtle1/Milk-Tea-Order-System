package com.cxy.milktea.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 积分调整DTO
 * 用于管理员手动调整会员积分的请求参数封装
 */
@Data
public class PointAdjustDTO {
    
    /**
     * 用户ID
     */
    @NotNull(message = "用户ID不能为空")
    private Long userId;
    
    /**
     * 积分变动数量，正数为增加，负数为减少
     */
    @NotNull(message = "积分变动数量不能为空")
    private Integer point;
    
    /**
     * 调整原因
     */
    @NotBlank(message = "调整原因不能为空")
    private String description;
} 