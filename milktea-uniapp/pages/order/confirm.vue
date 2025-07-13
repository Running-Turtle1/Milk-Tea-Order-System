<template>
	<view class="confirm-container">
		<view v-if="loading" class="loading">
			<text>加载中...</text>
		</view>
		
		<scroll-view v-else scroll-y class="confirm-content">
			<!-- 商品列表 -->
			<view class="product-section">
				<view class="section-title">已选商品</view>
				<view class="product-list">
					<view 
						v-for="item in cartItems" 
						:key="item.id" 
						class="product-item">
						<image :src="getProductImage(item)" mode="aspectFill" class="product-image"></image>
						<view class="product-info">
							<view class="product-top">
								<view class="product-name">{{ getProductName(item) }}</view>
								<view class="product-quantity">x{{ item.quantity || 1 }}</view>
							</view>
							
							<view class="product-options" v-if="item.temperature || item.sweetness || hasIngredients(item)">
								<text v-if="item.temperature">{{ item.temperature }}</text>
								<text v-if="item.sweetness">{{ item.sweetness }}</text>
								<text v-if="hasIngredients(item)">
									{{ formatIngredients(item) }}
								</text>
							</view>
							
							<view class="product-price">¥{{ calculateItemPrice(item).toFixed(2) }}</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 优惠券选择 -->
			<view class="coupon-section" @click="openCouponModal">
				<view class="section-title">优惠券</view>
				<view class="coupon-right">
					<text v-if="selectedCoupon" class="coupon-value">
						已选择：{{ selectedCoupon.name }} -¥{{ selectedCoupon.amount.toFixed(2) }}
					</text>
					<text v-else class="no-coupon">未使用优惠券</text>
					<text class="arrow">></text>
				</view>
			</view>
			
			<!-- 备注 -->
			<view class="note-section">
				<view class="section-title">备注</view>
				<input 
					type="text" 
					v-model="note" 
					placeholder="有什么特殊要求可以告诉我们哦~" 
					class="note-input" />
			</view>
			
			<!-- 金额明细 -->
			<view class="price-detail">
				<view class="price-row">
					<text class="price-label">商品金额</text>
					<text class="price-value">¥{{ calculateTotalPrice().toFixed(2) }}</text>
				</view>
				
				<!-- 优惠券折扣 -->
				<view class="price-row" v-if="selectedCoupon">
					<text class="price-label">优惠券{{ selectedCoupon.type === 2 ? '(' + (selectedCoupon.amount * 10).toFixed(1) + '折)' : '' }}</text>
					<text class="price-value discount">-¥{{ getCouponDiscountAmount().toFixed(2) }}</text>
				</view>
				
				<!-- 优惠券后的金额 -->
				<view class="price-row" v-if="selectedCoupon">
					<text class="price-label">优惠后金额</text>
					<text class="price-value">¥{{ getPriceAfterCoupon().toFixed(2) }}</text>
				</view>
				
				<!-- 会员折扣 -->
				<view class="price-row" v-if="memberDiscount < 1">
					<text class="price-label">会员折扣 ({{ (memberDiscount * 10).toFixed(1) }}折)</text>
					<text class="price-value discount">-¥{{ getMemberDiscountAmount().toFixed(2) }}</text>
				</view>
				
				<!-- 实付金额 -->
				<view class="price-row">
					<text class="price-label">实付金额</text>
					<text class="price-value">¥{{ calculateFinalPrice().toFixed(2) }}</text>
				</view>
			</view>
			
			<!-- 底部占位 -->
			<view class="bottom-placeholder"></view>
		</scroll-view>
		
		<!-- 结算栏 -->
		<view class="checkout-bar">
			<view class="total-section">
				<text class="total-text">总价：</text>
				<text class="total-price">¥{{ calculateFinalPrice().toFixed(2) }}</text>
			</view>
			<button class="submit-btn" @click="submitOrder">提交订单</button>
		</view>
		
		<!-- 优惠券选择弹窗 -->
		<view class="coupon-modal" v-if="showCouponModal">
			<view class="coupon-modal-mask" @click="closeCouponModal"></view>
			<view class="coupon-modal-container">
				<view class="coupon-modal-header">
					<text class="coupon-modal-title">选择优惠券</text>
					<text class="coupon-modal-close" @click="closeCouponModal">×</text>
				</view>
				
				<view class="coupon-modal-content">
					<view class="coupon-list" v-if="availableCoupons.length > 0">
						<!-- 不使用优惠券选项 -->
						<view 
							class="coupon-card" 
							:class="{'selected': selectedCoupon === null}"
							@click="selectNoCoupon"
						>
							<view class="coupon-left">
								<text class="coupon-amount">不使用</text>
							</view>
							<view class="coupon-right">
								<text class="coupon-name">不使用优惠券</text>
								<text class="coupon-desc">无需使用优惠券</text>
							</view>
							<view class="coupon-select-icon" v-if="selectedCoupon === null">
								<text class="check-icon">✓</text>
							</view>
						</view>
						
						<!-- 可用优惠券列表 -->
						<view 
							v-for="(coupon, index) in availableCoupons" 
							:key="index"
							class="coupon-card" 
							:class="{
								'selected': selectedCoupon && selectedCoupon.id === coupon.id,
								'disabled': !coupon.canUse
							}"
							@click="coupon.canUse ? selectCoupon(coupon) : showMinAmountTips(coupon)"
						>
							<view class="coupon-left">
								<text class="coupon-amount" v-if="coupon.type === 1">¥{{ coupon.amount.toFixed(2) }}</text>
								<text class="coupon-amount" v-else>{{ (coupon.amount * 10).toFixed(1) }}折</text>
								<text class="coupon-condition" v-if="coupon.minConsumption > 0" :class="{'condition-not-met': !coupon.canUse}">满{{ coupon.minConsumption.toFixed(2) }}可用</text>
							</view>
							<view class="coupon-right">
								<text class="coupon-name">{{ coupon.name }}</text>
								<text class="coupon-desc">{{ coupon.description || coupon.typeText }}</text>
								<text class="coupon-date">有效期至{{ coupon.expireDate }}</text>
							</view>
							<view class="coupon-select-icon" v-if="selectedCoupon && selectedCoupon.id === coupon.id">
								<text class="check-icon">✓</text>
							</view>
							<view class="coupon-disabled-mask" v-if="!coupon.canUse"></view>
						</view>
					</view>
					
					<view class="no-coupons" v-else>
						<text>暂无可用优惠券</text>
					</view>
				</view>
				
				<view class="coupon-modal-footer">
					<button class="cancel-btn" @click="closeCouponModal">取消</button>
					<button class="confirm-btn" @click="confirmCouponSelection">确定</button>
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
				cartItems: [],
				loading: true,
				availableCoupons: [],
				selectedCoupon: null,
				paymentMethod: 'wechat',
				paymentMethods: [
					{ name: '微信支付', value: 'wechat', icon: 'weixin' },
					{ name: '支付宝', value: 'alipay', icon: 'zhifubao' },
					{ name: '积分支付', value: 'point', icon: 'jifen' }
				],
				note: '',
				deliveryFee: 0, // 店内点餐无配送费
				showCouponModal: false,
				
				// 会员信息相关
				memberInfo: null,
				memberDiscount: 1.0 // 默认不打折
			}
		},
		onLoad(options) {
			
			// 获取会员信息和折扣
			this.getMemberInfo();
			
			// 检查是否有从外部传入的商品数据
			if (options && options.items) {
				try {
					// 尝试解析传入的商品数据
					const passedItems = JSON.parse(decodeURIComponent(options.items));
					if (passedItems && Array.isArray(passedItems) && passedItems.length > 0) {
						this.cartItems = passedItems;
						this.loading = false;
					}
				} catch (e) {
					console.error('解析传入商品数据失败:', e);
				}
			}
			
			// 如果没有成功从外部获取数据，则从API获取购物车商品
			if (!this.cartItems || this.cartItems.length === 0) {
				this.loadCartItems();
			}
			
			// 无论如何都获取可用优惠券
			this.loadUserCoupons();
		},
		methods: {
			// 加载购物车数据
			loadCartItems() {
				this.loading = true;
				
				api.request({
					url: '/cart',
					method: 'GET',
					success: (res) => {
						this.loading = false;
						
						if (res.statusCode === 200) {
							// 处理不同的数据结构
							if (res.data.code === 200 && res.data.data) {
								// 处理 {code:200, data:{items:[...]}} 的结构
								const cartData = res.data.data;
							// 只获取已选中的商品
								this.cartItems = cartData.items ? cartData.items.filter(item => item.selected) : [];
							} else if (Array.isArray(res.data)) {
								// 处理直接返回数组 [...] 的结构
							this.cartItems = res.data.filter(item => item.selected);
							} else if (res.data.items && Array.isArray(res.data.items)) {
								// 处理 {items:[...]} 的结构
								this.cartItems = res.data.items.filter(item => item.selected);
							}
							
							// 如果没有选中商品，返回购物车页面
							if (this.cartItems.length === 0) {
								uni.showModal({
									title: '提示',
									content: '请先选择商品后再结算',
									showCancel: false,
									success: () => {
										uni.navigateBack();
									}
								});
							}
						} else if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
							// 处理认证失败
							uni.removeStorageSync('token');
							uni.showToast({
								title: '登录已过期，请重新登录',
								icon: 'none'
							});
							
							setTimeout(() => {
								uni.navigateTo({
									url: '/pages/login/login'
								});
							}, 1500);
						} else {
							// 处理其他错误
							uni.showToast({
								title: res.data.message || '获取购物车失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						this.loading = false;
						console.error('获取购物车失败', err);
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
					}
				});
			},
			
			// 加载用户优惠券
			loadUserCoupons() {
				const token = uni.getStorageSync('token');
				if (!token) {
					console.log('未找到token，无法获取优惠券');
					return;
				}
				
				// 获取当前订单总金额用于判断优惠券是否可用
				const totalPrice = this.calculateTotalPrice();
				
				// 使用api.js的方法
				api.getCoupons(0) // status=0表示未使用的优惠券
					.then(res => {
						
						if (res.statusCode === 200) {
							let couponsData = [];
							
							// 直接处理标准响应结构
							if (res.data && res.data.code === 200 && res.data.data && res.data.data.content) {
								// 正确处理分页数据结构
								couponsData = res.data.data.content;
							} else {
								this.availableCoupons = [];
								return;
							}
							
							if (couponsData.length === 0) {
								this.availableCoupons = [];
								return;
							}
							
							// 处理优惠券数据...
							let processedCoupons = couponsData.map(item => {
								
								// 根据接口文档，优惠券的详细信息在coupon属性中
								const coupon = item.coupon || item;
								
								// 尝试从不同的可能字段名获取最低消费金额
								const minConsumption = parseFloat(
									coupon.minConsumption || 
									coupon.minPoint || 
									coupon.min_point || 
									coupon.minAmount || 
									0
								);
								
								// 确定优惠券类型
								const type = parseInt(coupon.type || 1);
								
								// 优惠券金额/折扣率
								const amount = parseFloat(coupon.amount || 0);
								
								// 判断是否可用 - 优先使用API的canUse，否则判断订单金额
								let canUse = typeof item.canUse !== 'undefined' ? item.canUse : (totalPrice >= minConsumption);
								
								// 规范化优惠券数据
								return {
									id: item.id || coupon.id || '',
									couponId: coupon.id || '',
									name: coupon.name || '优惠券',
									amount: amount,
									type: type, // 1: 满减券, 2: 折扣券
									typeText: coupon.typeText || (type === 2 ? '折扣券' : '满减券'),
									description: coupon.description || '',
									minConsumption: minConsumption,
									startTime: coupon.startTime || '',
									endTime: coupon.endTime || '',
									expireDate: coupon.endTime || '',
									status: item.status || 0,
									statusText: item.statusText || '未使用',
									canUse: canUse
								};
							});
							
							// 过滤和排序优惠券...
							this.availableCoupons = processedCoupons.filter(coupon => 
								coupon.status === 0 || coupon.statusText === '未使用'
							);
							
							// 先展示可用的再展示不可用的
							this.availableCoupons.sort((a, b) => {
								// 先按照可用状态排序（可用的在前）
								if (a.canUse !== b.canUse) {
									return a.canUse ? -1 : 1;
								}
								
								// 对于可用的优惠券，折扣券和满减券按照折扣额度排序
								if (a.canUse) {
									// 计算实际折扣金额用于排序
									const aValue = a.type === 2 ? totalPrice * (1 - a.amount) : a.amount;
									const bValue = b.type === 2 ? totalPrice * (1 - b.amount) : b.amount;
									return bValue - aValue; // 折扣大的优先
								}
								
								// 不可用的按照最低消费金额排序
								return a.minConsumption - b.minConsumption;
							});
							
						} else {
							this.availableCoupons = [];
						}
					})
					.catch(err => {
						console.error('获取优惠券请求失败，错误详情:', err);
						this.availableCoupons = [];
					});
			},
			
			// 选择优惠券
			openCouponModal() {
				this.showCouponModal = true;
			},
			
			// 关闭优惠券选择弹窗
			closeCouponModal() {
				this.showCouponModal = false;
			},
			
			// 选择优惠券
			selectCoupon(coupon) {
				// 检查优惠券是否满足使用条件
				if (!coupon.canUse) {
					this.showMinAmountTips(coupon);
					return;
				}
				
				this.selectedCoupon = coupon;
				this.showCouponModal = false;
			},
			
			// 选择不使用优惠券
			selectNoCoupon() {
							this.selectedCoupon = null;
				this.showCouponModal = false;
			},
			
			// 确认优惠券选择
			confirmCouponSelection() {
				this.showCouponModal = false;
			},
			
			// 选择支付方式
			selectPayment(method) {
				this.paymentMethod = method;
			},
			
			// 计算单个商品价格
			calculateItemPrice(item) {
				console.log('计算商品价格:', item);
				
				// 防止item为undefined
				if (!item) {
					console.error('商品数据为空');
					return 0;
				}
				
				let price = 0;
				
				// 尝试从不同数据结构中获取价格
				if (item.product && typeof item.product.price !== 'undefined') {
					price = item.product.price;
				} else if (typeof item.productPrice !== 'undefined') {
					price = item.productPrice;
				} else if (typeof item.price !== 'undefined') {
					price = item.price;
				} else {
					return 0;
				}
				
				// 确保价格是数字类型
				price = parseFloat(price) || 0;
				
				// 计算配料额外价格
				if (item.ingredients && item.ingredients.length > 0) {
					const ingredientsPrice = item.ingredients.reduce((sum, ing) => {
						const ingPrice = parseFloat(ing.price) || 0;
						return sum + ingPrice;
					}, 0);
					
					price += ingredientsPrice;
				}
				
				const quantity = parseInt(item.quantity) || 1;
				const totalPrice = price * quantity;
				
				return totalPrice;
			},
			
			// 计算商品总价
			calculateTotalPrice() {
				return this.cartItems.reduce((sum, item) => sum + this.calculateItemPrice(item), 0);
			},
			
			// 计算最终价格（含优惠）
			calculateFinalPrice() {
				// 计算商品总价
				let total = this.calculateTotalPrice();
				
				// 先应用优惠券
				if (this.selectedCoupon) {
					if (this.selectedCoupon.type === 2) { // 折扣券
						// 折扣券金额是折扣率，如0.8表示8折
						const discountRate = this.selectedCoupon.amount;
						// 计算折扣金额
						const discountAmount = total * (1 - discountRate);
						total = total - discountAmount;
					} else { // 满减券
						total = Math.max(0, total - this.selectedCoupon.amount);
					}
				}
				
				// 然后对剩余金额应用会员折扣
				if (this.memberDiscount < 1) {
					const beforeDiscount = total;
					// 四舍五入保留两位小数
					total = Math.round(total * this.memberDiscount * 100) / 100;
				}
				
				return total > 0 ? total : 0;
			},
			
			// 获取优惠券折扣金额方法
			getCouponDiscountAmount() {
				if (!this.selectedCoupon) return 0;
				
				const totalPrice = this.calculateTotalPrice();
				
				if (this.selectedCoupon.type === 2) { // 折扣券
					// 折扣券折扣金额 = 原价 × (1 - 折扣率)
					return totalPrice * (1 - this.selectedCoupon.amount);
				} else { // 满减券
					return this.selectedCoupon.amount;
				}
			},
			
			// 获取会员折扣金额方法
			getMemberDiscountAmount() {
				if (this.memberDiscount >= 1) return 0;
				
				// 先计算应用优惠券后的金额
				let priceAfterCoupon = this.getPriceAfterCoupon();
				
				// 会员折扣金额 = 优惠券后金额 × (1 - 会员折扣率)
				let discountAmount = priceAfterCoupon * (1 - this.memberDiscount);
				
				// 舍入到两位小数
				discountAmount = Math.round(discountAmount * 100) / 100;
				
				return discountAmount;
			},
			
			// 获取优惠券后金额方法
			getPriceAfterCoupon() {
				const totalPrice = this.calculateTotalPrice();
				
				if (!this.selectedCoupon) return totalPrice;
				
				if (this.selectedCoupon.type === 2) { // 折扣券
					return totalPrice * this.selectedCoupon.amount;
				} else { // 满减券
					return Math.max(0, totalPrice - this.selectedCoupon.amount);
				}
			},
			
			// 提交订单
			submitOrder() {
				if (this.cartItems.length === 0) {
					uni.showToast({
						title: '请先选择商品',
						icon: 'none'
					});
					return;
				}

				uni.showLoading({
					title: '提交中...'
				});
				
				// 构建符合API格式的订单数据
				const orderData = {
					// 购物车商品ID列表
					cartIds: this.cartItems.map(item => item.id || 0).filter(id => id > 0),
					
					// 直接购买的商品信息（如果有）
					directProduct: this.cartItems.length === 1 && this.cartItems[0].directBuy ? {
						productId: this.cartItems[0].productId || this.cartItems[0].product?.id,
						quantity: this.cartItems[0].quantity || 1,
						cartId: this.cartItems[0].id || 0,
						temperature: this.cartItems[0].temperature || "",
						sweetness: this.cartItems[0].sweetness || "",
						ingredients: (this.cartItems[0].ingredients || []).map(ing => ({
							id: ing.id || 0,
							name: ing.name || "",
							price: ing.price || 0
						})),
						selected: true
					} : null,
					
					// 备注/说明
					remark: this.note || "",
					
					// 优惠券ID
					userCouponId: this.selectedCoupon ? (this.selectedCoupon.id || 0) : null
				};
				
				// 如果没有直接购买商品，则移除该字段
				if (!orderData.directProduct) {
					delete orderData.directProduct;
				}
				
				// 如果没有选择优惠券，则移除该字段
				if (!orderData.userCouponId) {
					delete orderData.userCouponId;
				}
				
				const token = uni.getStorageSync('token');
				if (!token) {
					uni.hideLoading();
					uni.navigateTo({
						url: '/pages/login/login'
					});
					return;
				}
				
				// 使用api.js的createOrder方法
				api.createOrder(orderData)
					.then(res => {
						uni.hideLoading();
						
						if (res.statusCode === 200 || res.statusCode === 201) {
							// 获取订单ID和订单号
							let orderId, orderNo;
							
							if (res.data && res.data.code === 200 && res.data.data) {
								// 标准API响应结构
								orderId = res.data.data.id || res.data.data.orderId;
								orderNo = res.data.data.orderNo;
							} else if (res.data) {
								// 备用结构
								orderId = res.data.orderId || res.data.id;
								orderNo = res.data.orderNo;
							}
							
							if (orderId || orderNo) {
								uni.showToast({
									title: '订单提交成功',
									icon: 'success',
									duration: 2000
								});
								
								// 清空已选中的购物车商品
								if (this.cartItems.length > 0) {
									this.clearSelectedCartItems();
								}
								
								// 跳转到订单详情页面
								setTimeout(() => {
									uni.navigateTo({
										url: `/pages/order/detail?orderNo=${orderNo || orderId}`
									});
								}, 1500);
							} else {
								uni.showToast({
									title: '订单数据异常',
									icon: 'none'
								});
								console.error('订单创建成功但返回数据异常', res.data);
							}
						} else {
							// 显示错误信息
							let errorMsg = '创建订单失败';
							if (res.data && res.data.message) {
								errorMsg = res.data.message;
							}
							uni.showToast({
								title: errorMsg,
								icon: 'none',
								duration: 2000
							});
							console.error('创建订单失败:', res);
						}
					})
					.catch(err => {
						uni.hideLoading();
						console.error('提交订单失败:', err);
						uni.showToast({
							title: '网络请求失败，请稍后再试',
							icon: 'none',
							duration: 2000
						});
					});
			},
			
			// 清空已选中的购物车商品
			clearSelectedCartItems() {
				const token = uni.getStorageSync('token');
				if (!token) return;
				
				// 发送请求移除购物车中已选择的商品
				api.request({
					url: '/cart/selected',
					method: 'DELETE',
					success: (res) => {
						console.log('移除已选择的购物车商品成功:', res.data);
					},
					fail: (err) => {
						console.error('移除购物车商品失败:', err);
					}
				});
			},
			
			// 获取商品图片
			getProductImage(item) {
				if (item.product && item.product.image) {
					return item.product.image;
				} else if (item.productImage) {
					return item.productImage;
				}
				return '/static/default-product.png';
			},
			
			// 获取商品名称
			getProductName(item) {
				if (item.product && item.product.name) {
					return item.product.name;
				} else if (item.productName) {
					return item.productName;
				}
				return '未知商品';
			},
			
			// 检查是否有配料
			hasIngredients(item) {
				return item.ingredients && item.ingredients.length > 0;
			},
			
			// 格式化配料显示
			formatIngredients(item) {
				if (!this.hasIngredients(item)) return '';
				
				return item.ingredients.map(ing => {
					return ing.name || ing;
				}).join('、');
			},
			
			// 显示未满足最低金额的提示
			showMinAmountTips(coupon) {
				const diff = coupon.minConsumption - this.calculateTotalPrice();
				uni.showToast({
					title: `还差¥${diff.toFixed(2)}才能使用此${coupon.type === 2 ? '折扣' : ''}优惠券`,
					icon: 'none',
					duration: 2000
				});
			},
			
			// 获取会员等级信息
			getMemberInfo() {
				const token = uni.getStorageSync('token');
				if (!token) return;
				
				// 使用api.js的getMemberInfo方法
				api.getMemberInfo()
					.then(res => {
						console.log('获取会员信息响应状态码:', res.statusCode);
						console.log('获取会员信息完整响应:', JSON.stringify(res.data));
						
						if (res.statusCode === 200 && res.data && res.data.code === 200) {
							this.memberInfo = res.data.data;
							
							// 设置会员折扣
							if (this.memberInfo && this.memberInfo.discount) {
								this.memberDiscount = parseFloat(this.memberInfo.discount);
							}
						} else {
							console.error('获取会员信息失败:', res.data);
						}
					})
					.catch(err => {
						console.error('获取会员信息请求失败:', err);
					});
			}
		}
	}
</script>

<style>
	/* 整体容器 */
	.confirm-container {
		height: 100vh;
		background-color: #121212;
		position: relative;
		display: flex;
		flex-direction: column;
	}
	
	.confirm-content {
		flex: 1;
		height: calc(100vh - 120rpx); /* 减去结算栏高度 */
		overflow-y: auto;
	}
	
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		color: #ffffff;
	}
	
	.section-title {
		font-size: 28rpx;
		color: #888888;
	}
	
	.arrow {
		font-size: 30rpx;
		color: #666666;
	}
	
	/* 商品列表 */
	.product-section {
		background-color: #1a1a1a;
		padding: 30rpx;
		margin-bottom: 20rpx;
		border-radius: 16rpx;
		margin: 20rpx;
	}
	
	.product-list {
		margin-top: 20rpx;
	}
	
	.product-item {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #333333;
	}
	
	.product-item:last-child {
		border-bottom: none;
	}
	
	.product-image {
		width: 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
		margin-right: 20rpx;
		background-color: #2a2a2a;
	}
	
	.product-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	
	.product-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}
	
	.product-name {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.product-quantity {
		font-size: 28rpx;
		color: #999999;
	}
	
	.product-options {
		font-size: 24rpx;
		color: #888888;
		margin-bottom: 10rpx;
	}
	
	.product-options text {
		margin-right: 20rpx;
	}
	
	.product-price {
		font-size: 28rpx;
		color: #7b68ee;
	}
	
	/* 优惠券 */
	.coupon-section {
		background-color: #1a1a1a;
		padding: 30rpx;
		margin-bottom: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 16rpx;
		margin: 20rpx;
	}
	
	.coupon-right {
		display: flex;
		align-items: center;
	}
	
	.coupon-value {
		font-size: 28rpx;
		color: #7b68ee;
		margin-right: 10rpx;
	}
	
	.no-coupon {
		font-size: 28rpx;
		color: #999999;
		margin-right: 10rpx;
	}
	
	/* 支付方式 */
	.payment-section {
		background-color: #1a1a1a;
		padding: 30rpx;
		margin-bottom: 20rpx;
		border-radius: 16rpx;
		margin: 20rpx;
	}
	
	.payment-methods {
		display: flex;
		margin-top: 20rpx;
	}
	
	.payment-method {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
		border-radius: 8rpx;
		border: 2rpx solid transparent;
		background-color: #2a2a2a;
		margin: 0 10rpx;
	}
	
	.payment-method:first-child {
		margin-left: 0;
	}
	
	.payment-method:last-child {
		margin-right: 0;
	}
	
	.payment-method.selected {
		border-color: #7b68ee;
		background-color: rgba(123, 104, 238, 0.1);
	}
	
	.payment-icon {
		height: 60rpx;
		margin-bottom: 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.payment-icon .icon {
		width: 60rpx;
		height: 60rpx;
	}
	
	.payment-name {
		font-size: 26rpx;
		color: #ffffff;
	}
	
	/* 备注 */
	.note-section {
		background-color: #1a1a1a;
		padding: 30rpx;
		margin-bottom: 20rpx;
		border-radius: 16rpx;
		margin: 20rpx;
	}
	
	.note-input {
		margin-top: 20rpx;
		height: 80rpx;
		border: 1rpx solid #333333;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		background-color: #2a2a2a;
		color: #ffffff;
	}
	
	/* 金额明细 */
	.price-detail {
		background-color: #1a1a1a;
		padding: 30rpx;
		margin-bottom: 20rpx;
		border-radius: 16rpx;
		margin: 20rpx;
	}
	
	.price-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}
	
	.price-row:last-child {
		margin-bottom: 0;
	}
	
	.price-label {
		font-size: 28rpx;
		color: #999999;
	}
	
	.price-value {
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.discount {
		color: #7b68ee;
	}
	
	/* 底部占位，确保内容不被结算栏遮挡 */
	.bottom-placeholder {
		height: 120rpx;
	}
	
	/* 结算栏 */
	.checkout-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 120rpx;
		background-color: #1a1a1a;
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.3);
		z-index: 100;
		box-sizing: border-box;
	}
	
	.total-section {
		flex: 1; /* 让总价部分占据剩余空间 */
		display: flex;
		align-items: center;
	}
	
	.total-text {
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.total-price {
		font-size: 36rpx;
		color: #7b68ee;
		font-weight: bold;
	}
	
	.submit-btn {
		width: 240rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background-color: #7b68ee;
		color: #ffffff;
		border-radius: 40rpx;
		font-size: 30rpx;
		margin-left: auto; /* 确保按钮靠右 */
	}
	
	/* 优惠券选择弹窗 */
	.coupon-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}
	
	.coupon-modal-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
	
	.coupon-modal-container {
		background-color: #1a1a1a;
		padding: 30rpx;
		border-radius: 16rpx;
		width: 90%;
		max-width: 650rpx;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
	}
	
	.coupon-modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.coupon-modal-title {
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.coupon-modal-close {
		font-size: 30rpx;
		color: #ffffff;
	}
	
	.coupon-modal-content {
		flex: 1;
		max-height: 60vh;
		overflow-y: auto;
	}
	
	.coupon-list {
		margin-bottom: 20rpx;
	}
	
	/* 优惠券卡片样式 - 仅应用于弹窗内 */
	.coupon-modal .coupon-card {
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
	
	.coupon-modal .coupon-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		width: 10rpx;
		height: 100%;
		background-color: #7b68ee;
		border-radius: 10rpx 0 0 10rpx;
	}
	
	.coupon-modal .coupon-card::after {
		content: '';
		position: absolute;
		right: 25%;
		top: 0;
		width: 2rpx;
		height: 100%;
		background-image: linear-gradient(to bottom, #333333 0%, #333333 50%, transparent 50%);
		background-size: 2rpx 12rpx;
		background-repeat: repeat-y;
	}
	
	.coupon-modal .coupon-card.selected {
		background: linear-gradient(135deg, #332e59 0%, #1a1842 100%);
		border: 1rpx solid #7b68ee;
	}
	
	/* 不可用优惠券样式 */
	.coupon-modal .coupon-card.disabled {
		opacity: 0.7;
		background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
	}
	
	.coupon-modal .coupon-card.disabled::before {
		background-color: #555555;
	}
	
	.coupon-disabled-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.3);
		z-index: 3;
	}
	
	.condition-not-met {
		color: #ff6b6b !important;
		background-color: rgba(255, 107, 107, 0.1) !important;
	}
	
	.coupon-modal .coupon-left {
		flex: 3;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 10rpx 20rpx;
		position: relative;
		z-index: 1;
		min-width: 160rpx;
	}
	
	.coupon-modal .coupon-amount {
		font-size: 40rpx;
		font-weight: bold;
		color: #7b68ee;
		margin-bottom: 10rpx;
	}
	
	.coupon-modal .coupon-condition {
		font-size: 22rpx;
		color: #999999;
		margin-top: 8rpx;
		background-color: rgba(123, 104, 238, 0.1);
		padding: 6rpx 12rpx;
		border-radius: 10rpx;
		display: inline-block;
		white-space: nowrap;
	}
	
	.coupon-modal .coupon-right {
		flex: 6;
		padding: 10rpx 20rpx 10rpx 40rpx;
		border-left: none;
		display: flex;
		flex-direction: column;
		justify-content: center;
		z-index: 1;
	}
	
	.coupon-modal .coupon-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 8rpx;
	}
	
	.coupon-modal .coupon-desc {
		font-size: 24rpx;
		color: #aaaaaa;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	
	.coupon-modal .coupon-date {
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
	
	.coupon-modal-footer {
		text-align: right;
		margin-top: 20rpx;
		display: flex;
		justify-content: center;
		padding: 0 20rpx;
	}
	
	.cancel-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background-color: #333333;
		color: #aaaaaa;
		border-radius: 40rpx;
		font-size: 28rpx;
		margin-right: 20rpx;
		max-width: 220rpx;
	}
	
	.confirm-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background-color: #7b68ee;
		color: #ffffff;
		border-radius: 40rpx;
		font-size: 28rpx;
		max-width: 220rpx;
	}
	
	.no-coupons {
		text-align: center;
		padding: 20rpx;
		color: #999999;
	}
	
	/* 引入字体图标 */
	@font-face {
		font-family: 'iconfont';
		src: url('https://at.alicdn.com/t/font_3094924_eoqn9nhzl6.woff2') format('woff2'),
			 url('https://at.alicdn.com/t/font_3094924_eoqn9nhzl6.woff') format('woff'),
			 url('https://at.alicdn.com/t/font_3094924_eoqn9nhzl6.ttf') format('truetype');
	}
	
	.iconfont {
		font-family: "iconfont" !important;
		font-size: 48rpx;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
	
	.icon-wechat:before {
		content: "\e63b";
		color: #07C160;
	}
	
	.icon-alipay:before {
		content: "\e618";
		color: #1677FF;
	}
	
	.icon-point:before {
		content: "\e657";
		color: #FF6B00;
	}
</style> 