package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.ProductCreateDTO;
import com.cxy.milktea.admin.dto.ProductDTO;
import com.cxy.milktea.admin.dto.ProductUpdateDTO;
import com.cxy.milktea.admin.service.ProductService;
import com.cxy.milktea.client.service.FileService;
import com.cxy.milktea.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理端商品控制器
 * 提供商品的增删改查功能
 */
@RestController
@RequestMapping("/admin/product")
@RequiredArgsConstructor
@Component("adminProductController")
public class ProductController {

    private final ProductService productService;
    private final FileService fileService;

    /**
     * 分页获取商品列表
     * @param categoryId 分类ID，可选
     * @param keyword 关键词，可选
     * @param page 页码，默认0
     * @param size 每页大小，默认10
     * @return 商品分页结果
     */
    @GetMapping("/page")
    public ApiResponse<Page<ProductDTO>> getProductsByPage(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return ApiResponse.success(productService.getProductsByPage(categoryId, keyword, page, size));
    }

    /**
     * 获取商品详情
     * @param id 商品ID
     * @return 商品详情
     */
    @GetMapping("/{id}")
    public ApiResponse<ProductDTO> getProductById(@PathVariable Long id) {
        return ApiResponse.success(productService.getProductById(id));
    }

    /**
     * 创建商品
     * @param productCreateDTO 商品创建DTO
     * @return 创建后的商品
     */
    @PostMapping
    public ApiResponse<ProductDTO> createProduct(@Valid @RequestBody ProductCreateDTO productCreateDTO) {
        return ApiResponse.success("创建商品成功", productService.createProduct(productCreateDTO));
    }

    /**
     * 更新商品
     * @param id 商品ID
     * @param productUpdateDTO 商品更新DTO
     * @return 更新后的商品
     */
    @PutMapping("/{id}")
    public ApiResponse<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateDTO productUpdateDTO) {
        return ApiResponse.success("更新商品成功", productService.updateProduct(id, productUpdateDTO));
    }

    /**
     * 更新商品状态（上架/下架）
     * @param id 商品ID
     * @param status 状态值：0下架，1上架
     * @return 更新后的商品
     */
    @PutMapping("/{id}/status")
    public ApiResponse<ProductDTO> updateProductStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {
        return ApiResponse.success(
                status == 1 ? "商品已上架" : "商品已下架",
                productService.updateProductStatus(id, status));
    }

    /**
     * 更新商品推荐状态
     * @param id 商品ID
     * @param isRecommend 是否推荐：0否，1是
     * @return 更新后的商品
     */
    @PutMapping("/{id}/recommend")
    public ApiResponse<ProductDTO> updateProductRecommendStatus(
            @PathVariable Long id,
            @RequestParam Integer isRecommend) {
        return ApiResponse.success(
                isRecommend == 1 ? "商品已设为推荐" : "已取消商品推荐",
                productService.updateProductRecommendStatus(id, isRecommend));
    }

    /**
     * 更新商品排序
     * @param id 商品ID
     * @param sort 排序值
     * @return 更新后的商品
     */
    @PutMapping("/{id}/sort")
    public ApiResponse<ProductDTO> updateProductSort(
            @PathVariable Long id,
            @RequestParam Integer sort) {
        return ApiResponse.success("更新排序成功", productService.updateProductSort(id, sort));
    }

    /**
     * 删除商品
     * @param id 商品ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ApiResponse.success("删除商品成功", null);
    }

    /**
     * 获取商品销量排行
     * @param limit 获取数量，默认为10
     * @return 商品销量排行列表
     */
    @GetMapping("/sales/ranking")
    public ApiResponse<List<ProductDTO>> getProductSalesRanking(
            @RequestParam(defaultValue = "10") Integer limit) {
        return ApiResponse.success(productService.getProductSalesRanking(limit));
    }

    /**
     * 手动更新商品销量
     * @param id 商品ID
     * @param sales 销量值
     * @return 更新后的商品
     */
    @PutMapping("/{id}/sales")
    public ApiResponse<ProductDTO> updateProductSales(
            @PathVariable Long id,
            @RequestParam Integer sales) {
        return ApiResponse.success("更新销量成功", productService.updateProductSales(id, sales));
    }

    /**
     * 上传商品图片
     * @param file 要上传的图片文件
     * @param productId 关联的商品ID，如果有则自动更新商品图片
     * @return 上传后的图片URL
     */
    @PostMapping("/upload/image")
    public ApiResponse<Map<String, Object>> uploadProductImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "productId", required = false) Long productId) {
        
        // 上传图片到百度云BOS
        String imageUrl = fileService.uploadFile(file, "products");
        
        // 如果提供了商品ID，则更新商品图片
        ProductDTO product = null;
        if (productId != null) {
            ProductUpdateDTO updateDTO = new ProductUpdateDTO();
            updateDTO.setImage(imageUrl);
            product = productService.updateProductImage(productId, imageUrl);
        }
        
        // 构造返回数据
        Map<String, Object> data = new HashMap<>();
        data.put("url", imageUrl);
        if (product != null) {
            data.put("product", product);
        }
        
        return ApiResponse.success("商品图片上传成功", data);
    }
} 