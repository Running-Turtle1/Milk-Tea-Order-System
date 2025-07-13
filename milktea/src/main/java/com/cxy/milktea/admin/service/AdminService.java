package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.AdminDTO;
import com.cxy.milktea.common.entity.Admin;
import org.springframework.data.domain.Page;

import java.util.List;

public interface AdminService {

    /**
     * 根据ID获取管理员
     */
    AdminDTO getAdminById(Long id);
    
    /**
     * 获取所有管理员
     */
    List<AdminDTO> getAllAdmins();
    
    /**
     * 分页获取管理员
     */
    Page<AdminDTO> getAdmins(int page, int size, String keyword);
    
    /**
     * 创建管理员
     */
    AdminDTO createAdmin(AdminDTO adminDTO, String password);
    
    /**
     * 更新管理员信息
     */
    AdminDTO updateAdmin(Long id, AdminDTO adminDTO);
    
    /**
     * 删除管理员
     */
    void deleteAdmin(Long id);
    
    /**
     * 启用/禁用管理员
     */
    AdminDTO updateAdminStatus(Long id, Integer status);
    
    /**
     * 重置管理员密码
     */
    void resetPassword(Long id, String newPassword);
    
    /**
     * 管理员修改自己的密码
     */
    void changePassword(String oldPassword, String newPassword);
    
    /**
     * 获取当前登录的管理员
     */
    Admin getCurrentAdmin();
} 