package com.cxy.milktea.client.controller;


import com.cxy.milktea.client.dto.ShopInfoDTO;
import com.cxy.milktea.client.service.ShopInfoService;
import com.cxy.milktea.common.util.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 门店信息控制器
 */
@RestController
@RequestMapping("/shop")
@Component("clientShopInfoController")  // 指定Bean名称，避免与管理端控制器冲突
public class ShopInfoController {

    private final ShopInfoService shopInfoService;
    
    @Autowired
    public ShopInfoController(@Qualifier("clientShopInfoService") ShopInfoService shopInfoService) {
        this.shopInfoService = shopInfoService;
    }
    
    /**
     * 获取门店信息
     * @return 门店信息
     */
    @GetMapping("/info")
    public Result<ShopInfoDTO> getShopInfo() {
        ShopInfoDTO shopInfo = shopInfoService.getShopInfo();
        return Result.success(shopInfo);
    }
} 