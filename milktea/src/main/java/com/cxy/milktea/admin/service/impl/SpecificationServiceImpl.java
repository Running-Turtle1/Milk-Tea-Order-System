package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.SpecificationDTO;
import com.cxy.milktea.admin.service.SpecificationService;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.SpecificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 规格服务实现类
 */
@Service
@RequiredArgsConstructor
public class SpecificationServiceImpl implements SpecificationService {

    private final SpecificationRepository specificationRepository;

    @Override
    @Cacheable(value = "specifications", key = "'admin_all_' + #type", unless = "#result == null || #result.isEmpty()")
    public List<SpecificationDTO> getAllSpecifications(String type) {
        List<com.cxy.milktea.common.entity.Specification> specifications;
        
        if (StringUtils.hasText(type)) {
            specifications = specificationRepository.findByTypeOrderBySortAsc(type);
        } else {
            specifications = specificationRepository.findAll(Sort.by(Sort.Direction.ASC, "type", "sort"));
        }
        
        return specifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<SpecificationDTO> getSpecificationsByPage(Integer page, Integer size, String type) {
        org.springframework.data.jpa.domain.Specification<com.cxy.milktea.common.entity.Specification> spec = 
                (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // 根据类型筛选
            if (StringUtils.hasText(type)) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "type", "sort"));
        Page<com.cxy.milktea.common.entity.Specification> specificationPage = 
                specificationRepository.findAll(spec, pageable);
        
        return specificationPage.map(this::convertToDTO);
    }

    @Override
    public SpecificationDTO getSpecificationById(Long id) {
        com.cxy.milktea.common.entity.Specification specification = findSpecificationById(id);
        return convertToDTO(specification);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"specifications", "products"}, allEntries = true)
    public SpecificationDTO createSpecification(SpecificationDTO specificationDTO) {
        // 检查类型是否合法
        validateSpecificationType(specificationDTO.getType());
        
        com.cxy.milktea.common.entity.Specification specification = 
                com.cxy.milktea.common.entity.Specification.builder()
                .name(specificationDTO.getName())
                .type(specificationDTO.getType())
                .sort(specificationDTO.getSort() != null ? specificationDTO.getSort() : 0)
                .status(specificationDTO.getStatus() != null ? specificationDTO.getStatus() : 1)
                .build();
        
        com.cxy.milktea.common.entity.Specification savedSpecification = 
                specificationRepository.save(specification);
        
        return convertToDTO(savedSpecification);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"specifications", "products"}, allEntries = true)
    public SpecificationDTO updateSpecification(Long id, SpecificationDTO specificationDTO) {
        com.cxy.milktea.common.entity.Specification specification = findSpecificationById(id);
        
        // 检查类型是否合法
        validateSpecificationType(specificationDTO.getType());
        
        specification.setName(specificationDTO.getName());
        specification.setType(specificationDTO.getType());
        
        if (specificationDTO.getSort() != null) {
            specification.setSort(specificationDTO.getSort());
        }
        
        if (specificationDTO.getStatus() != null) {
            specification.setStatus(specificationDTO.getStatus());
        }
        
        com.cxy.milktea.common.entity.Specification updatedSpecification = 
                specificationRepository.save(specification);
        
        return convertToDTO(updatedSpecification);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"specifications", "products"}, allEntries = true)
    public SpecificationDTO updateSpecificationStatus(Long id, Integer status) {
        if (status != 0 && status != 1) {
            throw new BusinessException(400, "状态值无效，应为0或1");
        }
        
        com.cxy.milktea.common.entity.Specification specification = findSpecificationById(id);
        specification.setStatus(status);
        
        com.cxy.milktea.common.entity.Specification updatedSpecification = 
                specificationRepository.save(specification);
        
        return convertToDTO(updatedSpecification);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"specifications", "products"}, allEntries = true)
    public SpecificationDTO updateSpecificationSort(Long id, Integer sort) {
        com.cxy.milktea.common.entity.Specification specification = findSpecificationById(id);
        specification.setSort(sort);
        
        com.cxy.milktea.common.entity.Specification updatedSpecification = 
                specificationRepository.save(specification);
        
        return convertToDTO(updatedSpecification);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"specifications", "products"}, allEntries = true)
    public void deleteSpecification(Long id) {
        if (!specificationRepository.existsById(id)) {
            throw new BusinessException(404, "规格不存在");
        }
        specificationRepository.deleteById(id);
    }

    /**
     * 根据ID查找规格
     */
    private com.cxy.milktea.common.entity.Specification findSpecificationById(Long id) {
        return specificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "规格不存在"));
    }

    /**
     * 验证规格类型
     */
    private void validateSpecificationType(String type) {
        if (!"temperature".equals(type) && !"sweetness".equals(type)) {
            throw new BusinessException(400, "规格类型无效，只能是temperature或sweetness");
        }
    }

    /**
     * 转换为DTO
     */
    private SpecificationDTO convertToDTO(com.cxy.milktea.common.entity.Specification specification) {
        return SpecificationDTO.builder()
                .id(specification.getId())
                .name(specification.getName())
                .type(specification.getType())
                .sort(specification.getSort())
                .status(specification.getStatus())
                .createdAt(specification.getCreatedAt())
                .updatedAt(specification.getUpdatedAt())
                .build();
    }
} 