package com.cxy.milktea.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailDTO {
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
    
    // 温度选项
    private List<SpecificationDTO> temperatures;
    
    // 糖度选项
    private List<SpecificationDTO> sweetness;
    
    // 配料选项
    private List<IngredientDTO> ingredients;
} 