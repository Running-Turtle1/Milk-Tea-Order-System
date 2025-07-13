package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.MemberLevelDTO;
import com.cxy.milktea.admin.service.MemberLevelService;
import com.cxy.milktea.admin.service.UserManagementService;
import com.cxy.milktea.common.entity.User;
import com.cxy.milktea.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserManagementServiceImpl implements UserManagementService {

    private final UserRepository userRepository;
    private final MemberLevelService memberLevelService;

    /**
     * 批量更新所有用户的会员等级，使其与数据库会员等级规则一致
     * @return 更新的用户数量
     */
    @Override
    @Transactional
    public int syncAllUserMemberLevels() {
        log.info("开始同步所有用户的会员等级");
        
        // 获取所有会员等级，用于查询名称
        List<MemberLevelDTO> allLevels = memberLevelService.getAllMemberLevels();
        
        // 获取所有用户
        List<User> allUsers = userRepository.findAll();
        int updatedCount = 0;
        
        for (User user : allUsers) {
            Integer totalPoints = user.getTotalPoints();
            Integer currentLevel = user.getMemberLevel();
            
            // 根据积分和数据库会员等级规则获取正确的会员等级
            MemberLevelDTO memberLevelDTO = memberLevelService.getMemberLevelByPoints(totalPoints);
            Integer correctLevel = memberLevelDTO.getLevel();
            
            // 如果当前等级不正确，则更新
            if (!correctLevel.equals(currentLevel)) {
                // 获取当前等级名称
                String currentLevelName = getCurrentLevelName(allLevels, currentLevel);
                
                user.setMemberLevel(correctLevel);
                userRepository.save(user);
                updatedCount++;
                log.info("更新用户 [{}] 的会员等级: {} ({}) -> {} ({}), 积分: {}", 
                         user.getUsername(), 
                         currentLevel, currentLevelName,
                         correctLevel, memberLevelDTO.getName(),
                         totalPoints);
            }
        }
        
        log.info("会员等级同步完成，共更新了 {} 个用户", updatedCount);
        return updatedCount;
    }
    
    /**
     * 根据等级值获取等级名称
     * @param allLevels 所有会员等级
     * @param level 等级值
     * @return 等级名称
     */
    private String getCurrentLevelName(List<MemberLevelDTO> allLevels, Integer level) {
        return allLevels.stream()
                .filter(l -> l.getLevel().equals(level))
                .map(MemberLevelDTO::getName)
                .findFirst()
                .orElse("未知等级");
    }
} 