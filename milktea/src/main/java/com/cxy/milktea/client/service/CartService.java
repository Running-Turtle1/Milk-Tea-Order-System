package com.cxy.milktea.client.service;

import com.cxy.milktea.client.dto.CartDTO;
import com.cxy.milktea.client.dto.CartRequest;

import java.util.List;

/**
 * 购物车服务接口
 * 定义了与购物车相关的所有业务操作
 */
public interface CartService {

    /**
     * 获取当前用户的购物车
     * 根据当前登录用户ID获取其购物车信息
     * 
     * @return 返回购物车数据传输对象，包含购物车项目列表和汇总信息
     */
    CartDTO getCart();

    /**
     * 添加商品到购物车
     * 将指定商品添加到用户购物车，如果已存在则增加数量
     * 
     * @param request 包含商品ID、数量、选中配料等信息的请求对象
     * @return 返回更新后的购物车信息
     */
    CartDTO addToCart(CartRequest request);

    /**
     * 更新购物车中的商品
     * 修改购物车中特定商品的数量、配料等信息
     * 
     * @param cartItemId 购物车项ID
     * @param request 包含更新信息的请求对象
     * @return 返回更新后的购物车信息
     */
    CartDTO updateCart(Long cartItemId, CartRequest request);

    /**
     * 删除购物车中的商品
     * 从购物车中移除指定的商品项
     * 
     * @param cartItemId 要删除的购物车项ID
     * @return 返回更新后的购物车信息
     */
    CartDTO removeFromCart(Long cartItemId);

    /**
     * 清空购物车
     * 删除当前用户购物车中的所有商品
     */
    void clearCart();

    /**
     * 选择或取消选择购物车项目
     * 更新购物车中特定商品的选中状态
     * 
     * @param cartItemId 购物车项ID
     * @param selected 是否选中
     * @return 返回更新后的购物车信息
     */
    CartDTO selectCartItem(Long cartItemId, Boolean selected);

    /**
     * 选择或取消选择所有购物车项目
     * 批量更新购物车中所有商品的选中状态
     * 
     * @param selected 是否全选
     * @return 返回更新后的购物车信息
     */
    CartDTO selectAllCartItems(Boolean selected);

    /**
     * 移除选中的购物车项目
     * 删除购物车中所有被选中的商品
     * 
     * @return 返回更新后的购物车信息
     */
    CartDTO removeSelectedItems();

    /**
     * 批量更新购物车项目
     * 一次性更新多个购物车项目的信息
     * 
     * @param requests 购物车更新请求列表，每项包含商品ID和更新信息
     * @return 返回更新后的购物车信息
     */
    CartDTO batchUpdateCartItems(List<CartRequest> requests);
} 