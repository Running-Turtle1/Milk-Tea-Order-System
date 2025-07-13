package com.cxy.milktea.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberLevelDTO {
    private Integer currentLevel;
    private String levelName;
    private Integer currentPoints;
    private Integer nextLevelPoints;
    private Integer pointsToNextLevel;
    private Double discount;
    private String benefits;
} 