package com.cxy.milktea.client.service.impl;

import com.cxy.milktea.common.config.FileStorageConfig;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.client.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 文件服务实现类
 * 实现文件上传到本地文件系统的功能
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileServiceImpl implements FileService {

    private final FileStorageConfig fileStorageConfig;

    @Override
    public String uploadFile(MultipartFile file, String directory) {
        if (file.isEmpty()) {
            throw new BusinessException(400, "文件不能为空");
        }
        
        try {
            // 文件原始名称
            String originalFilename = file.getOriginalFilename();
            // 文件扩展名
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            // 生成新的文件名
            String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String newFilename = UUID.randomUUID().toString().replace("-", "") + extension;
            
            // 创建目录结构
            String relativePath = directory + "/" + dateDir;
            File uploadDir = new File(fileStorageConfig.getFileStorageLocation(), relativePath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            // 目标文件路径
            File targetFile = new File(uploadDir, newFilename);
            
            // 保存文件
            file.transferTo(targetFile);
            
            // 返回文件访问URL
            return fileStorageConfig.getFileAccessUrl() + "/" + relativePath + "/" + newFilename;
        } catch (IOException e) {
            log.error("文件上传失败: {}", e.getMessage());
            throw new BusinessException(500, "文件上传失败: " + e.getMessage());
        }
    }
} 