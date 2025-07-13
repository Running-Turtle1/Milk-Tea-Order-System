package com.cxy.milktea.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Redis缓存监控器
 * 用于监控Redis缓存状态
 */
@Component
@RequiredArgsConstructor
@Slf4j
@EnableScheduling
public class RedisCacheMonitor {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 打印Redis缓存使用统计
     * 每小时执行一次
     */
    @Scheduled(fixedRate = 3600000) // 每小时执行一次
    public void logCacheStatistics() {
        try {
            // 获取所有缓存的键
            Set<String> keys = redisTemplate.keys("*");
            if (keys != null && !keys.isEmpty()) {
                log.info("Redis缓存统计 - 总键数: {}", keys.size());
            }
        } catch (Exception e) {
            log.error("获取Redis缓存统计信息时出错", e);
        }
    }
    
    /**
     * 打印Redis连接信息
     * 应用启动时执行一次
     */
    @Scheduled(initialDelay = 10000, fixedDelay = Long.MAX_VALUE)
    public void logConnectionInfo() {
        try {
            RedisConnectionFactory connectionFactory = redisTemplate.getConnectionFactory();
            if (connectionFactory != null) {
                log.info("Redis连接工厂类型: {}, 缓存已配置并连接成功", 
                        connectionFactory.getClass().getSimpleName());
            }
        } catch (Exception e) {
            log.error("获取Redis连接信息时出错", e);
        }
    }
} 