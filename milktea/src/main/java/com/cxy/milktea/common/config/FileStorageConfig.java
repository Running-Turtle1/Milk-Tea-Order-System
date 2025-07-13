package com.cxy.milktea.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 文件存储配置类
 */
@Configuration
public class FileStorageConfig {
    
    @Value("${file.storage.location}")
    private String fileStorageLocation;
    
    @Value("${file.storage.access-url}")
    private String fileAccessUrl;
    
    @Value("${file.storage.auto-create-dir:true}")
    private boolean autoCreateDir;
    
    private String absoluteStoragePath;
    
    @PostConstruct
    public void initDirectory() {
        // 确保路径分隔符正确
        fileStorageLocation = StringUtils.cleanPath(fileStorageLocation);
        
        // 处理相对路径，转换为绝对路径
        File directory;
        if (fileStorageLocation.startsWith("./") || fileStorageLocation.startsWith("../") 
                || !fileStorageLocation.contains(":")) {
            // 相对路径，相对于应用程序运行目录
            directory = new File(fileStorageLocation).getAbsoluteFile();
        } else {
            // 绝对路径
            directory = new File(fileStorageLocation);
        }
        
        // 保存绝对路径
        absoluteStoragePath = directory.getAbsolutePath();
        
        // 创建外部存储目录
        if (!directory.exists() && autoCreateDir) {
            boolean created = directory.mkdirs();
            if (!created) {
                throw new RuntimeException("无法创建文件存储目录: " + absoluteStoragePath);
            }
        }
        
        // 检查目录是否可写
        if (!directory.canWrite()) {
            throw new RuntimeException("文件存储目录不可写: " + absoluteStoragePath);
        }
        
        // 创建常用子目录
        createSubDirectories(directory, "products", "avatars", "categories");
    }
    
    private void createSubDirectories(File parent, String... subDirs) {
        if (autoCreateDir) {
            for (String subDir : subDirs) {
                File subDirectory = new File(parent, subDir);
                if (!subDirectory.exists()) {
                    boolean created = subDirectory.mkdirs();
                    if (!created) {
                        throw new RuntimeException("无法创建子目录: " + subDirectory.getAbsolutePath());
                    }
                }
            }
        }
    }
    
    public String getFileStorageLocation() {
        return absoluteStoragePath;
    }
    
    public String getFileAccessUrl() {
        return fileAccessUrl;
    }
} 