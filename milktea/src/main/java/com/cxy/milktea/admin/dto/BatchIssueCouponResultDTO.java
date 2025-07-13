package com.cxy.milktea.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 批量发放优惠券结果DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchIssueCouponResultDTO {
    
    /**
     * 总共选中的用户数量
     */
    private int totalSelected;
    
    /**
     * 成功发放的数量
     */
    private int successCount;
    
    /**
     * 已经领取过优惠券的用户ID及其用户名
     */
    private List<Map<String, Object>> alreadyReceived;
    
    /**
     * 因其他原因无法发放的用户ID及原因
     */
    private List<Map<String, Object>> failedUsers;
} 