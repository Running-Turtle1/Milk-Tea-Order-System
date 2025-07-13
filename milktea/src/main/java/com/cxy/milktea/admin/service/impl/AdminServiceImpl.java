package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.AdminDTO;
import com.cxy.milktea.admin.service.AdminService;
import com.cxy.milktea.common.entity.Admin;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AdminDTO getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "管理员不存在"));
        return convertToDto(admin);
    }

    @Override
    public List<AdminDTO> getAllAdmins() {
        return adminRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<AdminDTO> getAdmins(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Admin> adminPage;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            adminPage = adminRepository.search(keyword, pageable);
        } else {
            adminPage = adminRepository.findAll(pageable);
        }
        
        List<AdminDTO> adminDTOs = adminPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return new PageImpl<>(adminDTOs, pageable, adminPage.getTotalElements());
    }

    @Override
    @Transactional
    public AdminDTO createAdmin(AdminDTO adminDTO, String password) {
        // 检查用户名是否已存在
        if (adminRepository.existsByUsername(adminDTO.getUsername())) {
            throw new BusinessException(400, "用户名已存在");
        }
        
        // 创建新管理员
        Admin admin = Admin.builder()
                .username(adminDTO.getUsername())
                .password(passwordEncoder.encode(password))
                .realName(adminDTO.getRealName())
                .phone(adminDTO.getPhone())
                .avatar(adminDTO.getAvatar())
                .status(1) // 默认启用
                .build();
        
        Admin savedAdmin = adminRepository.save(admin);
        
        return convertToDto(savedAdmin);
    }

    @Override
    @Transactional
    public AdminDTO updateAdmin(Long id, AdminDTO adminDTO) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "管理员不存在"));
        
        // 如果用户名已更改，检查新用户名是否已存在
        if (!admin.getUsername().equals(adminDTO.getUsername()) && 
                adminRepository.existsByUsername(adminDTO.getUsername())) {
            throw new BusinessException(400, "用户名已存在");
        }
        
        admin.setUsername(adminDTO.getUsername());
        admin.setRealName(adminDTO.getRealName());
        admin.setPhone(adminDTO.getPhone());
        admin.setAvatar(adminDTO.getAvatar());
        
        Admin updatedAdmin = adminRepository.save(admin);
        
        return convertToDto(updatedAdmin);
    }

    @Override
    @Transactional
    public void deleteAdmin(Long id) {
        // 检查是否存在
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "管理员不存在"));
        
        // 不能删除ID为1的管理员（超级管理员）
        if (admin.getId() == 1) {
            throw new BusinessException(400, "不能删除超级管理员");
        }
        
        adminRepository.deleteById(id);
    }

    @Override
    @Transactional
    public AdminDTO updateAdminStatus(Long id, Integer status) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "管理员不存在"));
        
        // 不能禁用ID为1的管理员（超级管理员）
        if (admin.getId() == 1 && status == 0) {
            throw new BusinessException(400, "不能禁用超级管理员");
        }
        
        admin.setStatus(status);
        Admin updatedAdmin = adminRepository.save(admin);
        
        return convertToDto(updatedAdmin);
    }

    @Override
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "管理员不存在"));
        
        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
    }

    @Override
    @Transactional
    public void changePassword(String oldPassword, String newPassword) {
        Admin admin = getCurrentAdmin();
        
        // 验证旧密码是否正确
        if (!passwordEncoder.matches(oldPassword, admin.getPassword())) {
            throw new BusinessException(400, "旧密码不正确");
        }
        
        // 检查新旧密码是否相同
        if (oldPassword.equals(newPassword)) {
            throw new BusinessException(400, "新密码不能与旧密码相同");
        }
        
        // 更新密码
        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
    }

    @Override
    public Admin getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(401, "管理员未登录");
        }
        
        return (Admin) authentication.getPrincipal();
    }
    
    /**
     * 将管理员实体转换为DTO
     */
    private AdminDTO convertToDto(Admin admin) {
        return AdminDTO.builder()
                .id(admin.getId())
                .username(admin.getUsername())
                .realName(admin.getRealName())
                .phone(admin.getPhone())
                .avatar(admin.getAvatar())
                .status(admin.getStatus())
                .createdAt(admin.getCreatedAt())
                .updatedAt(admin.getUpdatedAt())
                .build();
    }
} 