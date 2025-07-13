package com.cxy.milktea.common.repository;

import com.cxy.milktea.common.entity.ShopInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 店铺信息Repository接口
 */
@Repository
public interface ShopInfoRepository extends JpaRepository<ShopInfo, Long> {
    
} 