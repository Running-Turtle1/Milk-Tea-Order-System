package com.cxy.milktea.client.controller;


import com.cxy.milktea.client.dto.OrderDTO;
import com.cxy.milktea.client.dto.OrderRequest;
import com.cxy.milktea.client.service.OrderService;
import com.cxy.milktea.common.util.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

/**
 * 订单控制器
 * 处理与奶茶订单相关的HTTP请求，包括创建、支付、取消订单以及查询订单信息
 */
@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {

    /**
     * 订单服务，用于处理订单相关的业务逻辑
     */
    private final OrderService orderService;

    /**
     * 创建订单
     * 根据提交的订单请求创建新订单
     * 
     * @param orderRequest 订单请求对象，包含商品、数量、配料等信息
     * @return 返回创建的订单信息
     */
    @PostMapping("/create")
    public Result<OrderDTO> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        OrderDTO orderDTO = orderService.createOrder(orderRequest);
        return Result.success(orderDTO);
    }

    /**
     * 支付订单
     * 处理订单的支付请求
     * 
     * @param orderNo 订单编号
     * @param paymentMethod 支付方式，默认为微信支付
     * @return 返回支付后的订单信息
     */
    @PostMapping("/pay/{orderNo}")
    public Result<OrderDTO> payOrder(
            @PathVariable String orderNo,
            @RequestParam(defaultValue = "wechat") String paymentMethod) {
        OrderDTO orderDTO = orderService.payOrder(orderNo, paymentMethod);
        return Result.success(orderDTO);
    }

    /**
     * 取消订单
     * 允许用户取消未支付的订单
     * 
     * @param orderNo 要取消的订单编号
     * @return 返回取消后的订单信息
     */
    @PostMapping("/cancel/{orderNo}")
    public Result<OrderDTO> cancelOrder(@PathVariable String orderNo) {
        OrderDTO orderDTO = orderService.cancelOrder(orderNo);
        return Result.success(orderDTO);
    }
    
    /**
     * 删除订单
     * 允许用户删除已完成或已取消的订单
     * 
     * @param orderNo 要删除的订单编号
     * @return 返回操作结果
     */
    @DeleteMapping("/{orderNo}")
    public Result<Boolean> deleteOrder(@PathVariable String orderNo) {
        boolean result = orderService.deleteOrder(orderNo);
        return Result.success(result);
    }

    /**
     * 获取订单详情
     * 查询指定订单号的详细信息
     * 
     * @param orderNo 订单编号
     * @return 返回订单的详细信息
     */
    @GetMapping("/detail/{orderNo}")
    public Result<OrderDTO> getOrderDetail(@PathVariable String orderNo) {
        OrderDTO orderDTO = orderService.getOrderDetail(orderNo);
        return Result.success(orderDTO);
    }

    /**
     * 获取用户订单列表
     * 分页查询当前用户的订单历史
     * 
     * @param status 订单状态过滤条件，可选参数
     * @param page 页码，默认为0
     * @param size 每页记录数，默认为10
     * @return 返回分页的用户订单列表
     */
    @GetMapping("/list")
    public Result<Page<OrderDTO>> getUserOrders(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<OrderDTO> orderPage = orderService.getUserOrders(status, page, size);
        return Result.success(orderPage);
    }
} 