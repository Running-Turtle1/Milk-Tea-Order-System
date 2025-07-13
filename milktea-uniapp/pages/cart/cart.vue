<template>
	<view class="cart-container">
		<!-- 空购物车提示 -->
		<view class="empty-cart" v-if="cartInfo.items && cartInfo.items.length === 0">
			<image src="/static/tabbar/cart.png" class="empty-icon"></image>
			<text class="empty-text">购物车空空如也</text>
			<view class="go-shopping-btn" @click="goToMenu">
				<button type="primary" size="mini">去选购</button>
			</view>
		</view>
		
		<!-- 购物车内容 -->
		<view class="cart-content" v-else @click="closeAllSwipe">
			<!-- 头部操作栏 -->
			<view class="cart-header">
				<text class="cart-title">购物车</text>
				<text class="edit-btn" @click="toggleEditMode">{{isEditMode ? '完成' : '编辑'}}</text>
			</view>
			
			<!-- 商品列表 -->
			<scroll-view scroll-y class="cart-list" @touchstart.stop="() => {}">
				<!-- 商品项 - 重新实现左滑删除功能 -->
				<view 
					class="cart-item-wrapper" 
					v-for="(item, index) in cartInfo.items" 
					:key="index"
					@touchstart="touchStart($event, index)"
					@touchmove="touchMove($event, index)"
					@touchend="touchEnd($event, index)"
				>
					<!-- 删除按钮放在容器内，但在卡片前面声明，确保它在DOM中的顺序是先于卡片 -->
					<view class="delete-button" @click.stop="removeItem(item.id)">删除</view>
					
					<view class="cart-item-container" :style="{transform: `translateX(${item.offset || 0}px)`}">
						<view class="cart-item">
					<!-- 选择框 -->
							<view class="checkbox" @click.stop="toggleItemSelect(item.id, !item.selected)">
						<text :class="['checkbox-icon', item.selected ? 'checked' : '']"></text>
					</view>
					
					<!-- 商品信息 -->
					<view class="item-content">
						<image :src="item.productImage || '/static/default-product.png'" class="item-image" mode="aspectFill"></image>
						<view class="item-details">
							<view class="item-name">{{item.productName}}</view>
							<view class="item-specs-container">
								<view class="specs-row" v-if="item.temperature || item.sweetness">
									<text class="specs-label">规格：</text>
									<text class="specs-value">{{item.temperature || ''}}</text>
									<text class="specs-value" v-if="item.temperature && item.sweetness">，</text>
									<text class="specs-value">{{item.sweetness || ''}}</text>
								</view>
								<view class="specs-row" v-if="item.ingredients && item.ingredients.length > 0">
									<text class="specs-label">配料：</text>
									<text class="specs-value">
										<text v-for="(ing, i) in item.ingredients" :key="i">
											{{ing.name}}{{i < item.ingredients.length - 1 ? '、' : ''}}
										</text>
									</text>
								</view>
							</view>
							<view class="price-quantity">
								<text class="item-price">¥{{calculateItemTotalPrice(item).toFixed(2)}}</text>
								<view class="quantity-control">
											<text class="quantity-btn minus" @click.stop="adjustQuantity(item.id, item.quantity - 1)">-</text>
									<input type="number" class="quantity-input" :value="item.quantity" disabled />
											<text class="quantity-btn plus" @click.stop="adjustQuantity(item.id, item.quantity + 1)">+</text>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 编辑模式下的删除按钮 -->
							<view class="delete-btn" v-if="isEditMode" @click.stop="removeItem(item.id)">
						<text class="delete-icon">×</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			
			<!-- 底部结算栏 -->
			<view class="cart-footer">
				<view class="select-all" @click="toggleSelectAll(!allSelected)">
					<text :class="['checkbox-icon', allSelected ? 'checked' : '']"></text>
					<text class="select-all-text">全选</text>
				</view>
				
				<view class="footer-right" v-if="!isEditMode">
					<view class="price-info">
						<view class="total-price">
							合计: <text class="price-value">¥{{cartInfo.selectedTotalPrice.toFixed(2)}}</text>
						</view>
					</view>
					<view class="checkout-btn" @click="checkout" :class="{'disabled': cartInfo.selectedTotalQuantity === 0}">
						<text>结算({{cartInfo.selectedTotalQuantity}})</text>
					</view>
				</view>
				
				<view class="footer-right" v-else>
					<view class="batch-delete-btn" @click="removeSelectedItems">
						<text>删除所选</text>
					</view>
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
				cartInfo: {
					items: [],
					totalPrice: 0,
					totalQuantity: 0,
					selectedTotalPrice: 0,
					selectedTotalQuantity: 0,
					allProductsAvailable: true
				},
				isEditMode: false,
				loading: false,
				// 左滑删除相关数据
				deleteButtonWidth: 70, // 调整删除按钮宽度为70px，与下面的px单位保持一致
				touchStartX: 0,
				touchStartY: 0,
				direction: '',
				activeIndex: -1,
				isMoving: false
			}
		},
		computed: {
			// 是否全选
			allSelected() {
				if (!this.cartInfo.items || this.cartInfo.items.length === 0) {
					return false;
				}
				return this.cartInfo.items.every(item => item.selected);
			}
		},
		onShow() {
			this.fetchCartData();
		},
		methods: {
			// 计算单个商品总价（包含配料）
			calculateItemTotalPrice(item) {
				// 商品基础价格
				let price = item.productPrice || 0;
				
				// 配料价格计算
				if (item.ingredients && item.ingredients.length > 0) {
					const ingredientsPrice = item.ingredients.reduce((sum, ing) => {
						return sum + (parseFloat(ing.price) || 0);
					}, 0);
					price += ingredientsPrice;
				}
				
				return price;
			},
			
			// 获取购物车数据
			fetchCartData() {
				this.loading = true;
				const token = uni.getStorageSync('token');
				
				if (!token) {
					this.loading = false;
					// 修改：不直接跳转到登录页，而是先弹出确认对话框
					uni.showModal({
						title: '未登录提示',
						content: '您尚未登录，是否前往登录页面？',
						confirmText: '去登录',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								this.redirectToLogin();
							} else {
								// 取消登录时，跳转到菜单页
								uni.switchTab({
									url: '/pages/menu/menu'
								});
							}
						}
					});
					return;
				}
				
				api.request({
					url: '/cart',
					method: 'GET'
				})
				.then(res => {
						console.log('获取购物车响应:', res.data);
						if (res.data.code === 200) {
							this.cartInfo = res.data.data;
							
							// 如果没有items属性，初始化一个空数组
							if (!this.cartInfo.items) {
								this.cartInfo.items = [];
							}
							
						} else if (res.data.code === 401) {
							this.handleTokenExpired();
						} else {
							this.showToast(res.data.message || '获取购物车失败');
						}
				})
				.catch(err => {
						console.error('网络请求失败:', err);
						this.showToast('网络请求失败');
				})
				.finally(() => {
						this.loading = false;
				});
			},
			
			// 调整商品数量
			adjustQuantity(itemId, newQuantity) {
				if (newQuantity < 1) {
					newQuantity = 1;
				}
				
				// 找到对应的商品
				const itemIndex = this.cartInfo.items.findIndex(item => item.id === itemId);
				if (itemIndex === -1) {
					this.showToast('找不到商品信息');
					return;
				}
				
				const item = this.cartInfo.items[itemIndex];
				
				api.request({
					url: `/cart/${itemId}`,
					method: 'PUT',
					data: {
						productId: item.productId,
						quantity: newQuantity,
						temperature: item.temperature || '',
						sweetness: item.sweetness || '',
						ingredients: item.ingredients || []
					}
				})
				.then(res => {
						console.log('更新购物车响应:', res.data);
						if (res.data.code === 200) {
							this.cartInfo = res.data.data;
						} else if (res.data.code === 401) {
							this.handleTokenExpired();
						} else {
							this.showToast(res.data.message || '更新购物车失败');
						}
				})
				.catch(err => {
						console.error('网络请求失败:', err);
						this.showToast('网络请求失败');
				});
			},
			
			// 切换商品选中状态
			toggleItemSelect(itemId, selected) {
				api.request({
					url: `/cart/select/${itemId}?selected=${selected}`,
					method: 'PUT'
				})
				.then(res => {
						console.log('切换选中状态响应:', res.data);
						if (res.data.code === 200) {
							this.cartInfo = res.data.data;
						} else if (res.data.code === 401) {
							this.handleTokenExpired();
						} else {
							this.showToast(res.data.message || '更新选中状态失败');
						}
				})
				.catch(err => {
						console.error('网络请求失败:', err);
						this.showToast('网络请求失败');
				});
			},
			
			// 切换全选状态
			toggleSelectAll(selected) {
				api.request({
					url: `/cart/select-all?selected=${selected}`,
					method: 'PUT'
				})
				.then(res => {
						console.log('全选/取消全选响应:', res.data);
						if (res.data.code === 200) {
							this.cartInfo = res.data.data;
						} else if (res.data.code === 401) {
							this.handleTokenExpired();
						} else {
							this.showToast(res.data.message || '操作失败');
						}
				})
				.catch(err => {
						console.error('网络请求失败:', err);
						this.showToast('网络请求失败');
				});
			},
			
			// 移除商品
			removeItem(itemId) {
				uni.showModal({
					title: '提示',
					content: '确定要从购物车中移除该商品吗？',
					success: (res) => {
						if (res.confirm) {
							api.request({
								url: `/cart/${itemId}`,
								method: 'DELETE'
							})
							.then(res => {
									console.log('移除商品响应:', res.data);
									if (res.data.code === 200) {
										this.cartInfo = res.data.data;
										this.resetSwipeStatus(); // 重置所有左滑状态
										this.showToast('删除成功', 'success');
									} else if (res.data.code === 401) {
										this.handleTokenExpired();
									} else {
										this.showToast(res.data.message || '移除商品失败');
									}
							})
							.catch(err => {
									console.error('网络请求失败:', err);
									this.showToast('网络请求失败');
							});
						}
					}
				});
			},
			
			// 移除选中的商品
			removeSelectedItems() {
				if (this.cartInfo.selectedTotalQuantity === 0) {
					this.showToast('请选择要删除的商品');
					return;
				}
				
				uni.showModal({
					title: '提示',
					content: '确定要删除选中的商品吗？',
					success: (res) => {
						if (res.confirm) {
							api.request({
								url: '/cart/selected',
								method: 'DELETE'
							})
							.then(res => {
									console.log('删除选中商品响应:', res.data);
									if (res.data.code === 200) {
										this.cartInfo = res.data.data;
										this.resetSwipeStatus(); // 重置所有左滑状态
										this.showToast('删除成功', 'success');
									} else if (res.data.code === 401) {
										this.handleTokenExpired();
									} else {
									this.showToast(res.data.message || '删除选中商品失败');
									}
							})
							.catch(err => {
									console.error('网络请求失败:', err);
									this.showToast('网络请求失败');
							});
						}
					}
				});
			},
			
			// 清空购物车
			clearCart() {
				if (this.cartInfo.totalQuantity === 0) {
					this.showToast('购物车已经是空的了');
					return;
				}
					
				uni.showModal({
					title: '提示',
					content: '确定要清空购物车吗？',
						success: (res) => {
						if (res.confirm) {
							api.request({
								url: '/cart',
								method: 'DELETE'
							})
							.then(res => {
								console.log('清空购物车响应:', res.data);
							if (res.data.code === 200) {
								this.cartInfo = res.data.data;
									this.showToast('已清空购物车', 'success');
							} else if (res.data.code === 401) {
								this.handleTokenExpired();
							} else {
									this.showToast(res.data.message || '清空购物车失败');
							}
							})
							.catch(err => {
							console.error('网络请求失败:', err);
							this.showToast('网络请求失败');
							});
						}
						}
				});
			},
			
			// 检查库存
			checkStock() {
				if (this.cartInfo.selectedTotalQuantity === 0) {
					this.showToast('请先选择商品');
					return false;
				}
				
				return true;
			},
			
			// 结算
			async checkout() {
				if (this.cartInfo.selectedTotalQuantity === 0) {
					this.showToast('请选择要结算的商品');
					return;
				}
				
				try {
					// 获取选中的商品并确保包含价格信息
					const selectedItems = this.cartInfo.items.filter(item => item.selected).map(item => {
						// 确保每个商品都有价格信息
						if (!item.productPrice && typeof item.productPrice !== 'number') {
							console.error('商品缺少价格信息:', item);
						}
						
						// 创建新对象，确保包含所有必要信息
						return {
							...item,
							price: item.productPrice || 0, // 添加price字段作为备用
							quantity: item.quantity || 1,
							// 确保配料信息完整
							ingredients: Array.isArray(item.ingredients) ? item.ingredients : []
						};
					});
					
					console.log('传递到确认订单页面的商品数据:', selectedItems);
					
					// 将选中的商品数据传递到确认订单页面
					uni.navigateTo({
						url: `/pages/order/confirm?items=${encodeURIComponent(JSON.stringify(selectedItems))}`
					});
				} catch (error) {
					console.error('结算前检查失败:', error);
					this.showToast('网络请求失败，请重试');
				}
			},
			
			// 切换编辑模式
			toggleEditMode() {
				this.isEditMode = !this.isEditMode;
			},
			
			// 前往点单页
			goToMenu() {
				uni.switchTab({
					url: '/pages/menu/menu'
				});
			},
			
			// 重定向到登录页
			redirectToLogin() {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			},
			
			// 处理Token过期
			handleTokenExpired() {
				uni.removeStorageSync('token');
				
				uni.showToast({
					title: '登录已过期，请重新登录',
					icon: 'none'
				});
				
				setTimeout(() => {
					this.redirectToLogin();
				}, 1500);
			},
			
			// 显示提示信息
			showToast(title, icon = 'none') {
				uni.showToast({
					title,
					icon
				});
			},
			
			// 修改触摸事件处理方法，提高灵敏度
			touchStart(e, index) {
				// 记录开始触摸的位置
				this.touchStartX = e.touches[0].clientX;
				this.touchStartY = e.touches[0].clientY;
				this.direction = '';
				this.isMoving = false;
				this.activeIndex = index;
				
				// 如果有其他已滑出的项，先关闭它们
				this.cartInfo.items.forEach((item, idx) => {
					if (idx !== index && item.offset) {
						this.$set(item, 'offset', 0);
					}
				});
			},
			
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
					if (deltaX > 0 && !(this.cartInfo.items[index].offset < 0)) {
						offset = 0;
					}
					
					// 限制最大左滑距离，增加2px以匹配删除按钮右偏移
					if (offset < -72) { // 70px + 2px
						offset = -72;
					}
					
					// 应用偏移量
					this.$set(this.cartInfo.items[index], 'offset', offset);
					
					// 阻止滚动
					e.preventDefault();
				}
			},
			
			touchEnd(e, index) {
				if (this.activeIndex !== index || !this.isMoving) return;
				
				const item = this.cartInfo.items[index];
				const offset = item.offset || 0;
				
				// 降低左滑触发阈值
				if (offset < -20) {
					// 完全展开删除按钮，增加2px以匹配删除按钮右偏移
					this.$set(item, 'offset', -72);
				} else {
					// 否则恢复原位
					this.$set(item, 'offset', 0);
				}
				
				// 重置移动状态
				this.isMoving = false;
			},
			
			// 关闭所有滑动项
			closeAllSwipe() {
				if (!this.cartInfo.items) return;
				
				this.cartInfo.items.forEach((item, index) => {
					if (item.offset) {
						this.$set(item, 'offset', 0);
					}
				});
			},
			
			// 在删除商品或批量删除后重置滑动状态
			resetSwipeStatus() {
				this.closeAllSwipe();
			}
		}
	}
</script>

<style>
	.cart-container {
		min-height: calc(100vh - 50px); /* 减去tabBar的高度 */
		background-color: #121212;
	}
	
	/* 空购物车样式 */
	.empty-cart {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 70vh; /* 减少高度，为tabBar留出空间 */
	}
	
	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
		opacity: 0.7;
	}
	
	.empty-text {
		font-size: 30rpx;
		color: #888888;
		margin-bottom: 40rpx;
	}
	
	.go-shopping-btn {
		margin-top: 20rpx;
	}
	
	.go-shopping-btn button {
		background-color: #7b68ee;
	}
	
	/* 购物车内容样式 */
	.cart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		position: sticky;
		top: 0;
		background-color: #1a1a1a;
		z-index: 10;
	}
	
	.cart-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	.edit-btn {
		font-size: 28rpx;
		color: #7b68ee;
	}
	
	/* 购物车列表 */
	.cart-list {
		height: calc(100vh - 200rpx); /* 减少高度，为tabBar和底部结算栏留出空间 */
		padding: 20rpx;
		box-sizing: border-box;
	}
	
	/* 库存警告 */
	.stock-warning {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: rgba(255, 76, 76, 0.1);
		border-radius: 10rpx;
		margin-bottom: 20rpx;
	}
	
	.warning-icon {
		margin-right: 10rpx;
	}
	
	.warning-text {
		font-size: 24rpx;
		color: #ff4c4c;
	}
	
	/* 购物车项目 */
	.cart-item-wrapper {
		position: relative;
		width: 100%;
		margin-bottom: 20rpx;
		overflow: hidden;
		border-radius: 16rpx;
		box-sizing: border-box;
	}
	
	.cart-item-container {
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
	
	.delete-button {
		position: absolute;
		top: 0;
		right: -2px; /* 向右偏移2px，确保完全隐藏 */
		width: 70px; /* 改为px单位，确保与JS中的值匹配 */
		height: 100%;
		background-color: #ff4c4c;
		color: #ffffff;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 30rpx;
		font-weight: bold;
		z-index: 1;
		box-sizing: border-box;
	}
	
	.cart-item {
		width: 100%;
		box-sizing: border-box;
		background-color: #1a1a1a;
		display: flex;
		padding: 30rpx;
		border-radius: 16rpx;
		position: relative;
		border-right: 1px solid #1a1a1a; /* 添加右边框，确保边缘严实 */
	}
	
	.out-of-stock {
		opacity: 0.7;
	}
	
	/* 复选框 */
	.checkbox {
		display: flex;
		align-items: center;
		margin-right: 20rpx;
	}
	
	.checkbox-icon {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		border: 2rpx solid #555555;
		position: relative;
	}
	
	.checkbox-icon.checked {
		background-color: #7b68ee;
		border-color: #7b68ee;
	}
	
	.checkbox-icon.checked::after {
		content: '';
		position: absolute;
		left: 14rpx;
		top: 8rpx;
		width: 12rpx;
		height: 20rpx;
		border: solid white;
		border-width: 0 3rpx 3rpx 0;
		transform: rotate(45deg);
	}
	
	/* 商品内容 */
	.item-content {
		display: flex;
		flex: 1;
	}
	
	.item-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
		background-color: #2a2a2a;
	}
	
	.item-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	
	.item-name {
		font-size: 28rpx;
		color: #ffffff;
		margin-bottom: 10rpx;
	}
	
	.item-specs-container {
		margin-bottom: 10rpx;
	}
	
	.specs-row {
		display: flex;
		align-items: center;
		margin-bottom: 6rpx;
	}
	
	.specs-label {
		font-size: 24rpx;
		color: #888888;
		margin-right: 10rpx;
	}
	
	.specs-value {
		font-size: 24rpx;
		color: #ffffff;
	}
	
	.stock-info {
		margin-bottom: 10rpx;
	}
	
	.stock-warning {
		font-size: 24rpx;
		color: #ff4c4c;
	}
	
	.price-quantity {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.item-price {
		font-size: 30rpx;
		font-weight: bold;
		color: #7b68ee;
	}
	
	/* 数量控制 */
	.quantity-control {
		display: flex;
		align-items: center;
	}
	
	.quantity-btn {
		width: 60rpx;
		height: 60rpx;
		line-height: 56rpx;
		text-align: center;
		background-color: #2a2a2a;
		color: #ffffff;
		font-size: 36rpx;
		border-radius: 30rpx;
	}
	
	.quantity-input {
		width: 80rpx;
		text-align: center;
		height: 60rpx;
		line-height: 60rpx;
		background-color: transparent;
		color: #ffffff;
		font-size: 28rpx;
		margin: 0 10rpx;
	}
	
	/* 删除按钮 */
	.delete-btn {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 50rpx;
		height: 50rpx;
		border-radius: 25rpx;
		background-color: rgba(255, 76, 76, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.delete-icon {
		color: #ff4c4c;
		font-size: 32rpx;
	}
	
	/* 底部结算栏 */
	.cart-footer {
		position: fixed;
		left: 0;
		/* #ifdef H5 */
		bottom: 100rpx;
		/* #endif */
		
		/* #ifdef MP-WEIXIN */
		bottom: 0;
		/* #endif */
		
		/* #ifdef APP-PLUS */
		bottom: 0;
		/* #endif */
		
		width: 100%;
		height: 100rpx;
		background-color: #1a1a1a;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 30rpx;
		box-sizing: border-box;
		z-index: 999;
	}
	
	.select-all {
		display: flex;
		align-items: center;
	}
	
	.select-all-text {
		margin-left: 20rpx;
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.footer-right {
		display: flex;
		align-items: center;
	}
	
	.price-info {
		margin-right: 20rpx;
	}
	
	.total-price {
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.price-value {
		font-size: 32rpx;
		font-weight: bold;
		color: #7b68ee;
	}
	
	.checkout-btn {
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 40rpx;
		border-radius: 35rpx;
		background-color: #7b68ee;
		color: #ffffff;
		font-size: 28rpx;
	}
	
	.checkout-btn.disabled {
		background-color: #444444;
		color: #aaaaaa;
	}
	
	.batch-delete-btn {
		height: 70rpx;
		line-height: 70rpx;
		padding: 0 40rpx;
		border-radius: 35rpx;
		background-color: #ff4c4c;
		color: #ffffff;
		font-size: 28rpx;
	}
	
	/* 移除旧的左滑相关样式 */
	.swipe-area,
	.swipe-move-box,
	.swipe-action-btn {
		display: none;
	}
</style> 