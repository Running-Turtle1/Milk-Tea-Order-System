package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface IngredientRepository extends JpaRepository<Ingredient, Long>, JpaSpecificationExecutor<Ingredient> {
    
    List<Ingredient> findByStatusOrderBySortAsc(Integer status);
    
    List<Ingredient> findByTypeAndStatusOrderBySortAsc(String type, Integer status);
} 