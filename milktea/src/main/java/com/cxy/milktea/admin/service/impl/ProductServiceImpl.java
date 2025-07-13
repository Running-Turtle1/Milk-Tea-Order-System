package com.cxy.milktea.admin.service.impl;

import com.cxy.milktea.admin.dto.ProductCreateDTO;
import com.cxy.milktea.admin.dto.ProductDTO;
import com.cxy.milktea.admin.dto.ProductUpdateDTO;
import com.cxy.milktea.admin.service.ProductService;
import com.cxy.milktea.common.entity.Category;
import com.cxy.milktea.common.entity.Product;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.CategoryRepository;
import com.cxy.milktea.common.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 商品服务实现类
 */
@Service("adminProductServiceImpl")
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Page<ProductDTO> getProductsByPage(Long categoryId, String keyword, Integer page, Integer size) {
        Specification<Product> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // 根据分类ID筛选
            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }
            
            // 根据关键词搜索名称
            if (StringUtils.hasText(keyword)) {
                predicates.add(criteriaBuilder.like(root.get("name"), "%" + keyword + "%"));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        // 排序：按照排序值降序，然后按ID降序
        Sort sort = Sort.by(Sort.Direction.DESC, "sort").and(Sort.by(Sort.Direction.DESC, "id"));
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> productPage = productRepository.findAll(spec, pageable);
        return productPage.map(this::convertToDTO);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = findProductById(id);
        return convertToDTO(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products"}, allEntries = true)
    public ProductDTO createProduct(ProductCreateDTO productCreateDTO) {
        // 验证分类是否存在
        Category category = categoryRepository.findById(productCreateDTO.getCategoryId())
                .orElseThrow(() -> new BusinessException(400, "所选分类不存在"));
        
        Product product = Product.builder()
                .category(category)
                .name(productCreateDTO.getName())
                .image(productCreateDTO.getImage())
                .description(productCreateDTO.getDescription())
                .price(productCreateDTO.getPrice())
                .stock(productCreateDTO.getStock())
                .isRecommend(productCreateDTO.getIsRecommend())
                .supportCustom(productCreateDTO.getSupportCustom())
                .sort(productCreateDTO.getSort())
                .status(productCreateDTO.getStatus())
                .sales(0) // 新商品销量初始为0
                .build();
        
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products"}, allEntries = true)
    public ProductDTO updateProduct(Long id, ProductUpdateDTO productUpdateDTO) {
        Product product = findProductById(id);
        
        // 验证分类是否存在
        Category category = categoryRepository.findById(productUpdateDTO.getCategoryId())
                .orElseThrow(() -> new BusinessException(400, "所选分类不存在"));
        
        product.setCategory(category);
        product.setName(productUpdateDTO.getName());
        
        if (productUpdateDTO.getImage() != null) {
            product.setImage(productUpdateDTO.getImage());
        }
        
        product.setDescription(productUpdateDTO.getDescription());
        product.setPrice(productUpdateDTO.getPrice());
        product.setStock(productUpdateDTO.getStock());
        
        if (productUpdateDTO.getIsRecommend() != null) {
            product.setIsRecommend(productUpdateDTO.getIsRecommend());
        }
        
        if (productUpdateDTO.getSupportCustom() != null) {
            product.setSupportCustom(productUpdateDTO.getSupportCustom());
        }
        
        if (productUpdateDTO.getSort() != null) {
            product.setSort(productUpdateDTO.getSort());
        }
        
        if (productUpdateDTO.getStatus() != null) {
            product.setStatus(productUpdateDTO.getStatus());
        }
        
        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products"}, allEntries = true)
    public ProductDTO updateProductStatus(Long id, Integer status) {
        if (status != 0 && status != 1) {
            throw new BusinessException(400, "状态值无效，应为0或1");
        }
        
        Product product = findProductById(id);
        product.setStatus(status);
        
        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products"}, allEntries = true)
    public ProductDTO updateProductRecommendStatus(Long id, Integer isRecommend) {
        if (isRecommend != 0 && isRecommend != 1) {
            throw new BusinessException(400, "推荐状态值无效，应为0或1");
        }
        
        Product product = findProductById(id);
        product.setIsRecommend(isRecommend);
        
        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products"}, allEntries = true)
    public ProductDTO updateProductSort(Long id, Integer sort) {
        Product product = findProductById(id);
        product.setSort(sort);
        
        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products"}, allEntries = true)
    public void deleteProduct(Long id) {
        // 验证商品是否存在
        if (!productRepository.existsById(id)) {
            throw new BusinessException(404, "商品不存在");
        }
        
        // 删除商品
        productRepository.deleteById(id);
    }

    @Override
    public List<ProductDTO> getProductSalesRanking(Integer limit) {
        // 创建排序：按销量降序
        Sort sort = Sort.by(Sort.Direction.DESC, "sales");
        
        // 查询上架商品（status=1）
        Specification<Product> spec = (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("status"), 1);
        
        // 限制返回记录数
        PageRequest pageRequest = PageRequest.of(0, limit, sort);
        
        // 执行查询
        List<Product> topSellingProducts = productRepository.findAll(spec, pageRequest).getContent();
        
        // 转换为DTO
        return topSellingProducts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    @CacheEvict(value = {"products"}, allEntries = true)
    public ProductDTO updateProductSales(Long id, Integer sales) {
        if (sales < 0) {
            throw new BusinessException(400, "销量不能为负数");
        }
        
        // 查找商品
        Product product = findProductById(id);
        
        // 更新销量
        product.setSales(sales);
        
        // 保存更新
        Product updatedProduct = productRepository.save(product);
        
        return convertToDTO(updatedProduct);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products"}, allEntries = true)
    public ProductDTO updateProductImage(Long id, String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            throw new BusinessException(400, "图片URL不能为空");
        }
        
        Product product = findProductById(id);
        product.setImage(imageUrl);
        
        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    /**
     * 根据ID查找商品
     */
    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "商品不存在"));
    }

    /**
     * 转换为DTO
     */
    private ProductDTO convertToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .name(product.getName())
                .image(product.getImage())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .sales(product.getSales())
                .isRecommend(product.getIsRecommend())
                .supportCustom(product.getSupportCustom())
                .sort(product.getSort())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
} 