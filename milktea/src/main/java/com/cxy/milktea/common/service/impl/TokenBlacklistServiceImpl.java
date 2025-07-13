package com.cxy.milktea.common.service.impl;

import com.cxy.milktea.common.constant.CacheConstants;
import com.cxy.milktea.common.service.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Token黑名单服务实现类
 * 使用Redis存储令牌黑名单
 */
@Service("commonTokenBlacklistService")
@RequiredArgsConstructor
public class TokenBlacklistServiceImpl implements TokenBlacklistService {

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void addToBlacklist(String token, long expirationTimeMillis) {
        // 计算剩余过期时间（毫秒）
        long ttl = expirationTimeMillis - System.currentTimeMillis();
        
        // 如果token已经过期，则不需要加入黑名单
        if (ttl <= 0) {
            return;
        }
        
        // 将token加入到Redis黑名单中，过期时间为token的剩余有效期
        String key = CacheConstants.TOKEN_BLACKLIST_PREFIX + token;
        redisTemplate.opsForValue().set(key, true, ttl, TimeUnit.MILLISECONDS);
    }

    @Override
    public boolean isBlacklisted(String token) {
        String key = CacheConstants.TOKEN_BLACKLIST_PREFIX + token;
        Object value = redisTemplate.opsForValue().get(key);
        return value != null;
    }
} 