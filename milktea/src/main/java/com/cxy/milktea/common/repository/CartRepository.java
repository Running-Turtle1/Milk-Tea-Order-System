package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    
    List<Cart> findByUserId(Long userId);
    
    Optional<Cart> findByUserIdAndProductId(Long userId, Long productId);
    
    Optional<Cart> findByUserIdAndProductIdAndAttributesHashAndIngredientsHash(
        Long userId, 
        Long productId, 
        String attributesHash, 
        String ingredientsHash
    );
    
    void deleteByUserId(Long userId);
    
    void deleteByUserIdAndId(Long userId, Long id);
} 