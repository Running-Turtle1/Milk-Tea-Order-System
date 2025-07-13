package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.UserCoupon;
import com.cxy.milktea.common.entity.User;
import com.cxy.milktea.common.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {
    
    // 查询用户优惠券
    Page<UserCoupon> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // 查询用户未使用优惠券
    Page<UserCoupon> findByUserAndStatusOrderByCreatedAtDesc(User user, Integer status, Pageable pageable);
    
    // 查询用户可用优惠券（根据消费金额）
    @Query("SELECT uc FROM UserCoupon uc JOIN uc.coupon c WHERE uc.user.id = ?1 AND uc.status = 0 AND c.status = 1 AND c.startTime <= ?2 AND c.endTime >= ?2 AND c.minPoint <= ?3")
    List<UserCoupon> findAvailableCouponsByUser(Long userId, LocalDateTime now, BigDecimal amount);
    
    // 查询用户所有优惠券
    @Query("SELECT uc FROM UserCoupon uc WHERE uc.user.id = ?1")
    List<UserCoupon> findByUserId(Long userId);
    
    // 查询用户优惠券
    Optional<UserCoupon> findByIdAndUser(Long id, User user);
    
    // 查询用户是否已有特定优惠券
    boolean existsByUserAndCouponId(User user, Long couponId);
    
    // 查询用户是否已有特定优惠券
    boolean existsByUserAndCoupon(User user, Coupon coupon);
    
    // 根据订单ID查询优惠券
    Optional<UserCoupon> findByOrderId(Long orderId);
    
    // 更新已过期的优惠券状态
    @Modifying
    @Transactional
    @Query("UPDATE UserCoupon uc SET uc.status = 2 WHERE uc.status = 0 AND " +
           "(SELECT c.status FROM Coupon c WHERE c.id = uc.coupon.id) != 1 OR " +
           "(SELECT c.endTime FROM Coupon c WHERE c.id = uc.coupon.id) < :now")
    int updateExpiredCoupons(@Param("now") LocalDateTime now);
    
    /**
     * 分页查询用户优惠券（支持多条件查询）
     */
    @Query("SELECT uc FROM UserCoupon uc JOIN uc.coupon c JOIN uc.user u " +
           "WHERE (:userId IS NULL OR u.id = :userId) " +
           "AND (:couponId IS NULL OR c.id = :couponId) " +
           "AND (:status IS NULL OR uc.status = :status) " +
           "AND (:startDate IS NULL OR uc.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR uc.createdAt <= :endDate)")
    Page<UserCoupon> findWithFilters(
            @Param("userId") Long userId,
            @Param("couponId") Long couponId,
            @Param("status") Integer status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
    
    /**
     * 查询用户未使用的指定优惠券数量
     */
    @Query("SELECT COUNT(uc) FROM UserCoupon uc " +
           "WHERE uc.user.id = :userId AND uc.coupon.id = :couponId AND uc.status = 0")
    Integer countUnusedCouponByUserAndCouponId(
            @Param("userId") Long userId, 
            @Param("couponId") Long couponId);
} 