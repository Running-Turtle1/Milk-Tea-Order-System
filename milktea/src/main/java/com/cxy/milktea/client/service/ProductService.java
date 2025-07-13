package com.cxy.milktea.client.service;

import com.cxy.milktea.client.dto.CategoryDTO;
import com.cxy.milktea.client.dto.IngredientDTO;
import com.cxy.milktea.client.dto.ProductDTO;
import com.cxy.milktea.client.dto.ProductDetailDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    /**
     * 获取所有商品分类
     */
    List<CategoryDTO> getAllCategories();

    /**
     * 获取所有配料
     */
    List<IngredientDTO> getAllIngredients();

    /**
     * 获取推荐商品
     */
    List<ProductDTO> getRecommendProducts();

    /**
     * 根据分类获取商品
     */
    Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable);

    /**
     * 获取商品详情
     */
    ProductDetailDTO getProductDetail(Long productId);

    /**
     * 搜索商品
     */
    Page<ProductDTO> searchProducts(String keyword, Pageable pageable);
} 