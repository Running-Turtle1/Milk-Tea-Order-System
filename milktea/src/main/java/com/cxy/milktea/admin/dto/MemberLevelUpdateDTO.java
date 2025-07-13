package com.cxy.milktea.admin.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 会员等级更新DTO
 * 用于创建和更新会员等级
 */
@Data
public class MemberLevelUpdateDTO {
    
    /**
     * 等级值
     */
    @NotNull(message = "等级值不能为空")
    @Min(value = 0, message = "等级值不能小于0")
    private Integer level;
    
    /**
     * 等级名称
     */
    @NotBlank(message = "等级名称不能为空")
    @Size(max = 50, message = "等级名称长度不能超过50个字符")
    private String name;
    
    /**
     * 等级图标
     */
    private String icon;
    
    /**
     * 升级所需积分
     */
    @NotNull(message = "升级所需积分不能为空")
    @Min(value = 0, message = "升级所需积分不能小于0")
    private Integer pointThreshold;
    
    /**
     * 消费金额门槛
     */
    @DecimalMin(value = "0.0", message = "消费金额门槛不能小于0")
    private BigDecimal amountThreshold;
    
    /**
     * 积分倍率
     */
    @NotNull(message = "积分倍率不能为空")
    @DecimalMin(value = "0.1", message = "积分倍率不能小于0.1")
    @DecimalMax(value = "10.0", message = "积分倍率不能大于10")
    private BigDecimal pointRate;
    
    /**
     * 折扣率
     */
    @NotNull(message = "折扣率不能为空")
    @DecimalMin(value = "0.1", message = "折扣率不能小于0.1")
    @DecimalMax(value = "1.0", message = "折扣率不能大于1")
    private BigDecimal discount;
    
    /**
     * 是否免配送费
     */
    private Boolean freeShipping = false;
    
    /**
     * 是否有生日特权
     */
    private Boolean birthdayPrivilege = false;
    
    /**
     * 是否优先制作
     */
    private Boolean priorityProduction = false;
    
    /**
     * 等级描述
     */
    @Size(max = 500, message = "等级描述长度不能超过500个字符")
    private String description;
    
    /**
     * 状态：0禁用，1启用
     */
    @NotNull(message = "状态不能为空")
    @Min(value = 0, message = "状态值无效")
    @Max(value = 1, message = "状态值无效")
    private Integer status;
} 