package com.cxy.milktea.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 会员信息DTO
 * 用于管理端会员管理功能展示会员信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
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
     * 用户头像URL
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
     * 用户生日
     */
    private LocalDate birthday;
    
    /**
     * 用户总积分
     */
    private Integer totalPoints;
    
    /**
     * 会员等级：0普通会员，1银卡会员，2金卡会员，3黑卡会员
     */
    private Integer memberLevel;
    
    /**
     * 会员等级文本
     */
    private String memberLevelText;
    
    /**
     * 用户状态：0禁用，1启用
     */
    private Integer status;
    
    /**
     * 状态文本
     */
    private String statusText;
    
    /**
     * 注册时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 最近消费时间
     */
    private LocalDateTime lastOrderTime;
    
    /**
     * 消费次数
     */
    private Long orderCount;
    
    /**
     * 消费总金额
     */
    private Double totalAmount;
} 