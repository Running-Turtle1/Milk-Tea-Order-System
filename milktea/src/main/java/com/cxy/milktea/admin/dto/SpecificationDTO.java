package com.cxy.milktea.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 规格数据传输对象
 * 用于温度、糖度等规格的前后端交互
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecificationDTO {
    
    private Long id;
    
    @NotBlank(message = "规格名称不能为空")
    private String name;
    
    @NotBlank(message = "规格类型不能为空")
    private String type;  // temperature温度，sweetness糖度
    
    private Integer sort;
    
    private Integer status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 