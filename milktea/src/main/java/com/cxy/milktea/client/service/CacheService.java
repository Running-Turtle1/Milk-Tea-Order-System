package com.cxy.milktea.client.service;

/**
 * 缓存服务接口
 */
public interface CacheService {
    
    /**
     * 清除商品相关缓存
     */
    void clearProductCaches();
    
    /**
     * 清除指定商品的缓存
     * @param productId 商品ID
     */
    void clearProductCache(Long productId);
    
    /**
     * 清除分类相关缓存
     */
    void clearCategoryCaches();
    
    /**
     * 清除配料相关缓存
     */
    void clearIngredientCaches();
    
    /**
     * 清除用户优惠券相关缓存
     * @param userId 用户ID
     */
    void clearUserCouponCaches(Long userId);
    
    /**
     * 清除门店信息缓存
     */
    void clearShopInfoCache();
} 