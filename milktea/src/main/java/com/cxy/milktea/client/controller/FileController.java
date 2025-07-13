package com.cxy.milktea.client.controller;

import com.cxy.milktea.client.dto.UpdateUserRequest;
import com.cxy.milktea.client.dto.UserDTO;
import com.cxy.milktea.client.service.FileService;
import com.cxy.milktea.client.service.UserService;
import com.cxy.milktea.common.util.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 文件上传控制器
 * 提供文件上传的API接口
 */
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;
    private final UserService userService;
    
    /**
     * 上传用户头像
     * 将头像图片上传到本地文件系统，并自动更新用户头像信息
     * 
     * @param file 要上传的头像图片文件
     * @return 返回上传成功的图片URL和更新后的用户信息
     */
    @PostMapping("/avatar")
    public Result<Map<String, Object>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        // 上传头像到本地存储
        String avatarUrl = fileService.uploadFile(file, "avatars");
        
        // 创建更新用户信息的请求对象
        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setAvatar(avatarUrl);
        
        // 更新用户头像信息
        UserDTO updatedUser = userService.updateUserInfo(updateRequest);
        
        // 构造返回数据
        Map<String, Object> data = new HashMap<>();
        data.put("url", avatarUrl);
        data.put("user", updatedUser);
        
        return Result.success("头像上传并更新成功", data);
    }
} 