import request from '../utils/request'
import qs from 'qs'

// 管理员登录
export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

// 获取今日订单统计数据（用于首页展示）
export function getTodayOrderStats() {
  return request({
    url: '/admin/orders/today-stats',
    method: 'get'
  })
}

// 获取会员统计信息（用于首页展示）
export function getMemberStats() {
  return request({
    url: '/admin/users/stats',
    method: 'get'
  })
}

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
  })
}

// 更新用户状态
export function updateUserStatus(id, status) {
  return request({
    url: `/admin/users/${id}/status/${status}`,
    method: 'put'
  })
}

// 调整会员积分
export function adjustUserPoints(data) {
  return request({
    url: '/admin/users/points/adjust',
    method: 'post',
    data
  })
}

// 同步会员等级
export function syncMemberLevels() {
  return request({
    url: '/admin/user-management/sync-member-levels',
    method: 'post'
  })
}

// 获取会员积分记录
export function getUserPoints(id, params) {
  return request({
    url: `/admin/users/${id}/points`,
    method: 'get',
    params
  })
}

// 获取所有积分记录
export function getAllPointsRecords(params) {
  return request({
    url: '/admin/users/points',
    method: 'get',
    params
  })
}

// 获取订单列表
export function getOrderList(params) {
  return request({
    url: '/admin/orders',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/admin/orders/${id}`,
    method: 'get'
  })
}

// 获取订单商品详情
export function getOrderDetails(id) {
  return request({
    url: `/admin/orders/${id}/details`,
    method: 'get'
  })
}

// 订单退款
export function refundOrder(data) {
  return request({
    url: '/admin/orders/refund',
    method: 'post',
    data
  })
}

// 获取退款列表
export function getRefundList(params) {
  return request({
    url: '/admin/refund/list',
    method: 'get',
    params
  })
}

// 获取退款详情
export function getRefundDetail(id) {
  return request({
    url: `/admin/refund/${id}`,
    method: 'get'
  })
}

// 获取订单的退款记录
export function getOrderRefunds(orderId) {
  return request({
    url: `/admin/refund/order/${orderId}`,
    method: 'get'
  })
}

// 处理退款申请
export function processRefund(data) {
  return request({
    url: '/admin/refund/process',
    method: 'post',
    data
  })
}

// 获取日期范围内订单统计
export function getDateRangeOrderStats(params) {
  return request({
    url: '/admin/orders/date-range-stats',
    method: 'get',
    params
  })
}

// 获取收入统计
export function getIncomeStats(params) {
  return request({
    url: '/admin/orders/income-stats',
    method: 'get',
    params
  })
}

// 获取商品销量排行
export function getProductSalesRanking(params) {
  return request({
    url: '/admin/product/sales/ranking',
    method: 'get',
    params
  })
}

// 分页获取商品列表
export function getProductList(params) {
  return request({
    url: '/admin/product/page',
    method: 'get',
    params
  })
}

// 获取商品详情
export function getProductDetail(id) {
  return request({
    url: `/admin/product/${id}`,
    method: 'get'
  })
}

// 创建商品
export function createProduct(data) {
  return request({
    url: '/admin/product',
    method: 'post',
    data
  })
}

// 更新商品
export function updateProduct(id, data) {
  return request({
    url: `/admin/product/${id}`,
    method: 'put',
    data
  })
}

// 更新商品状态
export function updateProductStatus(id, status) {
  return request({
    url: `/admin/product/${id}/status`,
    method: 'put',
    params: { status }
  })
}

// 更新商品推荐状态
export function updateProductRecommend(id, isRecommend) {
  return request({
    url: `/admin/product/${id}/recommend`,
    method: 'put',
    params: { isRecommend }
  })
}

// 更新商品排序
export function updateProductSort(id, sort) {
  return request({
    url: `/admin/product/${id}/sort`,
    method: 'put',
    params: { sort }
  })
}

// 删除商品
export function deleteProduct(id) {
  return request({
    url: `/admin/product/${id}`,
    method: 'delete'
  })
}

// 上传商品图片
export function uploadProductImage(formData) {
  return request({
    url: '/admin/product/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 分类管理相关API
 */

// 获取分类列表
export function getCategoryList(params) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params
  })
}

// 获取分类详情
export function getCategoryDetail(id) {
  return request({
    url: `/admin/category/${id}`,
    method: 'get'
  })
}

// 创建分类
export function createCategory(data) {
  return request({
    url: '/admin/category',
    method: 'post',
    data
  })
}

// 更新分类
export function updateCategory(id, data) {
  return request({
    url: `/admin/category/${id}`,
    method: 'put',
    data
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/admin/category/${id}`,
    method: 'delete'
  })
}

// 更新分类状态
export function updateCategoryStatus(id, data) {
  const status = data.status
  return request({
    url: `/admin/category/${id}/status`,
    method: 'get',
    params: { status }
  })
}

// 上传分类图片
export function uploadCategoryImage(data) {
  return request({
    url: '/admin/category/upload/image',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 优惠券管理相关API

// 获取优惠券列表
export function getCouponList(params) {
  return request({
    url: '/admin/coupons',
    method: 'get',
    params
  })
}

// 获取优惠券详情
export function getCouponDetail(id) {
  return request({
    url: `/admin/coupons/${id}`,
    method: 'get'
  })
}

// 创建优惠券
export function createCoupon(data) {
  return request({
    url: '/admin/coupons',
    method: 'post',
    data
  })
}

// 更新优惠券
export function updateCoupon(id, data) {
  return request({
    url: `/admin/coupons/${id}`,
    method: 'put',
    data
  })
}

// 更新优惠券状态
export function updateCouponStatus(id, status) {
  return request({
    url: `/admin/coupons/${id}/status/${status}`,
    method: 'put'
  })
}

// 删除优惠券
export function deleteCoupon(id) {
  return request({
    url: `/admin/coupons/${id}`,
    method: 'delete'
  })
}

// 获取优惠券统计数据
export function getCouponStats() {
  return request({
    url: '/admin/coupons/stats',
    method: 'get'
  })
}

// 获取用户优惠券列表
export function getUserCouponList(params) {
  return request({
    url: '/admin/coupons/user-coupons',
    method: 'get',
    params
  })
}

// 检查用户是否已领取优惠券
export function checkUserCoupon(couponId, userId) {
  return request({
    url: '/admin/coupons/check-user-coupon',
    method: 'get',
    params: { couponId, userId }
  })
}

// 发放优惠券
export function issueCoupon(data) {
  return request({
    url: '/admin/coupons/issue',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 批量发放优惠券
export function batchIssueCoupon(data) {
  return request({
    url: '/admin/coupons/batch-issue',
    method: 'post',
    data: qs.stringify(data, { arrayFormat: 'repeat' }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
} 

// 修改密码
export function changePassword(data) {
  return request({
    url: '/admin/change-password',
    method: 'put',
    data
  })
} 