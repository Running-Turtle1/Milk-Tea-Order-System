package com.cxy.milktea.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 签到记录实体类
 */
@Entity
@Table(name = "checkin")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Checkin {
    
    /**
     * 签到ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 用户
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    /**
     * 签到日期
     */
    @Column(nullable = false)
    private LocalDate checkinDate;
    
    /**
     * 获得的积分
     */
    private Integer points;
    
    /**
     * 签到时间
     */
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 连续签到天数
     */
    private Integer consecutiveDays;
} 