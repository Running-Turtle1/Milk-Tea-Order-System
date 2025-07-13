package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.IngredientDTO;
import com.cxy.milktea.admin.service.IngredientService;
import com.cxy.milktea.common.entity.Ingredient;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 配料服务实现类
 */
@Service
@RequiredArgsConstructor
public class IngredientServiceImpl implements IngredientService {

    private final IngredientRepository ingredientRepository;

    @Override
    @Cacheable(value = "ingredients", key = "'admin_all'", unless = "#result == null || #result.isEmpty()")
    public List<IngredientDTO> getAllIngredients() {
        List<Ingredient> ingredients = ingredientRepository.findAll(Sort.by(Sort.Direction.ASC, "sort"));
        return ingredients.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<IngredientDTO> getIngredientsByPage(Integer page, Integer size, String type) {
        Specification<Ingredient> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // 根据类型筛选
            if (StringUtils.hasText(type)) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "sort"));
        Page<Ingredient> ingredientPage = ingredientRepository.findAll(spec, pageable);
        return ingredientPage.map(this::convertToDTO);
    }

    @Override
    public IngredientDTO getIngredientById(Long id) {
        Ingredient ingredient = findIngredientById(id);
        return convertToDTO(ingredient);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"ingredients"}, allEntries = true)
    public IngredientDTO createIngredient(IngredientDTO ingredientDTO) {
        Ingredient ingredient = Ingredient.builder()
                .name(ingredientDTO.getName())
                .price(ingredientDTO.getPrice())
                .stock(ingredientDTO.getStock() != null ? ingredientDTO.getStock() : 0)
                .type(ingredientDTO.getType())
                .sort(ingredientDTO.getSort() != null ? ingredientDTO.getSort() : 0)
                .status(ingredientDTO.getStatus() != null ? ingredientDTO.getStatus() : 1)
                .build();
        
        Ingredient savedIngredient = ingredientRepository.save(ingredient);
        return convertToDTO(savedIngredient);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"ingredients"}, allEntries = true)
    public IngredientDTO updateIngredient(Long id, IngredientDTO ingredientDTO) {
        Ingredient ingredient = findIngredientById(id);
        
        ingredient.setName(ingredientDTO.getName());
        ingredient.setPrice(ingredientDTO.getPrice());
        
        if (ingredientDTO.getStock() != null) {
            ingredient.setStock(ingredientDTO.getStock());
        }
        
        ingredient.setType(ingredientDTO.getType());
        
        if (ingredientDTO.getSort() != null) {
            ingredient.setSort(ingredientDTO.getSort());
        }
        
        if (ingredientDTO.getStatus() != null) {
            ingredient.setStatus(ingredientDTO.getStatus());
        }
        
        Ingredient updatedIngredient = ingredientRepository.save(ingredient);
        return convertToDTO(updatedIngredient);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"ingredients"}, allEntries = true)
    public IngredientDTO updateIngredientStatus(Long id, Integer status) {
        if (status != 0 && status != 1) {
            throw new BusinessException(400, "状态值无效，应为0或1");
        }
        
        Ingredient ingredient = findIngredientById(id);
        ingredient.setStatus(status);
        
        Ingredient updatedIngredient = ingredientRepository.save(ingredient);
        return convertToDTO(updatedIngredient);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"ingredients"}, allEntries = true)
    public void deleteIngredient(Long id) {
        if (!ingredientRepository.existsById(id)) {
            throw new BusinessException(404, "配料不存在");
        }
        ingredientRepository.deleteById(id);
    }

    /**
     * 根据ID查找配料
     */
    private Ingredient findIngredientById(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "配料不存在"));
    }

    /**
     * 转换为DTO
     */
    private IngredientDTO convertToDTO(Ingredient ingredient) {
        return IngredientDTO.builder()
                .id(ingredient.getId())
                .name(ingredient.getName())
                .price(ingredient.getPrice())
                .stock(ingredient.getStock())
                .type(ingredient.getType())
                .sort(ingredient.getSort())
                .status(ingredient.getStatus())
                .createdAt(ingredient.getCreatedAt())
                .updatedAt(ingredient.getUpdatedAt())
                .build();
    }
} 