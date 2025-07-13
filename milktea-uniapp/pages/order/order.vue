<template>
	<view class="order-container">
		<!-- 标签切换栏 -->
		<view class="tabs">
			<view 
				v-for="(tab, index) in tabs" 
				:key="index" 
				:class="['tab-item', activeTab === index ? 'active' : '']"
				@click="switchTab(index)"
			>
				<text>{{tab}}</text>
			</view>
		</view>
		
		<!-- 订单列表 -->
		<scroll-view 
			class="order-list" 
			scroll-y="true"
			@scrolltolower="loadMore"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@click="closeAllSwipe"
		>
			<!-- 加载中提示 -->
			<view class="loading-box" v-if="loading && !refreshing && orders.length === 0">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
			
			<!-- 空状态显示 -->
			<view class="empty-state" v-if="orders.length === 0 && !loading">
				<image src="/static/tabbar/order.png" class="empty-icon"></image>
				<text class="empty-text">{{emptyText}}</text>
			</view>
			
			<!-- 订单项目 -->
			<view 
				class="order-item-wrapper" 
				v-for="(order, index) in orders" 
				:key="index"
				@touchstart="touchStart($event, index)"
				@touchmove="touchMove($event, index)"
				@touchend="touchEnd($event, index)"
			>
				<!-- 删除按钮和退款按钮放在容器内，但在卡片前面声明 -->
				<view class="action-buttons">
					<view class="refund-button" v-if="order.status === 1" @click.stop="applyRefund(order)">申请退款</view>
				<view class="delete-button" @click.stop="deleteOrder(order.orderNo)">删除</view>
				</view>
				
				<view class="order-item-container" :style="{transform: `translateX(${order.offset || 0}px)`}" @click="goToOrderDetail(order.orderNo)">
					<view class="order-item">
				<view class="order-header">
					<view class="order-number">订单号: {{order.orderNo}}</view>
					<view class="order-status">{{order.statusText}}</view>
				</view>
				
				<view class="order-products">
					<view 
						class="product-item" 
						v-for="(product, pIndex) in order.orderDetails" 
						:key="pIndex"
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
				
				<view class="order-footer">
					<view class="order-total">
						<text>共{{getTotalQuantity(order)}}件商品</text>
						<text class="order-amount">实付: ¥{{order.paymentAmount.toFixed(2)}}</text>
					</view>
					<view class="order-time">{{formatDate(order.createdAt)}}</view>
					
					<!-- 订单操作按钮 -->
					<view class="order-actions" @click.stop>
						<button 
							class="action-btn cancel-btn" 
							v-if="order.status === 0" 
							@click.stop="cancelOrder(order)"
						>取消订单</button>
						<button 
							class="action-btn pay-btn" 
							v-if="order.status === 0" 
							@click.stop="goToOrderDetail(order.orderNo)"
						>去支付</button>
						<button 
							class="action-btn detail-btn" 
							@click.stop="goToOrderDetail(order.orderNo)"
						>订单详情</button>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 底部加载更多提示 -->
			<view class="load-more" v-if="orders.length > 0 && hasMore && !loading">
				<text>上拉加载更多</text>
			</view>
			<view class="load-more" v-else-if="orders.length > 0 && !hasMore">
				<text>已加载全部</text>
			</view>
			<view class="loading-box" v-if="loading && orders.length > 0">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import api from '@/utils/api.js';
	
	export default {
		data() {
			return {
				tabs: ['全部', '待支付', '已支付', '已取消', '售后'],
				activeTab: 0,
				orders: [],
				loading: false,
				refreshing: false,
				hasMore: true,
				page: 0,
				size: 5,
				emptyText: '暂无订单',
				// 左滑删除相关数据
				deleteButtonWidth: 70, // 删除按钮宽度为70px
				refundButtonWidth: 100, // 退款按钮宽度为100px
				touchStartX: 0,
				touchStartY: 0,
				direction: '',
				activeIndex: -1,
				isMoving: false
			}
		},
		onLoad() {
			this.checkLoginStatus();
			this.loadOrders();
			
			// 注意：不使用$getAppWebview方法，它在小程序环境中不可用
			// 改为依赖scroll-view的点击事件来关闭滑动项
		},
		onShow() {
			// 页面显示时刷新一次数据
			this.refreshOrders();
		},
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				const token = uni.getStorageSync('token');
				if (!token) {
					uni.showModal({
						title: '未登录提示',
						content: '您尚未登录，是否前往登录页面？',
						confirmText: '去登录',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								uni.navigateTo({
									url: '/pages/login/login'
								});
							} else {
								// 取消登录时，跳转到菜单页
								uni.switchTab({
									url: '/pages/menu/menu'
								});
							}
						}
					});
				}
			},
			
			// 切换标签
			switchTab(index) {
				if (this.activeTab !== index) {
					this.activeTab = index;
					this.refreshOrders();
				}
			},
			
			// 刷新订单
			refreshOrders() {
				this.orders = [];
				this.page = 0;
				this.hasMore = true;
				this.loadOrders();
			},
			
			// 下拉刷新
			onRefresh() {
				this.refreshing = true;
				this.refreshOrders();
				
				// 1.5秒后结束刷新状态
				setTimeout(() => {
					this.refreshing = false;
				}, 1500);
			},
			
			// 加载订单列表
			loadOrders() {
				if (this.loading || !this.hasMore) return;
				
				this.loading = true;
				
				// 根据激活的标签页获取状态筛选
				let status = undefined; // 使用undefined而不是null
				switch(this.activeTab) {
					case 1: // 待支付
						status = 0;
						break;
					case 2: // 已支付
						status = 1;
						break;
					case 3: // 已取消
						status = 5;
						break;
					case 4: // 售后（包含退款中、已退款、拒绝退款）
						// 使用数组传递多个状态值或特殊处理
						this.loadRefundOrders();
						return; // 提前返回，不执行下面的常规订单获取
					// 不设置default，保持status为undefined
				}
				
				// 打印状态值和类型，方便调试
				console.log('请求订单列表，状态:', status, '类型:', typeof status);
				
				api.getOrders(status, this.page, this.size)
					.then(res => {
						console.log('获取订单列表响应:', res.data);
						if (res.data.code === 200) {
							const data = res.data.data;
							
							// 合并数据
							this.orders = this.orders.concat(data.content || []);
							
							// 判断是否还有更多数据
							if (data.last) {
								this.hasMore = false;
							} else {
								this.page++;
							}
							
							// 更新空数据提示
							this.updateEmptyText();
						} else {
							uni.showToast({
								title: res.data.message || '获取订单失败',
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
			
			// 加载退款相关订单
			loadRefundOrders() {
				// 获取所有退款相关状态的订单（退款中:3、已退款:4、拒绝退款:6）
				Promise.all([
					api.getOrders(3, this.page, this.size), // 退款中
					api.getOrders(4, this.page, this.size), // 已退款
					api.getOrders(6, this.page, this.size)  // 拒绝退款
				])
				.then(responses => {
					// 处理三个请求的响应
					let allRefundOrders = [];
					
					// 合并所有退款相关订单
					responses.forEach(res => {
						if (res.data && res.data.code === 200 && res.data.data) {
							const data = res.data.data;
							allRefundOrders = allRefundOrders.concat(data.content || []);
						}
					});
					
					// 按时间倒序排序
					allRefundOrders.sort((a, b) => {
						return new Date(b.createdAt) - new Date(a.createdAt);
					});
					
					// 添加数据到订单列表
					this.orders = this.orders.concat(allRefundOrders);
					
					// 由于已经获取了所有退款订单，标记为没有更多数据
					this.hasMore = false;
					
					// 更新空数据提示
					if (this.orders.length === 0) {
						this.emptyText = '暂无售后订单';
					}
				})
				.catch(err => {
					console.error('获取退款订单失败:', err);
					uni.showToast({
						title: '获取售后订单失败',
						icon: 'none'
					});
				})
				.finally(() => {
					this.loading = false;
				});
			},
			
			// 更新空数据提示
			updateEmptyText() {
				if (this.orders.length === 0) {
					switch(this.activeTab) {
						case 0:
							this.emptyText = '暂无订单';
							break;
						case 1:
							this.emptyText = '暂无待支付订单';
							break;
						case 2:
							this.emptyText = '暂无已支付订单';
							break;
						case 3:
							this.emptyText = '暂无已取消订单';
							break;
						case 4:
							this.emptyText = '暂无售后订单';
							break;
						default:
							this.emptyText = '暂无订单';
					}
				}
			},
			
			// 加载更多
			loadMore() {
				if (this.hasMore && !this.loading) {
					this.loadOrders();
				}
			},
			
			// 取消订单
			cancelOrder(order) {
				uni.showModal({
					title: '提示',
					content: '确定要取消该订单吗？',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '取消中...'
							});
							
							api.cancelOrder(order.orderNo)
								.then(res => {
									uni.hideLoading();
									console.log('取消订单响应:', res.data);
									if (res.data.code === 200) {
										uni.showToast({
											title: '订单已取消',
											icon: 'success'
										});
										
										// 刷新订单列表
										setTimeout(() => {
											this.refreshOrders();
										}, 1000);
									} else {
										uni.showToast({
											title: res.data.message || '取消订单失败',
											icon: 'none'
										});
									}
								})
								.catch(err => {
									uni.hideLoading();
									console.error('网络请求失败:', err);
									uni.showToast({
										title: '网络请求失败',
										icon: 'none'
									});
							});
						}
					}
				});
			},
			
			// 查看订单详情
			goToOrderDetail(orderNo) {
				uni.navigateTo({
					url: `/pages/order/detail?orderNo=${orderNo}`
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
			
			// 获取订单总商品数量
			getTotalQuantity(order) {
				if (!order.orderDetails || !order.orderDetails.length) return 0;
				
				return order.orderDetails.reduce((total, product) => {
					return total + product.quantity;
				}, 0);
			},
			
			// 触摸开始事件处理
			touchStart(e, index) {
				// 记录开始触摸的位置
				this.touchStartX = e.touches[0].clientX;
				this.touchStartY = e.touches[0].clientY;
				this.direction = '';
				this.isMoving = false;
				this.activeIndex = index;
				
				// 如果有其他已滑出的项，先关闭它们
				this.orders.forEach((order, idx) => {
					if (idx !== index && order.offset) {
						this.$set(order, 'offset', 0);
					}
				});
			},
			
			// 触摸移动事件处理
			touchMove(e, index) {
				if (this.activeIndex !== index) return;
				
				const moveX = e.touches[0].clientX;
				const moveY = e.touches[0].clientY;
				
				// 计算横向和纵向移动的距离
				const deltaX = moveX - this.touchStartX;
				const deltaY = moveY - this.touchStartY;
				
				// 如果还没确定方向
				if (!this.direction) {
					// 降低水平滑动判定阈值，从10px降到5px
					if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
						this.direction = 'horizontal';
					} else {
						this.direction = 'vertical';
						return; // 如果是纵向滑动，不处理
					}
				}
				
				// 如果是横向滑动
				if (this.direction === 'horizontal') {
					// 设置移动标志
					this.isMoving = true;
					
					// 计算偏移量，只允许左滑（负值）
					let offset = deltaX;
					
					// 如果是右滑并且没有打开的删除按钮，直接忽略
					if (deltaX > 0 && !(this.orders[index].offset < 0)) {
						offset = 0;
					}
					
					// 限制最大左滑距离，根据按钮总宽度调整
					const maxOffset = this.orders[index].status === 1 ? 
					                  -(this.deleteButtonWidth + this.refundButtonWidth + 2) : 
					                  -(this.deleteButtonWidth + 2); // +2px偏移
					
					if (offset < maxOffset) {
						offset = maxOffset;
					}
					
					// 应用偏移量
					this.$set(this.orders[index], 'offset', offset);
					
					// 阻止滚动
					e.preventDefault();
				}
			},
			
			// 触摸结束事件处理
			touchEnd(e, index) {
				if (this.activeIndex !== index || !this.isMoving) return;
				
				const order = this.orders[index];
				const offset = order.offset || 0;
				
				// 计算最大偏移量
				const maxOffset = order.status === 1 ? 
				                  -(this.deleteButtonWidth + this.refundButtonWidth + 2) : 
				                  -(this.deleteButtonWidth + 2);
				
				// 降低左滑触发阈值
				if (offset < -20) {
					// 完全展开操作按钮
					this.$set(order, 'offset', maxOffset);
				} else {
					// 否则恢复原位
					this.$set(order, 'offset', 0);
				}
				
				// 重置移动状态
				this.isMoving = false;
			},
			
			// 关闭所有滑动项
			closeAllSwipe() {
				if (!this.orders) return;
				
				this.orders.forEach((order, index) => {
					if (order.offset) {
						this.$set(order, 'offset', 0);
					}
				});
			},
			
			// 删除订单
			deleteOrder(orderNo) {
				uni.showModal({
					title: '提示',
					content: '确定要删除该订单吗？',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '删除中...'
							});
							
							api.deleteOrder(orderNo)
								.then(res => {
									console.log('删除订单响应:', res.data);
									if (res.data.code === 200) {
										uni.showToast({
											title: '删除成功',
											icon: 'success'
										});
										
										// 刷新订单列表
										setTimeout(() => {
											this.refreshOrders();
										}, 1000);
									} else {
										uni.showToast({
											title: res.data.message || '删除订单失败',
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
			
			// 申请退款
			applyRefund(order) {
				uni.showModal({
					title: '申请退款',
					content: '确定要申请退款吗？',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: `/pages/order/refund?orderNo=${order.orderNo}&amount=${order.paymentAmount}`
							});
						}
					}
				});
			}
		}
	}
</script>

<style>
	.order-container {
		background-color: #121212;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100vh;
		overflow-x: hidden;
	}
	
	/* 标签切换栏 */
	.tabs {
		display: flex;
		background-color: #1a1a1a;
		height: 90rpx;
		position: sticky;
		top: 0;
		z-index: 10;
		width: 100%;
		white-space: nowrap;
		overflow-x: auto;
	}
	
	.tab-item {
		flex: 1;
		min-width: 100rpx; /* 调整最小宽度适应5个标签 */
		display: flex;
		justify-content: center;
		align-items: center;
		color: #888888;
		font-size: 24rpx;
		position: relative;
		padding: 0 4rpx; /* 略微减小内边距 */
	}
	
	.tab-item.active {
		color: #7b68ee;
		font-weight: bold;
	}
	
	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 50rpx;
		height: 6rpx;
		background-color: #7b68ee;
		border-radius: 3rpx;
	}
	
	/* 订单列表 */
	.order-list {
		flex: 1;
		padding: 20rpx;
		width: 100%;
		box-sizing: border-box;
		height: calc(100vh - 90rpx);
	}
	
	/* 订单项目 */
	.order-item-wrapper {
		position: relative;
		width: 100%;
		margin-bottom: 20rpx;
		overflow: hidden;
		border-radius: 16rpx;
		box-sizing: border-box;
	}
	
	.action-buttons {
		position: absolute;
		top: 0;
		right: 0;
		height: 100%;
		display: flex;
		z-index: 1;
	}
	
	.delete-button {
		width: 70px; /* 改为px单位，确保与JS中的值匹配 */
		height: 100%;
		background-color: #ff4c4c;
		color: #ffffff;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 30rpx;
		font-weight: bold;
		box-sizing: border-box;
	}
	
	.refund-button {
		width: 100px; /* 退款按钮宽度 */
		height: 100%;
		background-color: #ff9800;
		color: #ffffff;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 30rpx;
		font-weight: bold;
		box-sizing: border-box;
	}
	
	.order-item-container {
		width: 100%;
		transition: transform 0.2s ease-out; /* 减少动画时间，减轻阻尼感 */
		position: relative;
		z-index: 2;
		background-color: #1a1a1a;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
		overflow: hidden; /* 确保内容不溢出 */
		transform: translateX(0); /* 确保默认位置正确 */
	}
	
	.order-item {
		padding: 0;
		background-color: #1a1a1a;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		border-right: 1px solid #1a1a1a; /* 添加右边框，确保边缘严实 */
	}
	
	.order-header {
		padding: 12rpx;
		border-bottom: 2rpx solid #2a2a2a;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.order-number {
		font-size: 22rpx;
		color: #888888;
		max-width: 65%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.order-status {
		font-size: 26rpx;
		color: #7b68ee;
		font-weight: bold;
	}
	
	.order-products {
		padding: 10rpx 12rpx;
	}
	
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
		min-width: 0; /* 确保弹性项可以缩小到比内容更小 */
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
	
	.order-footer {
		padding: 12rpx;
		border-top: 2rpx solid #2a2a2a;
	}
	
	.order-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;
		font-size: 24rpx;
		color: #888888;
	}
	
	.order-amount {
		font-size: 26rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.order-time {
		font-size: 22rpx;
		color: #888888;
		margin-bottom: 15rpx;
	}
	
	.order-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 10rpx;
		flex-wrap: wrap;
		gap: 10rpx;
	}
	
	.action-btn {
		margin-left: 10rpx;
		font-size: 20rpx;
		padding: 6rpx 16rpx;
		background-color: transparent;
		border-radius: 30rpx;
		height: 46rpx;
		line-height: 34rpx;
		z-index: 2;
	}
	
	.cancel-btn {
		color: #888888;
		border: 2rpx solid #888888;
	}
	
	.pay-btn {
		color: #7b68ee;
		border: 2rpx solid #7b68ee;
	}
	
	.detail-btn {
		color: #ffffff;
		border: 2rpx solid #ffffff;
	}
	
	/* 加载中 */
	.loading-box {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 200rpx;
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
	
	/* 空状态显示 */
	.empty-state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 400rpx;
	}
	
	.empty-icon {
		width: 120rpx;
		height: 120rpx;
		margin-bottom: 20rpx;
		opacity: 0.5;
	}
	
	.empty-text {
		font-size: 26rpx;
		color: #888888;
	}
	
	/* 加载更多 */
	.load-more {
		text-align: center;
		padding: 20rpx 0;
	}
	
	.load-more text {
		font-size: 22rpx;
		color: #888888;
	}
</style> 