package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.Order;
import com.cxy.milktea.common.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    
    /**
     * 根据订单ID查询订单详情
     */
    @Query("SELECT od FROM OrderDetail od WHERE od.order.id = :orderId")
    List<OrderDetail> findByOrderId(@Param("orderId") Long orderId);
    
    /**
     * 根据订单查询订单详情
     */
    List<OrderDetail> findByOrder(Order order);

    /**
     * 根据产品ID统计销量
     */
    @Query("SELECT SUM(od.quantity) FROM OrderDetail od WHERE od.productId = :productId")
    Integer countSalesByProductId(@Param("productId") Long productId);
} 