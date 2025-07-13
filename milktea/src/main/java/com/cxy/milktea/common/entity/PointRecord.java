package com.cxy.milktea.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "point_record")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer point;

    // 类型：1消费获得，2使用积分，3活动获得，4每日签到，5积分过期
    @Column(nullable = false)
    private Integer type;

    // 关联订单ID
    private Long orderId;

    private String description;

    @CreationTimestamp
    private LocalDateTime createdAt;
} 