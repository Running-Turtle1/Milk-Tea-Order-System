package com.cxy.milktea.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 订单退款DTO
 */
@Data
public class RefundOrderDTO {
    
    /**
     * 订单ID
     */
    @NotNull(message = "订单ID不能为空")
    private Long orderId;
    
    /**
     * 退款原因
     */
    @NotBlank(message = "退款原因不能为空")
    private String reason;
    
    /**
     * 退款备注（可选）
     */
    private String remark;
    
    /**
     * 操作人ID
     */
    private Long operatorId;
    
    /**
     * 操作人姓名
     */
    private String operatorName;
} 