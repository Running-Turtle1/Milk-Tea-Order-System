package com.cxy.milktea.admin.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class OrderQueryDTO {
    
    private String orderNo;  // 订单号
    
    private String keyword;  // 关键字（用户名、手机号）
    
    private Integer status;  // 订单状态
    
    private String takeNo;  // 取餐号
    
    private LocalDate startDate;  // 开始日期
    
    private LocalDate endDate;  // 结束日期
} 