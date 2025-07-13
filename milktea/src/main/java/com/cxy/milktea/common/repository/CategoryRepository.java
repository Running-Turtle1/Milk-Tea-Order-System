package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByStatusOrderBySortAsc(Integer status);
} 