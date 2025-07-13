package com.cxy.milktea.admin.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 会员查询条件DTO
 * 用于管理端会员查询功能的查询条件封装
 */
@Data
public class UserQueryDTO {
    
    /**
     * 用户名或手机号关键词
     */
    private String keyword;
    
    /**
     * 会员等级：0普通会员，1银卡会员，2金卡会员，3黑卡会员
     */
    private Integer memberLevel;
    
    /**
     * 会员状态：0禁用，1启用
     */
    private Integer status;
    
    /**
     * 最小积分
     */
    private Integer minPoints;
    
    /**
     * 最大积分
     */
    private Integer maxPoints;
    
    /**
     * 注册开始日期
     */
    private LocalDate startDate;
    
    /**
     * 注册结束日期
     */
    private LocalDate endDate;
} 