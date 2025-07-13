package com.cxy.milktea.admin.service;

/**
 * 用户管理服务
 * 提供用户批量管理和维护功能
 */
public interface UserManagementService {
    
    /**
     * 批量更新所有用户的会员等级，使其与数据库会员等级规则一致
     * @return 更新的用户数量
     */
    int syncAllUserMemberLevels();
} 