package com.cxy.milktea.admin.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 配料数据传输对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientDTO {
    
    private Long id;
    
    @NotBlank(message = "配料名称不能为空")
    private String name;
    
    @NotNull(message = "配料价格不能为空")
    @DecimalMin(value = "0", message = "价格不能小于0")
    private BigDecimal price;
    
    private Integer stock;
    
    @NotBlank(message = "配料类型不能为空")
    private String type;
    
    private Integer sort;
    
    private Integer status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 