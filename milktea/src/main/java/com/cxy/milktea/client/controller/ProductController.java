package com.cxy.milktea.client.controller;


import com.cxy.milktea.client.dto.*;
import com.cxy.milktea.client.service.ProductService;
import com.cxy.milktea.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 产品控制器
 * 处理与奶茶产品、分类和配料相关的HTTP请求
 * 提供产品查询、搜索、分类和详情获取等接口
 */
@RestController
@RequiredArgsConstructor
@Component("clientProductController")
public class ProductController {

    /**
     * 产品服务，注入用于处理产品相关业务逻辑
     */
    private final ProductService productService;

    /**
     * 获取所有商品分类
     * @return 返回包含所有商品分类的API响应
     */
    @GetMapping("/product/categories")
    public ApiResponse<List<CategoryDTO>> getCategoryList() {
        List<CategoryDTO> categories = productService.getAllCategories();
        return ApiResponse.success(categories);
    }
    
    /**
     * 获取所有配料
     * @return 返回包含所有配料信息的API响应
     */
    @GetMapping("/ingredient/list")
    public ApiResponse<List<IngredientDTO>> getIngredientList() {
        List<IngredientDTO> ingredients = productService.getAllIngredients();
        return ApiResponse.success(ingredients);
    }

    /**
     * 获取推荐商品
     * @return 返回包含推荐商品的API响应
     */
    @GetMapping("/product/recommend")
    public ApiResponse<List<ProductDTO>> getRecommendProducts() {
        List<ProductDTO> products = productService.getRecommendProducts();
        return ApiResponse.success(products);
    }

    /**
     * 根据分类获取商品
     * @param categoryId 商品分类ID
     * @param page 页码，默认为0
     * @param size 每页记录数，默认为10
     * @return 返回包含分页商品信息的API响应
     */
    @GetMapping("/product/list")
    public ApiResponse<Page<ProductDTO>> getProductsByCategory(
            @RequestParam Long categoryId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sort").descending().and(Sort.by("sales").descending()));
        Page<ProductDTO> productPage = productService.getProductsByCategory(categoryId, pageable);
        return ApiResponse.success(productPage);
    }

    /**
     * 获取商品详情
     * @param id 商品ID
     * @return 返回包含商品详细信息的API响应
     */
    @GetMapping("/product/detail/{id}")
    public ApiResponse<ProductDetailDTO> getProductDetail(@PathVariable Long id) {
        ProductDetailDTO product = productService.getProductDetail(id);
        return ApiResponse.success(product);
    }

    /**
     * 搜索商品
     * @param keyword 搜索关键词
     * @param page 页码，默认为0
     * @param size 每页记录数，默认为10
     * @return 返回包含搜索结果的API响应
     */
    @GetMapping("/product/search")
    public ApiResponse<Page<ProductDTO>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> productPage = productService.searchProducts(keyword, pageable);
        return ApiResponse.success(productPage);
    }
} 