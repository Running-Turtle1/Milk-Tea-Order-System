package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    /**
     * 根据状态查询优惠券列表
     */
    List<Coupon> findByStatusOrderByCreatedAtDesc(Integer status);
    
    /**
     * 根据会员等级查询启用状态的优惠券
     */
    @Query("SELECT c FROM Coupon c WHERE c.status = 1 AND (c.memberLevel = 0 OR c.memberLevel <= :memberLevel)")
    List<Coupon> findByMemberLevelAndStatus(@Param("memberLevel") Integer memberLevel);
    
    /**
     * 查询可领取的优惠券（状态为启用且在有效期内）
     */
    @Query("SELECT c FROM Coupon c WHERE c.status = 1 " +
           "AND c.startTime <= :now AND c.endTime >= :now " +
           "AND (c.total IS NULL OR c.issued IS NULL OR c.issued < c.total)")
    List<Coupon> findAvailableCoupons(@Param("now") LocalDateTime now);
    
    /**
     * 分页查询优惠券（支持按名称、类型、状态、有效期筛选）
     */
    @Query("SELECT c FROM Coupon c " +
           "WHERE (:name IS NULL OR c.name LIKE %:name%) " +
           "AND (:type IS NULL OR c.type = :type) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:startDate IS NULL OR c.endTime >= :startDate) " +
           "AND (:endDate IS NULL OR c.startTime <= :endDate)")
    Page<Coupon> findWithFilters(
            @Param("name") String name,
            @Param("type") Integer type,
            @Param("status") Integer status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
    
    // 查询满足消费金额的优惠券
    @Query("SELECT c FROM Coupon c WHERE c.status = 1 AND c.startTime <= ?1 AND c.endTime >= ?1 AND c.minPoint <= ?2 AND (c.total IS NULL OR c.issued IS NULL OR c.issued < c.total)")
    List<Coupon> findAvailableCouponsByAmount(LocalDateTime now, BigDecimal amount);
} 