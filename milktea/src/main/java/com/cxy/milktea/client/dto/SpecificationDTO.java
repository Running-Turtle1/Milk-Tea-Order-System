package com.cxy.milktea.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecificationDTO {
    private Long id;
    private String name;
    private String type;
    private Integer sort;
} 