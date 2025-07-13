package com.cxy.milktea.client.service.impl;

import com.cxy.milktea.client.dto.*;
import com.cxy.milktea.client.service.ProductService;
import com.cxy.milktea.common.entity.Category;
import com.cxy.milktea.common.entity.Ingredient;
import com.cxy.milktea.common.entity.Product;
import com.cxy.milktea.common.entity.Specification;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.CategoryRepository;
import com.cxy.milktea.common.repository.IngredientRepository;
import com.cxy.milktea.common.repository.ProductRepository;
import com.cxy.milktea.common.repository.SpecificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service("clientProductServiceImpl")
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final SpecificationRepository specificationRepository;
    private final IngredientRepository ingredientRepository;

    // 状态常量
    private static final Integer STATUS_ENABLED = 1;

    @Override
    @Cacheable(value = "categories", key = "'all'", unless = "#result == null || #result.isEmpty()")
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findByStatusOrderBySortAsc(STATUS_ENABLED);
        return categories.stream()
                .map(this::convertToCategoryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "ingredients", key = "'all'", unless = "#result == null || #result.isEmpty()")
    public List<IngredientDTO> getAllIngredients() {
        List<Ingredient> ingredients = ingredientRepository.findByStatusOrderBySortAsc(STATUS_ENABLED);
        return ingredients.stream()
                .map(this::convertToIngredientDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "products", key = "'recommend'", unless = "#result == null || #result.isEmpty()")
    public List<ProductDTO> getRecommendProducts() {
        List<Product> products = productRepository.findByIsRecommendAndStatusOrderBySalesDesc(1, STATUS_ENABLED);
        return products.stream()
                .map(this::convertToProductDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "products", key = "'category_' + #categoryId + '_page_' + #pageable.pageNumber", unless = "#result == null || #result.content.isEmpty()")
    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        Page<Product> productPage = productRepository.findByCategoryIdAndStatus(categoryId, STATUS_ENABLED, pageable);
        return productPage.map(this::convertToProductDTO);
    }

    @Override
    @Cacheable(value = "products", key = "'detail_' + #productId", unless = "#result == null")
    public ProductDetailDTO getProductDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(404, "商品不存在"));
        
        if (product.getStatus() != STATUS_ENABLED) {
            throw new BusinessException(400, "商品已下架");
        }
        
        ProductDetailDTO productDetailDTO = convertToProductDetailDTO(product);
        
        // 获取温度规格选项
        List<Specification> temperatures = specificationRepository.findByTypeAndStatusOrderBySortAsc("temperature", STATUS_ENABLED);
        productDetailDTO.setTemperatures(temperatures.stream()
                .map(this::convertToSpecificationDTO)
                .collect(Collectors.toList()));
        
        // 获取糖度规格选项
        List<Specification> sweetness = specificationRepository.findByTypeAndStatusOrderBySortAsc("sweetness", STATUS_ENABLED);
        productDetailDTO.setSweetness(sweetness.stream()
                .map(this::convertToSpecificationDTO)
                .collect(Collectors.toList()));
        
        // 获取配料选项
        List<Ingredient> ingredients = ingredientRepository.findByStatusOrderBySortAsc(STATUS_ENABLED);
        productDetailDTO.setIngredients(ingredients.stream()
                .map(this::convertToIngredientDTO)
                .collect(Collectors.toList()));
        
        return productDetailDTO;
    }

    @Override
    @Cacheable(value = "products", key = "'search_' + #keyword + '_page_' + #pageable.pageNumber", unless = "#result == null || #result.content.isEmpty()")
    public Page<ProductDTO> searchProducts(String keyword, Pageable pageable) {
        Page<Product> productPage = productRepository.searchProducts(keyword, STATUS_ENABLED, pageable);
        return productPage.map(this::convertToProductDTO);
    }
    
    /**
     * 将分类实体转换为DTO
     */
    private CategoryDTO convertToCategoryDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .image(category.getImage())
                .sort(category.getSort())
                .build();
    }
    
    /**
     * 将商品实体转换为DTO
     */
    private ProductDTO convertToProductDTO(Product product) {
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
                .build();
    }
    
    /**
     * 将商品实体转换为详情DTO
     */
    private ProductDetailDTO convertToProductDetailDTO(Product product) {
        return ProductDetailDTO.builder()
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
                .build();
    }
    
    /**
     * 将规格实体转换为DTO
     */
    private SpecificationDTO convertToSpecificationDTO(Specification specification) {
        return SpecificationDTO.builder()
                .id(specification.getId())
                .name(specification.getName())
                .type(specification.getType())
                .sort(specification.getSort())
                .build();
    }
    
    /**
     * 将配料实体转换为DTO
     */
    private IngredientDTO convertToIngredientDTO(Ingredient ingredient) {
        return IngredientDTO.builder()
                .id(ingredient.getId())
                .name(ingredient.getName())
                .price(ingredient.getPrice())
                .type(ingredient.getType())
                .sort(ingredient.getSort())
                .build();
    }
} 