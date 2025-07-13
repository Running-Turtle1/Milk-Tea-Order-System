package com.cxy.milktea.client.service.impl;

import com.cxy.milktea.client.dto.ShopInfoDTO;
import com.cxy.milktea.client.service.ShopInfoService;
import com.cxy.milktea.common.entity.ShopInfo;
import com.cxy.milktea.common.repository.ShopInfoRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * 门店信息服务实现类
 */
@Service("clientShopInfoService")  // 指定Bean名称，避免与管理端实现类冲突
public class ShopInfoServiceImpl implements ShopInfoService {

    @Autowired
    private ShopInfoRepository shopInfoRepository;
    
    @Override
    @Cacheable(value = "shopInfo", key = "'shopInfo'", unless = "#result == null")
    public ShopInfoDTO getShopInfo() {
        // 通常门店信息只有一条记录，获取ID为1的记录
        ShopInfo shopInfo = shopInfoRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("门店信息不存在"));
        
        // 转换为DTO返回
        ShopInfoDTO shopInfoDTO = new ShopInfoDTO();
        BeanUtils.copyProperties(shopInfo, shopInfoDTO);
        
        return shopInfoDTO;
    }
} 