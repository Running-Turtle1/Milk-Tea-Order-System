package com.cxy.milktea.admin.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

/**
 * 用户优惠券查询条件数据传输对象
 * 用于管理端查询用户优惠券列表
 */
@Data
public class UserCouponQueryDTO {
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 优惠券ID
     */
    private Long couponId;
    
    /**
     * 状态：0未使用，1已使用，2已过期
     */
    private Integer status;
    
    /**
     * 开始日期（领取时间范围）
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    /**
     * 结束日期（领取时间范围）
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
} 