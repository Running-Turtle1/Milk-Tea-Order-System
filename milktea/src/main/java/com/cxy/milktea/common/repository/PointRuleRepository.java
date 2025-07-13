package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.PointRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 积分规则Repository接口
 */
@Repository
public interface PointRuleRepository extends JpaRepository<PointRule, Long> {
    
    /**
     * 根据规则类型查询
     * @param type 规则类型
     * @return 积分规则列表
     */
    List<PointRule> findByType(Integer type);
    
    /**
     * 根据规则类型和状态查询
     * @param type 规则类型
     * @param status 状态
     * @return 积分规则列表
     */
    List<PointRule> findByTypeAndStatus(Integer type, Integer status);
    
    /**
     * 根据状态查询所有规则
     * @param status 状态
     * @return 积分规则列表
     */
    List<PointRule> findByStatusOrderByTypeAsc(Integer status);
    
    /**
     * 根据类型查找默认规则
     * @param type 规则类型
     * @return 积分规则
     */
    Optional<PointRule> findFirstByTypeAndStatusOrderByIdDesc(Integer type, Integer status);
    
    /**
     * 检查规则名称是否存在
     * @param name 规则名称
     * @return 是否存在
     */
    boolean existsByName(String name);
    
    /**
     * 检查规则名称是否存在(排除指定ID)
     * @param name 规则名称
     * @param id ID
     * @return 是否存在
     */
    boolean existsByNameAndIdNot(String name, Long id);
} 