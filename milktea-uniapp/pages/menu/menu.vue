<template>
	<view class="menu-container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-box" @click="goToSearch">
				<image src="/static/icons/common/search.svg" class="search-icon"></image>
				<text class="search-placeholder">搜索奶茶、果茶、小吃</text>
			</view>
		</view>
		
		<!-- 内容区带分类导航 -->
		<view class="content-with-categories">
			<!-- 左侧分类导航 -->
			<scroll-view scroll-y class="category-nav">
				<view 
					v-for="(category, index) in categories" 
					:key="category.id" 
					:class="['category-item', currentCategoryIndex === index ? 'active' : '']"
					@click="switchCategory(index)"
				>
					<text>{{category.name}}</text>
				</view>
			</scroll-view>
			
			<!-- 右侧商品列表 -->
			<scroll-view 
				scroll-y 
				class="product-list" 
				@scrolltolower="loadMoreProducts" 
				:scroll-into-view="scrollToId"
			>
				<!-- 推荐商品 -->
				<view class="section" v-if="currentCategoryIndex === 0">
					<view class="section-title">
						<text>推荐商品</text>
					</view>
					<view class="product-grid">
						<view 
							class="product-card" 
							v-for="product in recommendProducts" 
							:key="product.id"
							@click="showProductDetail(product)"
						>
							<image :src="product.image || '/static/images/default-product.svg'" class="product-image" mode="aspectFill"></image>
							<view class="product-info">
								<text class="product-name">{{product.name}}</text>
								<view class="product-price-row">
									<text class="product-price">¥{{product.price.toFixed(2)}}</text>
									<view class="add-to-cart-btn" @click.stop="showProductDetail(product)">
										<image src="/static/icons/common/add.svg" class="add-icon"></image>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 分类商品 -->
				<view 
					class="section" 
					v-for="(category, index) in categories" 
					:key="category.id" 
					:id="'category-section-' + category.id"
					v-show="currentCategoryIndex === 0 || currentCategoryIndex === index"
				>
					<view class="section-title">
						<text>{{category.name}}</text>
					</view>
					<view class="product-grid">
						<view 
							class="product-card" 
							v-for="product in categoryProducts[category.id] || []" 
							:key="product.id"
							@click="showProductDetail(product)"
						>
							<image :src="product.image || '/static/images/default-product.svg'" class="product-image" mode="aspectFill"></image>
							<view class="product-info">
								<text class="product-name">{{product.name}}</text>
								<view class="product-price-row">
									<text class="product-price">¥{{product.price.toFixed(2)}}</text>
									<view class="add-to-cart-btn" @click.stop="showProductDetail(product)">
										<image src="/static/icons/common/add.svg" class="add-icon"></image>
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 加载更多状态 -->
					<view class="load-more" v-if="categoryLoadingStatus[category.id] === 'loading'">
						<view class="loading-spinner"></view>
						<text>加载中...</text>
					</view>
					<view class="load-more" v-else-if="categoryLoadingStatus[category.id] === 'noMore'">
						<text>已加载全部</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 商品详情弹窗 - 预先渲染但隐藏 -->
		<view class="product-detail-popup" v-show="showDetail">
			<view class="popup-mask" @click="hideProductDetail" :style="maskStyle"></view>
			<view class="popup-content" :style="popupStyle">
				<!-- 添加内容淡入效果 -->
				<view class="popup-inner" :style="contentStyle">
					<!-- 关闭按钮 -->
					<view class="close-btn" @click="hideProductDetail">
						<image src="/static/icons/common/close.svg" class="close-icon"></image>
					</view>
					
					<!-- 商品基本信息 -->
					<view class="detail-header">
						<image :src="currentProduct.image || '/static/images/default-product.svg'" class="detail-image" mode="aspectFill"></image>
						<view class="detail-basic-info">
							<view class="name-price-row">
								<text class="detail-name">{{currentProduct.name}}</text>
								<text class="detail-price">¥{{currentProduct.price ? currentProduct.price.toFixed(2) : '0.00'}}</text>
							</view>
							<text class="detail-sales" v-if="currentProduct.sales">销量: {{currentProduct.sales}}</text>
						</view>
					</view>
					
					<!-- 规格选择 -->
					<view class="specifications">
						<!-- 温度选择 -->
						<view class="spec-section">
							<view class="spec-title-row">
								<image src="/static/icons/common/temperature.svg" class="spec-icon"></image>
							<text class="spec-title">温度</text>
							</view>
							<view class="spec-options">
								<view 
									v-for="(temp, index) in temperatures" 
									:key="index" 
									:class="['spec-option', selectedTemp === temp ? 'selected' : '']"
									@click="selectedTemp = temp"
								>
									<text>{{temp}}</text>
								</view>
							</view>
						</view>
						
						<!-- 甜度选择 -->
						<view class="spec-section">
							<view class="spec-title-row">
								<image src="/static/icons/common/sweetness.svg" class="spec-icon"></image>
							<text class="spec-title">甜度</text>
							</view>
							<view class="spec-options">
								<view 
									v-for="(sweet, index) in sweetness" 
									:key="index" 
									:class="['spec-option', selectedSweet === sweet ? 'selected' : '']"
									@click="selectedSweet = sweet"
								>
									<text>{{sweet}}</text>
								</view>
							</view>
						</view>
						
						<!-- 配料选择 -->
						<view class="spec-section" v-if="ingredients.length > 0">
							<view class="spec-title-row">
								<image src="/static/icons/common/ingredients.svg" class="spec-icon"></image>
							<text class="spec-title">加料</text>
							</view>
							<view class="ingredient-options">
								<view 
									v-for="ing in ingredients" 
									:key="ing.id" 
									:class="['ingredient-item', selectedIngredients.findIndex(i => i.id === ing.id) > -1 ? 'selected' : '']"
									@click="toggleIngredient(ing)"
								>
									<text class="ingredient-name">{{ing.name}}</text>
									<text class="ingredient-price">¥{{ing.price.toFixed(2)}}</text>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 数量调整 -->
					<view class="quantity-section">
						<view class="spec-title-row">
							<image src="/static/icons/common/quantity.svg" class="spec-icon"></image>
						<text class="quantity-label">数量</text>
						</view>
						<view class="quantity-control">
							<text class="quantity-btn minus" @click="adjustQuantity(-1)">-</text>
							<input type="number" class="quantity-input" v-model="quantity" disabled />
							<text class="quantity-btn plus" @click="adjustQuantity(1)">+</text>
						</view>
					</view>
					
					<!-- 底部按钮 -->
					<view class="detail-footer">
						<view class="total-price">
							<text>总计：</text>
							<text class="price-value">¥{{getTotalPrice().toFixed(2)}}</text>
						</view>
						<view class="add-to-cart" @click="addToCart">
							<text>加入购物车</text>
						</view>
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
				// 分类数据
				categories: [],
				currentCategoryIndex: 0,
				scrollToId: '',
				
				// 商品数据
				recommendProducts: [],
				categoryProducts: {}, // 按分类ID存储商品列表 {categoryId: [products]}
				categoryPages: {}, // 分页信息 {categoryId: currentPage}
				categoryLoadingStatus: {}, // 加载状态 {categoryId: 'loading'|'noMore'|'more'}
				
				// 商品详情
				showDetail: false,
				currentProduct: {},
				quantity: 1,
				popupStyle: {
					transform: 'translateY(100%)',
					transition: 'none'
				},
				maskStyle: {
					opacity: 0,
					transition: 'none'
				},
				contentStyle: {
					opacity: 0,
					transition: 'none'
				},
				
				// 规格选择
				temperatures: ['常温', '热', '冰', '少冰'],
				sweetness: ['标准糖', '少糖', '半糖', '微糖', '无糖'],
				ingredients: [],
				selectedTemp: '常温',
				selectedSweet: '标准糖',
				selectedIngredients: []
			}
		},
		onLoad(options) {
			this.loadCategories();
			this.loadRecommendProducts();
			this.loadIngredients();
			// 创建动画实例
			this.popupAnimation = uni.createAnimation({
				duration: 1000,
				timingFunction: 'ease-out',
				delay: 0
			});
			
			// 如果有productId参数，直接加载商品详情
			if (options.productId) {
				this.loadProductDetail(options.productId);
			}
		},
		methods: {
			// 加载商品分类
			loadCategories() {
				api.getCategories()
					.then(res => {
						console.log('获取商品分类响应:', res.data);
						if (res.data.code === 200) {
							// 添加"全部"分类
							this.categories = [
								{ id: 0, name: '全部' },
								...res.data.data
							];
							
							// 初始化分类商品数据结构
							this.categories.forEach(category => {
								if (category.id !== 0) { // 排除"全部"分类
									this.categoryProducts[category.id] = [];
									this.categoryPages[category.id] = 0;
									this.categoryLoadingStatus[category.id] = 'more';
									
									// 预加载每个分类的商品
									this.loadCategoryProducts(category.id);
								}
							});
						} else {
							this.showToast(res.data.message || '获取商品分类失败');
						}
					})
					.catch(err => {
						console.error('网络请求失败:', err);
						this.showToast('网络请求失败');
					});
			},
			
			// 加载推荐商品
			loadRecommendProducts() {
				api.getRecommendProducts()
					.then(res => {
						console.log('获取推荐商品响应:', res.data);
						if (res.data.code === 200) {
							this.recommendProducts = res.data.data;
						} else {
							this.showToast(res.data.message || '获取推荐商品失败');
						}
					})
					.catch(err => {
						console.error('网络请求失败:', err);
						this.showToast('网络请求失败');
					});
			},
			
			// 加载配料列表
			loadIngredients() {
				api.getIngredients()
					.then(res => {
						console.log('获取配料列表响应:', res.data);
						if (res.data.code === 200) {
							this.ingredients = res.data.data;
						} else {
							this.showToast(res.data.message || '获取配料列表失败');
						}
					})
					.catch(err => {
						console.error('网络请求失败:', err);
						this.showToast('网络请求失败');
					});
			},
			
			// 加载分类商品
			loadCategoryProducts(categoryId, isLoadMore = false) {
				if (this.categoryLoadingStatus[categoryId] === 'loading' || this.categoryLoadingStatus[categoryId] === 'noMore') {
					return;
				}
				
				this.categoryLoadingStatus[categoryId] = 'loading';
				
				const page = isLoadMore ? this.categoryPages[categoryId] + 1 : this.categoryPages[categoryId];
				const size = 10;
				
				api.getCategoryProducts(categoryId, page, size)
					.then(res => {
						console.log(`获取分类${categoryId}商品响应:`, res.data);
						if (res.data.code === 200) {
							const data = res.data.data;
							
							// 合并数据
							if (isLoadMore) {
								this.categoryProducts[categoryId] = [...this.categoryProducts[categoryId], ...data.content];
							} else {
								this.categoryProducts[categoryId] = data.content;
							}
							
							// 更新分页状态
							this.categoryPages[categoryId] = page;
							
							// 判断是否还有更多数据
							if (data.last) {
								this.categoryLoadingStatus[categoryId] = 'noMore';
							} else {
								this.categoryLoadingStatus[categoryId] = 'more';
							}
						} else {
							this.showToast(res.data.message || '获取分类商品失败');
							this.categoryLoadingStatus[categoryId] = 'more';
						}
					})
					.catch(err => {
						console.error('网络请求失败:', err);
						this.showToast('网络请求失败');
						this.categoryLoadingStatus[categoryId] = 'more';
					});
			},
			
			// 切换分类
			switchCategory(index) {
				this.currentCategoryIndex = index;
				
				// 如果是切换到"全部"分类，无需滚动
				if (index === 0) return;
				
				// 滚动到对应分类
				const categoryId = this.categories[index].id;
				this.scrollToId = 'category-section-' + categoryId;
			},
			
			// 加载更多商品
			loadMoreProducts() {
				// 全部分类视图下，不触发加载更多
				if (this.currentCategoryIndex === 0) return;
				
				// 获取当前选中的分类ID
				const categoryId = this.categories[this.currentCategoryIndex].id;
				this.loadCategoryProducts(categoryId, true);
			},
			
			// 预加载商品详情
			loadProductDetail(productId) {
				api.getProductDetail(productId)
					.then(res => {
						if (res.data.code === 200) {
							this.currentProduct = res.data.data;
							this.resetProductOptions();
							this.openDetailPopup();
						} else {
							this.showToast(res.data.message || '获取商品详情失败');
						}
					})
					.catch(err => {
						console.error('网络请求失败:', err);
						this.showToast('网络请求失败');
					});
			},
			
			// 显示商品详情
			showProductDetail(product) {
				// 先重置选项，避免显示上一次的选择
				this.resetProductOptions();
				
				// 先显示弹窗，但内容透明
				this.showDetail = true;
				this.popupStyle = {
					transform: 'translateY(100%)',
					transition: 'none'
				};
				this.maskStyle = {
					opacity: 0,
					transition: 'none'
				};
				this.contentStyle = {
					opacity: 0,
					transition: 'none'
				};
				
				// 强制重绘DOM
				this.$nextTick(() => {
					// 让DOM更新完成
					setTimeout(() => {
						// 先加载商品详情数据
						api.getProductDetail(product.id)
							.then(res => {
								console.log('获取商品详情响应:', res.data);
								if (res.data.code === 200) {
									// 设置数据
									this.currentProduct = res.data.data;
									
									// 打开弹窗
									this.openDetailPopup();
								} else {
									this.showToast(res.data.message || '获取商品详情失败');
									this.showDetail = false;
								}
							})
							.catch(err => {
								console.error('网络请求失败:', err);
								this.showToast('网络请求失败');
								this.showDetail = false;
							});
					}, 50);
				});
			},
			
			// 打开详情弹窗（动画部分）
			openDetailPopup() {
				// 第一步：显示蒙层
				this.maskStyle = {
					opacity: 1,
					transition: 'opacity 0.2s ease-out'
				};
				
				// 第二步：滑入弹窗
				setTimeout(() => {
					this.popupStyle = {
						transform: 'translateY(0)',
						transition: 'transform 0.3s ease-out'
					};
					
					// 第三步：显示内容
					setTimeout(() => {
						this.contentStyle = {
							opacity: 1,
							transition: 'opacity 0.2s ease-out'
						};
					}, 150);
				}, 100);
			},
			
			// 隐藏商品详情
			hideProductDetail() {
				// 第一步：隐藏内容
				this.contentStyle = {
					opacity: 0,
					transition: 'opacity 0.2s ease-in'
				};
				
				// 第二步：收起弹窗
				setTimeout(() => {
					this.popupStyle = {
						transform: 'translateY(100%)',
						transition: 'transform 0.3s ease-in'
					};
					
					// 第三步：隐藏蒙层
					setTimeout(() => {
						this.maskStyle = {
							opacity: 0,
							transition: 'opacity 0.2s ease-in'
						};
						
						// 最后完全隐藏
						setTimeout(() => {
							this.showDetail = false;
						}, 200);
					}, 150);
				}, 100);
			},
			
			// 重置商品选项
			resetProductOptions() {
				this.quantity = 1;
				this.selectedTemp = '常温';
				this.selectedSweet = '标准糖';
				this.selectedIngredients = [];
			},
			
			// 调整数量
			adjustQuantity(delta) {
				const newQuantity = this.quantity + delta;
				if (newQuantity >= 1 && newQuantity <= 99) {
					this.quantity = newQuantity;
				}
			},
			
			// 切换配料选择
			toggleIngredient(ingredient) {
				const index = this.selectedIngredients.findIndex(item => item.id === ingredient.id);
				if (index > -1) {
					this.selectedIngredients.splice(index, 1);
				} else {
					// 严格按照API文档要求的格式创建配料对象
					const ingredientObj = {
						id: ingredient.id,
						name: ingredient.name,
						price: ingredient.price
					};
					console.log('添加配料:', ingredientObj);
					this.selectedIngredients.push(ingredientObj);
				}
			},
			
			// 计算总价
			getTotalPrice() {
				if (!this.currentProduct.price) return 0;
				
				let total = this.currentProduct.price * this.quantity;
				
				// 加料价格
				this.selectedIngredients.forEach(ing => {
					total += ing.price * this.quantity;
				});
				
				return total;
			},
			
			// 添加到购物车（带规格）
			addToCart() {
				const token = uni.getStorageSync('token');
				
				if (!token) {
					// 修改：不直接跳转到登录页，而是先弹出确认对话框
					uni.showModal({
						title: '未登录提示',
						content: '您尚未登录，是否前往登录页面？',
						confirmText: '去登录',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								this.redirectToLogin();
							}
						}
					});
					return;
				}
				
				// 处理配料数据
				let ingredientsData = [];
				if (this.selectedIngredients && this.selectedIngredients.length > 0) {
					// 确保每个配料对象都有正确的字段
					ingredientsData = this.selectedIngredients.map(item => ({
						id: item.id,
						name: item.name,
						price: item.price
					}));
				}
				
				// 检查温度和甜度控制字段
				console.log('商品是否允许温度选择:', this.currentProduct.allowTemperature);
				console.log('商品是否允许甜度选择:', this.currentProduct.allowSweetness);
				console.log('商品可能的其他控制字段:', Object.keys(this.currentProduct).filter(key => key.startsWith('allow')));
				
				// 用户选择的温度和甜度
				console.log('用户选择的温度:', this.selectedTemp);
				console.log('用户选择的甜度:', this.selectedSweet);
				
				// 生成规格标识字符串（用于后续比较）
				const specKey = `${this.selectedTemp}-${this.selectedSweet}-${ingredientsData.map(i => i.id).join(',')}`;
				console.log('规格组合标识:', specKey);
				
				// 无论商品是否允许温度和甜度选择，都发送用户选择的值
				const cartData = {
					productId: this.currentProduct.id,
					quantity: this.quantity,
					temperature: this.selectedTemp,
					sweetness: this.selectedSweet,
					ingredients: ingredientsData,
					forceNewItem: true, // 添加标志，表示这是新项目
					selected: true
				};
				
				console.log('当前选择的配料原始数据:', this.selectedIngredients);
				console.log('处理后的配料数据:', ingredientsData);
				console.log('发送到购物车的数据:', cartData);
				console.log('当前商品是否允许配料:', this.currentProduct.allowIngredients);
				console.log('当前商品完整信息:', this.currentProduct);
				
				api.request({
					url: '/cart',
					method: 'POST',
					data: cartData
				}).then(res => {
					console.log('添加到购物车响应:', res.data);
					if (res.data.code === 200) {
						this.showToast('已添加到购物车', 'success');
						this.hideProductDetail();
					} else if (res.data.code === 401) {
						this.handleTokenExpired();
					} else {
						this.showToast(res.data.message || '添加到购物车失败');
					}
				}).catch(err => {
					console.error('网络请求失败:', err);
					this.showToast('网络请求失败');
				});
			},
			
			// 跳转到搜索页
			goToSearch() {
				uni.navigateTo({
					url: '/pages/menu/search'
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
			}
		}
	}
</script>

<style scoped>
	.menu-container {
		min-height: 100vh;
		background-color: #121212;
		position: relative;
	}
	
	/* 搜索栏 */
	.search-bar {
		padding: 20rpx 30rpx;
		background-color: #1a1a1a;
		position: sticky;
		top: 0;
		z-index: 10;
	}
	
	.search-box {
		display: flex;
		align-items: center;
		background-color: #262626;
		border-radius: 40rpx;
		padding: 15rpx 30rpx;
	}
	
	.search-icon {
		width: 28rpx;
		height: 28rpx;
		margin-right: 10rpx;
	}
	
	.search-placeholder {
		font-size: 28rpx;
		color: #888888;
	}
	
	/* 内容区带分类导航 */
	.content-with-categories {
		display: flex;
		height: calc(100vh - 110rpx);
	}
	
	/* 左侧分类导航 */
	.category-nav {
		width: 180rpx;
		background-color: #1a1a1a;
		height: 100%;
	}
	
	.category-item {
		padding: 30rpx 20rpx;
		text-align: center;
		font-size: 28rpx;
		color: #dddddd;
		position: relative;
	}
	
	.category-item.active {
		background-color: #121212;
		color: #7b68ee;
		font-weight: bold;
	}
	
	.category-item.active::after {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 6rpx;
		height: 30rpx;
		background-color: #7b68ee;
		border-radius: 3rpx;
	}
	
	/* 右侧商品列表 */
	.product-list {
		flex: 1;
		padding: 20rpx;
		height: 100%;
	}
	
	/* 分类标题 */
	.section {
		margin-bottom: 30rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 20rpx;
		padding-left: 10rpx;
		position: relative;
	}
	
	.section-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 4rpx;
		height: 30rpx;
		background-color: #7b68ee;
		border-radius: 2rpx;
	}
	
	/* 商品卡片网格 */
	.product-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
	
	.product-card {
		width: 48%;
		background-color: #1a1a1a;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
	}
	
	.product-image {
		width: 100%;
		height: 220rpx;
		background-color: #262626;
	}
	
	.product-info {
		padding: 20rpx;
	}
	
	.product-name {
		font-size: 28rpx;
		color: #ffffff;
		margin-bottom: 10rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.product-price-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.product-price {
		font-size: 30rpx;
		font-weight: bold;
		color: #7b68ee;
	}
	
	.add-to-cart-btn {
		width: 50rpx;
		height: 50rpx;
		background-color: #7b68ee;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.icon-add {
		color: #ffffff;
		font-size: 28rpx;
		font-weight: bold;
	}
	
	/* 加载状态 */
	.load-more {
		text-align: center;
		padding: 20rpx 0;
	}
	
	.loading-spinner {
		width: 40rpx;
		height: 40rpx;
		border: 3rpx solid #7b68ee;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		display: inline-block;
		vertical-align: middle;
		margin-right: 10rpx;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.load-more text {
		font-size: 24rpx;
		color: #888888;
		vertical-align: middle;
	}
	
	/* 商品详情弹窗 */
	.product-detail-popup {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1000;
		/* 提前创建层叠上下文 */
		transform: translateZ(0);
		pointer-events: auto;
	}
	
	.popup-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		will-change: opacity;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
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
		/* 使用transform提高性能 */
		transform: translateY(100%);
		will-change: transform;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
		/* 设置最大高度 */
		max-height: 85vh;
		overflow-y: auto;
	}
	
	/* 新增：内容容器 */
	.popup-inner {
		width: 100%;
		will-change: opacity;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
	}
	
	.close-btn {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
	}
	
	.close-icon {
		width: 30rpx;
		height: 30rpx;
	}
	
	/* 商品详情内容 */
	.detail-content {
		padding: 30rpx;
	}
	
	.detail-header {
		position: relative;
	}
	
	.detail-image {
		width: 100%;
		height: 400rpx;
		background-color: #262626;
	}
	
	.detail-basic-info {
		padding: 30rpx;
	}
	
	.name-price-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}
	
	.detail-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #ffffff;
		flex: 1;
		margin-right: 20rpx;
	}
	
	.detail-price {
		font-size: 36rpx;
		font-weight: bold;
		color: #7b68ee;
	}
	
	.detail-sales {
		font-size: 24rpx;
		color: #888888;
	}
	
	/* 规格选择区域 */
	.specifications {
		padding: 0 30rpx;
	}
	
	.spec-section {
		margin-bottom: 30rpx;
	}
	
	.spec-title-row {
		display: flex;
		align-items: center;
		margin-bottom: 15rpx;
	}
	
	.spec-icon {
		width: 36rpx;
		height: 36rpx;
		margin-right: 10rpx;
	}
	
	.spec-title {
		font-size: 28rpx;
		color: #aaaaaa;
	}
	
	.spec-options {
		display: flex;
		flex-wrap: wrap;
	}
	
	.spec-option {
		min-width: 120rpx;
		height: 60rpx;
		background-color: #262626;
		border-radius: 30rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
		padding: 0 20rpx;
	}
	
	.spec-option text {
		font-size: 24rpx;
		color: #ffffff;
	}
	
	.spec-option.selected {
		background-color: rgba(123, 104, 238, 0.2);
		border: 1rpx solid #7b68ee;
	}
	
	.spec-option.selected text {
		color: #7b68ee;
	}
	
	/* 配料选择 */
	.ingredient-options {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		width: 100%;
	}
	
	.ingredient-item {
		width: 30%;
		min-width: 120rpx;
		height: auto;
		background-color: #262626;
		border-radius: 10rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-right: 10rpx;
		margin-bottom: 15rpx;
		padding: 12rpx 10rpx;
		box-sizing: border-box;
		border: 1rpx solid transparent;
	}
	
	.ingredient-item:nth-child(3n) {
		margin-right: 0;
	}
	
	.ingredient-item.selected {
		background-color: rgba(123, 104, 238, 0.2);
		border: 1rpx solid #7b68ee;
	}
	
	.ingredient-name {
		font-size: 24rpx;
		color: #ffffff;
		margin-bottom: 4rpx;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}
	
	.ingredient-price {
		font-size: 22rpx;
		color: #7b68ee;
		text-align: center;
	}
	
	/* 数量调整 */
	.quantity-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #262626;
	}
	
	.quantity-label {
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.quantity-control {
		display: flex;
		align-items: center;
	}
	
	.quantity-btn {
		width: 60rpx;
		height: 60rpx;
		background-color: #262626;
		border-radius: 30rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 30rpx;
		color: #ffffff;
	}
	
	.quantity-input {
		width: 80rpx;
		text-align: center;
		margin: 0 20rpx;
		background-color: transparent;
		color: #ffffff;
		font-size: 28rpx;
	}
	
	/* 底部操作区 */
	.detail-footer {
		display: flex;
		padding: 30rpx;
		align-items: center;
	}
	
	.total-price {
		flex: 1;
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.price-value {
		font-size: 32rpx;
		font-weight: bold;
		color: #7b68ee;
	}
	
	.add-to-cart {
		min-width: 240rpx;
		height: 80rpx;
		background-color: #7b68ee;
		border-radius: 40rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.add-to-cart text {
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.add-icon {
		width: 30rpx;
		height: 30rpx;
	}
</style> 