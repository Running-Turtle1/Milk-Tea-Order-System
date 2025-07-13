package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.Admin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    
    Optional<Admin> findByUsername(String username);
    
    Boolean existsByUsername(String username);
    
    @Query("SELECT a FROM Admin a WHERE a.username LIKE %:keyword% OR a.realName LIKE %:keyword% OR a.phone LIKE %:keyword%")
    Page<Admin> search(String keyword, Pageable pageable);
    
    List<Admin> findByStatus(Integer status);
} 