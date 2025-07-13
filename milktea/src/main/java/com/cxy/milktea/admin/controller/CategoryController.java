package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.CategoryDTO;
import com.cxy.milktea.admin.service.CategoryService;
import com.cxy.milktea.client.service.FileService;
import com.cxy.milktea.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理端商品分类控制器
 * 提供分类的增删改查功能
 */
@RestController
@RequestMapping("/admin/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final FileService fileService;

    /**
     * 获取所有分类
     */
    @GetMapping("/list")
    public ApiResponse<List<CategoryDTO>> getAllCategories() {
        return ApiResponse.success(categoryService.getAllCategories());
    }

    /**
     * 分页获取分类
     */
    @GetMapping("/page")
    public ApiResponse<Page<CategoryDTO>> getCategoriesByPage(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return ApiResponse.success(categoryService.getCategoriesByPage(page, size));
    }

    /**
     * 获取单个分类详情
     */
    @GetMapping("/{id}")
    public ApiResponse<CategoryDTO> getCategoryById(@PathVariable Long id) {
        return ApiResponse.success(categoryService.getCategoryById(id));
    }

    /**
     * 创建分类
     * 只有管理员和店长可以创建分类
     */
    @PostMapping

    public ApiResponse<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        return ApiResponse.success("创建分类成功", categoryService.createCategory(categoryDTO));
    }

    /**
     * 更新分类
     * 只有管理员和店长可以更新分类
     */
    @PutMapping("/{id}")

    public ApiResponse<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO categoryDTO) {
        return ApiResponse.success("更新分类成功", categoryService.updateCategory(id, categoryDTO));
    }

    /**
     * 修改分类状态（启用/禁用）
     * 只有管理员和店长可以修改分类状态
     */
    @PutMapping("/{id}/status")

    public ApiResponse<CategoryDTO> updateCategoryStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {
        return ApiResponse.success("修改状态成功", categoryService.updateCategoryStatus(id, status));
    }

    /**
     * 删除分类
     * 只有管理员可以删除分类
     */
    @DeleteMapping("/{id}")

    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponse.success("删除分类成功", null);
    }

    /**
     * 更新分类排序
     */
    @PutMapping("/{id}/sort")

    public ApiResponse<CategoryDTO> updateCategorySort(
            @PathVariable Long id,
            @RequestParam Integer sort) {
        return ApiResponse.success("更新排序成功", categoryService.updateCategorySort(id, sort));
    }
    
    /**
     * 上传分类图片
     * @param file 要上传的图片文件
     * @param categoryId 关联的分类ID，如果有则自动更新分类图片
     * @return 上传后的图片URL
     */
    @PostMapping("/upload/image")

    public ApiResponse<Map<String, Object>> uploadCategoryImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "categoryId", required = false) Long categoryId) {
        
        // 上传图片到百度云BOS
        String imageUrl = fileService.uploadFile(file, "categories");
        
        // 如果提供了分类ID，则更新分类图片
        CategoryDTO category = null;
        if (categoryId != null) {
            category = categoryService.updateCategoryImage(categoryId, imageUrl);
        }
        
        // 构造返回数据
        Map<String, Object> data = new HashMap<>();
        data.put("url", imageUrl);
        if (category != null) {
            data.put("category", category);
        }
        
        return ApiResponse.success("分类图片上传成功", data);
    }
} 