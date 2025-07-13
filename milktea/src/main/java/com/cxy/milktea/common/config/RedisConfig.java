package com.cxy.milktea.common.config;

import com.cxy.milktea.common.constant.CacheConstants;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis基础配置类
 */
@Configuration
@EnableCaching
public class RedisConfig {
    
    /**
     * 配置Redis缓存管理器
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // 使用自定义Redis序列化配置
        RedisSerializationConfig serializationConfig = new RedisSerializationConfig();
        GenericJackson2JsonRedisSerializer serializer = serializationConfig.redisJsonSerializer();
        
        // 默认配置（1小时过期）
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(CacheConstants.USER_CACHE_EXPIRE_TIME)) 
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                .disableCachingNullValues(); // 不缓存空值
        
        // 特定缓存配置
        Map<String, RedisCacheConfiguration> configMap = new HashMap<>();
        
        // 商品相关缓存配置
        configMap.put(CacheConstants.PRODUCTS_CACHE, defaultConfig.entryTtl(Duration.ofSeconds(CacheConstants.PRODUCT_CACHE_EXPIRE_TIME)));
        configMap.put(CacheConstants.CATEGORIES_CACHE, defaultConfig.entryTtl(Duration.ofSeconds(CacheConstants.CATEGORY_CACHE_EXPIRE_TIME)));
        configMap.put(CacheConstants.INGREDIENTS_CACHE, defaultConfig.entryTtl(Duration.ofSeconds(CacheConstants.PRODUCT_CACHE_EXPIRE_TIME)));
        
        // 购物车缓存配置（1天过期）
        configMap.put(CacheConstants.CARTS_CACHE, defaultConfig.entryTtl(Duration.ofDays(1)));
        
        // 用户优惠券缓存配置（30分钟过期）
        configMap.put(CacheConstants.USER_COUPONS_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(30)));
        
        // 门店信息缓存配置
        configMap.put(CacheConstants.SHOP_INFO_CACHE, defaultConfig.entryTtl(Duration.ofSeconds(CacheConstants.SHOP_INFO_CACHE_EXPIRE_TIME)));
        
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(configMap)
                .transactionAware()
                .build();
    }
    
    /**
     * 配置RedisTemplate
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // 使用自定义Redis序列化配置
        RedisSerializationConfig serializationConfig = new RedisSerializationConfig();
        GenericJackson2JsonRedisSerializer jsonRedisSerializer = serializationConfig.redisJsonSerializer();
        
        // 设置key的序列化方式
        template.setKeySerializer(new StringRedisSerializer());
        // 设置value的序列化方式
        template.setValueSerializer(jsonRedisSerializer);
        // Hash的key也采用StringRedisSerializer的序列化方式
        template.setHashKeySerializer(new StringRedisSerializer());
        // Hash的value采用jsonRedisSerializer的序列化方式
        template.setHashValueSerializer(jsonRedisSerializer);
        // 启用事务支持
        template.setEnableTransactionSupport(true);
        
        template.afterPropertiesSet();
        return template;
    }
    
    /**
     * 自定义缓存键生成器
     */
    @Bean
    public RedisCacheKeyGenerator redisCacheKeyGenerator() {
        return new RedisCacheKeyGenerator();
    }
} 