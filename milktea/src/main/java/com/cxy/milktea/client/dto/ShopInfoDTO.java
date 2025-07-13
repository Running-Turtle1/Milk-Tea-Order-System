package com.cxy.milktea.client.dto;

import lombok.Data;

/**
 * 门店信息DTO
 */
@Data
public class ShopInfoDTO {
    
    private Long id;
    
    /**
     * 店铺名称
     */
    private String shopName;
    
    /**
     * 店铺LOGO
     */
    private String logo;
    
    /**
     * 店铺地址
     */
    private String address;
    
    /**
     * 联系电话
     */
    private String phone;
    
    /**
     * 营业时间
     */
    private String businessHours;
    
    /**
     * 店铺公告
     */
    private String notice;
    
} 