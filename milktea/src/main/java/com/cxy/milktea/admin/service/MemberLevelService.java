package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.MemberLevelDTO;
import com.cxy.milktea.admin.dto.MemberLevelUpdateDTO;

import java.util.List;
import java.util.Map;

/**
 * 会员等级Service接口
 */
public interface MemberLevelService {
    
    /**
     * 获取所有会员等级
     *
     * @return 会员等级列表
     */
    List<MemberLevelDTO> getAllMemberLevels();
    
    /**
     * 获取所有启用的会员等级
     *
     * @return 会员等级列表
     */
    List<MemberLevelDTO> getActiveMemberLevels();
    
    /**
     * 根据ID获取会员等级
     *
     * @param id 会员等级ID
     * @return 会员等级
     */
    MemberLevelDTO getMemberLevelById(Long id);
    
    /**
     * 创建会员等级
     *
     * @param memberLevelDTO 会员等级DTO
     * @return 创建后的会员等级
     */
    MemberLevelDTO createMemberLevel(MemberLevelUpdateDTO memberLevelDTO);
    
    /**
     * 更新会员等级
     *
     * @param id 会员等级ID
     * @param memberLevelDTO 会员等级DTO
     * @return 更新后的会员等级
     */
    MemberLevelDTO updateMemberLevel(Long id, MemberLevelUpdateDTO memberLevelDTO);
    
    /**
     * 更新会员等级状态
     *
     * @param id 会员等级ID
     * @param status 状态
     * @return 更新后的会员等级
     */
    MemberLevelDTO updateMemberLevelStatus(Long id, Integer status);
    
    /**
     * 删除会员等级
     *
     * @param id 会员等级ID
     * @return 是否删除成功
     */
    boolean deleteMemberLevel(Long id);
    
    /**
     * 获取会员等级统计信息
     *
     * @return 统计信息
     */
    Map<String, Object> getMemberLevelStats();
    
    /**
     * 根据积分获取会员等级
     *
     * @param points 积分
     * @return 会员等级
     */
    MemberLevelDTO getMemberLevelByPoints(Integer points);
} 