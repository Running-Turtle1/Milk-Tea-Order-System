package com.cxy.milktea.admin.service;

import com.cxy.milktea.admin.dto.ProductCreateDTO;
import com.cxy.milktea.admin.dto.ProductDTO;
import com.cxy.milktea.admin.dto.ProductUpdateDTO;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

/**
 * 商品服务接口
 * 定义商品管理的业务方法
 */
public interface ProductService {
    
    /**
     * 分页获取商品列表
     * @param categoryId 分类ID，可选
     * @param keyword 关键词，可选
     * @param page 页码
     * @param size 每页大小
     * @return 商品分页结果
     */
    Page<ProductDTO> getProductsByPage(Long categoryId, String keyword, Integer page, Integer size);
    
    /**
     * 根据ID获取商品
     * @param id 商品ID
     * @return 商品信息
     */
    ProductDTO getProductById(Long id);
    
    /**
     * 创建商品
     * @param productCreateDTO 商品创建DTO
     * @return 创建后的商品
     */
    ProductDTO createProduct(ProductCreateDTO productCreateDTO);
    
    /**
     * 更新商品
     * @param id 商品ID
     * @param productUpdateDTO 商品更新DTO
     * @return 更新后的商品
     */
    ProductDTO updateProduct(Long id, ProductUpdateDTO productUpdateDTO);
    
    /**
     * 更新商品状态
     * @param id 商品ID
     * @param status 状态值：0下架，1上架
     * @return 更新后的商品
     */
    ProductDTO updateProductStatus(Long id, Integer status);
    
    /**
     * 更新商品推荐状态
     * @param id 商品ID
     * @param isRecommend 是否推荐：0否，1是
     * @return 更新后的商品
     */
    ProductDTO updateProductRecommendStatus(Long id, Integer isRecommend);
    
    /**
     * 更新商品排序
     * @param id 商品ID
     * @param sort 排序值
     * @return 更新后的商品
     */
    ProductDTO updateProductSort(Long id, Integer sort);
    
    /**
     * 删除商品
     * @param id 商品ID
     */
    void deleteProduct(Long id);
    
    /**
     * 获取商品销量排行
     * @param limit 获取数量
     * @return 商品销量列表（按销量从高到低排序）
     */
    List<ProductDTO> getProductSalesRanking(Integer limit);
    
    /**
     * 手动更新商品销量
     * @param id 商品ID
     * @param sales 销量值
     * @return 更新后的商品
     */
    ProductDTO updateProductSales(Long id, Integer sales);
    
    /**
     * 更新商品图片
     * @param id 商品ID
     * @param imageUrl 图片URL
     * @return 更新后的商品
     */
    ProductDTO updateProductImage(Long id, String imageUrl);
} 