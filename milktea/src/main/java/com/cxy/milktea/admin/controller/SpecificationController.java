package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.SpecificationDTO;
import com.cxy.milktea.admin.service.SpecificationService;
import com.cxy.milktea.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 规格管理控制器
 * 提供温度和糖度规格的增删改查功能
 */
@RestController
@RequestMapping("/admin/specification")
@RequiredArgsConstructor
public class SpecificationController {

    private final SpecificationService specificationService;

    /**
     * 获取所有规格
     */
    @GetMapping("/list")
    public ApiResponse<List<SpecificationDTO>> getAllSpecifications(
            @RequestParam(required = false) String type) {
        return ApiResponse.success(specificationService.getAllSpecifications(type));
    }

    /**
     * 分页获取规格
     */
    @GetMapping("/page")
    public ApiResponse<Page<SpecificationDTO>> getSpecificationsByPage(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String type) {
        return ApiResponse.success(specificationService.getSpecificationsByPage(page, size, type));
    }

    /**
     * 获取规格详情
     */
    @GetMapping("/{id}")
    public ApiResponse<SpecificationDTO> getSpecificationById(@PathVariable Long id) {
        return ApiResponse.success(specificationService.getSpecificationById(id));
    }

    /**
     * 创建规格
     */
    @PostMapping

    public ApiResponse<SpecificationDTO> createSpecification(@Valid @RequestBody SpecificationDTO specificationDTO) {
        return ApiResponse.success("创建规格成功", specificationService.createSpecification(specificationDTO));
    }

    /**
     * 更新规格
     */
    @PutMapping("/{id}")

    public ApiResponse<SpecificationDTO> updateSpecification(
            @PathVariable Long id,
            @Valid @RequestBody SpecificationDTO specificationDTO) {
        return ApiResponse.success("更新规格成功", specificationService.updateSpecification(id, specificationDTO));
    }

    /**
     * 更新规格状态
     */
    @PutMapping("/{id}/status")

    public ApiResponse<SpecificationDTO> updateSpecificationStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {
        return ApiResponse.success("更新状态成功", specificationService.updateSpecificationStatus(id, status));
    }

    /**
     * 更新规格排序
     */
    @PutMapping("/{id}/sort")

    public ApiResponse<SpecificationDTO> updateSpecificationSort(
            @PathVariable Long id,
            @RequestParam Integer sort) {
        return ApiResponse.success("更新排序成功", specificationService.updateSpecificationSort(id, sort));
    }

    /**
     * 删除规格
     */
    @DeleteMapping("/{id}")

    public ApiResponse<Void> deleteSpecification(@PathVariable Long id) {
        specificationService.deleteSpecification(id);
        return ApiResponse.success("删除规格成功", null);
    }
} 