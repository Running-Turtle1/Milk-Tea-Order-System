package com.cxy.milktea.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 退款查询DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundQueryDTO {

    /**
     * 订单编号
     */
    private String orderNo;

    /**
     * 关键词，用于搜索用户名或手机号
     */
    private String keyword;

    /**
     * 退款状态：0-待处理，1-已退款，2-已拒绝
     */
    private Integer status;

    /**
     * 开始日期
     */
    private LocalDate startDate;

    /**
     * 结束日期
     */
    private LocalDate endDate;
} 