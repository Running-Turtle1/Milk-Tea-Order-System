package com.cxy.milktea.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopInfoDTO {
    
    private Long id;
    
    private String shopName;
    
    private String logo;
    
    private String address;
    
    private String phone;
    
    private String businessHours;
    
    private String notice;
    
    private String announcement;
    
    private Integer announcementStatus;
    
    private String description;
    
    private String email;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 