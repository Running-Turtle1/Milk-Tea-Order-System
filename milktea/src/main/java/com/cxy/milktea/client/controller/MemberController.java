package com.cxy.milktea.client.controller;

import com.cxy.milktea.admin.dto.MemberLevelDTO;
import com.cxy.milktea.admin.dto.PointRuleDTO;
import com.cxy.milktea.admin.service.MemberLevelService;
import com.cxy.milktea.admin.service.PointRuleService;
import com.cxy.milktea.client.dto.CheckinRecordDTO;
import com.cxy.milktea.client.dto.CheckinResultDTO;
import com.cxy.milktea.client.dto.UserInfoDTO;
import com.cxy.milktea.client.service.UserService;
import com.cxy.milktea.common.entity.Checkin;
import com.cxy.milktea.common.entity.User;
import com.cxy.milktea.common.response.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 客户端会员控制器
 */
@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {
    
    private final MemberLevelService memberLevelService;
    private final PointRuleService pointRuleService;
    private final UserService userService;
    
    /**
     * 获取当前用户的会员信息
     */
    @GetMapping("/info")
    public Result<UserInfoDTO> getMemberInfo() {
        User currentUser = getCurrentUser();
        return Result.success(userService.getUserInfo(currentUser.getId()));
    }
    
    /**
     * 获取所有会员等级
     */
    @GetMapping("/levels")
    public Result<List<MemberLevelDTO>> getMemberLevels() {
        return Result.success(memberLevelService.getActiveMemberLevels());
    }
    
    /**
     * 获取当前用户的会员等级详情
     */
    @GetMapping("/my-level")
    public Result<Map<String, Object>> getMyLevelDetail() {
        User currentUser = getCurrentUser();
        
        // 获取用户当前等级
        Integer currentLevel = currentUser.getMemberLevel();
        MemberLevelDTO currentLevelInfo = memberLevelService.getMemberLevelByPoints(currentUser.getTotalPoints());
        
        // 获取用户下一个等级
        List<MemberLevelDTO> allLevels = memberLevelService.getActiveMemberLevels();
        MemberLevelDTO nextLevel = allLevels.stream()
                .filter(level -> level.getLevel() > currentLevel)
                .findFirst()
                .orElse(null);
        
        // 计算升级还需积分
        Integer pointsNeeded = 0;
        if (nextLevel != null) {
            pointsNeeded = nextLevel.getPointThreshold() - currentUser.getTotalPoints();
            if (pointsNeeded < 0) pointsNeeded = 0;
        }
        
        // 构建返回结果
        Map<String, Object> result = Map.of(
                "currentLevel", currentLevelInfo,
                "nextLevel", nextLevel,
                "pointsNeeded", pointsNeeded,
                "totalPoints", currentUser.getTotalPoints()
        );
        
        return Result.success(result);
    }
    
    /**
     * 获取积分规则
     */
    @GetMapping("/point-rules")
    public Result<List<PointRuleDTO>> getPointRules() {
        return Result.success(pointRuleService.getActivePointRules());
    }
    
    /**
     * 每日签到
     */
    @PostMapping("/checkin")
    @Transactional
    public Result<CheckinResultDTO> checkin() {
        User currentUser = getCurrentUser();
        
        // 检查今日是否已签到
        LocalDate today = LocalDate.now();
        if (userService.hasCheckedInToday(currentUser.getId())) {
            return Result.failed(400, "今日已签到");
        }
        
        // 执行签到
        Checkin checkin = userService.recordCheckin(currentUser.getId());
        
        // 获取最新的用户信息
        User updatedUser = userService.getCurrentUserEntity();
        
        // 构建返回结果
        CheckinResultDTO result = CheckinResultDTO.builder()
                .success(true)
                .date(today)
                .points(checkin.getPoints())
                .totalPoints(updatedUser.getTotalPoints())
                .consecutiveDays(checkin.getConsecutiveDays())
                .build();
        
        return Result.success("签到成功", result);
    }
    
    /**
     * 获取签到记录
     * @param year 年份，默认当前年
     * @param month 月份，默认当前月
     * @return 返回指定月份的签到记录
     */
    @GetMapping("/checkin/records")
    public Result<CheckinRecordDTO> getCheckinRecords(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        
        User currentUser = getCurrentUser();
        
        // 如果未指定年月，则使用当前年月
        LocalDate now = LocalDate.now();
        int targetYear = year != null ? year : now.getYear();
        int targetMonth = month != null ? month : now.getMonthValue();
        
        // 获取签到记录
        CheckinRecordDTO records = userService.getUserCheckinRecords(currentUser.getId(), targetYear, targetMonth);
        
        return Result.success(records);
    }
    
    /**
     * 获取当前登录用户
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("用户未登录");
        }
        return (User) authentication.getPrincipal();
    }
} 