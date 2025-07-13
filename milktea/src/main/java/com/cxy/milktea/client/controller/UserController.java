package com.cxy.milktea.client.controller;


import com.cxy.milktea.client.dto.*;
import com.cxy.milktea.client.service.UserService;
import com.cxy.milktea.common.response.JwtResponse;
import com.cxy.milktea.common.util.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * 用户控制器
 * 处理与用户相关的HTTP请求，包括用户注册、登录、个人信息管理、积分管理和优惠券操作等
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    /**
     * 用户服务，用于处理用户相关的业务逻辑
     */
    private final UserService userService;

    /**
     * 用户注册
     * 处理新用户的注册请求
     * 
     * @param request 包含用户名、密码、手机号等注册信息的请求对象
     * @return 返回注册成功的用户信息
     */
    @PostMapping("/register")
    public Result<UserDTO> register(@Valid @RequestBody RegisterRequest request) {
        UserDTO userDTO = userService.register(request);
        return Result.success("注册成功", userDTO);
    }

    /**
     * 用户登录
     * 验证用户身份并生成JWT令牌
     * 
     * @param request 包含用户名/手机号和密码的登录请求
     * @return 返回包含JWT令牌的响应对象
     */
    @PostMapping("/login")
    public Result<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse jwtResponse = userService.login(request);
        return Result.success("登录成功", jwtResponse);
    }

    /**
     * 获取当前用户信息
     * 获取已登录用户的个人资料
     * 
     * @return 返回当前登录用户的详细信息
     */
    @GetMapping("/profile")
    public Result<UserDTO> getCurrentUser() {
        UserDTO userDTO = userService.getCurrentUser();
        return Result.success(userDTO);
    }

    /**
     * 更新用户信息
     * 更新当前用户的个人资料
     * 
     * @param request 包含需要更新的用户信息的请求对象
     * @return 返回更新后的用户信息
     */
    @PutMapping("/profile")
    public Result<UserDTO> updateUserInfo(@Valid @RequestBody UpdateUserRequest request) {
        UserDTO userDTO = userService.updateUserInfo(request);
        return Result.success("更新成功", userDTO);
    }

    /**
     * 修改密码
     * 更新当前登录用户的密码
     * 
     * @param request 包含旧密码和新密码的请求对象
     * @return 返回操作结果
     */
    @PutMapping("/change-password")
    public Result<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return Result.success("密码修改成功");
    }

    /**
     * 获取用户积分
     * 查询当前用户的积分余额
     * 
     * @return 返回用户当前的积分数量
     */
    @GetMapping("/points")
    public Result<Integer> getUserPoints() {
        Integer points = userService.getUserPoints();
        return Result.success(points);
    }
    
    /**
     * 获取会员等级信息
     * 查询当前用户的会员等级和相关特权信息
     * 
     * @return 返回用户的会员等级详细信息
     */
    @GetMapping("/member-level")
    public Result<MemberLevelDTO> getMemberLevelInfo() {
        MemberLevelDTO levelInfo = userService.getMemberLevelInfo();
        return Result.success(levelInfo);
    }
    
    /**
     * 获取用户积分记录
     * 分页查询用户的积分获取和消费记录
     * 
     * @param type 积分记录类型（收入/支出），可选参数
     * @param page 页码，默认为0
     * @param size 每页记录数，默认为10
     * @return 返回分页的积分记录列表
     */
    @GetMapping("/point-records")
    public Result<Page<PointRecordDTO>> getPointRecords(
            @RequestParam(required = false) Integer type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PointRecordDTO> records = userService.getPointRecords(type, page, size);
        return Result.success(records);
    }
    
    /**
     * 获取用户优惠券
     * 分页查询用户拥有的优惠券
     * 
     * @param status 优惠券状态（未使用/已使用/已过期），可选参数
     * @param page 页码，默认为0
     * @param size 每页记录数，默认为10
     * @return 返回分页的用户优惠券列表
     */
    @GetMapping("/coupons")
    public Result<Page<UserCouponDTO>> getUserCoupons(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<UserCouponDTO> coupons = userService.getUserCoupons(status, page, size);
        return Result.success(coupons);
    }
    
    /**
     * 获取用户可用优惠券（按消费金额）
     * 根据消费金额查询用户可以使用的优惠券
     * 
     * @param amount 订单消费金额
     * @return 返回可用于当前消费金额的优惠券列表
     */
    @GetMapping("/available-coupons")
    public Result<List<UserCouponDTO>> getAvailableCoupons(@RequestParam BigDecimal amount) {
        List<UserCouponDTO> coupons = userService.getAvailableCoupons(amount);
        return Result.success(coupons);
    }
    
    /**
     * 获取可领取的优惠券列表
     * 查询系统中可供当前用户领取的优惠券
     * 
     * @return 返回当前可领取的优惠券列表
     */
    @GetMapping("/receivable-coupons")
    public Result<List<CouponDTO>> getReceivableCoupons() {
        List<CouponDTO> coupons = userService.getReceivableCoupons();
        return Result.success(coupons);
    }
    
    /**
     * 领取优惠券
     * 用户领取系统发放的优惠券
     * 
     * @param couponId 要领取的优惠券ID
     * @return 返回领取成功的优惠券信息
     */
    @PostMapping("/receive-coupon/{couponId}")
    public Result<UserCouponDTO> receiveCoupon(@PathVariable Long couponId) {
        UserCouponDTO coupon = userService.receiveCoupon(couponId);
        return Result.success("领取成功", coupon);
    }
} 