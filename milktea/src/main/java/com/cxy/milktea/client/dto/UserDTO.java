package com.cxy.milktea.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String phone;
    private String avatar;
    private Integer gender;
    private LocalDate birthday;
    private Integer totalPoints;
    private Integer memberLevel;
    private LocalDateTime createdAt;
} 