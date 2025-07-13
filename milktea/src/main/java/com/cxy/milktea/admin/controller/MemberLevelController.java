package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.MemberLevelDTO;
import com.cxy.milktea.admin.dto.MemberLevelUpdateDTO;
import com.cxy.milktea.admin.service.MemberLevelService;
import com.cxy.milktea.common.response.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 会员等级管理Controller
 */
@RestController
@RequestMapping("/admin/member-levels")
@RequiredArgsConstructor
public class MemberLevelController {

    private final MemberLevelService memberLevelService;
    
    /**
     * 获取所有会员等级
     */
    @GetMapping
    public Result<List<MemberLevelDTO>> getMemberLevels() {
        return Result.success(memberLevelService.getAllMemberLevels());
    }
    
    /**
     * 获取启用的会员等级
     */
    @GetMapping("/active")
    public Result<List<MemberLevelDTO>> getActiveMemberLevels() {
        return Result.success(memberLevelService.getActiveMemberLevels());
    }
    
    /**
     * 根据ID获取会员等级
     */
    @GetMapping("/{id}")
    public Result<MemberLevelDTO> getMemberLevel(@PathVariable Long id) {
        return Result.success(memberLevelService.getMemberLevelById(id));
    }
    
    /**
     * 创建会员等级
     */
    @PostMapping
    public Result<MemberLevelDTO> createMemberLevel(@Valid @RequestBody MemberLevelUpdateDTO memberLevelDTO) {
        return Result.success(memberLevelService.createMemberLevel(memberLevelDTO));
    }
    
    /**
     * 更新会员等级
     */
    @PutMapping("/{id}")
    public Result<MemberLevelDTO> updateMemberLevel(
            @PathVariable Long id,
            @Valid @RequestBody MemberLevelUpdateDTO memberLevelDTO) {
        return Result.success(memberLevelService.updateMemberLevel(id, memberLevelDTO));
    }
    
    /**
     * 更新会员等级状态
     */
    @PutMapping("/{id}/status")
    public Result<MemberLevelDTO> updateMemberLevelStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {
        return Result.success(memberLevelService.updateMemberLevelStatus(id, status));
    }
    
    /**
     * 删除会员等级
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteMemberLevel(@PathVariable Long id) {
        return Result.success(memberLevelService.deleteMemberLevel(id));
    }
    
    /**
     * 获取会员等级统计信息
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getMemberLevelStats() {
        return Result.success(memberLevelService.getMemberLevelStats());
    }
    
    /**
     * 根据积分获取会员等级
     */
    @GetMapping("/by-points")
    public Result<MemberLevelDTO> getMemberLevelByPoints(@RequestParam Integer points) {
        return Result.success(memberLevelService.getMemberLevelByPoints(points));
    }
} 