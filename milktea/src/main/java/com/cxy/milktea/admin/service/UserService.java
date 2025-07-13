package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.*;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.Map;

/**
 * 管理端会员管理服务接口
 */
public interface UserService {
    
    /**
     * 分页查询会员列表
     *
     * @param queryDTO 查询条件
     * @param page 页码
     * @param size 每页记录数
     * @return 分页会员列表
     */
    Page<UserDTO> getUsers(UserQueryDTO queryDTO, int page, int size);
    
    /**
     * 根据ID获取会员详情
     *
     * @param id 会员ID
     * @return 会员详情
     */
    UserDTO getUserById(Long id);
    
    /**
     * 禁用/启用会员
     *
     * @param id 会员ID
     * @param status 状态：0禁用，1启用
     * @return 更新后的会员信息
     */
    UserDTO updateUserStatus(Long id, Integer status);
    
    /**
     * 调整会员积分
     *
     * @param pointAdjustDTO 积分调整信息
     * @return 调整后的会员信息
     */
    UserDTO adjustUserPoints(PointAdjustDTO pointAdjustDTO);
    
    /**
     * 分页查询会员积分记录
     *
     * @param userId 会员ID
     * @param type 积分类型
     * @param page 页码
     * @param size 每页记录数
     * @return 分页积分记录
     */
    Page<PointRecordDTO> getUserPointRecords(Long userId, Integer type, int page, int size);
    
    /**
     * 获取会员统计信息
     *
     * @return 统计信息，包含总会员数、各等级会员数、今日新增会员数等
     */
    Map<String, Object> getUserStats();
    
    /**
     * 获取指定日期范围内的会员统计信息
     *
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 包含日期范围内会员统计数据的Map
     */
    Map<String, Object> getUserStatsByDateRange(LocalDate startDate, LocalDate endDate);
} 