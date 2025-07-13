package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.CategoryDTO;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 分类服务接口
 * 定义分类管理的业务方法
 */
public interface CategoryService {
    
    /**
     * 获取所有分类
     * @return 分类列表
     */
    List<CategoryDTO> getAllCategories();
    
    /**
     * 分页获取分类
     * @param page 页码
     * @param size 每页记录数
     * @return 分页分类数据
     */
    Page<CategoryDTO> getCategoriesByPage(Integer page, Integer size);
    
    /**
     * 根据ID获取分类
     * @param id 分类ID
     * @return 分类信息
     */
    CategoryDTO getCategoryById(Long id);
    
    /**
     * 创建分类
     * @param categoryDTO 分类信息
     * @return 创建后的分类
     */
    CategoryDTO createCategory(CategoryDTO categoryDTO);
    
    /**
     * 更新分类
     * @param id 分类ID
     * @param categoryDTO 分类信息
     * @return 更新后的分类
     */
    CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO);
    
    /**
     * 更新分类状态
     * @param id 分类ID
     * @param status 状态值
     * @return 更新后的分类
     */
    CategoryDTO updateCategoryStatus(Long id, Integer status);
    
    /**
     * 更新分类排序
     * @param id 分类ID
     * @param sort 排序值
     * @return 更新后的分类
     */
    CategoryDTO updateCategorySort(Long id, Integer sort);
    
    /**
     * 更新分类图片
     * @param id 分类ID
     * @param imageUrl 图片URL
     * @return 更新后的分类
     */
    CategoryDTO updateCategoryImage(Long id, String imageUrl);
    
    /**
     * 删除分类
     * @param id 分类ID
     */
    void deleteCategory(Long id);
} 