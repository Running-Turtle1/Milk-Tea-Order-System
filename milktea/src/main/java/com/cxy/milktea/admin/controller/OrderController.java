package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.OrderDTO;
import com.cxy.milktea.admin.dto.OrderDetailDTO;
import com.cxy.milktea.admin.dto.OrderQueryDTO;
import com.cxy.milktea.admin.dto.RefundOrderDTO;
import com.cxy.milktea.admin.service.OrderService;
import com.cxy.milktea.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController("adminOrderController")
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    /**
     * 获取订单列表
     */
    @GetMapping

    public ResponseEntity<ApiResponse<Page<OrderDTO>>> getOrders(
            @ModelAttribute OrderQueryDTO queryDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<OrderDTO> orders = orderService.getOrders(queryDTO, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    /**
     * 获取订单详情
     */
    @GetMapping("/{id}")

    public ResponseEntity<ApiResponse<OrderDTO>> getOrder(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    /**
     * 获取订单的商品详情
     */
    @GetMapping("/{id}/details")

    public ResponseEntity<ApiResponse<List<OrderDetailDTO>>> getOrderDetails(@PathVariable Long id) {
        List<OrderDetailDTO> details = orderService.getOrderDetails(id);
        return ResponseEntity.ok(ApiResponse.success(details));
    }
    
    /**
     * 订单退款
     */
    @PostMapping("/refund")

    public ResponseEntity<ApiResponse<OrderDTO>> refundOrder(@Valid @RequestBody RefundOrderDTO refundDTO) {
        // 设置操作人信息
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            // 此处简化处理，实际应从认证对象中获取管理员ID和名称
            refundDTO.setOperatorName(authentication.getName());
        }
        
        OrderDTO order = orderService.refundOrder(refundDTO);
        return ResponseEntity.ok(ApiResponse.success("订单退款成功", order));
    }
    
    /**
     * 生成取餐号（仅用于API测试，实际业务中取餐号由支付时自动生成）
     */
    @GetMapping("/generate-take-number")

    public ResponseEntity<ApiResponse<String>> generateTakeNumber() {
        String takeNumber = orderService.generateTakeNumber();
        return ResponseEntity.ok(ApiResponse.success("取餐号生成成功", takeNumber));
    }
    
    /**
     * 获取今日订单统计
     */
    @GetMapping("/today-stats")

    public ResponseEntity<ApiResponse<Map<String, Object>>> getTodayOrderStats() {
        Map<String, Object> stats = orderService.getTodayOrderStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 获取指定日期范围内的订单统计
     * 
     * @param startDate 开始日期（可选，默认为30天前）
     * @param endDate 结束日期（可选，默认为今天）
     * @return 包含日期范围内订单统计信息的响应
     */
    @GetMapping("/date-range-stats")

    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrderStatsByDateRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> stats = orderService.getOrderStatsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 获取收入统计
     * 
     * @param startDate 开始日期（可选，默认为30天前）
     * @param endDate 结束日期（可选，默认为今天）
     * @return 包含收入统计信息的响应
     */
    @GetMapping("/income-stats")

    public ResponseEntity<ApiResponse<Map<String, Object>>> getIncomeStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> stats = orderService.getIncomeStats(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
} 