package com.cxy.milktea.common.config;

import org.springframework.cache.interceptor.KeyGenerator;

import java.lang.reflect.Method;

/**
 * 自定义Redis缓存键生成器
 * 用于生成更加具体和可控的缓存键
 */
public class RedisCacheKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        StringBuilder sb = new StringBuilder();
        sb.append(target.getClass().getSimpleName());
        sb.append(":");
        sb.append(method.getName());
        sb.append(":");
        
        if (params.length > 0) {
            for (Object param : params) {
                if (param != null) {
                    sb.append(param.toString());
                    sb.append("_");
                }
            }
            // 移除最后一个下划线
            if (sb.charAt(sb.length() - 1) == '_') {
                sb.deleteCharAt(sb.length() - 1);
            }
        } else {
            sb.append("noArgs");
        }
        
        return sb.toString();
    }
} 