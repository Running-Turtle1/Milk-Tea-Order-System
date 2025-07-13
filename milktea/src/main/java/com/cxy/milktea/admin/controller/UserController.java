package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.PointAdjustDTO;
import com.cxy.milktea.admin.dto.PointRecordDTO;
import com.cxy.milktea.admin.dto.UserDTO;
import com.cxy.milktea.admin.dto.UserQueryDTO;
import com.cxy.milktea.admin.service.UserService;
import com.cxy.milktea.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.Map;

/**
 * 管理端会员管理控制器
 */
@RestController("adminUserController")
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    /**
     * 获取会员列表
     */
    @GetMapping

    public ResponseEntity<ApiResponse<Page<UserDTO>>> getUsers(
            UserQueryDTO queryDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<UserDTO> users = userService.getUsers(queryDTO, page, size);
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    /**
     * 获取会员详情
     */
    @GetMapping("/{id}")

    public ResponseEntity<ApiResponse<UserDTO>> getUser(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    /**
     * 更新会员状态(启用/禁用)
     */
    @PutMapping("/{id}/status/{status}")

    public ResponseEntity<ApiResponse<UserDTO>> updateUserStatus(
            @PathVariable Long id,
            @PathVariable Integer status) {
        
        UserDTO user = userService.updateUserStatus(id, status);
        String message = "会员状态已更新为" + (status == 1 ? "启用" : "禁用");
        return ResponseEntity.ok(ApiResponse.success(message, user));
    }
    
    /**
     * 调整会员积分
     */
    @PostMapping("/points/adjust")

    public ResponseEntity<ApiResponse<UserDTO>> adjustUserPoints(
            @Valid @RequestBody PointAdjustDTO pointAdjustDTO) {
        
        UserDTO user = userService.adjustUserPoints(pointAdjustDTO);
        String message = "会员积分已" + (pointAdjustDTO.getPoint() > 0 ? "增加" : "减少") 
                + Math.abs(pointAdjustDTO.getPoint()) + "点";
        return ResponseEntity.ok(ApiResponse.success(message, user));
    }
    
    /**
     * 获取会员积分记录
     */
    @GetMapping("/{id}/points")

    public ResponseEntity<ApiResponse<Page<PointRecordDTO>>> getUserPointRecords(
            @PathVariable Long id,
            @RequestParam(required = false) Integer type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<PointRecordDTO> records = userService.getUserPointRecords(id, type, page, size);
        return ResponseEntity.ok(ApiResponse.success(records));
    }
    
    /**
     * 获取所有积分记录
     */
    @GetMapping("/points")

    public ResponseEntity<ApiResponse<Page<PointRecordDTO>>> getAllPointRecords(
            @RequestParam(required = false) Integer type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<PointRecordDTO> records = userService.getUserPointRecords(null, type, page, size);
        return ResponseEntity.ok(ApiResponse.success(records));
    }
    
    /**
     * 获取会员统计信息
     */
    @GetMapping("/stats")

    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats() {
        Map<String, Object> stats = userService.getUserStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 获取指定日期范围内的会员统计信息
     * 
     * @param startDate 开始日期（可选，默认为30天前）
     * @param endDate 结束日期（可选，默认为今天）
     * @return 包含日期范围内会员统计信息的响应
     */
    @GetMapping("/date-range-stats")

    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStatsByDateRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> stats = userService.getUserStatsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
} 