package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.ShopInfoDTO;
import com.cxy.milktea.admin.service.ShopInfoService;
import com.cxy.milktea.client.service.FileService;
import com.cxy.milktea.common.response.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 店铺信息管理控制器
 */
@RestController
@RequestMapping("/admin/shop")
@Component("adminShopInfoController")  // 指定Bean名称，避免与客户端控制器冲突
@RequiredArgsConstructor
public class ShopInfoController {
    
    @Qualifier("adminShopInfoService") 
    private final ShopInfoService shopInfoService;
    private final FileService fileService;
    
    /**
     * 获取店铺信息
     */
    @GetMapping("/info")
    public Result<ShopInfoDTO> getShopInfo() {
        return Result.success(shopInfoService.getShopInfo());
    }
    
    /**
     * 更新店铺信息
     */
    @PutMapping("/info")
    public Result<ShopInfoDTO> updateShopInfo(@RequestBody ShopInfoDTO shopInfoDTO) {
        return Result.success(shopInfoService.updateShopInfo(shopInfoDTO));
    }
    
    /**
     * 上传店铺Logo图片
     * @param file 要上传的图片文件
     * @return 上传后的图片URL
     */
    @PostMapping("/upload/logo")
    public Result<Map<String, Object>> uploadLogo(@RequestParam("file") MultipartFile file) {
        // 上传图片到百度云BOS
        String imageUrl = fileService.uploadFile(file, "shop");
        
        // 构造返回数据
        Map<String, Object> data = new HashMap<>();
        data.put("url", imageUrl);
        
        return Result.success(data);
    }
} 