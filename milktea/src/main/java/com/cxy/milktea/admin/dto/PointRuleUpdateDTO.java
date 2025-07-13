package com.cxy.milktea.admin.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 积分规则更新DTO
 * 用于创建和更新积分规则
 */
@Data
public class PointRuleUpdateDTO {
    
    /**
     * 规则名称
     */
    @NotBlank(message = "规则名称不能为空")
    @Size(max = 50, message = "规则名称长度不能超过50个字符")
    private String name;
    
    /**
     * 规则类型
     * 1-消费获取，2-评价获取，3-首次注册，4-每日签到，6-邀请注册
     */
    @NotNull(message = "规则类型不能为空")
    @Min(value = 1, message = "规则类型无效")
    @Max(value = 6, message = "规则类型无效")
    private Integer type;
    
    /**
     * 积分获取公式说明
     */
    @Size(max = 200, message = "公式说明长度不能超过200个字符")
    private String formula;
    
    /**
     * 是否为消费金额比例 (仅适用于消费积分)
     */
    private Boolean isRatio = false;
    
    /**
     * 积分比例/值
     */
    @NotNull(message = "积分比例/值不能为空")
    @DecimalMin(value = "0.1", message = "积分比例/值不能小于0.1")
    private BigDecimal pointValue;
    
    /**
     * 最低消费金额 (仅适用于消费积分)
     */
    @DecimalMin(value = "0.0", message = "最低消费金额不能小于0")
    private BigDecimal minAmount;
    
    /**
     * 最高获取积分 (仅适用于消费积分)
     */
    @Min(value = 0, message = "最高获取积分不能小于0")
    private Integer maxPoints;
    
    /**
     * 描述
     */
    @Size(max = 500, message = "描述长度不能超过500个字符")
    private String description;
    
    /**
     * 启用状态：0禁用，1启用
     */
    @NotNull(message = "状态不能为空")
    @Min(value = 0, message = "状态值无效")
    @Max(value = 1, message = "状态值无效")
    private Integer status;
} 