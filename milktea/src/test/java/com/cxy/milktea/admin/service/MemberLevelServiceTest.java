package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.MemberLevelDTO;
import com.cxy.milktea.admin.service.impl.MemberLevelServiceImpl;
import com.cxy.milktea.common.entity.MemberLevel;
import com.cxy.milktea.common.repository.MemberLevelRepository;
import com.cxy.milktea.common.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class MemberLevelServiceTest {

    @Mock
    private MemberLevelRepository memberLevelRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MemberLevelServiceImpl memberLevelService;

    private MemberLevel bronzeLevel;
    private MemberLevel silverLevel;
    private MemberLevel goldLevel;

    @BeforeEach
    public void setup() {
        // 初始化会员等级数据
        bronzeLevel = MemberLevel.builder()
                .id(1L)
                .level(1)
                .name("铜卡会员")
                .pointThreshold(100)
                .discount(BigDecimal.valueOf(0.95))
                .status(1)
                .build();

        silverLevel = MemberLevel.builder()
                .id(2L)
                .level(2)
                .name("银卡会员")
                .pointThreshold(1000)
                .discount(BigDecimal.valueOf(0.9))
                .status(1)
                .build();

        goldLevel = MemberLevel.builder()
                .id(3L)
                .level(3)
                .name("金卡会员")
                .pointThreshold(2000)
                .discount(BigDecimal.valueOf(0.85))
                .status(1)
                .build();
    }

    @Test
    public void testGetMemberLevelByPoints_BronzeLevel() {
        // 积分为500，应该返回铜卡会员
        when(memberLevelRepository.findLevelByPoints(500)).thenReturn(Optional.of(bronzeLevel));

        MemberLevelDTO result = memberLevelService.getMemberLevelByPoints(500);

        assertEquals(1, result.getLevel());
        assertEquals("铜卡会员", result.getName());
    }

    @Test
    public void testGetMemberLevelByPoints_SilverLevel() {
        // 积分为1200，应该返回银卡会员
        when(memberLevelRepository.findLevelByPoints(1200)).thenReturn(Optional.of(silverLevel));

        MemberLevelDTO result = memberLevelService.getMemberLevelByPoints(1200);

        assertEquals(2, result.getLevel());
        assertEquals("银卡会员", result.getName());
    }

    @Test
    public void testGetMemberLevelByPoints_GoldLevel() {
        // 积分为3000，应该返回金卡会员
        when(memberLevelRepository.findLevelByPoints(3000)).thenReturn(Optional.of(goldLevel));

        MemberLevelDTO result = memberLevelService.getMemberLevelByPoints(3000);

        assertEquals(3, result.getLevel());
        assertEquals("金卡会员", result.getName());
    }

    @Test
    public void testGetMemberLevelByPoints_EdgeCase() {
        // 积分刚好为1000，应该返回银卡会员
        when(memberLevelRepository.findLevelByPoints(1000)).thenReturn(Optional.of(silverLevel));

        MemberLevelDTO result = memberLevelService.getMemberLevelByPoints(1000);

        assertEquals(2, result.getLevel());
        assertEquals("银卡会员", result.getName());
    }
} 