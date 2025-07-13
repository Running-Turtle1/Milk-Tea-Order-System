package com.cxy.milktea.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    
    private Long id;
    
    private String orderNo;
    
    private Long userId;
    
    private String username;
    
    private String phone;
    
    private BigDecimal totalAmount;
    
    private BigDecimal discountAmount;
    
    private BigDecimal paymentAmount;
    
    private String paymentMethod;
    
    private LocalDateTime paymentTime;
    
    private Integer status;  // 0待支付，1已支付，2制作中，3待取餐，4已完成，5已取消
    
    private String statusText;  // 状态文本表示
    
    private String takeNo;  // 取餐号
    
    private String remark;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 