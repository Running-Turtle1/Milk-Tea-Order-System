package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.IngredientDTO;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 配料服务接口
 */
public interface IngredientService {
    
    /**
     * 获取所有配料
     * @return 配料列表
     */
    List<IngredientDTO> getAllIngredients();
    
    /**
     * 分页获取配料
     * @param page 页码
     * @param size 每页记录数
     * @param type 配料类型（可选）
     * @return 配料分页数据
     */
    Page<IngredientDTO> getIngredientsByPage(Integer page, Integer size, String type);
    
    /**
     * 根据ID获取配料
     * @param id 配料ID
     * @return 配料信息
     */
    IngredientDTO getIngredientById(Long id);
    
    /**
     * 创建配料
     * @param ingredientDTO 配料信息
     * @return 创建后的配料
     */
    IngredientDTO createIngredient(IngredientDTO ingredientDTO);
    
    /**
     * 更新配料
     * @param id 配料ID
     * @param ingredientDTO 配料信息
     * @return 更新后的配料
     */
    IngredientDTO updateIngredient(Long id, IngredientDTO ingredientDTO);
    
    /**
     * 更新配料状态
     * @param id 配料ID
     * @param status 状态值
     * @return 更新后的配料
     */
    IngredientDTO updateIngredientStatus(Long id, Integer status);
    
    /**
     * 删除配料
     * @param id 配料ID
     */
    void deleteIngredient(Long id);
} 