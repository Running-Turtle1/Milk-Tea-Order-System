package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.Checkin;
import com.cxy.milktea.common.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 签到记录Repository接口
 */
@Repository
public interface CheckinRepository extends JpaRepository<Checkin, Long> {
    
    /**
     * 根据用户和日期查询签到记录
     * @param user 用户
     * @param date 日期
     * @return 签到记录
     */
    Optional<Checkin> findByUserAndCheckinDate(User user, LocalDate date);
    
    /**
     * 查询用户在指定日期之后的签到记录
     * @param user 用户
     * @param date 起始日期
     * @return 签到记录列表
     */
    List<Checkin> findByUserAndCheckinDateAfterOrderByCheckinDateAsc(User user, LocalDate date);
    
    /**
     * 查询用户最近的签到记录
     * @param user 用户
     * @param pageable 分页参数
     * @return 签到记录分页
     */
    Page<Checkin> findByUserOrderByCheckinDateDesc(User user, Pageable pageable);
    
    /**
     * 统计用户在指定日期范围内的签到次数
     * @param user 用户
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 签到次数
     */
    long countByUserAndCheckinDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    /**
     * 查询用户最近一次签到记录
     * @param user 用户
     * @return 签到记录
     */
    Optional<Checkin> findFirstByUserOrderByCheckinDateDesc(User user);
    
    /**
     * 统计今日签到人数
     * @param date 日期
     * @return 签到人数
     */
    long countByCheckinDate(LocalDate date);
    
    /**
     * 查询指定日期的签到用户ID列表
     * @param date 日期
     * @return 用户ID列表
     */
    @Query("SELECT c.user.id FROM Checkin c WHERE c.checkinDate = :date")
    List<Long> findUserIdsByCheckinDate(@Param("date") LocalDate date);
    
    /**
     * 查询用户在指定日期范围内的签到记录
     * @param user 用户
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 签到记录列表
     */
    List<Checkin> findByUserAndCheckinDateBetween(User user, LocalDate startDate, LocalDate endDate);
} 