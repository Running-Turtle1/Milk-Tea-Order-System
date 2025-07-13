package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface SpecificationRepository extends JpaRepository<Specification, Long>, JpaSpecificationExecutor<Specification> {
    
    List<Specification> findByTypeAndStatusOrderBySortAsc(String type, Integer status);
    
    List<Specification> findByType(String type);
    
    List<Specification> findByTypeOrderBySortAsc(String type);
} 