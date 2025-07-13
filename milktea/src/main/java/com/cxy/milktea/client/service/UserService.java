package com.cxy.milktea.client.service;

import com.cxy.milktea.client.dto.*;
import com.cxy.milktea.common.response.JwtResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

import com.cxy.milktea.common.entity.Checkin;
import com.cxy.milktea.common.entity.User;

public interface UserService {

    /**
     * 用户注册
     */
    UserDTO register(RegisterRequest request);

    /**
     * 用户登录
     */
    JwtResponse login(LoginRequest request);

    /**
     * 获取当前用户信息
     */
    UserDTO getCurrentUser();

    /**
     * 更新用户信息
     */
    UserDTO updateUserInfo(UpdateUserRequest request);

    /**
     * 修改密码
     */
    void changePassword(ChangePasswordRequest request);

    /**
     * 获取用户积分
     */
    Integer getUserPoints();
    
    /**
     * 获取会员等级信息
     */
    MemberLevelDTO getMemberLevelInfo();
    
    /**
     * 获取用户积分记录
     */
    Page<PointRecordDTO> getPointRecords(Integer type, int page, int size);
    
    /**
     * 获取用户优惠券
     */
    Page<UserCouponDTO> getUserCoupons(Integer status, int page, int size);
    
    /**
     * 获取用户可用优惠券（按消费金额）
     */
    List<UserCouponDTO> getAvailableCoupons(BigDecimal amount);
    
    /**
     * 领取优惠券
     */
    UserCouponDTO receiveCoupon(Long couponId);
    
    /**
     * 获取可领取的优惠券列表
     * 查询系统中可供当前用户领取的优惠券
     */
    List<CouponDTO> getReceivableCoupons();
    
    /**
     * 增加用户积分
     * @param userId 用户ID
     * @param points 积分数量
     * @param type 积分类型
     * @param orderId 关联订单ID
     * @param description 描述
     * @return 更新后的总积分
     */
    Integer addUserPoints(Long userId, Integer points, Integer type, Long orderId, String description);
    
    /**
     * 使用优惠券
     * @param userCouponId 用户优惠券ID
     * @param orderId 订单ID
     * @return 是否成功
     */
    boolean useUserCoupon(Long userCouponId, Long orderId);
    
    /**
     * 检查并更新会员等级
     * @param userId 用户ID
     * @return 更新后的会员等级
     */
    Integer updateMemberLevel(Long userId);

    /**
     * 获取用户会员信息
     *
     * @param userId 用户ID
     * @return 用户信息DTO
     */
    UserInfoDTO getUserInfo(Long userId);

    /**
     * 检查用户今日是否已签到
     *
     * @param userId 用户ID
     * @return 是否已签到
     */
    boolean hasCheckedInToday(Long userId);

    /**
     * 记录用户签到
     *
     * @param userId 用户ID
     * @return 签到记录
     */
    Checkin recordCheckin(Long userId);

    /**
     * 获取用户签到记录
     *
     * @param userId 用户ID
     * @param year 年份
     * @param month 月份
     * @return 签到记录DTO
     */
    CheckinRecordDTO getUserCheckinRecords(Long userId, int year, int month);

    /**
     * 获取当前登录用户实体
     * @return 用户实体
     */
    User getCurrentUserEntity();

    /**
     * 更新签到记录
     * @param checkin 签到记录
     * @return 更新后的签到记录
     */
    Checkin updateCheckin(Checkin checkin);

    /**
     * 获取用户连续签到天数
     * @param userId 用户ID
     * @return 连续签到天数
     */
    Integer getConsecutiveDays(Long userId);
} 