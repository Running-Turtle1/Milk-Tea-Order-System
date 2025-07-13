package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.MemberLevelDTO;
import com.cxy.milktea.admin.dto.MemberLevelUpdateDTO;
import com.cxy.milktea.admin.service.MemberLevelService;
import com.cxy.milktea.common.entity.MemberLevel;
import com.cxy.milktea.common.entity.User;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.MemberLevelRepository;
import com.cxy.milktea.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 会员等级Service实现类
 */
@Service
@RequiredArgsConstructor
public class MemberLevelServiceImpl implements MemberLevelService {

    private final MemberLevelRepository memberLevelRepository;
    private final UserRepository userRepository;

    @Override
    public List<MemberLevelDTO> getAllMemberLevels() {
        List<MemberLevel> memberLevels = memberLevelRepository.findAll();
        return memberLevels.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MemberLevelDTO> getActiveMemberLevels() {
        List<MemberLevel> memberLevels = memberLevelRepository.findByStatusOrderByLevelAsc(1);
        return memberLevels.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MemberLevelDTO getMemberLevelById(Long id) {
        MemberLevel memberLevel = memberLevelRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "会员等级不存在"));
        return convertToDTO(memberLevel);
    }

    @Override
    @Transactional
    public MemberLevelDTO createMemberLevel(MemberLevelUpdateDTO memberLevelDTO) {
        // 校验等级值唯一性
        if (memberLevelRepository.existsByLevel(memberLevelDTO.getLevel())) {
            throw new BusinessException(400, "等级值已存在");
        }
        
        // 校验等级名称唯一性
        if (memberLevelRepository.existsByName(memberLevelDTO.getName())) {
            throw new BusinessException(400, "等级名称已存在");
        }

        MemberLevel memberLevel = new MemberLevel();
        updateMemberLevelFromDTO(memberLevel, memberLevelDTO);

        MemberLevel savedMemberLevel = memberLevelRepository.save(memberLevel);
        return convertToDTO(savedMemberLevel);
    }

    @Override
    @Transactional
    public MemberLevelDTO updateMemberLevel(Long id, MemberLevelUpdateDTO memberLevelDTO) {
        MemberLevel memberLevel = memberLevelRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "会员等级不存在"));

        // 校验等级值唯一性
        if (memberLevelRepository.existsByLevelAndIdNot(memberLevelDTO.getLevel(), id)) {
            throw new BusinessException(400, "等级值已存在");
        }
        
        // 校验等级名称唯一性
        if (memberLevelRepository.existsByNameAndIdNot(memberLevelDTO.getName(), id)) {
            throw new BusinessException(400, "等级名称已存在");
        }

        updateMemberLevelFromDTO(memberLevel, memberLevelDTO);

        MemberLevel updatedMemberLevel = memberLevelRepository.save(memberLevel);
        return convertToDTO(updatedMemberLevel);
    }

    @Override
    @Transactional
    public MemberLevelDTO updateMemberLevelStatus(Long id, Integer status) {
        if (status != 0 && status != 1) {
            throw new BusinessException(400, "状态值无效");
        }

        MemberLevel memberLevel = memberLevelRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "会员等级不存在"));

        memberLevel.setStatus(status);
        MemberLevel updatedMemberLevel = memberLevelRepository.save(memberLevel);
        return convertToDTO(updatedMemberLevel);
    }

    @Override
    @Transactional
    public boolean deleteMemberLevel(Long id) {
        MemberLevel memberLevel = memberLevelRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "会员等级不存在"));

        // 检查是否有用户使用该等级
        long userCount = userRepository.countByMemberLevel(memberLevel.getLevel());
        if (userCount > 0) {
            throw new BusinessException(400, "该等级下有用户，无法删除");
        }

        memberLevelRepository.delete(memberLevel);
        return true;
    }

    @Override
    public Map<String, Object> getMemberLevelStats() {
        List<MemberLevel> allLevels = memberLevelRepository.findAll();
        long activeLevels = allLevels.stream().filter(level -> level.getStatus() == 1).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLevels", allLevels.size());
        stats.put("activeLevels", activeLevels);

        // 计算每个等级的会员人数
        List<Object[]> levelCounts = userRepository.countUsersByMemberLevel();
        Map<Integer, Long> levelCountMap = new HashMap<>();
        
        for (Object[] result : levelCounts) {
            Integer level = (Integer) result[0];
            Long count = (Long) result[1];
            levelCountMap.put(level, count);
        }
        
        stats.put("levelCounts", levelCountMap);

        return stats;
    }

    @Override
    public MemberLevelDTO getMemberLevelByPoints(Integer points) {
        MemberLevel memberLevel = memberLevelRepository.findLevelByPoints(points)
                .orElseGet(() -> memberLevelRepository.findByLevel(0)
                        .orElseThrow(() -> new BusinessException(500, "系统错误：未找到默认会员等级")));
        
        return convertToDTO(memberLevel);
    }

    /**
     * 将会员等级实体转换为DTO
     */
    private MemberLevelDTO convertToDTO(MemberLevel memberLevel) {
        // 统计该等级会员人数
        long memberCount = userRepository.countByMemberLevel(memberLevel.getLevel());
        
        return MemberLevelDTO.builder()
                .id(memberLevel.getId())
                .level(memberLevel.getLevel())
                .name(memberLevel.getName())
                .icon(memberLevel.getIcon())
                .pointThreshold(memberLevel.getPointThreshold())
                .amountThreshold(memberLevel.getAmountThreshold())
                .pointRate(memberLevel.getPointRate())
                .discount(memberLevel.getDiscount())
                .freeShipping(memberLevel.getFreeShipping())
                .birthdayPrivilege(memberLevel.getBirthdayPrivilege())
                .priorityProduction(memberLevel.getPriorityProduction())
                .description(memberLevel.getDescription())
                .status(memberLevel.getStatus())
                .statusText(memberLevel.getStatus() == 1 ? "启用" : "禁用")
                .memberCount((int) memberCount)
                .createdAt(memberLevel.getCreatedAt())
                .updatedAt(memberLevel.getUpdatedAt())
                .build();
    }

    /**
     * 根据DTO更新会员等级实体
     */
    private void updateMemberLevelFromDTO(MemberLevel memberLevel, MemberLevelUpdateDTO dto) {
        memberLevel.setLevel(dto.getLevel());
        memberLevel.setName(dto.getName());
        memberLevel.setIcon(dto.getIcon());
        memberLevel.setPointThreshold(dto.getPointThreshold());
        memberLevel.setAmountThreshold(dto.getAmountThreshold());
        memberLevel.setPointRate(dto.getPointRate());
        memberLevel.setDiscount(dto.getDiscount());
        memberLevel.setFreeShipping(dto.getFreeShipping());
        memberLevel.setBirthdayPrivilege(dto.getBirthdayPrivilege());
        memberLevel.setPriorityProduction(dto.getPriorityProduction());
        memberLevel.setDescription(dto.getDescription());
        memberLevel.setStatus(dto.getStatus());
    }
} 