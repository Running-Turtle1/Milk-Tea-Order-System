package com.cxy.milktea.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    
    // 购物车ID列表，从购物车创建订单时使用
    private List<Long> cartIds;
    
    // 优惠券ID，可为空
    private Long userCouponId;
    
    // 备注
    private String remark;
    
    // 直接结算单个商品时使用
    private CartRequest directProduct;
} 