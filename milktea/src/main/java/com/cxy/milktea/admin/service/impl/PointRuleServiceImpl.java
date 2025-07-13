package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.PointRuleDTO;
import com.cxy.milktea.admin.dto.PointRuleUpdateDTO;
import com.cxy.milktea.admin.service.PointRuleService;
import com.cxy.milktea.common.entity.PointRule;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.PointRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 积分规则Service实现类
 */
@Service
@RequiredArgsConstructor
public class PointRuleServiceImpl implements PointRuleService {

    private final PointRuleRepository pointRuleRepository;

    @Override
    public List<PointRuleDTO> getAllPointRules() {
        List<PointRule> pointRules = pointRuleRepository.findAll();
        return pointRules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PointRuleDTO> getActivePointRules() {
        List<PointRule> pointRules = pointRuleRepository.findByStatusOrderByTypeAsc(1);
        return pointRules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PointRuleDTO> getPointRulesByType(Integer type) {
        List<PointRule> pointRules = pointRuleRepository.findByType(type);
        return pointRules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PointRuleDTO getPointRuleById(Long id) {
        PointRule pointRule = pointRuleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "积分规则不存在"));
        return convertToDTO(pointRule);
    }

    @Override
    @Transactional
    public PointRuleDTO createPointRule(PointRuleUpdateDTO pointRuleDTO) {
        // 校验规则名称唯一性
        if (pointRuleRepository.existsByName(pointRuleDTO.getName())) {
            throw new BusinessException(400, "规则名称已存在");
        }

        PointRule pointRule = new PointRule();
        updatePointRuleFromDTO(pointRule, pointRuleDTO);

        PointRule savedPointRule = pointRuleRepository.save(pointRule);
        return convertToDTO(savedPointRule);
    }

    @Override
    @Transactional
    public PointRuleDTO updatePointRule(Long id, PointRuleUpdateDTO pointRuleDTO) {
        PointRule pointRule = pointRuleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "积分规则不存在"));

        // 校验规则名称唯一性
        if (pointRuleRepository.existsByNameAndIdNot(pointRuleDTO.getName(), id)) {
            throw new BusinessException(400, "规则名称已存在");
        }

        updatePointRuleFromDTO(pointRule, pointRuleDTO);

        PointRule updatedPointRule = pointRuleRepository.save(pointRule);
        return convertToDTO(updatedPointRule);
    }

    @Override
    @Transactional
    public PointRuleDTO updatePointRuleStatus(Long id, Integer status) {
        if (status != 0 && status != 1) {
            throw new BusinessException(400, "状态值无效");
        }

        PointRule pointRule = pointRuleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "积分规则不存在"));

        pointRule.setStatus(status);
        PointRule updatedPointRule = pointRuleRepository.save(pointRule);
        return convertToDTO(updatedPointRule);
    }

    @Override
    @Transactional
    public boolean deletePointRule(Long id) {
        PointRule pointRule = pointRuleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "积分规则不存在"));

        pointRuleRepository.delete(pointRule);
        return true;
    }

    @Override
    public Integer calculateConsumptionPoints(BigDecimal amount) {
        // 获取消费积分规则(类型1，状态启用)
        Optional<PointRule> pointRuleOpt = pointRuleRepository.findFirstByTypeAndStatusOrderByIdDesc(1, 1);
        
        if (pointRuleOpt.isEmpty()) {
            return 0;
        }
        
        PointRule rule = pointRuleOpt.get();
        
        // 检查最低消费金额
        if (rule.getMinAmount() != null && amount.compareTo(rule.getMinAmount()) < 0) {
            return 0;
        }
        
        // 计算积分
        int points;
        if (Boolean.TRUE.equals(rule.getIsRatio())) {
            // 按比例计算: 金额 * 积分比例
            points = amount.multiply(rule.getPointValue()).setScale(0, RoundingMode.DOWN).intValue();
        } else {
            // 固定积分
            points = rule.getPointValue().intValue();
        }
        
        // 限制最高积分
        if (rule.getMaxPoints() != null && points > rule.getMaxPoints()) {
            points = rule.getMaxPoints();
        }
        
        return points;
    }

    @Override
    public Map<String, Object> getPointRuleStats() {
        List<PointRule> allRules = pointRuleRepository.findAll();
        
        // 计算各种统计数据
        long totalRules = allRules.size();
        long activeRules = allRules.stream().filter(rule -> rule.getStatus() == 1).count();
        
        // 按类型统计
        Map<Integer, Long> typeCount = allRules.stream()
                .collect(Collectors.groupingBy(PointRule::getType, Collectors.counting()));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRules", totalRules);
        stats.put("activeRules", activeRules);
        stats.put("typeCount", typeCount);
        
        return stats;
    }

    /**
     * 将积分规则实体转换为DTO
     */
    private PointRuleDTO convertToDTO(PointRule pointRule) {
        return PointRuleDTO.builder()
                .id(pointRule.getId())
                .name(pointRule.getName())
                .type(pointRule.getType())
                .typeText(getTypeText(pointRule.getType()))
                .formula(pointRule.getFormula())
                .isRatio(pointRule.getIsRatio())
                .pointValue(pointRule.getPointValue())
                .minAmount(pointRule.getMinAmount())
                .maxPoints(pointRule.getMaxPoints())
                .description(pointRule.getDescription())
                .status(pointRule.getStatus())
                .statusText(pointRule.getStatus() == 1 ? "启用" : "禁用")
                .createdAt(pointRule.getCreatedAt())
                .updatedAt(pointRule.getUpdatedAt())
                .build();
    }

    /**
     * 根据DTO更新积分规则实体
     */
    private void updatePointRuleFromDTO(PointRule pointRule, PointRuleUpdateDTO dto) {
        pointRule.setName(dto.getName());
        pointRule.setType(dto.getType());
        pointRule.setFormula(dto.getFormula());
        pointRule.setIsRatio(dto.getIsRatio());
        pointRule.setPointValue(dto.getPointValue());
        pointRule.setMinAmount(dto.getMinAmount());
        pointRule.setMaxPoints(dto.getMaxPoints());
        pointRule.setDescription(dto.getDescription());
        pointRule.setStatus(dto.getStatus());
    }
    
    /**
     * 获取规则类型文本
     */
    private String getTypeText(Integer type) {
        if (type == null) return "";
        
        return switch (type) {
            case 1 -> "消费获取";
            case 2 -> "首次注册";
            case 4 -> "每日签到";
            case 5 -> "管理员调整";
            default -> "未知类型";
        };
    }
} 