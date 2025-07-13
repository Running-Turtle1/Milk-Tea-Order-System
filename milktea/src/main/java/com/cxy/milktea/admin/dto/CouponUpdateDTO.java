package com.cxy.milktea.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券更新数据传输对象
 * 用于创建或更新优惠券信息
 */
@Data
public class CouponUpdateDTO {
    
    /**
     * 优惠券名称
     */
    @NotBlank(message = "优惠券名称不能为空")
    @Size(max = 50, message = "优惠券名称长度不能超过50")
    private String name;
    
    /**
     * 优惠券类型：1满减券，2折扣券
     */
    @NotNull(message = "优惠券类型不能为空")
    @Min(value = 1, message = "优惠券类型值无效")
    @Max(value = 2, message = "优惠券类型值无效")
    private Integer type;
    
    /**
     * 优惠券金额/折扣
     */
    @NotNull(message = "优惠券金额/折扣不能为空")
    @DecimalMin(value = "0.01", message = "优惠券金额/折扣必须大于0")
    private BigDecimal amount;
    
    /**
     * 最低消费金额
     */
    @NotNull(message = "最低消费金额不能为空")
    @DecimalMin(value = "0", message = "最低消费金额不能小于0")
    private BigDecimal minConsumption;
    
    /**
     * 使用范围：0全场通用，1指定商品
     */
    @NotNull(message = "使用范围不能为空")
    @Min(value = 0, message = "使用范围值无效")
    @Max(value = 1, message = "使用范围值无效")
    private Integer useScope;
    
    /**
     * 会员等级限制：0所有会员，1-3分别对应会员等级
     */
    @NotNull(message = "会员等级限制不能为空")
    @Min(value = 0, message = "会员等级限制值无效")
    @Max(value = 3, message = "会员等级限制值无效")
    private Integer memberLevel;
    
    /**
     * 发放总量（null表示不限制）
     */
    @Min(value = 1, message = "发放总量必须大于0")
    private Integer total;
    
    /**
     * 每人限领数量（null表示不限制）
     */
    @Min(value = 1, message = "每人限领数量必须大于0")
    private Integer perLimit;
    
    /**
     * 有效期开始时间
     */
    @NotNull(message = "有效期开始时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;
    
    /**
     * 有效期结束时间
     */
    @NotNull(message = "有效期结束时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
    
    /**
     * 使用说明
     */
    @Size(max = 500, message = "使用说明长度不能超过500")
    private String description;
    
    /**
     * 状态：0禁用，1启用
     */
    @NotNull(message = "状态不能为空")
    @Min(value = 0, message = "状态值无效")
    @Max(value = 1, message = "状态值无效")
    private Integer status;
} 