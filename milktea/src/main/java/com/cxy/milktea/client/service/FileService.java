package com.cxy.milktea.client.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 文件服务接口
 * 提供文件上传功能
 */
public interface FileService {
    
    /**
     * 上传文件到本地存储
     * @param file 要上传的文件
     * @param directory 存储目录
     * @return 返回文件访问URL
     */
    String uploadFile(MultipartFile file, String directory);
} 