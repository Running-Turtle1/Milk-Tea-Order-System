package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.Order;
import com.cxy.milktea.common.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // 根据订单号查询订单
    Optional<Order> findByOrderNo(String orderNo);
    
    // 查询用户的所有订单
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // 根据状态查询用户订单
    Page<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, Integer status, Pageable pageable);
    
    // 查询用户最近的订单
    List<Order> findTop5ByUserOrderByCreatedAtDesc(User user);

    List<Order> findByUserId(Long userId);

    @Query("SELECT o FROM Order o WHERE " +
            "(:orderNo IS NULL OR o.orderNo = :orderNo) AND " +
            "(:keyword IS NULL OR (EXISTS (SELECT u FROM User u WHERE u.id = o.user.id AND (u.username LIKE %:keyword% OR u.phone LIKE %:keyword%)))) AND " +
            "(:status IS NULL OR o.status = :status) AND " +
            "(:takeNo IS NULL OR o.takeNo = :takeNo) AND " +
            "(:startDateTime IS NULL OR o.createdAt >= :startDateTime) AND " +
            "(:endDateTime IS NULL OR o.createdAt <= :endDateTime)")
    Page<Order> findWithFilters(
            @Param("orderNo") String orderNo,
            @Param("keyword") String keyword,
            @Param("status") Integer status,
            @Param("takeNo") String takeNo,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            Pageable pageable);

    long countByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    long countByStatusInAndCreatedAtBetween(List<Integer> statuses, LocalDateTime startDateTime, LocalDateTime endDateTime);

    long countByStatusAndCreatedAtBetween(Integer status, LocalDateTime startDateTime, LocalDateTime endDateTime);

    List<Order> findByStatusAndPaymentTimeBefore(Integer status, LocalDateTime dateTime);

    List<Order> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.status IN (0, 1)")
    long countActiveOrdersByUserId(@Param("userId") Long userId);
    
    /**
     * 统计用户订单数量
     */
    long countByUserId(Long userId);
    
    /**
     * 获取用户最近一次下单时间
     */
    @Query("SELECT MAX(o.createdAt) FROM Order o WHERE o.user.id = :userId AND o.status = 1")
    LocalDateTime findLastOrderTimeByUserId(@Param("userId") Long userId);
    
    /**
     * 统计用户完成订单的总金额
     */
    @Query("SELECT SUM(o.paymentAmount) FROM Order o WHERE o.user.id = :userId AND o.status = 1")
    BigDecimal sumPaymentAmountByUserId(@Param("userId") Long userId);
    
    /**
     * 统计今日收入（已支付订单）
     */
    @Query("SELECT SUM(o.paymentAmount) FROM Order o WHERE o.status = 1 AND o.createdAt BETWEEN :startDateTime AND :endDateTime")
    BigDecimal sumIncomeByDateRange(@Param("startDateTime") LocalDateTime startDateTime, @Param("endDateTime") LocalDateTime endDateTime);
    
    /**
     * 统计指定日期范围内每天的收入
     */
    @Query("SELECT FUNCTION('DATE', o.createdAt) as date, SUM(o.paymentAmount) as income FROM Order o WHERE o.status = 1 AND o.createdAt BETWEEN :startDateTime AND :endDateTime GROUP BY FUNCTION('DATE', o.createdAt) ORDER BY date ASC")
    List<Object[]> sumDailyIncomeByDateRange(@Param("startDateTime") LocalDateTime startDateTime, @Param("endDateTime") LocalDateTime endDateTime);
}