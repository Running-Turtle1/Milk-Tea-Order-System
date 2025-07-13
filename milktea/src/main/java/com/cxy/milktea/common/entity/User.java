package com.cxy.milktea.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

/**
 * 用户实体类
 * 存储用户的基本信息、认证信息和会员相关信息
 * 实现了Spring Security的UserDetails接口，用于身份验证
 */
@Entity
@Table(name = "user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    /**
     * 用户ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户名，唯一
     */
    @Column(nullable = false, unique = true)
    private String username;

    /**
     * 密码，加密存储
     */
    @Column(nullable = false)
    private String password;

    /**
     * 手机号，唯一
     */
    @Column(nullable = false, unique = true)
    private String phone;

    /**
     * 用户头像URL
     */
    private String avatar;

    /**
     * 性别：0未知，1男，2女
     */
    private Integer gender;

    /**
     * 用户生日
     */
    private LocalDate birthday;

    /**
     * 用户总积分，默认为0
     */
    @Builder.Default
    private Integer totalPoints = 0;

    /**
     * 会员等级，默认为0（普通会员）
     */
    @Builder.Default
    private Integer memberLevel = 0;

    /**
     * 用户状态：0禁用，1启用
     */
    @Builder.Default
    private Integer status = 1;

    /**
     * 创建时间，自动生成
     */
    @CreationTimestamp
    private LocalDateTime createdAt;

    /**
     * 更新时间，自动更新
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * 获取用户名，实现UserDetails接口的方法
     * @return 返回用户名
     */
    @Override
    public String getUsername() {
        return username;
    }

    /**
     * 获取用户权限，实现UserDetails接口的方法
     * 当前所有用户都是ROLE_USER角色
     * @return 返回用户权限集合
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    /**
     * 判断账户是否未过期，实现UserDetails接口的方法
     * @return 当前实现始终返回true
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * 判断账户是否未锁定，实现UserDetails接口的方法
     * @return 当前实现始终返回true
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * 判断凭证是否未过期，实现UserDetails接口的方法
     * @return 当前实现始终返回true
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * 判断账户是否启用，实现UserDetails接口的方法
     * @return 根据用户状态判断，1为启用
     */
    @Override
    public boolean isEnabled() {
        return status == 1;
    }
} 