package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.SpecificationDTO;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 规格服务接口
 * 定义温度、糖度等规格管理的业务方法
 */
public interface SpecificationService {
    
    /**
     * 获取所有规格
     * @param type 规格类型，可选
     * @return 规格列表
     */
    List<SpecificationDTO> getAllSpecifications(String type);
    
    /**
     * 分页获取规格
     * @param page 页码
     * @param size 每页记录数
     * @param type 规格类型，可选
     * @return 规格分页数据
     */
    Page<SpecificationDTO> getSpecificationsByPage(Integer page, Integer size, String type);
    
    /**
     * 根据ID获取规格
     * @param id 规格ID
     * @return 规格信息
     */
    SpecificationDTO getSpecificationById(Long id);
    
    /**
     * 创建规格
     * @param specificationDTO 规格信息
     * @return 创建后的规格
     */
    SpecificationDTO createSpecification(SpecificationDTO specificationDTO);
    
    /**
     * 更新规格
     * @param id 规格ID
     * @param specificationDTO 规格信息
     * @return 更新后的规格
     */
    SpecificationDTO updateSpecification(Long id, SpecificationDTO specificationDTO);
    
    /**
     * 更新规格状态
     * @param id 规格ID
     * @param status 状态值
     * @return 更新后的规格
     */
    SpecificationDTO updateSpecificationStatus(Long id, Integer status);
    
    /**
     * 更新规格排序
     * @param id 规格ID
     * @param sort 排序值
     * @return 更新后的规格
     */
    SpecificationDTO updateSpecificationSort(Long id, Integer sort);
    
    /**
     * 删除规格
     * @param id 规格ID
     */
    void deleteSpecification(Long id);
} 