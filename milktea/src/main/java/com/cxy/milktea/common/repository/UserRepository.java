package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    
    Optional<User> findByPhone(String phone);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByPhone(String phone);
    
    /**
     * 多条件查询会员列表
     */
    @Query("SELECT u FROM User u WHERE " +
            "(:keyword IS NULL OR u.username LIKE %:keyword% OR u.phone LIKE %:keyword%) AND " +
            "(:memberLevel IS NULL OR u.memberLevel = :memberLevel) AND " +
            "(:status IS NULL OR u.status = :status) AND " +
            "(:minPoints IS NULL OR u.totalPoints >= :minPoints) AND " +
            "(:maxPoints IS NULL OR u.totalPoints <= :maxPoints) AND " +
            "(:startDateTime IS NULL OR u.createdAt >= :startDateTime) AND " +
            "(:endDateTime IS NULL OR u.createdAt <= :endDateTime)")
    Page<User> findWithFilters(
            @Param("keyword") String keyword,
            @Param("memberLevel") Integer memberLevel,
            @Param("status") Integer status,
            @Param("minPoints") Integer minPoints,
            @Param("maxPoints") Integer maxPoints,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            Pageable pageable);
            
    /**
     * 查询会员总数
     */
    long count();
    
    /**
     * 根据会员等级查询会员数量
     */
    long countByMemberLevel(Integer memberLevel);
    
    /**
     * 查询今日新增会员数
     */
    long countByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    /**
     * 按会员等级分组统计用户数量
     * @return 会员等级和对应的用户数量列表 [level, count]
     */
    @Query("SELECT u.memberLevel, COUNT(u) FROM User u GROUP BY u.memberLevel")
    List<Object[]> countUsersByMemberLevel();
} 