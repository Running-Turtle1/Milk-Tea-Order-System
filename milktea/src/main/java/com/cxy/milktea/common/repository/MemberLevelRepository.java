package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.MemberLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 会员等级Repository接口
 */
@Repository
public interface MemberLevelRepository extends JpaRepository<MemberLevel, Long> {
    
    /**
     * 根据等级值查找会员等级
     * @param level 等级值
     * @return 会员等级
     */
    Optional<MemberLevel> findByLevel(Integer level);
    
    /**
     * 查找所有启用的会员等级，按等级值升序排序
     * @return 会员等级列表
     */
    List<MemberLevel> findByStatusOrderByLevelAsc(Integer status);
    
    /**
     * 根据积分值查询对应的会员等级
     * @param points 积分值
     * @return 会员等级
     */
    @Query("SELECT ml FROM MemberLevel ml WHERE ml.status = 1 AND ml.pointThreshold <= :points ORDER BY ml.pointThreshold DESC LIMIT 1")
    Optional<MemberLevel> findLevelByPoints(Integer points);
    
    /**
     * 检查等级值是否已存在
     * @param level 等级值
     * @return 是否存在
     */
    boolean existsByLevel(Integer level);
    
    /**
     * 检查等级名称是否已存在
     * @param name 等级名称
     * @return 是否存在
     */
    boolean existsByName(String name);
    
    /**
     * 检查等级名称是否已存在(排除指定ID)
     * @param name 等级名称
     * @param id ID
     * @return 是否存在
     */
    boolean existsByNameAndIdNot(String name, Long id);
    
    /**
     * 检查等级值是否已存在(排除指定ID)
     * @param level 等级值
     * @param id ID
     * @return 是否存在
     */
    boolean existsByLevelAndIdNot(Integer level, Long id);
} 