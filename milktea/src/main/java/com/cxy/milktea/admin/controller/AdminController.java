package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.AdminLoginRequest;
import com.cxy.milktea.admin.dto.AdminPasswordDTO;
import com.cxy.milktea.admin.security.AdminDetailsServiceImpl;
import com.cxy.milktea.admin.service.AdminService;
import com.cxy.milktea.common.entity.Admin;
import com.cxy.milktea.common.response.JwtResponse;
import com.cxy.milktea.common.util.JwtTokenProvider;
import com.cxy.milktea.common.util.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    
    private final AdminDetailsServiceImpl adminDetailsService;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AdminService adminService;
    
    @PostMapping("/login")
    public Result<JwtResponse> login(@Valid @RequestBody AdminLoginRequest loginRequest) {
        try {
            // 直接使用UserDetailsService加载用户，避免使用AuthenticationManager
            UserDetails userDetails = adminDetailsService.loadUserByUsername(loginRequest.getUsername());
            
            // 手动验证密码
            if (!passwordEncoder.matches(loginRequest.getPassword(), userDetails.getPassword())) {
                throw new BadCredentialsException("密码不正确");
            }
            
            // 创建认证对象
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
            );
            
            // 设置安全上下文
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // 生成JWT令牌
            String jwt = tokenProvider.generateToken(authentication);
            
            // 获取管理员信息
            Admin admin = (Admin) userDetails;
            
            // 创建登录响应
            JwtResponse jwtResponse = JwtResponse.builder()
                    .token(jwt)
                    .tokenType("Bearer")
                    .user(admin)
                .build();
            
            // 返回标准响应格式
            return Result.success("登录成功", jwtResponse);
        } catch (UsernameNotFoundException e) {
            throw new BadCredentialsException("用户名或密码不正确");
        }
    }

    /**
     * 修改密码
     * 更新当前登录管理员的密码
     * 
     * @param request 包含旧密码和新密码的请求对象
     * @return 返回操作结果
     */
    @PutMapping("/change-password")
    public Result<?> changePassword(@Valid @RequestBody AdminPasswordDTO request) {
        adminService.changePassword(request.getOldPassword(), request.getNewPassword());
        return Result.success("密码修改成功");
    }
} 