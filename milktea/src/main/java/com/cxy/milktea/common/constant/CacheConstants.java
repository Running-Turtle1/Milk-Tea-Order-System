package com.cxy.milktea.common.constant;

/**
 * 缓存常量类
 * 定义系统中所有缓存的名称和键前缀
 */
public final class CacheConstants {
    
    // 禁止实例化
    private CacheConstants() {}
    
    // 缓存名称
    public static final String PRODUCTS_CACHE = "products";
    public static final String CATEGORIES_CACHE = "categories";
    public static final String INGREDIENTS_CACHE = "ingredients";
    public static final String USER_COUPONS_CACHE = "userCoupons";
    public static final String SHOP_INFO_CACHE = "shopInfo";
    public static final String CARTS_CACHE = "carts";
    
    // 缓存键前缀
    public static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";
    public static final String USER_PREFIX = "user:";
    public static final String PRODUCT_PREFIX = "product:";
    public static final String CATEGORY_PREFIX = "category:";
    public static final String ORDER_PREFIX = "order:";
    public static final String COUPON_PREFIX = "coupon:";
    
    // 缓存时间（秒）
    public static final long PRODUCT_CACHE_EXPIRE_TIME = 7200; // 2小时
    public static final long CATEGORY_CACHE_EXPIRE_TIME = 7200; // 2小时
    public static final long USER_CACHE_EXPIRE_TIME = 3600; // 1小时
    public static final long SHOP_INFO_CACHE_EXPIRE_TIME = 43200; // 12小时
} 