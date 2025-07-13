<template>
	<view class="detail-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-btn" @click="goBack">
				<image src="/static/icons/common/back.svg" class="back-icon"></image>
			</view>
			<view class="title">订单详情</view>
			<view class="navbar-right"></view>
		</view>
		
		<!-- 加载中提示 -->
		<view class="loading-box" v-if="loading">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>
		
		<!-- 使用scroll-view作为主滚动容器 -->
		<scroll-view 
			v-else
			scroll-y 
			:scroll-top="scrollTop" 
			class="detail-scroll-view" 
			enable-back-to-top
			:enhanced="true"
			:bounces="true"
			:show-scrollbar="true"
			@scroll="onScroll"
		>
			<!-- 订单状态卡片 -->
			<view class="status-card">
				<view class="status-header">
					<text class="status-text">{{orderStatusText}}</text>
					<text class="order-id">订单号: {{orderDetail.orderNo}}</text>
				</view>
				<view class="status-timeline" v-if="orderDetail.status !== 5">
					<view class="timeline-item" :class="{'completed': orderDetail.status >= 0}">
						<view class="timeline-dot"></view>
						<view class="timeline-info">
							<text class="timeline-title">订单已提交</text>
							<text class="timeline-time" v-if="orderDetail.createdAt">{{formatDate(orderDetail.createdAt)}}</text>
						</view>
					</view>
					<view class="timeline-line" :class="{'completed': orderDetail.status >= 1}"></view>
					<view class="timeline-item" :class="{'completed': orderDetail.status >= 1}">
						<view class="timeline-dot"></view>
						<view class="timeline-info">
							<text class="timeline-title">支付成功</text>
							<text class="timeline-time" v-if="orderDetail.paymentTime">{{formatDate(orderDetail.paymentTime)}}</text>
							<text class="timeline-time" v-if="orderDetail.takeNo">取餐号: {{orderDetail.takeNo}}</text>
						</view>
					</view>
				</view>
				<view class="status-canceled" v-else>
					<text class="canceled-text">订单已取消</text>
					<text class="canceled-time" v-if="orderDetail.cancelTime">{{formatDate(orderDetail.cancelTime)}}</text>
					<!-- 退款信息 -->
					<view class="refund-info" v-if="orderDetail.refundInfo">
						<text class="refund-reason">退款原因: {{orderDetail.refundInfo.reason || '无'}}</text>
						<text class="refund-time" v-if="orderDetail.refundInfo.refundTime">退款时间: {{formatDate(orderDetail.refundInfo.refundTime)}}</text>
					</view>
				</view>
			</view>
			
			<!-- 取餐信息 -->
			<view class="detail-section" v-if="orderDetail.status === 1">
				<view class="section-title">取餐信息</view>
				<view class="pickup-info">
					<view class="pickup-item">
						<text class="pickup-value">{{orderDetail.takeNo}}</text>
					</view>
					<view class="pickup-note">
						<text>请凭取餐号到门店取餐</text>
					</view>
				</view>
			</view>
			
			<!-- 商品信息 -->
			<view class="detail-section">
				<view class="section-title">商品信息</view>
				<view 
					class="product-item" 
					v-for="(product, index) in orderDetail.orderDetails" 
					:key="index"
				>
					<image class="product-image" :src="product.productImage" mode="aspectFill"></image>
					<view class="product-info">
						<view class="product-name">{{product.productName}}</view>
						<view class="product-spec" v-if="product.temperature || product.sweetness">
							<text v-if="product.temperature">{{product.temperature}}</text>
							<text v-if="product.temperature && product.sweetness"> / </text>
							<text v-if="product.sweetness">{{product.sweetness}}</text>
						</view>
						<view class="product-ingredients" v-if="product.ingredients && product.ingredients.length > 0">
							配料: 
							<text v-for="(ing, iIndex) in product.ingredients" :key="iIndex">
								{{ing.name}}{{iIndex < product.ingredients.length - 1 ? '、' : ''}}
							</text>
						</view>
					</view>
					<view class="product-price-qty">
						<view class="product-price">¥{{product.price.toFixed(2)}}</view>
						<view class="product-qty">x{{product.quantity}}</view>
					</view>
				</view>
			</view>
			
			<!-- 订单金额 -->
			<view class="detail-section">
				<view class="section-title">订单金额</view>
				<view class="price-list">
					<!-- 商品总价 -->
					<view class="price-item">
						<text class="price-label">商品总价</text>
						<text class="price-value">¥{{orderDetail.totalAmount.toFixed(2)}}</text>
					</view>
					<!-- 优惠金额 -->
					<view class="price-item" v-if="orderDetail.couponAmount > 0">
						<text class="price-label">优惠金额</text>
						<text class="price-value discount">-¥{{orderDetail.couponAmount.toFixed(2)}}</text>
					</view>
					<!-- 实付金额 -->
					<view class="price-item total">
						<text class="price-label">实付金额</text>
						<text class="price-value">¥{{(orderDetail.displayAmount || orderDetail.paymentAmount).toFixed(2)}}</text>
					</view>
				</view>
			</view>
			
			<!-- 支付信息 -->
			<view class="detail-section" v-if="orderDetail.status > 0">
				<view class="section-title">支付信息</view>
				<view class="payment-info">
					<view class="payment-item">
						<text class="payment-label">支付方式</text>
						<text class="payment-value">{{getPaymentMethodText(orderDetail.paymentMethod)}}</text>
					</view>
					<view class="payment-item" v-if="orderDetail.paymentTime">
						<text class="payment-label">支付时间</text>
						<text class="payment-value">{{formatDate(orderDetail.paymentTime)}}</text>
					</view>
					<view class="payment-item" v-if="orderDetail.transactionId">
						<text class="payment-label">交易单号</text>
						<text class="payment-value">{{orderDetail.transactionId}}</text>
					</view>
				</view>
			</view>
			
			<!-- 订单操作按钮 -->
			<view class="detail-actions" v-if="orderDetail.status === 0">
				<button class="action-btn cancel-btn" @click="cancelOrder">取消订单</button>
				<button class="action-btn pay-btn" @click="payOrder">去支付</button>
			</view>
			
			<!-- 底部安全区域，确保内容不被遮挡 -->
			<view class="safe-area-inset-bottom"></view>
		</scroll-view>
		
		<!-- 支付确认弹窗 -->
		<view class="payment-popup" v-if="showPaymentPopup">
			<view class="popup-mask" @click="closePopup"></view>
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">订单支付</text>
					<text class="popup-close" @click="closePopup">×</text>
				</view>
				
				<view class="popup-body">
					<view class="payment-amount-info">
						<view class="payment-amount">¥{{ orderDetail.paymentAmount.toFixed(2) }}</view>
						<view class="payment-order-no">订单号: {{orderDetail.orderNo || ''}}</view>
					</view>
					
					<view class="payment-methods">
						<view 
							class="payment-method-item" 
							:class="{'active': paymentMethod === 'wechat'}"
							@click="selectPaymentMethod('wechat')"
						>
							<view class="payment-method-content">
								<view class="payment-icon payment-icon-wechat">
									<image src="/static/icons/payment/wechat.svg" mode="aspectFit" class="payment-icon-img"></image>
								</view>
								<text class="payment-name">微信支付</text>
							</view>
							<text class="payment-select" v-if="paymentMethod === 'wechat'">✓</text>
						</view>
						
						<view 
							class="payment-method-item" 
							:class="{'active': paymentMethod === 'alipay'}"
							@click="selectPaymentMethod('alipay')"
						>
							<view class="payment-method-content">
								<view class="payment-icon payment-icon-alipay">
									<image src="/static/icons/payment/alipay.svg" mode="aspectFit" class="payment-icon-img"></image>
								</view>
								<text class="payment-name">支付宝</text>
							</view>
							<text class="payment-select" v-if="paymentMethod === 'alipay'">✓</text>
						</view>
					</view>
				</view>
				
				<view class="popup-footer">
					<button class="confirm-payment-btn" @click="confirmPayment">确认支付</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import api from '@/utils/api.js';
	
	export default {
		data() {
			return {
				loading: true,
				orderNo: '',
				orderDetail: {},
				showPaymentPopup: false,
				paymentMethod: 'wechat',
				scrollTop: 0 // 新增滚动位置控制
			}
		},
		computed: {
			orderStatusText() {
				switch(this.orderDetail.status) {
					case 0:
						return '待支付';
					case 1:
						return '已支付';
					case 2:
						return '已完成';
					case 3:
						return '退款中';
					case 4:
						return '已退款';
					case 5:
						return '已取消';
					case 6:
						return '拒绝退款';
					default:
						return '未知状态';
				}
			}
		},
		onLoad(options) {
			if (options.orderNo) {
				this.orderNo = options.orderNo;
				this.loadOrderDetail();
			} else {
				uni.showToast({
					title: '订单号不存在',
					icon: 'none'
				});
				setTimeout(() => {
					this.goBack();
				}, 1500);
			}
		},
		methods: {
			// 新增滚动事件处理
			onScroll(e) {
				// 可用于处理滚动事件
			},
			
			// 返回上一页
			goBack() {
				// 如果订单未支付或已取消，返回到订单列表页（tabBar页面）
				if (this.orderDetail && (this.orderDetail.status === 0 || this.orderDetail.status === 5)) {
					console.log('订单状态:', this.orderDetail.status, '跳转到订单列表页');
					uni.switchTab({
						url: '/pages/order/order'
					});
				} else {
					// 其他状态直接返回上一页
					console.log('订单状态:', this.orderDetail.status, '返回上一页');
					uni.navigateBack();
				}
			},
			
			// 加载订单详情
			loadOrderDetail() {
				this.loading = true;
				
				api.getOrderDetail(this.orderNo)
					.then(res => {
						console.log('订单详情响应:', res.data);
						if (res.data.code === 200) {
							let orderData = res.data.data;
							
							// 确保有优惠金额字段
							if (typeof orderData.couponAmount === 'undefined') {
								// 如果后端没有返回优惠金额，尝试从其他字段计算
								if (orderData.totalAmount && orderData.paymentAmount) {
									orderData.couponAmount = orderData.totalAmount - orderData.paymentAmount;
								} else {
									orderData.couponAmount = 0;
								}
							}
							
							this.orderDetail = orderData;
							console.log('处理后的订单数据:', this.orderDetail);
						} else {
							uni.showToast({
								title: res.data.message || '获取订单详情失败',
								icon: 'none'
							});
						}
					})
					.catch(err => {
						console.error('网络请求失败:', err);
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
					})
					.finally(() => {
						this.loading = false;
				});
			},
			
			// 格式化日期
			formatDate(dateStr) {
				if (!dateStr) return '';
				
				// 假设日期格式: 2025-04-24 18:47:20
				const parts = dateStr.split(' ');
				if (parts.length >= 1) {
					const datePart = parts[0];
					const timePart = parts.length > 1 ? parts[1] : '';
					
					return `${datePart} ${timePart.substring(0, 5)}`;
				}
				
				return dateStr;
			},
			
			// 获取支付方式文本
			getPaymentMethodText(method) {
				switch(method) {
					case 'wechat':
						return '微信支付';
					case 'alipay':
						return '支付宝';
					default:
						return method || '未知方式';
				}
			},
			
			// 取消订单
			cancelOrder() {
				uni.showModal({
					title: '提示',
					content: '确定要取消该订单吗？',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '取消中...'
							});
							
							api.cancelOrder(this.orderNo)
								.then(res => {
									console.log('取消订单响应:', res.data);
									if (res.data.code === 200) {
										uni.showToast({
											title: '订单已取消',
											icon: 'success'
										});
										
										// 设置状态为已取消，延迟两秒后跳转到订单列表页
										setTimeout(() => {
											// 更新当前订单状态为已取消(5)
											if (this.orderDetail) {
												this.orderDetail.status = 5;
											}
											uni.switchTab({
												url: '/pages/order/order'
											});
										}, 1500);
									} else {
										uni.showToast({
											title: res.data.message || '取消订单失败',
											icon: 'none'
										});
									}
								})
								.catch(err => {
									console.error('网络请求失败:', err);
									uni.showToast({
										title: '网络请求失败',
										icon: 'none'
									});
								})
								.finally(() => {
									uni.hideLoading();
							});
						}
					}
				});
			},
			
			// 显示支付弹窗
			payOrder() {
				this.showPaymentPopup = true;
				// 弹窗打开时初始化默认支付方式为微信支付
				this.paymentMethod = 'wechat';
			},
			
			// 关闭弹窗
			closePopup() {
				this.showPaymentPopup = false;
			},
			
			// 确认支付
			confirmPayment() {
				uni.showLoading({
					title: '支付中...'
				});
				
				// 确认当前选择的支付方式
				const currentPaymentMethod = this.paymentMethod;
				console.log('[确认支付] 准备支付订单:', this.orderNo);
				console.log('[确认支付] 选择的支付方式:', currentPaymentMethod);
				
				// 使用api.js中的payOrder方法
				api.payOrder(this.orderNo, currentPaymentMethod)
					.then(res => {
						console.log('[API调用] 支付订单响应:', res.data);
						if (res.data.code === 200) {
							uni.showToast({
								title: '支付成功',
								icon: 'success'
							});
							
							// 关闭弹窗
							this.closePopup();
							
							// 检查是否需要更新购物车
							this.checkAndUpdateCart();
							
							// 刷新优惠券状态
							this.refreshCouponsAfterPayment();
							
							// 显示支付成功提示后跳转到订单列表页
							setTimeout(() => {
								uni.switchTab({
									url: '/pages/order/order'
								});
							}, 1500);
						} else {
							uni.showToast({
								title: res.data.message || '支付失败',
								icon: 'none'
							});
						}
					})
					.catch(err => {
						console.error('[API调用] 网络请求失败:', err);
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
					})
					.finally(() => {
						uni.hideLoading();
					});
			},
			
			// 刷新优惠券状态
			refreshCouponsAfterPayment() {
				// 发送请求刷新优惠券列表
				api.refreshCoupons()
					.then(res => {
						console.log('支付后刷新优惠券状态:', res.data);
						// 只是触发后端接口更新优惠券状态，不需要处理返回数据
					})
					.catch(err => {
						console.error('刷新优惠券状态失败:', err);
				});
			},
			
			// 检查并更新购物车状态
			checkAndUpdateCart() {
				// 获取购物车状态，检查是否有需要移除的商品
				api.getCart()
					.then(res => {
						console.log('获取购物车信息:', res.data);
						
						// 检查是否有已选择的商品，如果有则移除
						let hasSelectedItems = false;
						
						// 根据不同的响应结构处理数据
						if (res.data && res.data.code === 200 && res.data.data && res.data.data.items) {
							hasSelectedItems = res.data.data.items.some(item => item.selected);
						} else if (Array.isArray(res.data)) {
							hasSelectedItems = res.data.some(item => item.selected);
						} else if (res.data && res.data.items) {
							hasSelectedItems = res.data.items.some(item => item.selected);
						}
						
						// 如果有选中的商品，则移除它们
						if (hasSelectedItems) {
							this.clearSelectedCartItems();
						}
					})
					.catch(err => {
						console.error('获取购物车信息失败:', err);
				});
			},
			
			// 清空已选中的购物车商品
			clearSelectedCartItems() {
				api.clearSelectedCartItems()
					.then(res => {
						console.log('移除已选择的购物车商品成功:', res.data);
					})
					.catch(err => {
						console.error('移除购物车商品失败:', err);
				});
			},
			
			// 选择支付方式
			selectPaymentMethod(method) {
				this.paymentMethod = method;
			}
		}
	}
</script>

<style>
	.detail-container {
		height: 100vh;
		background-color: #121212;
		width: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	/* 顶部导航栏 */
	.navbar {
		display: flex;
		align-items: center;
		height: calc(90rpx + var(--status-bar-height) + 20rpx);
		background-color: #1a1a1a;
		padding: 0;
		padding-top: calc(var(--status-bar-height) + 20rpx);
		position: relative;
		z-index: 100;
		width: 100%;
		box-sizing: border-box;
		justify-content: space-between;
		flex-shrink: 0;
	}
	
	.back-btn {
		width: 50rpx;
		height: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 30rpx;
	}
	
	.back-icon {
		width: 40rpx;
		height: 40rpx;
	}
	
	.title {
		flex: 1;
		text-align: center;
		font-size: 32rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.navbar-right {
		width: 100rpx;
	}
	
	/* 加载中 */
	.loading-box {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	
	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid #7b68ee;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 20rpx;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.loading-text {
		font-size: 26rpx;
		color: #888888;
	}
	
	/* 滚动视图 */
	.detail-scroll-view {
		flex: 1;
		height: 0; /* 重要: 当使用flex:1时，需要设置初始高度为0 */
		width: 100%;
		box-sizing: border-box;
		padding: 15rpx;
	}
	
	/* 卡片和部分样式 */
	.status-card,
	.detail-section {
		background-color: #1a1a1a;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
		padding: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
		width: 100%;
		box-sizing: border-box;
	}
	
	/* 底部安全区域 */
	.safe-area-inset-bottom {
		height: 50rpx;
		width: 100%;
	}
	
	/* 订单状态卡片 */
	.status-card {
		background-color: #1a1a1a;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
		padding: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
		width: 100%;
		box-sizing: border-box;
	}
	
	.status-header {
		display: flex;
		flex-direction: column;
		margin-bottom: 25rpx;
	}
	
	.status-text {
		font-size: 32rpx;
		color: #7b68ee;
		font-weight: bold;
		margin-bottom: 8rpx;
	}
	
	.order-id {
		font-size: 22rpx;
		color: #888888;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	/* 订单状态时间线 */
	.status-timeline {
		display: flex;
		flex-direction: column;
		padding: 15rpx 0;
	}
	
	.timeline-item {
		display: flex;
		align-items: flex-start;
		position: relative;
	}
	
	.timeline-dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		background-color: #2a2a2a;
		margin-top: 8rpx;
		margin-right: 16rpx;
		flex-shrink: 0;
	}
	
	.timeline-item.completed .timeline-dot {
		background-color: #7b68ee;
	}
	
	.timeline-line {
		width: 4rpx;
		height: 40rpx;
		background-color: #2a2a2a;
		margin-left: 6rpx;
		margin-right: 28rpx;
	}
	
	.timeline-line.completed {
		background-color: #7b68ee;
	}
	
	.timeline-info {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	
	.timeline-title {
		font-size: 26rpx;
		color: #888888;
		margin-bottom: 6rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.timeline-item.completed .timeline-title {
		color: #ffffff;
	}
	
	.timeline-time {
		font-size: 22rpx;
		color: #666666;
	}
	
	/* 取消状态 */
	.status-canceled {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 0 10rpx;
	}
	
	.canceled-text {
		font-size: 30rpx;
		color: #888888;
		margin-bottom: 8rpx;
	}
	
	.canceled-time {
		font-size: 22rpx;
		color: #666666;
		margin-bottom: 10rpx;
	}
	
	/* 退款信息 */
	.refund-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: rgba(255, 107, 107, 0.1);
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
		margin-top: 5rpx;
		width: 80%;
	}
	
	.refund-reason {
		font-size: 22rpx;
		color: #ff6b6b;
		margin-bottom: 5rpx;
	}
	
	.refund-time {
		font-size: 22rpx;
		color: #ff6b6b;
	}
	
	/* 订单详情部分 */
	.detail-section {
		background-color: #1a1a1a;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
		padding: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
		width: 100%;
		box-sizing: border-box;
	}
	
	.section-title {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: bold;
		margin-bottom: 15rpx;
		position: relative;
		padding-left: 16rpx;
	}
	
	.section-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 6rpx;
		height: 24rpx;
		width: 5rpx;
		background-color: #7b68ee;
		border-radius: 3rpx;
	}
	
	/* 配送信息 */
	.pickup-info {
		padding: 20rpx 0;
	}
	
	.pickup-item {
		display: flex;
		justify-content: center;
		margin-bottom: 20rpx;
	}
	
	.pickup-value {
		color: #ffffff;
		font-size: 60rpx;
		font-weight: bold;
		text-shadow: 0 0 8rpx rgba(123, 104, 238, 0.6);
		text-align: center;
	}
	
	.pickup-note {
		font-size: 24rpx;
		color: #888888;
		padding: 10rpx 0;
		text-align: center;
	}
	
	/* 商品信息 */
	.product-item {
		display: flex;
		padding: 12rpx 0;
		border-bottom: 1rpx solid #2a2a2a;
	}
	
	.product-item:last-child {
		border-bottom: none;
	}
	
	.product-image {
		width: 90rpx;
		height: 90rpx;
		border-radius: 8rpx;
		background-color: #2a2a2a;
		flex-shrink: 0;
	}
	
	.product-info {
		flex: 1;
		margin-left: 12rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 0;
		overflow: hidden;
	}
	
	.product-name {
		font-size: 24rpx;
		color: #ffffff;
		margin-bottom: 6rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.product-spec {
		font-size: 22rpx;
		color: #888888;
		margin-bottom: 6rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.product-ingredients {
		font-size: 20rpx;
		color: #888888;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.product-price-qty {
		min-width: 90rpx;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		flex-shrink: 0;
	}
	
	.product-price {
		font-size: 24rpx;
		color: #ffffff;
		margin-bottom: 6rpx;
	}
	
	.product-qty {
		font-size: 22rpx;
		color: #888888;
	}
	
	/* 订单金额 */
	.price-list {
		display: flex;
		flex-direction: column;
	}
	
	.price-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 15rpx;
	}
	
	.price-label {
		font-size: 26rpx;
		color: #888888;
	}
	
	.price-value {
		font-size: 26rpx;
		color: #ffffff;
	}
	
	.price-value.discount {
		color: #ff6b6b;
	}
	
	.price-item.total {
		border-top: 1rpx solid #2a2a2a;
		padding-top: 15rpx;
		margin-top: 15rpx;
	}
	
	.price-label.total, .price-value.total {
		font-size: 28rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	/* 支付信息 */
	.payment-info {
		display: flex;
		flex-direction: column;
	}
	
	.payment-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 15rpx;
	}
	
	.payment-label {
		font-size: 26rpx;
		color: #888888;
	}
	
	.payment-value {
		font-size: 26rpx;
		color: #ffffff;
		max-width: 60%;
		text-align: right;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	/* 订单操作按钮 */
	.detail-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 25rpx;
	}
	
	.action-btn {
		width: 47%;
		height: 70rpx;
		border-radius: 35rpx;
		font-size: 26rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.cancel-btn {
		background-color: transparent;
		color: #ffffff;
		border: 2rpx solid #ffffff;
	}
	
	.pay-btn {
		background-color: #7b68ee;
		color: #ffffff;
		border: none;
	}
	
	/* 支付弹窗 */
	.payment-popup {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1000;
	}
	
	.popup-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
	}
	
	.popup-content {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: #1a1a1a;
		border-radius: 30rpx 30rpx 0 0;
		overflow: hidden;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}
	
	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1rpx solid #2a2a2a;
	}
	
	.popup-title {
		font-size: 30rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.popup-close {
		font-size: 36rpx;
		color: #888888;
		padding: 0 15rpx;
	}
	
	.popup-body {
		padding: 20rpx 30rpx;
		flex: 1;
	}
	
	.popup-footer {
		padding: 20rpx 30rpx 40rpx 30rpx;
		border-top: 1rpx solid #2a2a2a;
	}
	
	.payment-amount-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.payment-amount {
		font-size: 50rpx;
		color: #ffffff;
		font-weight: bold;
		margin-bottom: 8rpx;
	}
	
	.payment-order-no {
		font-size: 22rpx;
		color: #888888;
		max-width: 90%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.payment-methods {
		margin-bottom: 25rpx;
		width: 100%;
	}
	
	.payment-method-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 25rpx 20rpx;
		border-radius: 12rpx;
		margin-bottom: 15rpx;
		background-color: #2a2a2a;
		position: relative;
		border: 1px solid transparent;
	}
	
	.payment-method-item.active {
		background-color: rgba(123, 104, 238, 0.1);
		border: 1px solid #7b68ee;
	}
	
	.payment-method-content {
		display: flex;
		align-items: center;
		flex: 1;
	}
	
	.payment-icon {
		width: 50rpx;
		height: 50rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.payment-icon-img {
		width: 36rpx;
		height: 36rpx;
	}
	
	.payment-icon-wechat {
		color: #09BB07;
	}
	
	.payment-icon-alipay {
		color: #1677FF;
	}
	
	.payment-name {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: 500;
	}
	
	.payment-select {
		color: #7b68ee;
		font-size: 32rpx;
		margin-right: 10rpx;
	}
	
	.confirm-payment-btn {
		width: 100%;
		height: 80rpx;
		background-color: #7b68ee;
		color: #ffffff;
		border-radius: 40rpx;
		font-size: 28rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border: none;
	}
	
	/* 优惠券选择弹窗 */
	.coupon-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1001; /* 确保优惠券弹窗在支付弹窗之上 */
	}
	
	.coupon-modal-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
	}
	
	.coupon-modal-container {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		max-height: 80vh;
		background-color: #1a1a1a;
		border-radius: 30rpx 30rpx 0 0;
		overflow: hidden;
		box-sizing: border-box;
	}
	
	.coupon-modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #2a2a2a;
		width: 100%;
		box-sizing: border-box;
	}
	
	.coupon-modal-title {
		font-size: 32rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.coupon-modal-close {
		font-size: 36rpx;
		color: #888888;
		padding: 0 15rpx;
	}
	
	.coupon-modal-content {
		padding: 20rpx 30rpx;
		max-height: 60vh;
		overflow-y: auto;
		width: 100%;
		box-sizing: border-box;
	}
	
	.coupon-list {
		margin-bottom: 25rpx;
		width: 100%;
	}
	
	.coupon-card {
		display: flex;
		position: relative;
		margin: 20rpx 0;
		padding: 30rpx 20rpx;
		background: linear-gradient(135deg, #2a2a2a 0%, #222222 100%);
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
		overflow: hidden;
		align-items: center;
	}
	
	.coupon-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		width: 10rpx;
		height: 100%;
		background-color: #7b68ee;
		border-radius: 10rpx 0 0 10rpx;
	}
	
	.coupon-card.selected {
		background: linear-gradient(135deg, #332e59 0%, #1a1842 100%);
		border: 1rpx solid #7b68ee;
	}
	
	.coupon-left {
		flex: 3;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 10rpx 20rpx;
		position: relative;
		z-index: 1;
		min-width: 160rpx;
	}
	
	.coupon-amount {
		font-size: 40rpx;
		font-weight: bold;
		color: #7b68ee;
		margin-bottom: 10rpx;
	}
	
	.coupon-condition {
		font-size: 22rpx;
		color: #999999;
		margin-top: 8rpx;
		background-color: rgba(123, 104, 238, 0.1);
		padding: 6rpx 12rpx;
		border-radius: 10rpx;
		display: inline-block;
		white-space: nowrap;
	}
	
	.coupon-right {
		flex: 5;
		padding: 10rpx 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		z-index: 1;
	}
	
	.coupon-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 8rpx;
	}
	
	.coupon-desc {
		font-size: 24rpx;
		color: #aaaaaa;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	
	.coupon-date {
		font-size: 22rpx;
		color: #888888;
		background-color: rgba(255, 255, 255, 0.05);
		padding: 4rpx 10rpx;
		border-radius: 8rpx;
		display: inline-block;
	}
	
	.coupon-select-icon {
		position: absolute;
		right: 20rpx;
		top: 20rpx;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background-color: #7b68ee;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2;
	}
	
	.check-icon {
		font-size: 26rpx;
		color: #ffffff;
	}
	
	.no-coupons {
		font-size: 26rpx;
		color: #888888;
		text-align: center;
		padding: 40rpx 0;
	}
	
	.coupon-modal-footer {
		display: flex;
		justify-content: center;
		padding: 30rpx;
		gap: 20rpx;
		width: 100%;
		box-sizing: border-box;
	}
	
	.coupon-cancel-btn,
	.coupon-confirm-btn {
		width: 45%;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 40rpx;
		font-size: 28rpx;
		border: none;
	}
	
	.coupon-cancel-btn {
		background-color: #333333;
		color: #aaaaaa;
	}
	
	.coupon-confirm-btn {
		background-color: #7b68ee;
		color: #ffffff;
	}
	
	/* 支付弹窗中的优惠券选择 */
	.coupon-selection {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 15rpx;
		border-radius: 12rpx;
		background-color: #2a2a2a;
		margin-bottom: 20rpx;
		position: relative;
	}
	
	.coupon-label {
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.coupon-value {
		display: flex;
		align-items: center;
	}
	
	.coupon-value text.discount-text {
		font-size: 28rpx;
		color: #ff6b6b;
		font-weight: 500;
	}
	
	.coupon-value text.normal-text {
		font-size: 28rpx;
		color: #7b68ee;
	}
	
	.coupon-arrow {
		font-size: 28rpx;
		color: #888888;
		margin-left: 10rpx;
	}
	
	/* 优惠明细 */
	.discount-detail {
		margin-bottom: 20rpx;
		padding: 15rpx;
		background-color: #222222;
		border-radius: 10rpx;
	}
	
	.discount-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10rpx;
	}
	
	.discount-label {
		font-size: 24rpx;
		color: #888888;
	}
	
	.discount-value {
		font-size: 24rpx;
		color: #ffffff;
	}
	
	.coupon-discount {
		color: #ff6b6b;
	}
	
	/* 为选中的支付方式添加特殊效果 */
	.payment-method-item.active .payment-name {
		color: #7b68ee;
		font-weight: bold;
	}
	
	/* 调整各支付图标大小以适配布局 */
	.payment-icon svg {
		width: 32rpx;
		height: 32rpx;
	}
	
	/* 根据设备尺寸自动调整支付按钮 */
	@media screen and (max-width: 375px) {
		.payment-method-item {
			padding: 20rpx 15rpx;
		}
		
		.payment-name {
			font-size: 26rpx;
		}
		
		.payment-icon svg {
			width: 28rpx;
			height: 28rpx;
		}
	}
	
	.coupon-notice {
		background-color: #2a2a2a;
		padding: 15rpx 20rpx;
		margin: 15rpx 0 20rpx;
		border-radius: 8rpx;
		border-left: 4rpx solid #ff9800;
	}
	
	.coupon-notice text {
		font-size: 24rpx;
		color: #ff9800;
	}
</style> 