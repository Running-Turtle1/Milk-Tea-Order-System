package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.IngredientDTO;
import com.cxy.milktea.admin.service.IngredientService;
import com.cxy.milktea.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 配料管理控制器
 * 提供配料的增删改查功能
 */
@RestController
@RequestMapping("/admin/ingredient")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientService ingredientService;

    /**
     * 获取所有配料
     */
    @GetMapping("/list")
    public ApiResponse<List<IngredientDTO>> getAllIngredients() {
        return ApiResponse.success(ingredientService.getAllIngredients());
    }

    /**
     * 分页获取配料
     */
    @GetMapping("/page")
    public ApiResponse<Page<IngredientDTO>> getIngredientsByPage(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String type) {
        return ApiResponse.success(ingredientService.getIngredientsByPage(page, size, type));
    }

    /**
     * 获取配料详情
     */
    @GetMapping("/{id}")
    public ApiResponse<IngredientDTO> getIngredientById(@PathVariable Long id) {
        return ApiResponse.success(ingredientService.getIngredientById(id));
    }

    /**
     * 创建配料
     */
    @PostMapping

    public ApiResponse<IngredientDTO> createIngredient(@Valid @RequestBody IngredientDTO ingredientDTO) {
        return ApiResponse.success("创建配料成功", ingredientService.createIngredient(ingredientDTO));
    }

    /**
     * 更新配料
     */
    @PutMapping("/{id}")

    public ApiResponse<IngredientDTO> updateIngredient(
            @PathVariable Long id,
            @Valid @RequestBody IngredientDTO ingredientDTO) {
        return ApiResponse.success("更新配料成功", ingredientService.updateIngredient(id, ingredientDTO));
    }

    /**
     * 更新配料状态
     */
    @PutMapping("/{id}/status")

    public ApiResponse<IngredientDTO> updateIngredientStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {
        return ApiResponse.success("更新状态成功", ingredientService.updateIngredientStatus(id, status));
    }

    /**
     * 删除配料
     */
    @DeleteMapping("/{id}")

    public ApiResponse<Void> deleteIngredient(@PathVariable Long id) {
        ingredientService.deleteIngredient(id);
        return ApiResponse.success("删除配料成功", null);
    }
} 