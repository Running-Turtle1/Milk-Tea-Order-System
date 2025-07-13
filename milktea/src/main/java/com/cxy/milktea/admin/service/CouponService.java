package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

/**
 * 优惠券管理服务接口
 */
public interface CouponService {
    
    /**
     * 分页查询优惠券列表
     *
     * @param queryDTO 查询条件
     * @param page 页码
     * @param size 每页大小
     * @return 优惠券分页数据
     */
    Page<CouponDTO> getCoupons(CouponQueryDTO queryDTO, int page, int size);
    
    /**
     * 根据ID获取优惠券
     *
     * @param id 优惠券ID
     * @return 优惠券信息
     */
    CouponDTO getCouponById(Long id);
    
    /**
     * 创建优惠券
     *
     * @param couponDTO 优惠券信息
     * @return 创建后的优惠券
     */
    CouponDTO createCoupon(CouponUpdateDTO couponDTO);
    
    /**
     * 更新优惠券
     *
     * @param id 优惠券ID
     * @param couponDTO 优惠券信息
     * @return 更新后的优惠券
     */
    CouponDTO updateCoupon(Long id, CouponUpdateDTO couponDTO);
    
    /**
     * 更新优惠券状态
     *
     * @param id 优惠券ID
     * @param status 状态：0禁用，1启用
     * @return 更新后的优惠券
     */
    CouponDTO updateCouponStatus(Long id, Integer status);
    
    /**
     * 删除优惠券
     *
     * @param id 优惠券ID
     * @return 是否删除成功
     */
    boolean deleteCoupon(Long id);
    
    /**
     * 获取不同类型的优惠券统计
     *
     * @return 优惠券统计信息
     */
    Map<String, Object> getCouponStats();
    
    /**
     * 分页查询用户优惠券列表
     *
     * @param queryDTO 查询条件
     * @param page 页码
     * @param size 每页大小
     * @return 用户优惠券分页数据
     */
    Page<UserCouponDTO> getUserCoupons(UserCouponQueryDTO queryDTO, int page, int size);
    
    /**
     * 根据ID获取用户优惠券
     *
     * @param id 用户优惠券ID
     * @return 用户优惠券信息
     */
    UserCouponDTO getUserCouponById(Long id);
    
    /**
     * 向用户发放优惠券
     *
     * @param userId 用户ID
     * @param couponId 优惠券ID
     * @return 发放结果
     */
    UserCouponDTO issueCouponToUser(Long userId, Long couponId);
    
    /**
     * 批量向用户发放优惠券
     *
     * @param userIds 用户ID列表
     * @param couponId 优惠券ID
     * @return 批量发放结果，包含成功数量和已领取用户列表
     */
    BatchIssueCouponResultDTO batchIssueCoupon(List<Long> userIds, Long couponId);
} 