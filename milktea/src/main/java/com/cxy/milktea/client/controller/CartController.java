package com.cxy.milktea.client.controller;

import com.cxy.milktea.client.dto.CartDTO;
import com.cxy.milktea.client.dto.CartRequest;
import com.cxy.milktea.client.dto.ResponseResult;
import com.cxy.milktea.client.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 购物车控制器
 * 处理与购物车相关的所有HTTP请求，包括查询、添加、更新、删除购物车项等操作
 */
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    /**
     * 购物车服务，用于处理购物车相关的业务逻辑
     */
    private final CartService cartService;

    /**
     * 获取当前用户的购物车
     * @return 包含购物车信息的响应结果
     */
    @GetMapping
    public ResponseResult<CartDTO> getCart() {
        CartDTO cart = cartService.getCart();
        return ResponseResult.success(cart);
    }

    /**
     * 向购物车添加商品
     * @param request 包含商品ID、数量、选中配料等信息的请求对象
     * @return 更新后的购物车信息
     */
    @PostMapping
    public ResponseResult<CartDTO> addToCart(@RequestBody CartRequest request) {
        CartDTO cart = cartService.addToCart(request);
        return ResponseResult.success(cart);
    }

    /**
     * 更新购物车中的商品
     * @param cartItemId 购物车项ID
     * @param request 包含更新信息的请求对象
     * @return 更新后的购物车信息
     */
    @PutMapping("/{id}")
    public ResponseResult<CartDTO> updateCart(@PathVariable("id") Long cartItemId, 
                                            @RequestBody CartRequest request) {
        CartDTO cart = cartService.updateCart(cartItemId, request);
        return ResponseResult.success(cart);
    }

    /**
     * 从购物车中移除商品
     * @param cartItemId 要移除的购物车项ID
     * @return 更新后的购物车信息
     */
    @DeleteMapping("/{id}")
    public ResponseResult<CartDTO> removeFromCart(@PathVariable("id") Long cartItemId) {
        CartDTO cart = cartService.removeFromCart(cartItemId);
        return ResponseResult.success(cart);
    }

    /**
     * 清空购物车
     * @return 操作成功的响应结果
     */
    @DeleteMapping
    public ResponseResult<Void> clearCart() {
        cartService.clearCart();
        return ResponseResult.success();
    }
    
    /**
     * 选中或取消选中购物车中的商品
     * @param cartItemId 购物车项ID
     * @param selected 是否选中
     * @return 更新后的购物车信息
     */
    @PutMapping("/select/{id}")
    public ResponseResult<CartDTO> selectCartItem(@PathVariable("id") Long cartItemId, @RequestParam Boolean selected) {
        CartDTO cart = cartService.selectCartItem(cartItemId, selected);
        return ResponseResult.success(cart);
    }
    
    /**
     * 选中或取消选中购物车中的所有商品
     * @param selected 是否全选
     * @return 更新后的购物车信息
     */
    @PutMapping("/select-all")
    public ResponseResult<CartDTO> selectAllCartItems(@RequestParam Boolean selected) {
        CartDTO cart = cartService.selectAllCartItems(selected);
        return ResponseResult.success(cart);
    }
    
    /**
     * 移除购物车中已选中的商品
     * @return 更新后的购物车信息
     */
    @DeleteMapping("/selected")
    public ResponseResult<CartDTO> removeSelectedItems() {
        CartDTO cart = cartService.removeSelectedItems();
        return ResponseResult.success(cart);
    }
    
    /**
     * 批量更新购物车中的商品
     * @param requests 包含多个购物车项更新信息的请求列表
     * @return 更新后的购物车信息
     */
    @PutMapping("/batch-update")
    public ResponseResult<CartDTO> batchUpdateCartItems(@RequestBody List<CartRequest> requests) {
        CartDTO cart = cartService.batchUpdateCartItems(requests);
        return ResponseResult.success(cart);
    }
} 