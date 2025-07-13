package com.cxy.milktea.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberLevelConfig {
    private final String name;
    private final Integer pointsRequired;
    private final Integer nextLevelPoints;
    private final Double discount;
    private final String benefits;
} 