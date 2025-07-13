package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.PointRecord;
import com.cxy.milktea.common.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface PointRecordRepository extends JpaRepository<PointRecord, Long> {
    
    // 查询用户积分记录
    Page<PointRecord> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // 根据积分类型查询用户积分记录
    Page<PointRecord> findByUserAndTypeOrderByCreatedAtDesc(User user, Integer type, Pageable pageable);
    
    /**
     * 查询用户积分记录
     */
    Page<PointRecord> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * 多条件查询积分记录
     */
    @Query("SELECT p FROM PointRecord p JOIN p.user u WHERE " +
            "(:userId IS NULL OR p.user.id = :userId) AND " +
            "(:keyword IS NULL OR u.username LIKE %:keyword% OR u.phone LIKE %:keyword%) AND " +
            "(:type IS NULL OR p.type = :type) AND " +
            "(:startDateTime IS NULL OR p.createdAt >= :startDateTime) AND " +
            "(:endDateTime IS NULL OR p.createdAt <= :endDateTime)")
    Page<PointRecord> findWithFilters(
            @Param("userId") Long userId,
            @Param("keyword") String keyword,
            @Param("type") Integer type,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            Pageable pageable);
    
    /**
     * 统计用户今日获得的积分
     */
    @Query("SELECT SUM(p.point) FROM PointRecord p WHERE p.user.id = :userId AND p.createdAt >= :startDateTime AND p.point > 0")
    Integer sumPointGainedToday(@Param("userId") Long userId, @Param("startDateTime") LocalDateTime startDateTime);
    
    /**
     * 统计用户今日消费的积分
     */
    @Query("SELECT SUM(ABS(p.point)) FROM PointRecord p WHERE p.user.id = :userId AND p.createdAt >= :startDateTime AND p.point < 0")
    Integer sumPointSpentToday(@Param("userId") Long userId, @Param("startDateTime") LocalDateTime startDateTime);
} 