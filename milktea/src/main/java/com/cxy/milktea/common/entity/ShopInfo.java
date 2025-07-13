package com.cxy.milktea.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 店铺信息实体类
 */
@Data
@Entity
@Table(name = "shop_info")
@NoArgsConstructor
@AllArgsConstructor
public class ShopInfo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 店铺名称
     */
    @Column(name = "shop_name", nullable = false)
    private String shopName;
    
    /**
     * 店铺LOGO
     */
    @Column(name = "logo")
    private String logo;
    
    /**
     * 店铺地址
     */
    @Column(name = "address")
    private String address;
    
    /**
     * 联系电话
     */
    @Column(name = "phone")
    private String phone;
    
    /**
     * 营业时间
     */
    @Column(name = "business_hours")
    private String businessHours;
    
    /**
     * 店铺公告
     */
    @Column(name = "notice", columnDefinition = "TEXT")
    private String notice;
    
    @Column(name = "announcement", length = 500)
    private String announcement;
    
    @Column(name = "announcement_status")
    private Integer announcementStatus;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "email")
    private String email;
    
    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
} 