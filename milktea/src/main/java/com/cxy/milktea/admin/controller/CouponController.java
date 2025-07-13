package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.*;
import com.cxy.milktea.admin.service.CouponService;
import com.cxy.milktea.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 优惠券管理控制器
 */
@RestController
@RequestMapping("/admin/coupons")
@RequiredArgsConstructor
public class CouponController {
    
    private final CouponService couponService;
    
    /**
     * 分页查询优惠券列表
     */
    @GetMapping

    public ResponseEntity<ApiResponse<Page<CouponDTO>>> getCoupons(
            CouponQueryDTO queryDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<CouponDTO> coupons = couponService.getCoupons(queryDTO, page, size);
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }
    
    /**
     * 获取优惠券详情
     */
    @GetMapping("/{id}")

    public ResponseEntity<ApiResponse<CouponDTO>> getCoupon(@PathVariable Long id) {
        CouponDTO coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(ApiResponse.success(coupon));
    }
    
    /**
     * 创建优惠券
     */
    @PostMapping

    public ResponseEntity<ApiResponse<CouponDTO>> createCoupon(
            @Valid @RequestBody CouponUpdateDTO couponDTO) {
        
        CouponDTO createdCoupon = couponService.createCoupon(couponDTO);
        return ResponseEntity.ok(ApiResponse.success("优惠券创建成功", createdCoupon));
    }
    
    /**
     * 更新优惠券
     */
    @PutMapping("/{id}")

    public ResponseEntity<ApiResponse<CouponDTO>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponUpdateDTO couponDTO) {
        
        CouponDTO updatedCoupon = couponService.updateCoupon(id, couponDTO);
        return ResponseEntity.ok(ApiResponse.success("优惠券更新成功", updatedCoupon));
    }
    
    /**
     * 更新优惠券状态
     */
    @PutMapping("/{id}/status/{status}")

    public ResponseEntity<ApiResponse<CouponDTO>> updateCouponStatus(
            @PathVariable Long id,
            @PathVariable Integer status) {
        
        CouponDTO updatedCoupon = couponService.updateCouponStatus(id, status);
        String message = status == 1 ? "优惠券已启用" : "优惠券已禁用";
        return ResponseEntity.ok(ApiResponse.success(message, updatedCoupon));
    }
    
    /**
     * 删除优惠券
     */
    @DeleteMapping("/{id}")

    public ResponseEntity<ApiResponse<Boolean>> deleteCoupon(@PathVariable Long id) {
        boolean result = couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("优惠券删除成功", result));
    }
    
    /**
     * 获取优惠券统计数据
     */
    @GetMapping("/stats")

    public ResponseEntity<ApiResponse<Map<String, Object>>> getCouponStats() {
        Map<String, Object> stats = couponService.getCouponStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 分页查询用户优惠券列表
     */
    @GetMapping("/user-coupons")

    public ResponseEntity<ApiResponse<Page<UserCouponDTO>>> getUserCoupons(
            UserCouponQueryDTO queryDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<UserCouponDTO> userCoupons = couponService.getUserCoupons(queryDTO, page, size);
        return ResponseEntity.ok(ApiResponse.success(userCoupons));
    }
    
    /**
     * 获取用户优惠券详情
     */
    @GetMapping("/user-coupons/{id}")

    public ResponseEntity<ApiResponse<UserCouponDTO>> getUserCoupon(@PathVariable Long id) {
        UserCouponDTO userCoupon = couponService.getUserCouponById(id);
        return ResponseEntity.ok(ApiResponse.success(userCoupon));
    }
    
    /**
     * 向用户发放优惠券
     */
    @PostMapping("/issue")

    public ResponseEntity<ApiResponse<UserCouponDTO>> issueCouponToUser(
            @RequestParam Long userId,
            @RequestParam Long couponId) {
        
        UserCouponDTO userCoupon = couponService.issueCouponToUser(userId, couponId);
        return ResponseEntity.ok(ApiResponse.success("优惠券发放成功", userCoupon));
    }
    
    /**
     * 批量向用户发放优惠券
     */
    @PostMapping("/batch-issue")

    public ResponseEntity<ApiResponse<BatchIssueCouponResultDTO>> batchIssueCoupon(
            @RequestParam List<Long> userIds,
            @RequestParam Long couponId) {
        
        BatchIssueCouponResultDTO result = couponService.batchIssueCoupon(userIds, couponId);
        
        StringBuilder message = new StringBuilder();
        message.append("共选择").append(result.getTotalSelected()).append("个用户，");
        message.append("成功发放").append(result.getSuccessCount()).append("张优惠券");
        
        if (!result.getAlreadyReceived().isEmpty()) {
            message.append("，").append(result.getAlreadyReceived().size()).append("个用户已领取过");
        }
        
        if (!result.getFailedUsers().isEmpty()) {
            message.append("，").append(result.getFailedUsers().size()).append("个用户发放失败");
        }
        
        return ResponseEntity.ok(ApiResponse.success(message.toString(), result));
    }
} 