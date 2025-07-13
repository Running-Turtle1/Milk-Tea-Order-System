package com.cxy.milktea.admin.controller;

import com.cxy.milktea.admin.dto.OrderRefundDTO;
import com.cxy.milktea.admin.dto.RefundProcessDTO;
import com.cxy.milktea.admin.dto.RefundQueryDTO;
import com.cxy.milktea.admin.service.OrderService;
import com.cxy.milktea.common.util.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 管理员订单退款控制器
 */
@RestController("adminOrderRefundController")
@RequestMapping("/admin/refund")
@RequiredArgsConstructor
public class OrderRefundController {

    /**
     * 订单服务
     */
    private final OrderService orderService;

    /**
     * 获取退款列表
     * 
     * @param queryDTO 查询条件
     * @param page 页码
     * @param size 每页大小
     * @return 退款列表
     */
    @GetMapping("/list")
    public Result<Page<OrderRefundDTO>> getRefunds(
            RefundQueryDTO queryDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<OrderRefundDTO> refundPage = orderService.getRefunds(queryDTO, page, size);
        return Result.success(refundPage);
    }

    /**
     * 获取退款详情
     * 
     * @param refundId 退款ID
     * @return 退款详情
     */
    @GetMapping("/{refundId}")
    public Result<OrderRefundDTO> getRefundDetail(@PathVariable Long refundId) {
        OrderRefundDTO refundDTO = orderService.getRefundById(refundId);
        return Result.success(refundDTO);
    }

    /**
     * 获取订单的退款记录
     * 
     * @param orderId 订单ID
     * @return 退款记录列表
     */
    @GetMapping("/order/{orderId}")
    public Result<List<OrderRefundDTO>> getOrderRefunds(@PathVariable Long orderId) {
        List<OrderRefundDTO> refunds = orderService.getRefundsByOrderId(orderId);
        return Result.success(refunds);
    }

    /**
     * 处理退款申请
     * 
     * @param refundProcessDTO 退款处理DTO
     * @return 处理结果
     */
    @PostMapping("/process")
    public Result<OrderRefundDTO> processRefund(@Valid @RequestBody RefundProcessDTO refundProcessDTO) {
        OrderRefundDTO refundDTO = orderService.processRefund(refundProcessDTO);
        return Result.success(refundDTO);
    }
} 