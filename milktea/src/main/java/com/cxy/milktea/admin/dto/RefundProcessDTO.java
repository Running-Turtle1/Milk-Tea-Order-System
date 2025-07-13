package com.cxy.milktea.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 处理退款请求DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundProcessDTO {

    /**
     * 退款ID
     */
    @NotNull(message = "退款ID不能为空")
    private Long refundId;

    /**
     * 处理结果：1-同意退款，2-拒绝退款
     */
    @NotNull(message = "处理结果不能为空")
    private Integer result;

    /**
     * 处理说明
     */
    private String comment;

    /**
     * 处理人
     */
    private String processor;
} 