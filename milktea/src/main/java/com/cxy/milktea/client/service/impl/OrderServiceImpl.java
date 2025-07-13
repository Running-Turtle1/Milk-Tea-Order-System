package com.cxy.milktea.client.service.impl;

import com.cxy.milktea.client.dto.*;
import com.cxy.milktea.client.service.CartService;
import com.cxy.milktea.client.service.OrderService;
import com.cxy.milktea.client.service.UserService;
import com.cxy.milktea.common.entity.*;
import com.cxy.milktea.common.exception.BusinessException;
import com.cxy.milktea.common.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import com.cxy.milktea.admin.service.PointRuleService;
import com.cxy.milktea.admin.service.MemberLevelService;
import com.cxy.milktea.admin.dto.MemberLevelDTO;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final com.cxy.milktea.common.repository.OrderRepository orderRepository;
    private final com.cxy.milktea.common.repository.OrderDetailRepository orderDetailRepository;
    private final com.cxy.milktea.common.repository.CartRepository cartRepository;
    private final com.cxy.milktea.common.repository.ProductRepository productRepository;
    private final CartService cartService;
    private final UserService userService;
    private final com.cxy.milktea.common.repository.UserCouponRepository userCouponRepository;
    private final ObjectMapper objectMapper;
    private final PointRuleService pointRuleService;
    private final MemberLevelService memberLevelService;
    private final com.cxy.milktea.common.repository.OrderRefundRepository orderRefundRepository;
    
    @Override
    @Transactional
    public OrderDTO createOrder(OrderRequest orderRequest) {
        User currentUser = getCurrentUser();
        
        // 生成订单编号
        String orderNo = generateOrderNo();
        
        // 创建订单对象
        Order order = Order.builder()
                .orderNo(orderNo)
                .user(currentUser)
                .status(0) // 待支付状态
                .build();
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        // 处理来自购物车的商品
        if (orderRequest.getCartIds() != null && !orderRequest.getCartIds().isEmpty()) {
            List<Cart> carts = cartRepository.findAllById(orderRequest.getCartIds());
            
            // 验证购物车项属于当前用户
            for (Cart cart : carts) {
                if (!cart.getUser().getId().equals(currentUser.getId())) {
                    throw new BusinessException(403, "无权访问其他用户的购物车");
                }
                
                // 检查商品是否上架
                if (cart.getProduct().getStatus() != 1) {
                    throw new BusinessException(400, "商品 " + cart.getProduct().getName() + " 已下架");
                }
                
                // 创建订单详情
                OrderDetail orderDetail = createOrderDetailFromCart(cart);
                order.addOrderDetail(orderDetail);
                
                // 累加总金额
                totalAmount = totalAmount.add(orderDetail.getTotalPrice());
            }
            
            // 设置订单总金额
            order.setTotalAmount(totalAmount);
            
            // 处理优惠券
            if (orderRequest.getUserCouponId() != null) {
                applyUserCoupon(order, orderRequest.getUserCouponId());
            } else {
                // 没有使用优惠券
                order.setCouponDiscountAmount(BigDecimal.ZERO);
            }
            
            // 应用会员折扣
            applyMemberDiscount(order, currentUser);
            
            // 计算最终支付金额
            calculateFinalPaymentAmount(order);
            
            // 保存订单
            orderRepository.save(order);
            
            // 删除已下单的购物车商品
            cartRepository.deleteAll(carts);
        }
        // 处理直接购买的商品
        else if (orderRequest.getDirectProduct() != null) {
            CartRequest directProduct = orderRequest.getDirectProduct();
            
            // 获取商品信息
            Product product = productRepository.findById(directProduct.getProductId())
                    .orElseThrow(() -> new BusinessException(404, "商品不存在"));
            
            if (product.getStatus() != 1) {
                throw new BusinessException(400, "商品已下架");
            }
            
            // 创建订单详情
            OrderDetail orderDetail = createOrderDetailFromDirectProduct(product, directProduct);
            order.addOrderDetail(orderDetail);
            
            // 设置订单总金额
            totalAmount = orderDetail.getTotalPrice();
            order.setTotalAmount(totalAmount);
            
            // 处理优惠券
            if (orderRequest.getUserCouponId() != null) {
                applyUserCoupon(order, orderRequest.getUserCouponId());
            } else {
                // 没有使用优惠券
                order.setCouponDiscountAmount(BigDecimal.ZERO);
            }
            
            // 应用会员折扣
            applyMemberDiscount(order, currentUser);
            
            // 计算最终支付金额
            calculateFinalPaymentAmount(order);
            
            orderRepository.save(order);
        } else {
            throw new BusinessException(400, "订单信息不完整");
        }
        
        // 设置订单备注
        if (orderRequest.getRemark() != null) {
            order.setRemark(orderRequest.getRemark());
        }
        
        return convertToDTO(order);
    }
    
    /**
     * 计算最终支付金额和总折扣
     */
    private void calculateFinalPaymentAmount(Order order) {
        // 获取各项金额并确保不为null
        BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal couponDiscount = order.getCouponDiscountAmount() != null ? order.getCouponDiscountAmount() : BigDecimal.ZERO;
        BigDecimal memberDiscount = order.getMemberDiscountAmount() != null ? order.getMemberDiscountAmount() : BigDecimal.ZERO;
        
        // 确保所有金额都保留两位小数
        couponDiscount = couponDiscount.setScale(2, BigDecimal.ROUND_HALF_UP);
        memberDiscount = memberDiscount.setScale(2, BigDecimal.ROUND_HALF_UP);
        
        // 计算总折扣金额
        BigDecimal totalDiscount = couponDiscount.add(memberDiscount);
        totalDiscount = totalDiscount.setScale(2, BigDecimal.ROUND_HALF_UP);
        order.setDiscountAmount(totalDiscount);
        
        // 计算最终支付金额
        BigDecimal finalPayment = totalAmount.subtract(totalDiscount);
        
        // 确保支付金额不小于0
        if (finalPayment.compareTo(BigDecimal.ZERO) < 0) {
            finalPayment = BigDecimal.ZERO;
        }
        
        // 最终金额保留两位小数
        finalPayment = finalPayment.setScale(2, BigDecimal.ROUND_HALF_UP);
        order.setPaymentAmount(finalPayment);
    }
    
    /**
     * 应用会员等级折扣到订单
     */
    private void applyMemberDiscount(Order order, User user) {
        // 获取会员等级信息
        MemberLevelDTO memberLevel = memberLevelService.getMemberLevelByPoints(user.getTotalPoints());
        
        // 获取折扣率
        BigDecimal discount = memberLevel.getDiscount();
        
        // 如果折扣是1（无折扣）或者null，则直接返回
        if (discount == null || BigDecimal.ONE.compareTo(discount) == 0) {
            order.setMemberDiscountAmount(BigDecimal.ZERO);
            return;
        }
        
        // 检查折扣率是否合法（0-1之间）
        if (discount.compareTo(BigDecimal.ZERO) < 0 || discount.compareTo(BigDecimal.ONE) > 0) {
            order.setMemberDiscountAmount(BigDecimal.ZERO);
            return;
        }
        
        // 计算会员折扣基础金额（总金额减去优惠券折扣）
        BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal couponDiscount = order.getCouponDiscountAmount() != null ? order.getCouponDiscountAmount() : BigDecimal.ZERO;
        
        // 确保精度一致性
        totalAmount = totalAmount.setScale(2, BigDecimal.ROUND_HALF_UP);
        couponDiscount = couponDiscount.setScale(2, BigDecimal.ROUND_HALF_UP);
        
        BigDecimal baseAmount = totalAmount.subtract(couponDiscount);
        
        // 会员折扣率存储的是小数形式，如0.9表示9折
        // 计算会员折扣后金额（保留两位小数）
        BigDecimal discountedAmount = baseAmount.multiply(discount).setScale(2, BigDecimal.ROUND_HALF_UP);
        
        // 计算折扣金额 = 基础金额 - 折扣后金额
        BigDecimal discountAmount = baseAmount.subtract(discountedAmount);
        
        // 设置会员折扣金额，四舍五入保留两位小数
        discountAmount = discountAmount.setScale(2, BigDecimal.ROUND_HALF_UP);
        order.setMemberDiscountAmount(discountAmount);
    }
    
    /**
     * 应用用户优惠券到订单
     */
    private void applyUserCoupon(Order order, Long userCouponId) {
        // 获取用户优惠券
        UserCoupon userCoupon = userCouponRepository.findByIdAndUser(userCouponId, order.getUser())
                .orElseThrow(() -> new BusinessException(404, "优惠券不存在"));
        
        // 先检查并更新优惠券状态
        LocalDateTime now = LocalDateTime.now();
        if (userCoupon.getStatus() == 0 && 
                (userCoupon.getCoupon().getStatus() != 1 || now.isAfter(userCoupon.getCoupon().getEndTime()))) {
            userCoupon.setStatus(2); // 设置为已过期状态
            userCouponRepository.save(userCoupon);
            throw new BusinessException(400, "优惠券已过期");
        }
        
        // 检查优惠券是否可用
        if (userCoupon.getStatus() != 0) {
            throw new BusinessException(400, "优惠券已使用或已过期");
        }
        
        // 获取优惠券
        Coupon coupon = userCoupon.getCoupon();
        
        // 检查优惠券有效期
        if (coupon.getStatus() != 1 || now.isBefore(coupon.getStartTime()) || now.isAfter(coupon.getEndTime())) {
            throw new BusinessException(400, "优惠券不在有效期内");
        }
        
        // 检查订单金额是否满足优惠券使用条件
        if (order.getTotalAmount().compareTo(coupon.getMinPoint()) < 0) {
            throw new BusinessException(400, "订单金额不满足优惠券使用条件");
        }
        
        // 计算优惠券折扣金额
        BigDecimal couponDiscountAmount;
        
        if (coupon.getType() == 1) { // 满减券
            couponDiscountAmount = coupon.getAmount();
            // 防止优惠后金额为负数
            if (couponDiscountAmount.compareTo(order.getTotalAmount()) > 0) {
                couponDiscountAmount = order.getTotalAmount(); // 最多优惠到0元
            }
            // 四舍五入保留两位小数
            couponDiscountAmount = couponDiscountAmount.setScale(2, BigDecimal.ROUND_HALF_UP);
        } else if (coupon.getType() == 2) { // 折扣券
            // 折扣券的amount字段直接存储的是折扣率，如0.8表示8折
            BigDecimal discountRate = coupon.getAmount();
            
            // 检查折扣率是否合法（0-1之间）
            if (discountRate.compareTo(BigDecimal.ZERO) < 0 || discountRate.compareTo(BigDecimal.ONE) > 0) {
                throw new BusinessException(400, "优惠券折扣率设置错误: " + discountRate);
            }
            
            // 确保订单总金额有正确的精度
            BigDecimal totalAmount = order.getTotalAmount().setScale(2, BigDecimal.ROUND_HALF_UP);
            
            // 优惠后金额 = 原金额 × 折扣率（保留两位小数）
            BigDecimal discountedAmount = totalAmount.multiply(discountRate).setScale(2, BigDecimal.ROUND_HALF_UP);
            
            // 优惠金额 = 原金额 - 优惠后金额
            couponDiscountAmount = totalAmount.subtract(discountedAmount);
            // 四舍五入保留两位小数
            couponDiscountAmount = couponDiscountAmount.setScale(2, BigDecimal.ROUND_HALF_UP);
        } else {
            throw new BusinessException(400, "不支持的优惠券类型");
        }
        
        // 设置优惠券折扣金额
        order.setCouponDiscountAmount(couponDiscountAmount);
        
        // 直接将优惠券ID保存到订单中
        order.setUserCouponId(userCouponId);
    }
    
    @Override
    @Transactional
    public OrderDTO payOrder(String orderNo, String paymentMethod) {
        User currentUser = getCurrentUser();
        
        Order order = orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));
        
        // 验证订单属于当前用户
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException(403, "无权操作此订单");
        }
        
        // 验证订单状态
        if (order.getStatus() != 0) {
            throw new BusinessException(400, "订单状态错误，无法支付");
        }
        
        // 更新订单信息
        order.setStatus(1); // 已支付状态
        order.setPaymentMethod(paymentMethod);
        order.setPaymentTime(LocalDateTime.now());
        
        // 生成取餐号
        order.setTakeNo(generateTakeNo());
        
        // 保存订单
        orderRepository.save(order);
        
        // 处理优惠券使用
        processOrderCoupon(order);
        
        // 增加用户积分
        addOrderPoints(order);
        
        // 更新商品销量
        updateProductSales(order);
        
        return convertToDTO(order);
    }
    
    /**
     * 处理订单优惠券
     */
    private void processOrderCoupon(Order order) {
        // 直接从订单的userCouponId字段获取优惠券ID
        if (order.getUserCouponId() != null) {
            try {
                // 正式标记优惠券为已使用
                userService.useUserCoupon(order.getUserCouponId(), order.getId());
            } catch (Exception e) {
                // 记录异常，但不影响订单支付流程
                System.err.println("更新优惠券状态失败: " + e.getMessage());
            }
        }
    }
    
    /**
     * 增加订单积分
     */
    private void addOrderPoints(Order order) {
        // 使用积分规则服务计算积分
        BigDecimal paymentAmount = order.getPaymentAmount();
        int points = pointRuleService.calculateConsumptionPoints(paymentAmount);
        
        if (points > 0) {
            // 增加用户积分
            userService.addUserPoints(
                    order.getUser().getId(),
                    points,
                    1, // 1表示消费获得
                    order.getId(),
                    "订单消费：" + order.getOrderNo()
            );
        }
    }

    @Override
    @Transactional
    public OrderDTO cancelOrder(String orderNo) {
        User currentUser = getCurrentUser();
        
        Order order = orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));
        
        // 验证订单属于当前用户
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException(403, "无权操作此订单");
        }
        
        // 验证订单状态，只有待支付状态可以取消
        if (order.getStatus() != 0) {
            throw new BusinessException(400, "当前订单状态无法取消");
        }
        
        // 更新订单状态
        order.setStatus(5); // 已取消状态
        orderRepository.save(order);
        
        return convertToDTO(order);
    }

    @Override
    public OrderDTO getOrderDetail(String orderNo) {
        User currentUser = getCurrentUser();
        
        Order order = orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));
        
        // 验证订单属于当前用户
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException(403, "无权查看此订单");
        }
        
        return convertToDTO(order);
    }

    @Override
    public Page<OrderDTO> getUserOrders(Integer status, int page, int size) {
        User currentUser = getCurrentUser();
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage;
        
        // 根据状态查询
        if (status != null) {
            orderPage = orderRepository.findByUserAndStatusOrderByCreatedAtDesc(currentUser, status, pageable);
        } else {
            orderPage = orderRepository.findByUserOrderByCreatedAtDesc(currentUser, pageable);
        }
        
        List<OrderDTO> orderDTOs = orderPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(orderDTOs, pageable, orderPage.getTotalElements());
    }
    
    @Override
    @Transactional
    public boolean deleteOrder(String orderNo) {
        User currentUser = getCurrentUser();
        
        Order order = orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));
        
        // 验证订单属于当前用户
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException(403, "无权操作此订单");
        }
        
        // 允许删除已支付、已取消、已退款、拒绝退款的订单
        if (order.getStatus() != 1 && order.getStatus() != 5 && order.getStatus() != 4 && order.getStatus() != 6) {
            throw new BusinessException(400, "只能删除已支付、已取消、已退款或拒绝退款的订单");
        }
        
        // 如果使用了优惠券且是取消状态，应该将优惠券状态重置为未使用
        if (order.getStatus() == 5) {
            // 查找该订单关联的优惠券
            Optional<UserCoupon> userCoupon = userCouponRepository.findByOrderId(order.getId());
            userCoupon.ifPresent(coupon -> {
                // 重置优惠券状态
                coupon.setStatus(0); // 未使用状态
                coupon.setOrderId(null);
                coupon.setUsedTime(null);
                userCouponRepository.save(coupon);
            });
        }
        
        // 删除订单详情
        orderDetailRepository.deleteAll(order.getOrderDetails());
        
        // 删除订单
        orderRepository.delete(order);
        
        return true;
    }
    
    /**
     * 从购物车创建订单详情
     */
    private OrderDetail createOrderDetailFromCart(Cart cart) {
        return OrderDetail.builder()
                .productId(cart.getProduct().getId())
                .productName(cart.getProduct().getName())
                .productImage(cart.getProduct().getImage())
                .price(cart.getProduct().getPrice())
                .quantity(cart.getQuantity())
                .temperature(cart.getTemperature())
                .sweetness(cart.getSweetness())
                .ingredients(cart.getIngredients())
                .totalPrice(cart.getTotalPrice())
                .build();
    }
    
    /**
     * 从直接购买商品创建订单详情
     */
    private OrderDetail createOrderDetailFromDirectProduct(Product product, CartRequest directProduct) {
        // 处理配料
        List<IngredientSimpleDTO> ingredients = directProduct.getIngredients();
        String ingredientsJson = null;
        
        if (ingredients != null && !ingredients.isEmpty()) {
            try {
                ingredientsJson = objectMapper.writeValueAsString(ingredients);
            } catch (JsonProcessingException e) {
                throw new BusinessException(500, "序列化配料失败");
            }
        }
        
        // 计算总价
        BigDecimal totalPrice = calculateTotalPrice(product.getPrice(), directProduct.getQuantity(), ingredients);
        
        return OrderDetail.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImage())
                .price(product.getPrice())
                .quantity(directProduct.getQuantity())
                .temperature(directProduct.getTemperature())
                .sweetness(directProduct.getSweetness())
                .ingredients(ingredientsJson)
                .totalPrice(totalPrice)
                .build();
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
     * 生成订单编号
     */
    private String generateOrderNo() {
        return "OD" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now())
                + String.format("%04d", new Random().nextInt(10000));
    }
    
    /**
     * 生成取餐号
     */
    private String generateTakeNo() {
        try {
            String today = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            // 生成100-999之间的随机数作为取餐号
            int randomNumber = 100 + new Random().nextInt(900);
            return String.format("%03d", randomNumber);
        } catch (Exception e) {
            // 如果生成失败，使用时间戳后三位数
            String timestamp = String.valueOf(System.currentTimeMillis());
            return timestamp.substring(timestamp.length() - 3);
        }
    }
    
    /**
     * 订单实体转换为DTO
     */
    private OrderDTO convertToDTO(Order order) {
        List<OrderDetailDTO> detailDTOs = order.getOrderDetails().stream()
                .map(this::convertDetailToDTO)
                .collect(Collectors.toList());
        
        return OrderDTO.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .totalAmount(order.getTotalAmount())
                .memberDiscountAmount(order.getMemberDiscountAmount())
                .couponDiscountAmount(order.getCouponDiscountAmount())
                .discountAmount(order.getDiscountAmount())
                .paymentAmount(order.getPaymentAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentTime(order.getPaymentTime())
                .status(order.getStatus())
                .statusText(getStatusText(order.getStatus()))
                .takeNo(order.getTakeNo())
                .remark(order.getRemark())
                .userCouponId(order.getUserCouponId())
                .orderDetails(detailDTOs)
                .createdAt(order.getCreatedAt())
                .build();
    }
    
    /**
     * 订单详情实体转换为DTO
     */
    private OrderDetailDTO convertDetailToDTO(OrderDetail detail) {
        List<IngredientSimpleDTO> ingredients = null;
        
        if (detail.getIngredients() != null && !detail.getIngredients().isEmpty()) {
            try {
                ingredients = objectMapper.readValue(detail.getIngredients(), new TypeReference<List<IngredientSimpleDTO>>() {});
            } catch (JsonProcessingException e) {
                throw new BusinessException(500, "解析配料信息失败");
            }
        }
        
        return OrderDetailDTO.builder()
                .id(detail.getId())
                .productId(detail.getProductId())
                .productName(detail.getProductName())
                .productImage(detail.getProductImage())
                .price(detail.getPrice())
                .quantity(detail.getQuantity())
                .temperature(detail.getTemperature())
                .sweetness(detail.getSweetness())
                .ingredients(ingredients)
                .totalPrice(detail.getTotalPrice())
                .build();
    }
    
    /**
     * 获取订单状态文本
     */
    private String getStatusText(Integer status) {
        switch (status) {
            case 0: return "待支付";
            case 1: return "已支付";
            case 2: return "已完成";
            case 3: return "退款中";
            case 4: return "已退款";
            case 5: return "已取消";
            case 6: return "拒绝退款";
            default: return "未知状态";
        }
    }
    
    /**
     * 获取当前登录用户
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(401, "用户未登录");
        }
        
        return (User) authentication.getPrincipal();
    }
    
    /**
     * 更新商品销量
     */
    private void updateProductSales(Order order) {
        try {
            // 获取订单中的所有商品详情
            List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(order.getId());
            
            // 更新每个商品的销量
            for (OrderDetail detail : orderDetails) {
                productRepository.increaseSales(detail.getProductId(), detail.getQuantity());
            }
        } catch (Exception e) {
            // 记录异常，但不影响订单支付流程
            System.err.println("更新商品销量失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public RefundDTO applyRefund(RefundRequestDTO refundRequest) {
        User currentUser = getCurrentUser();
        
        // 获取订单信息
        Order order = orderRepository.findByOrderNo(refundRequest.getOrderNo())
                .orElseThrow(() -> new BusinessException(404, "订单不存在"));
        
        // 验证订单属于当前用户
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException(403, "无权操作此订单");
        }
        
        // 验证订单状态，只有已支付状态可以申请退款
        if (order.getStatus() != 1) {
            throw new BusinessException(400, "当前订单状态无法申请退款");
        }
        
        // 确保精度一致后再比较
        BigDecimal paymentAmount = order.getPaymentAmount().setScale(2, BigDecimal.ROUND_HALF_UP);
        BigDecimal requestRefundAmount = refundRequest.getRefundAmount().setScale(2, BigDecimal.ROUND_HALF_UP);
        
        // 验证退款金额不超过订单支付金额
        if (requestRefundAmount.compareTo(paymentAmount) > 0) {
            throw new BusinessException(400, "退款金额不能超过订单支付金额");
        }
        
        // 创建退款记录
        OrderRefund refund = OrderRefund.builder()
                .order(order)
                .refundAmount(requestRefundAmount)
                .amount(order.getPaymentAmount())
                .reason(refundRequest.getReason())
                .remark(refundRequest.getRemark())
                .status(0) // 待处理状态
                .refundMethod(refundRequest.getRefundMethod())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        // 保存退款记录
        OrderRefund savedRefund = orderRefundRepository.save(refund);
        
        // 更新订单状态为退款中
        order.setStatus(3); // 设置为退款中状态
        orderRepository.save(order);
        
        return convertToRefundDTO(savedRefund);
    }

    @Override
    public RefundDTO getRefundDetail(Long refundId) {
        User currentUser = getCurrentUser();
        
        OrderRefund refund = orderRefundRepository.findById(refundId)
                .orElseThrow(() -> new BusinessException(404, "退款记录不存在"));
        
        // 验证退款记录属于当前用户
        if (!refund.getOrder().getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException(403, "无权查看此退款记录");
        }
        
        return convertToRefundDTO(refund);
    }

    @Override
    public Page<RefundDTO> getUserRefunds(Integer status, int page, int size) {
        User currentUser = getCurrentUser();
        
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderRefund> refundPage;
        
        // 根据状态查询
        if (status != null) {
            refundPage = orderRefundRepository.findByUserIdAndStatus(currentUser.getId(), status, pageable);
        } else {
            refundPage = orderRefundRepository.findByUserId(currentUser.getId(), pageable);
        }
        
        List<RefundDTO> refundDTOs = refundPage.getContent().stream()
                .map(this::convertToRefundDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(refundDTOs, pageable, refundPage.getTotalElements());
    }

    /**
     * 将退款实体转换为DTO
     */
    private RefundDTO convertToRefundDTO(OrderRefund refund) {
        return RefundDTO.builder()
                .id(refund.getId())
                .orderId(refund.getOrder().getId())
                .orderNo(refund.getOrder().getOrderNo())
                .refundAmount(refund.getRefundAmount())
                .orderAmount(refund.getOrder().getPaymentAmount())
                .reason(refund.getReason())
                .remark(refund.getRemark())
                .status(refund.getStatus())
                .statusText(getRefundStatusText(refund.getStatus()))
                .comment(refund.getComment())
                .processTime(refund.getProcessTime())
                .refundMethod(refund.getRefundMethod())
                .refundMethodText(getRefundMethodText(refund.getRefundMethod()))
                .createdAt(refund.getCreatedAt())
                .build();
    }

    /**
     * 获取退款状态文本
     */
    private String getRefundStatusText(Integer status) {
        if (status == null) return "未知状态";
        switch (status) {
            case 0: return "待处理";
            case 1: return "已退款";
            case 2: return "已拒绝";
            default: return "未知状态";
        }
    }

    /**
     * 获取退款方式文本
     */
    private String getRefundMethodText(Integer method) {
        if (method == null) return "未知方式";
        switch (method) {
            case 1: return "原路返回";
            case 2: return "退到余额";
            default: return "未知方式";
        }
    }
} 