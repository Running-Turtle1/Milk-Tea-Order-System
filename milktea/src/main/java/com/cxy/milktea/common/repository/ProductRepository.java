package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    
    // 查询推荐商品
    List<Product> findByIsRecommendAndStatusOrderBySalesDesc(Integer isRecommend, Integer status);
    
    // 根据分类查询商品
    Page<Product> findByCategoryIdAndStatus(Long categoryId, Integer status, Pageable pageable);
    
    // 搜索商品
    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.name LIKE %:keyword%")
    Page<Product> searchProducts(@Param("keyword") String keyword, @Param("status") Integer status, Pageable pageable);
    
    // 统计分类下的商品数量
    long countByCategoryId(Long categoryId);
    
    // 增加商品销量
    @Modifying
    @Query("UPDATE Product p SET p.sales = p.sales + :quantity WHERE p.id = :productId")
    void increaseSales(@Param("productId") Long productId, @Param("quantity") Integer quantity);
} 