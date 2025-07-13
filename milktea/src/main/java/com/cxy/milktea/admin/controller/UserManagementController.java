package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.service.UserManagementService;
import com.cxy.milktea.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户管理控制器
 * 提供用户批量管理相关接口
 */
@RestController
@RequestMapping("/admin/user-management")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;
    
    /**
     * 同步所有用户的会员等级
     * 根据当前数据库的会员等级规则，更新所有用户的会员等级
     * @return 更新结果
     */
    @PostMapping("/sync-member-levels")

    public ApiResponse<Map<String, Object>> syncAllUserMemberLevels() {
        int updatedCount = userManagementService.syncAllUserMemberLevels();
        
        Map<String, Object> result = new HashMap<>();
        result.put("updatedCount", updatedCount);
        
        return ApiResponse.success("会员等级同步完成，已更新 " + updatedCount + " 个用户", result);
    }
} 