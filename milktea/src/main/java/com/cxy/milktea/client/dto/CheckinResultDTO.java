package com.cxy.milktea.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 签到结果DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinResultDTO {
    
    /**
     * 是否签到成功
     */
    private Boolean success;
    
    /**
     * 签到日期
     */
    private LocalDate date;
    
    /**
     * 获得的积分
     */
    private Integer points;
    
    /**
     * 当前总积分
     */
    private Integer totalPoints;
    
    /**
     * 连续签到天数
     */
    private Integer consecutiveDays;
} 