package com.cxy.milktea.client.service.impl;

import com.cxy.milktea.client.dto.CartDTO;
import com.cxy.milktea.client.dto.CartItemDTO;
import com.cxy.milktea.client.dto.CartRequest;
import com.cxy.milktea.client.dto.IngredientSimpleDTO;
import com.cxy.milktea.client.service.CartService;
import com.cxy.milktea.common.entity.Cart;
import com.cxy.milktea.common.entity.Product;
import com.cxy.milktea.common.entity.User;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.CartRepository;
import com.cxy.milktea.common.repository.ProductRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 购物车服务实现类
 * 实现购物车相关的所有业务逻辑，包括商品添加、更新、删除和查询等功能
 */
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    /**
     * 购物车数据访问对象
     */
    private final CartRepository cartRepository;
    
    /**
     * 商品数据访问对象
     */
    private final ProductRepository productRepository;
    
    /**
     * JSON对象映射器，用于购物车中配料的序列化和反序列化
     */
    private final ObjectMapper objectMapper;
    
    /**
     * Redis模板，用于购物车缓存
     */
    private final RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 购物车缓存前缀
     */
    private static final String CART_CACHE_PREFIX = "cart:user:";
    
    /**
     * 购物车缓存过期时间（天）
     */
    private static final long CART_CACHE_EXPIRATION = 1;

    /**
     * 获取当前用户的购物车
     * 查询用户购物车中的所有商品，计算总价、总数量等信息
     * 
     * @return 返回购物车数据传输对象，包含购物车项目列表和汇总信息
     */
    @Override
    @Cacheable(value = "carts", key = "'user_' + #root.target.getCurrentUser().getId()", unless = "#result == null")
    public CartDTO getCart() {
        // 获取当前登录用户
        User currentUser = getCurrentUser();
        // 查询用户的购物车项目
        List<Cart> cartItems = cartRepository.findByUserId(currentUser.getId());
        
        // 如果购物车为空，返回空购物车对象
        if (cartItems.isEmpty()) {
            return CartDTO.builder()
                    .items(Collections.emptyList())
                    .totalPrice(BigDecimal.ZERO)
                    .totalQuantity(0)
                    .selectedTotalPrice(BigDecimal.ZERO)
                    .selectedTotalQuantity(0)
                    .allProductsAvailable(true)
                    .build();
        }
        
        // 将实体对象转换为DTO对象
        List<CartItemDTO> cartItemDTOs = cartItems.stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());
        
        // 计算所有商品的总价
        BigDecimal totalPrice = cartItemDTOs.stream()
                .map(CartItemDTO::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 计算所有商品的总数量
        int totalQuantity = cartItemDTOs.stream()
                .mapToInt(CartItemDTO::getQuantity)
                .sum();
        
        // 计算选中商品的总价
        BigDecimal selectedTotalPrice = cartItemDTOs.stream()
                .filter(CartItemDTO::getSelected)
                .map(CartItemDTO::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 计算选中商品的总数量
        int selectedTotalQuantity = cartItemDTOs.stream()
                .filter(CartItemDTO::getSelected)
                .mapToInt(CartItemDTO::getQuantity)
                .sum();
        
        // 检查所有选中的商品是否都有库存
        boolean allProductsAvailable = cartItemDTOs.stream()
                .filter(CartItemDTO::getSelected)
                .allMatch(item -> item.getStockAvailable() == null || item.getStockAvailable());
        
        // 构建并返回购物车DTO对象
        return CartDTO.builder()
                .items(cartItemDTOs)
                .totalPrice(totalPrice)
                .totalQuantity(totalQuantity)
                .selectedTotalPrice(selectedTotalPrice)
                .selectedTotalQuantity(selectedTotalQuantity)
                .allProductsAvailable(allProductsAvailable)
                .build();
    }

    /**
     * 添加商品到购物车
     * 将指定商品添加到用户购物车，如果已存在相同商品、规格和配料则增加数量
     * 
     * @param request 包含商品ID、数量、选中配料等信息的请求对象
     * @return 返回更新后的购物车信息
     */
    @Override
    @Transactional
    @CacheEvict(value = "carts", key = "'user_' + #root.target.getCurrentUser().getId()")
    public CartDTO addToCart(CartRequest request) {
        // 获取当前登录用户
        User currentUser = getCurrentUser();
        // 根据ID获取商品信息
        Product product = getProductById(request.getProductId());
        
        // 计算规格属性哈希
        String attributesHash = calculateAttributesHash(request.getTemperature(), request.getSweetness());
        
        // 计算配料哈希
        String ingredientsHash = calculateIngredientsHash(request.getIngredients());
        
        // 计算商品总价（包含配料价格）
        BigDecimal totalPrice = calculateTotalPrice(product.getPrice(), request.getQuantity(), request.getIngredients());
        
        // 检查购物车中是否已存在相同商品、规格和配料
        Cart existingCart = cartRepository.findByUserIdAndProductIdAndAttributesHashAndIngredientsHash(
                currentUser.getId(), 
                product.getId(),
                attributesHash,
                ingredientsHash
            ).orElse(null);
        
        if (existingCart != null) {
            // 如果已存在完全匹配的项，则只增加数量和总价
            existingCart.setQuantity(existingCart.getQuantity() + request.getQuantity());
            existingCart.setTotalPrice(existingCart.getTotalPrice().add(totalPrice));
            cartRepository.save(existingCart);
        } else {
            // 如果不存在匹配的项，创建新购物车项目
            Cart cart = Cart.builder()
                    .user(currentUser)
                    .product(product)
                    .quantity(request.getQuantity())
                    .temperature(request.getTemperature())
                    .sweetness(request.getSweetness())
                    .ingredients(serializeIngredients(request.getIngredients()))
                    .attributesHash(attributesHash)
                    .ingredientsHash(ingredientsHash)
                    .totalPrice(totalPrice)
                    .selected(true)
                    .build();
            
            cartRepository.save(cart);
        }
        
        // 返回更新后的购物车信息
        return getCart();
    }

    @Override
    @Transactional
    @CacheEvict(value = "carts", key = "'user_' + #root.target.getCurrentUser().getId()")
    public CartDTO updateCart(Long cartItemId, CartRequest request) {
        User currentUser = getCurrentUser();
        Cart cart = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new BusinessException(404, "购物车项目不存在"));
        
        // 验证是否是当前用户的购物车
        if (!cart.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException(403, "无权操作他人购物车");
        }
        
        Product product = getProductById(request.getProductId());
        
        // 计算规格属性哈希
        String attributesHash = calculateAttributesHash(request.getTemperature(), request.getSweetness());
        
        // 计算配料哈希
        String ingredientsHash = calculateIngredientsHash(request.getIngredients());
        
        // 计算总价
        BigDecimal totalPrice = calculateTotalPrice(product.getPrice(), request.getQuantity(), request.getIngredients());
        
        // 更新购物车
        cart.setQuantity(request.getQuantity());
        cart.setTemperature(request.getTemperature());
        cart.setSweetness(request.getSweetness());
        cart.setIngredients(serializeIngredients(request.getIngredients()));
        cart.setAttributesHash(attributesHash);
        cart.setIngredientsHash(ingredientsHash);
        cart.setTotalPrice(totalPrice);
        
        cartRepository.save(cart);
        
        return getCart();
    }

    @Override
    @Transactional
    @CacheEvict(value = "carts", key = "'user_' + #root.target.getCurrentUser().getId()")
    public CartDTO removeFromCart(Long cartItemId) {
        User currentUser = getCurrentUser();
        Cart cart = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new BusinessException(404, "购物车项目不存在"));
        
        // 验证是否是当前用户的购物车
        if (!cart.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException(403, "无权操作他人购物车");
        }
        
        cartRepository.deleteById(cartItemId);
        
        return getCart();
    }

    @Override
    @Transactional
    @CacheEvict(value = "carts", key = "'user_' + #root.target.getCurrentUser().getId()")
    public void clearCart() {
        User currentUser = getCurrentUser();
        cartRepository.deleteByUserId(currentUser.getId());
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "carts", key = "'user_' + #root.target.getCurrentUser().getId()")
    public CartDTO selectCartItem(Long cartItemId, Boolean selected) {
        User currentUser = getCurrentUser();
        Cart cart = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new BusinessException(404, "购物车项目不存在"));
        
        // 验证是否是当前用户的购物车
        if (!cart.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException(403, "无权操作他人购物车");
        }
        
        cart.setSelected(selected);
        cartRepository.save(cart);
        
        return getCart();
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "carts", key = "'user_' + #root.target.getCurrentUser().getId()")
    public CartDTO selectAllCartItems(Boolean selected) {
        User currentUser = getCurrentUser();
        List<Cart> cartItems = cartRepository.findByUserId(currentUser.getId());
        
        for (Cart cart : cartItems) {
            cart.setSelected(selected);
        }
        
        cartRepository.saveAll(cartItems);
        
        return getCart();
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "carts", key = "'user_' + #root.target.getCurrentUser().getId()")
    public CartDTO removeSelectedItems() {
        User currentUser = getCurrentUser();
        List<Cart> cartItems = cartRepository.findByUserId(currentUser.getId());
        
        // 过滤出选中的购物车项目
        List<Cart> selectedItems = cartItems.stream()
                .filter(Cart::getSelected)
                .collect(Collectors.toList());
        
        cartRepository.deleteAll(selectedItems);
        
        return getCart();
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "carts", key = "'user_' + #root.target.getCurrentUser().getId()")
    public CartDTO batchUpdateCartItems(List<CartRequest> requests) {
        User currentUser = getCurrentUser();
        
        for (CartRequest request : requests) {
            // 只处理有ID的更新请求
            if (request.getCartId() != null) {
                Cart cart = cartRepository.findById(request.getCartId())
                        .orElseThrow(() -> new BusinessException(404, "购物车项目不存在"));
                
                // 验证是否是当前用户的购物车
                if (!cart.getUser().getId().equals(currentUser.getId())) {
                    throw new BusinessException(403, "无权操作他人购物车");
                }
                
                // 更新购物车项
                if (request.getQuantity() != null) {
                    cart.setQuantity(request.getQuantity());
                    
                    // 重新计算总价
                    BigDecimal totalPrice = calculateTotalPrice(
                            cart.getProduct().getPrice(),
                            request.getQuantity(),
                            request.getIngredients() != null 
                                ? request.getIngredients() 
                                : deserializeIngredients(cart.getIngredients())
                    );
                    cart.setTotalPrice(totalPrice);
                }
                
                if (request.getSelected() != null) {
                    cart.setSelected(request.getSelected());
                }
                
                cartRepository.save(cart);
            }
        }
        
        return getCart();
    }
    
    /**
     * 获取当前登录用户
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(401, "用户未登录");
        }
        
        return (User) authentication.getPrincipal();
    }
    
    /**
     * 根据ID获取商品
     */
    private Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(404, "商品不存在"));
    }
    
    /**
     * 计算总价
     */
    private BigDecimal calculateTotalPrice(BigDecimal productPrice, Integer quantity, List<IngredientSimpleDTO> ingredients) {
        BigDecimal totalIngredientPrice = BigDecimal.ZERO;
        
        if (ingredients != null && !ingredients.isEmpty()) {
            totalIngredientPrice = ingredients.stream()
                    .map(IngredientSimpleDTO::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        
        BigDecimal itemPrice = productPrice.add(totalIngredientPrice);
        return itemPrice.multiply(new BigDecimal(quantity));
    }
    
    /**
     * 序列化配料为JSON字符串
     */
    private String serializeIngredients(List<IngredientSimpleDTO> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            return null;
        }
        
        try {
            return objectMapper.writeValueAsString(ingredients);
        } catch (JsonProcessingException e) {
            throw new BusinessException(500, "序列化配料失败");
        }
    }
    
    /**
     * 反序列化JSON字符串为配料列表
     */
    private List<IngredientSimpleDTO> deserializeIngredients(String ingredientsJson) {
        if (ingredientsJson == null || ingredientsJson.isEmpty()) {
            return Collections.emptyList();
        }
        
        try {
            return objectMapper.readValue(ingredientsJson, new TypeReference<List<IngredientSimpleDTO>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
    
    /**
     * 将购物车实体转换为DTO
     */
    private CartItemDTO convertToCartItemDTO(Cart cart) {
        Product product = cart.getProduct();
        // 移除库存检查，所有商品都视为有库存
        boolean stockAvailable = true;
        
        return CartItemDTO.builder()
                .id(cart.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImage())
                .productPrice(product.getPrice())
                .quantity(cart.getQuantity())
                .temperature(cart.getTemperature())
                .sweetness(cart.getSweetness())
                .ingredients(deserializeIngredients(cart.getIngredients()))
                .totalPrice(cart.getTotalPrice())
                .selected(cart.getSelected())
                .stockAvailable(stockAvailable)
                .availableStock(Integer.MAX_VALUE) // 设置为最大值表示不限量
                .build();
    }

    /**
     * 计算规格属性哈希值
     */
    private String calculateAttributesHash(String temperature, String sweetness) {
        StringBuilder sb = new StringBuilder();
        
        // 对属性进行排序，确保相同属性生成相同哈希值
        Map<String, String> attributes = new TreeMap<>();
        
        if (temperature != null && !temperature.isEmpty()) {
            attributes.put("temperature", temperature);
        }
        
        if (sweetness != null && !sweetness.isEmpty()) {
            attributes.put("sweetness", sweetness);
        }
        
        // 构建属性字符串
        for (Map.Entry<String, String> entry : attributes.entrySet()) {
            sb.append(entry.getKey()).append(":").append(entry.getValue()).append(";");
        }
        
        return DigestUtils.md5Hex(sb.toString());
    }
    
    /**
     * 计算配料哈希值
     */
    private String calculateIngredientsHash(List<IngredientSimpleDTO> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            return DigestUtils.md5Hex("");
        }
        
        // 对配料ID进行排序，确保相同配料组合生成相同哈希值
        List<Long> ingredientIds = ingredients.stream()
                .map(IngredientSimpleDTO::getId)
                .sorted()
                .collect(Collectors.toList());
        
        return DigestUtils.md5Hex(ingredientIds.toString());
    }
} 