package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.CategoryDTO;
import com.cxy.milktea.admin.service.CategoryService;
import com.cxy.milktea.common.entity.Category;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.CategoryRepository;
import com.cxy.milktea.common.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 分类服务实现类
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "sort"));
        return categories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<CategoryDTO> getCategoriesByPage(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "sort"));
        Page<Category> categoryPage = categoryRepository.findAll(pageable);
        return categoryPage.map(this::convertToDTO);
    }

    @Override
    public CategoryDTO getCategoryById(Long id) {
        Category category = findCategoryById(id);
        return convertToDTO(category);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"categories", "products"}, allEntries = true)
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = Category.builder()
                .name(categoryDTO.getName())
                .image(categoryDTO.getImage())
                .sort(categoryDTO.getSort() != null ? categoryDTO.getSort() : 0)
                .status(categoryDTO.getStatus() != null ? categoryDTO.getStatus() : 1)
                .build();
        
        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"categories", "products"}, allEntries = true)
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = findCategoryById(id);
        
        category.setName(categoryDTO.getName());
        if (categoryDTO.getImage() != null) {
            category.setImage(categoryDTO.getImage());
        }
        if (categoryDTO.getSort() != null) {
            category.setSort(categoryDTO.getSort());
        }
        if (categoryDTO.getStatus() != null) {
            category.setStatus(categoryDTO.getStatus());
        }
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"categories", "products"}, allEntries = true)
    public CategoryDTO updateCategoryStatus(Long id, Integer status) {
        if (status != 0 && status != 1) {
            throw new BusinessException(400, "状态值无效，应为0或1");
        }
        
        Category category = findCategoryById(id);
        category.setStatus(status);
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"categories", "products"}, allEntries = true)
    public CategoryDTO updateCategorySort(Long id, Integer sort) {
        Category category = findCategoryById(id);
        category.setSort(sort);
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"categories", "products"}, allEntries = true)
    public CategoryDTO updateCategoryImage(Long id, String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            throw new BusinessException(400, "图片URL不能为空");
        }
        
        Category category = findCategoryById(id);
        category.setImage(imageUrl);
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"categories", "products"}, allEntries = true)
    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);
        
        // 检查该分类下是否有商品
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new BusinessException(400, "该分类下存在商品，不能删除");
        }
        
        categoryRepository.delete(category);
    }

    /**
     * 根据ID查找分类
     */
    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "分类不存在"));
    }

    /**
     * 转换为DTO
     */
    private CategoryDTO convertToDTO(Category category) {
        Long categoryId = category.getId();
        long productCount = 0;
        
        // 获取分类下的商品数量
        if (categoryId != null) {
            productCount = productRepository.countByCategoryId(categoryId);
        }
        
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .image(category.getImage())
                .sort(category.getSort())
                .status(category.getStatus())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .productCount((int) productCount)
                .build();
    }
} 