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
public class CartDTO {
    private List<CartItemDTO> items;
    private BigDecimal totalPrice;
    private Integer totalQuantity;
    private BigDecimal selectedTotalPrice;
    private Integer selectedTotalQuantity;
    private Boolean allProductsAvailable;
} 