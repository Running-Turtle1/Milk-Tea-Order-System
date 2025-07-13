package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.ShopInfoDTO;
import com.cxy.milktea.admin.service.ShopInfoService;
import com.cxy.milktea.common.entity.ShopInfo;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.ShopInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 店铺信息Service实现类
 */
@Service("adminShopInfoService")  // 指定Bean名称，避免与客户端实现类冲突
@RequiredArgsConstructor
public class ShopInfoServiceImpl implements ShopInfoService {

    private final ShopInfoRepository shopInfoRepository;

    @Override
    public ShopInfoDTO getShopInfo() {
        // 获取ID为1的店铺信息，如果不存在则创建默认的店铺信息
        ShopInfo shopInfo = shopInfoRepository.findById(1L)
                .orElseGet(() -> createDefaultShopInfo());
        
        return convertToDTO(shopInfo);
    }

    @Override
    @Transactional
    public ShopInfoDTO updateShopInfo(ShopInfoDTO shopInfoDTO) {
        // 获取店铺信息，如果不存在则创建
        ShopInfo shopInfo = shopInfoRepository.findById(1L)
                .orElseGet(() -> createDefaultShopInfo());
        
        // 更新店铺信息
        shopInfo.setShopName(shopInfoDTO.getShopName());
        shopInfo.setLogo(shopInfoDTO.getLogo());
        shopInfo.setAddress(shopInfoDTO.getAddress());
        shopInfo.setPhone(shopInfoDTO.getPhone());
        shopInfo.setBusinessHours(shopInfoDTO.getBusinessHours());
        shopInfo.setNotice(shopInfoDTO.getNotice());
        shopInfo.setDescription(shopInfoDTO.getDescription());
        shopInfo.setEmail(shopInfoDTO.getEmail());
        
        // 保存更新后的店铺信息
        ShopInfo updatedShopInfo = shopInfoRepository.save(shopInfo);
        
        return convertToDTO(updatedShopInfo);
    }
    
    /**
     * 创建默认的店铺信息
     */
    private ShopInfo createDefaultShopInfo() {
        ShopInfo shopInfo = new ShopInfo();
        shopInfo.setId(1L);
        shopInfo.setShopName("奶茶物语");
        shopInfo.setLogo("https://example.com/logo.jpg");
        shopInfo.setAddress("请设置店铺地址");
        shopInfo.setPhone("请设置联系电话");
        shopInfo.setBusinessHours("09:00-22:00");
        shopInfo.setNotice("欢迎光临奶茶物语");
        shopInfo.setAnnouncementStatus(0);
        
        return shopInfoRepository.save(shopInfo);
    }
    
    /**
     * 将实体转换为DTO
     */
    private ShopInfoDTO convertToDTO(ShopInfo shopInfo) {
        return ShopInfoDTO.builder()
                .id(shopInfo.getId())
                .shopName(shopInfo.getShopName())
                .logo(shopInfo.getLogo())
                .address(shopInfo.getAddress())
                .phone(shopInfo.getPhone())
                .businessHours(shopInfo.getBusinessHours())
                .notice(shopInfo.getNotice())
                .announcement(shopInfo.getAnnouncement())
                .announcementStatus(shopInfo.getAnnouncementStatus())
                .description(shopInfo.getDescription())
                .email(shopInfo.getEmail())
                .createdAt(shopInfo.getCreatedAt())
                .updatedAt(shopInfo.getUpdatedAt())
                .build();
    }
} 