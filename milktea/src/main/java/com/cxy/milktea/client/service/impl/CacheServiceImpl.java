package com.cxy.milktea.client.service.impl;

import com.cxy.milktea.client.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Set;

/**
 * 缓存服务实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CacheServiceImpl implements CacheService {

    private final CacheManager cacheManager;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public void clearProductCaches() {
        log.info("清除商品缓存");
        Objects.requireNonNull(cacheManager.getCache("products")).clear();
    }
    
    @Override
    public void clearProductCache(Long productId) {
        log.info("清除商品缓存，商品ID：{}", productId);
        Objects.requireNonNull(cacheManager.getCache("products")).evict("detail_" + productId);
        
        // 使用通配符匹配其他可能包含该商品的缓存键，需要使用RedisTemplate
        String keyPattern = "products::*";
        Set<String> keys = redisTemplate.keys(keyPattern);
        if (keys != null && !keys.isEmpty()) {
            log.info("删除相关商品缓存键，数量：{}", keys.size());
            redisTemplate.delete(keys);
        }
    }
    
    @Override
    public void clearCategoryCaches() {
        log.info("清除分类缓存");
        Objects.requireNonNull(cacheManager.getCache("categories")).clear();
        
        // 清除包含分类的商品缓存
        String keyPattern = "products::category_*";
        Set<String> keys = redisTemplate.keys(keyPattern);
        if (keys != null && !keys.isEmpty()) {
            log.info("删除相关分类商品缓存键，数量：{}", keys.size());
            redisTemplate.delete(keys);
        }
    }
    
    @Override
    public void clearIngredientCaches() {
        log.info("清除配料缓存");
        Objects.requireNonNull(cacheManager.getCache("ingredients")).clear();
    }
    
    @Override
    public void clearUserCouponCaches(Long userId) {
        log.info("清除用户优惠券缓存，用户ID：{}", userId);
        // 清除特定用户的优惠券缓存
        String keyPattern = "userCoupons::user_" + userId + "*";
        Set<String> keys = redisTemplate.keys(keyPattern);
        if (keys != null && !keys.isEmpty()) {
            log.info("删除用户优惠券缓存键，数量：{}", keys.size());
            redisTemplate.delete(keys);
        }
    }
    
    @Override
    public void clearShopInfoCache() {
        log.info("清除门店信息缓存");
        Objects.requireNonNull(cacheManager.getCache("shopInfo")).clear();
    }
} 