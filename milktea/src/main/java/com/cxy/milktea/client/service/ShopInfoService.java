package com.cxy.milktea.client.service;

import com.cxy.milktea.client.dto.ShopInfoDTO;

/**
 * 门店信息服务接口
 */
public interface ShopInfoService {
    
    /**
     * 获取门店信息
     * @return 门店信息DTO
     */
    ShopInfoDTO getShopInfo();
    
} 