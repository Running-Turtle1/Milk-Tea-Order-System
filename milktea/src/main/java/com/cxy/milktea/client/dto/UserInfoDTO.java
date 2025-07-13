package com.cxy.milktea.client.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户信息DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDTO {
    
    /**
     * 用户ID
     */
    private Long id;
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 手机号
     */
    private String phone;
    
    /**
     * 头像
     */
    private String avatar;
    
    /**
     * 性别：0未知，1男，2女
     */
    private Integer gender;
    
    /**
     * 性别文本
     */
    private String genderText;
    
    /**
     * 生日
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthday;
    
    /**
     * 积分
     */
    private Integer totalPoints;
    
    /**
     * 会员等级
     */
    private Integer memberLevel;
    
    /**
     * 会员等级名称
     */
    private String memberLevelName;
    
    /**
     * 会员折扣率
     */
    private Double discount;
    
    /**
     * 会员积分倍率
     */
    private Double pointRate;
    
    /**
     * 会员特权列表
     */
    private String[] privileges;
    
    /**
     * 注册时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    /**
     * 今日是否已签到
     */
    private Boolean checkedInToday;
} 