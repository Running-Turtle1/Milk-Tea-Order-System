package com.cxy.milktea.client.dto;

import lombok.*;
import java.util.List;

/**
 * 签到记录DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinRecordDTO {
    
    /**
     * 已签到的日期列表（日期的天数，例如[1,2,3,5,8]）
     */
    private List<Integer> days;
    
    /**
     * 连续签到天数
     */
    private Integer continuesDays;
    
    /**
     * 当月总天数
     */
    private Integer currentMonthDays;
} 