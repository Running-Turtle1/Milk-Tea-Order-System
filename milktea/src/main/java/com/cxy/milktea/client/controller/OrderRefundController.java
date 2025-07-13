package com.cxy.milktea.client.controller;

import com.cxy.milktea.client.dto.RefundDTO;
import com.cxy.milktea.client.dto.RefundRequestDTO;
import com.cxy.milktea.client.service.OrderService;
import com.cxy.milktea.common.util.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

/**
 * 订单退款控制器
 * 处理与订单退款相关的HTTP请求
 */
@RestController("clientOrderRefundController")
@RequestMapping("/refund")
@RequiredArgsConstructor
public class OrderRefundController {

    /**
     * 订单服务，用于处理订单相关的业务逻辑
     */
    private final OrderService orderService;

    /**
     * 申请退款
     * 
     * @param refundRequest 退款请求对象
     * @return 返回创建的退款信息
     */
    @PostMapping("/apply")
    public Result<RefundDTO> applyRefund(@Valid @RequestBody RefundRequestDTO refundRequest) {
        RefundDTO refundDTO = orderService.applyRefund(refundRequest);
        return Result.success(refundDTO);
    }

    /**
     * 获取退款详情
     * 
     * @param refundId 退款ID
     * @return 返回退款的详细信息
     */
    @GetMapping("/detail/{refundId}")
    public Result<RefundDTO> getRefundDetail(@PathVariable Long refundId) {
        RefundDTO refundDTO = orderService.getRefundDetail(refundId);
        return Result.success(refundDTO);
    }

    /**
     * 获取用户退款列表
     * 
     * @param status 退款状态过滤条件，可选参数
     * @param page 页码，默认为0
     * @param size 每页记录数，默认为10
     * @return 返回分页的用户退款列表
     */
    @GetMapping("/list")
    public Result<Page<RefundDTO>> getUserRefunds(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<RefundDTO> refundPage = orderService.getUserRefunds(status, page, size);
        return Result.success(refundPage);
    }
} 