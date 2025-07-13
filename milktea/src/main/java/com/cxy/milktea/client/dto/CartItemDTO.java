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
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal productPrice;
    private Integer quantity;
    private String temperature;
    private String sweetness;
    private List<IngredientSimpleDTO> ingredients;
    private BigDecimal totalPrice;
    private Boolean selected;
    private Boolean stockAvailable;
    private Integer availableStock;
} 