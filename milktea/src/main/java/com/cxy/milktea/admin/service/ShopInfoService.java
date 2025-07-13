package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.ShopInfoDTO;

/**
 * 店铺信息Service接口
 */
public interface ShopInfoService {
    
    /**
     * 获取店铺信息
     *
     * @return 店铺信息DTO
     */
    ShopInfoDTO getShopInfo();
    
    /**
     * 更新店铺信息
     *
     * @param shopInfoDTO 店铺信息DTO
     * @return 更新后的店铺信息DTO
     */
    ShopInfoDTO updateShopInfo(ShopInfoDTO shopInfoDTO);
} 