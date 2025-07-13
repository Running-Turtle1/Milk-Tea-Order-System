package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.PointRuleDTO;
import com.cxy.milktea.admin.dto.PointRuleUpdateDTO;
import com.cxy.milktea.admin.service.PointRuleService;
import com.cxy.milktea.common.response.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 积分规则管理Controller
 */
@RestController
@RequestMapping("/admin/point-rules")
@RequiredArgsConstructor
public class PointRuleController {

    private final PointRuleService pointRuleService;
    
    /**
     * 获取所有积分规则
     */
    @GetMapping
    public Result<List<PointRuleDTO>> getPointRules() {
        return Result.success(pointRuleService.getAllPointRules());
    }
    
    /**
     * 获取启用的积分规则
     */
    @GetMapping("/active")
    public Result<List<PointRuleDTO>> getActivePointRules() {
        return Result.success(pointRuleService.getActivePointRules());
    }
    
    /**
     * 根据类型获取积分规则
     */
    @GetMapping("/by-type")
    public Result<List<PointRuleDTO>> getPointRulesByType(@RequestParam Integer type) {
        return Result.success(pointRuleService.getPointRulesByType(type));
    }
    
    /**
     * 根据ID获取积分规则
     */
    @GetMapping("/{id}")
    public Result<PointRuleDTO> getPointRule(@PathVariable Long id) {
        return Result.success(pointRuleService.getPointRuleById(id));
    }
    
    /**
     * 创建积分规则
     */
    @PostMapping
    public Result<PointRuleDTO> createPointRule(@Valid @RequestBody PointRuleUpdateDTO pointRuleDTO) {
        return Result.success(pointRuleService.createPointRule(pointRuleDTO));
    }
    
    /**
     * 更新积分规则
     */
    @PutMapping("/{id}")
    public Result<PointRuleDTO> updatePointRule(
            @PathVariable Long id,
            @Valid @RequestBody PointRuleUpdateDTO pointRuleDTO) {
        return Result.success(pointRuleService.updatePointRule(id, pointRuleDTO));
    }
    
    /**
     * 更新积分规则状态
     */
    @PutMapping("/{id}/status")
    public Result<PointRuleDTO> updatePointRuleStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {
        return Result.success(pointRuleService.updatePointRuleStatus(id, status));
    }
    
    /**
     * 删除积分规则
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> deletePointRule(@PathVariable Long id) {
        return Result.success(pointRuleService.deletePointRule(id));
    }
    
    /**
     * 计算消费积分
     */
    @GetMapping("/calculate-consumption-points")
    public Result<Integer> calculateConsumptionPoints(@RequestParam BigDecimal amount) {
        return Result.success(pointRuleService.calculateConsumptionPoints(amount));
    }
    
    /**
     * 获取积分规则统计信息
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getPointRuleStats() {
        return Result.success(pointRuleService.getPointRuleStats());
    }
} 