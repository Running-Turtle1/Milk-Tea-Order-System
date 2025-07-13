package com.cxy.milktea.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品数据传输对象
 * 用于商品信息的前后端交互
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    
    private Long id;
    
    private Long categoryId;
    
    private String categoryName;
    
    private String name;
    
    private String image;
    
    private String description;
    
    private BigDecimal price;
    
    private Integer stock;
    
    private Integer sales;
    
    private Integer isRecommend;
    
    private Integer supportCustom;
    
    private Integer sort;
    
    private Integer status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 