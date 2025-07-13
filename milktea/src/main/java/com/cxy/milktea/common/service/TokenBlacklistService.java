package com.cxy.milktea.common.service;

/**
 * Token黑名单服务接口
 * 用于管理已经注销但尚未过期的JWT令牌
 */
public interface TokenBlacklistService {
    
    /**
     * 将token加入黑名单
     * @param token 令牌
     * @param expirationTimeMillis 过期时间（毫秒）
     */
    void addToBlacklist(String token, long expirationTimeMillis);
    
    /**
     * 检查token是否在黑名单中
     * @param token 令牌
     * @return 如果在黑名单中返回true，否则返回false
     */
    boolean isBlacklisted(String token);
} 