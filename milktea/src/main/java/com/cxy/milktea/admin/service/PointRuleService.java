package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.PointRuleDTO;
import com.cxy.milktea.admin.dto.PointRuleUpdateDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 积分规则Service接口
 */
public interface PointRuleService {
    
    /**
     * 获取所有积分规则
     *
     * @return 积分规则列表
     */
    List<PointRuleDTO> getAllPointRules();
    
    /**
     * 获取所有启用的积分规则
     *
     * @return 积分规则列表
     */
    List<PointRuleDTO> getActivePointRules();
    
    /**
     * 根据类型获取积分规则
     *
     * @param type 规则类型
     * @return 积分规则列表
     */
    List<PointRuleDTO> getPointRulesByType(Integer type);
    
    /**
     * 根据ID获取积分规则
     *
     * @param id 规则ID
     * @return 积分规则
     */
    PointRuleDTO getPointRuleById(Long id);
    
    /**
     * 创建积分规则
     *
     * @param pointRuleDTO 积分规则DTO
     * @return 创建后的积分规则
     */
    PointRuleDTO createPointRule(PointRuleUpdateDTO pointRuleDTO);
    
    /**
     * 更新积分规则
     *
     * @param id 规则ID
     * @param pointRuleDTO 积分规则DTO
     * @return 更新后的积分规则
     */
    PointRuleDTO updatePointRule(Long id, PointRuleUpdateDTO pointRuleDTO);
    
    /**
     * 更新积分规则状态
     *
     * @param id 规则ID
     * @param status 状态
     * @return 更新后的积分规则
     */
    PointRuleDTO updatePointRuleStatus(Long id, Integer status);
    
    /**
     * 删除积分规则
     *
     * @param id 规则ID
     * @return 是否删除成功
     */
    boolean deletePointRule(Long id);
    
    /**
     * 计算消费积分
     *
     * @param amount 消费金额
     * @return 获得的积分
     */
    Integer calculateConsumptionPoints(BigDecimal amount);
    
    /**
     * 获取积分规则统计信息
     *
     * @return 统计信息
     */
    Map<String, Object> getPointRuleStats();
} 