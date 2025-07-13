package com.cxy.milktea.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

/**
 * 优惠券查询条件数据传输对象
 * 用于管理端查询优惠券列表
 */
@Data
public class CouponQueryDTO {
    
    /**
     * 关键词（优惠券名称）
     */
    private String keyword;
    
    /**
     * 优惠券类型：1满减券，2折扣券
     */
    private Integer type;
    
    /**
     * 使用范围：0全场通用，1指定商品
     */
    private Integer useScope;
    
    /**
     * 会员等级限制：0所有会员，1-3分别对应会员等级
     */
    private Integer memberLevel;
    
    /**
     * 状态：0禁用，1启用
     */
    private Integer status;
    
    /**
     * 开始日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    /**
     * 结束日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
} 