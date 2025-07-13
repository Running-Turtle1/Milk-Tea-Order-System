package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.OrderRefund;
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
public interface OrderRefundRepository extends JpaRepository<OrderRefund, Long> {
    
    /**
     * 查询订单的所有退款记录
     */
    List<OrderRefund> findByOrderId(Long orderId);
    
    /**
     * 统计特定日期范围内的退款总额
     */
    @Query("SELECT SUM(r.refundAmount) FROM OrderRefund r WHERE r.createdAt BETWEEN :startDateTime AND :endDateTime")
    BigDecimal sumRefundAmountByDateRange(@Param("startDateTime") LocalDateTime startDateTime, @Param("endDateTime") LocalDateTime endDateTime);
    
    /**
     * 统计指定日期范围内每天的退款总额
     */
    @Query("SELECT FUNCTION('DATE', r.createdAt) as date, SUM(r.refundAmount) as amount FROM OrderRefund r WHERE r.createdAt BETWEEN :startDateTime AND :endDateTime GROUP BY FUNCTION('DATE', r.createdAt) ORDER BY date ASC")
    List<Object[]> sumDailyRefundByDateRange(@Param("startDateTime") LocalDateTime startDateTime, @Param("endDateTime") LocalDateTime endDateTime);

    /**
     * 查询用户的退款记录
     */
    @Query("SELECT r FROM OrderRefund r WHERE r.order.user.id = :userId ORDER BY r.createdAt DESC")
    Page<OrderRefund> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * 查询指定状态的退款记录
     */
    @Query("SELECT r FROM OrderRefund r WHERE r.order.user.id = :userId AND r.status = :status ORDER BY r.createdAt DESC")
    Page<OrderRefund> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Integer status, Pageable pageable);

    /**
     * 多条件查询退款记录
     */
    @Query("SELECT r FROM OrderRefund r WHERE " +
            "(:orderNo IS NULL OR r.order.orderNo = :orderNo) AND " +
            "(:keyword IS NULL OR (EXISTS (SELECT u FROM User u WHERE u.id = r.order.user.id AND (u.username LIKE %:keyword% OR u.phone LIKE %:keyword%)))) AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:startDateTime IS NULL OR r.createdAt >= :startDateTime) AND " +
            "(:endDateTime IS NULL OR r.createdAt <= :endDateTime)")
    Page<OrderRefund> findWithFilters(
            @Param("orderNo") String orderNo,
            @Param("keyword") String keyword,
            @Param("status") Integer status,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            Pageable pageable);
} 