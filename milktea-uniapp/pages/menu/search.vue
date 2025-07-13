<template>
	<view class="search-container">
		<!-- 顶部标题栏 -->
		<view class="navbar">
			<text class="page-title">搜索</text>
		</view>
		
		<!-- 搜索栏 -->
		<view class="search-header">
			<view class="search-box">
				<image src="/static/icons/common/search.svg" class="search-icon"></image>
				<input 
					type="text" 
					class="search-input" 
					placeholder="搜索奶茶、果茶、小吃" 
					placeholder-style="color: #888888;"
					v-model="keyword"
					@input="onKeywordInput"
					focus
				/>
				<view class="clear-icon" @click="clearKeyword" v-if="keyword">
					<image src="/static/icons/common/close.svg" class="close-icon-small"></image>
				</view>
			</view>
			<text class="cancel-btn" @click="goBack">取消</text>
		</view>
		
		<!-- 搜索历史 -->
		<view class="search-history" v-if="!keyword && searchHistory.length > 0 && !searching">
			<view class="section-header">
				<text class="section-title">搜索历史</text>
				<text class="clear-btn" @click="clearHistory">清空</text>
			</view>
			<view class="history-tags">
				<view 
					class="history-tag" 
					v-for="(item, index) in searchHistory" 
					:key="index"
					@click="useHistoryKeyword(item)"
				>
					<text>{{item}}</text>
				</view>
			</view>
		</view>
		
		<!-- 搜索中 -->
		<view class="loading-box" v-if="loading">
			<view class="loading-spinner"></view>
			<text class="loading-text">搜索中...</text>
		</view>
		
		<!-- 搜索结果 -->
		<scroll-view 
			scroll-y 
			class="search-results" 
			v-if="!loading && searchResults.length > 0"
			@scrolltolower="loadMoreResults"
		>
			<view 
				class="product-item" 
				v-for="product in searchResults" 
				:key="product.id"
				@click="showProductDetail(product)"
			>
				<image :src="product.image || '/static/default-product.png'" class="product-image" mode="aspectFill"></image>
				<view class="product-info">
					<view class="product-name">{{product.name}}</view>
					<view class="product-description" v-if="product.description">{{product.description}}</view>
					<view class="product-bottom">
						<text class="product-price">¥{{product.price.toFixed(2)}}</text>
						<view class="add-to-cart-btn" @click.stop="showProductDetail(product)">
							<image src="/static/icons/common/add.svg" class="add-icon"></image>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 加载状态 -->
			<view class="load-more" v-if="hasMore && !loadingMore">
				<text>上拉加载更多</text>
			</view>
			<view class="load-more" v-else-if="!hasMore">
				<text>已加载全部</text>
			</view>
			<view class="loading-more" v-if="loadingMore">
				<view class="loading-spinner"></view>
				<text>加载中...</text>
			</view>
		</scroll-view>
		
		<!-- 搜索无结果 -->
		<view class="no-results" v-if="hasSearched && searchResults.length === 0">
			<image src="/static/tabbar/menu.png" class="empty-icon"></image>
			<text class="no-results-text">没有找到相关商品</text>
		</view>
		
		<!-- 商品详情弹窗 -->
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
				keyword: '',
				searchHistory: [],
				searching: false,
				loading: false,
				loadingMore: false,
				searchResults: [],
				page: 0,
				size: 10,
				hasMore: true,
				searchTimer: null, // 用于防抖处理的计时器
				hasSearched: false, // 添加标记表示是否已进行过搜索
				
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
		onLoad() {
			// 加载搜索历史
			this.loadSearchHistory();
			// 加载配料
			this.loadIngredients();
		},
		methods: {
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
			
			// 处理关键词输入（添加防抖）
			onKeywordInput() {
				// 设置搜索中状态
				this.searching = true;
				
				// 清除之前的计时器
				if (this.searchTimer) {
					clearTimeout(this.searchTimer);
				}
				
				// 如果关键词为空，清空结果并退出
				if (!this.keyword.trim()) {
					this.searchResults = [];
					this.searching = this.keyword ? true : false;
					return;
				}
				
				// 设置300ms的延迟，避免频繁请求
				this.searchTimer = setTimeout(() => {
					this.searchProducts();
				}, 300);
			},
			
			// 搜索产品（修复API调用）
			searchProducts() {
				// 标记已经进行过搜索
				this.hasSearched = true;
				
				// 保存关键词到历史
				if (this.keyword.trim()) {
					this.saveKeywordToHistory(this.keyword);
				}
				
				// 重置分页
				this.page = 0;
				this.hasMore = true;
				
				// 显示加载状态
				this.loading = true;
				
				// 发送搜索请求，使用api模块
				api.request({
					url: '/product/search',
					method: 'GET',
					data: {
						keyword: this.keyword,
						page: this.page,
						size: this.size
					}
				})
				.then(res => {
					console.log('搜索产品响应:', res.data);
					if (res.data.code === 200) {
						this.searchResults = res.data.data.content || [];
						// 判断是否有更多结果
						this.hasMore = this.searchResults.length >= this.size;
					} else {
						this.searchResults = [];
						this.showToast(res.data.message || '搜索失败');
					}
				})
				.catch(err => {
					console.error('网络请求失败:', err);
					this.showToast('网络请求失败');
					this.searchResults = [];
				})
				.finally(() => {
					this.loading = false;
				});
			},
			
			// 保存关键词到历史（新方法，从saveSearchHistory中抽取部分逻辑）
			saveKeywordToHistory(keyword) {
				// 如果历史中已有该关键词，先移除
				const index = this.searchHistory.indexOf(keyword);
				if (index > -1) {
					this.searchHistory.splice(index, 1);
				}
				
				// 将新关键词添加到历史列表开头
				this.searchHistory.unshift(keyword);
				
				// 限制历史记录数量为10条
				if (this.searchHistory.length > 10) {
					this.searchHistory.pop();
				}
				
				// 保存到本地存储
				this.saveSearchHistory();
			},
			
			// 加载更多搜索结果（修复API调用）
			loadMoreResults() {
				if (!this.hasMore || this.loadingMore || this.loading) return;
				
				this.loadingMore = true;
				this.page++;
				
				api.request({
					url: '/product/search',
					method: 'GET',
					data: {
						keyword: this.keyword,
						page: this.page,
						size: this.size
					}
				})
				.then(res => {
					console.log('加载更多搜索结果:', res.data);
					if (res.data.code === 200) {
						const newResults = res.data.data.content || [];
						// 合并数据
						this.searchResults = [...this.searchResults, ...newResults];
						// 判断是否还有更多数据
						this.hasMore = newResults.length >= this.size;
					} else {
						this.showToast(res.data.message || '加载更多失败');
					}
				})
				.catch(err => {
					console.error('网络请求失败:', err);
					this.showToast('网络请求失败');
				})
				.finally(() => {
					this.loadingMore = false;
				});
			},
			
			// 清空搜索关键词
			clearKeyword() {
				this.keyword = '';
				this.searchResults = [];
				this.searching = false;
				// 清除防抖计时器
				if (this.searchTimer) {
					clearTimeout(this.searchTimer);
				}
			},
			
			// 使用历史搜索词
			useHistoryKeyword(keyword) {
				this.keyword = keyword;
				this.searchProducts();
			},
			
			// 加载搜索历史
			loadSearchHistory() {
				const history = uni.getStorageSync('searchHistory');
				if (history) {
					this.searchHistory = JSON.parse(history);
				}
			},
			
			// 保存搜索历史
			saveSearchHistory() {
				uni.setStorageSync('searchHistory', JSON.stringify(this.searchHistory));
			},
			
			// 清空搜索历史
			clearHistory() {
				uni.showModal({
					title: '提示',
					content: '确定要清空搜索历史吗？',
					success: (res) => {
						if (res.confirm) {
							this.searchHistory = [];
							uni.removeStorageSync('searchHistory');
						}
					}
				});
			},
			
			// 打开商品详情（修复API调用）
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
						// 获取商品详情
						api.request({
							url: `/product/detail/${product.id}`,
							method: 'GET'
						})
						.then(res => {
							console.log('获取商品详情响应:', res.data);
							if (res.data.code === 200) {
								this.currentProduct = res.data.data;
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
			
			// 重置商品选项
			resetProductOptions() {
				this.quantity = 1;
				this.selectedTemp = '常温';
				this.selectedSweet = '标准糖';
				this.selectedIngredients = [];
			},
			
			// 关闭商品详情
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
			
			// 添加到购物车（修复API调用）
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
				
				api.request({
					url: '/cart',
					method: 'POST',
					data: cartData
				})
				.then(res => {
					console.log('添加到购物车响应:', res.data);
					if (res.data.code === 200) {
						this.showToast('已添加到购物车', 'success');
						this.hideProductDetail();
					} else if (res.data.code === 401) {
						this.handleTokenExpired();
					} else {
						this.showToast(res.data.message || '添加到购物车失败');
					}
				})
				.catch(err => {
					console.error('网络请求失败:', err);
					this.showToast('网络请求失败');
				});
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack();
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
	.search-container {
		min-height: 100vh;
		background-color: #121212;
		display: flex;
		flex-direction: column;
	}
	
	/* 顶部标题栏 */
	.navbar {
		padding-top: var(--status-bar-height);
		height: calc(44px + var(--status-bar-height));
		background-color: #1a1a1a;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		z-index: 100;
	}
	
	.page-title {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	/* 搜索栏 */
	.search-header {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #1a1a1a;
	}
	
	.search-box {
		flex: 1;
		display: flex;
		align-items: center;
		background-color: #262626;
		border-radius: 40rpx;
		padding: 10rpx 20rpx;
		position: relative;
	}
	
	.search-icon {
		width: 28rpx;
		height: 28rpx;
		margin: 0 10rpx;
	}
	
	.search-input {
		flex: 1;
		height: 60rpx;
		color: #ffffff;
		font-size: 28rpx;
	}
	
	.clear-icon {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.close-icon-small {
		width: 24rpx;
		height: 24rpx;
	}
	
	.cancel-btn {
		padding: 0 20rpx;
		color: #7b68ee;
		font-size: 28rpx;
	}
	
	/* 搜索历史 */
	.search-history {
		padding: 30rpx;
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.section-title {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.clear-btn {
		font-size: 24rpx;
		color: #888888;
	}
	
	.history-tags {
		display: flex;
		flex-wrap: wrap;
	}
	
	.history-tag {
		padding: 10rpx 30rpx;
		background-color: #262626;
		border-radius: 30rpx;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
	}
	
	.history-tag text {
		font-size: 24rpx;
		color: #dddddd;
	}
	
	/* 搜索中 */
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
		font-size: 28rpx;
		color: #888888;
	}
	
	/* 搜索结果 */
	.search-results {
		height: calc(100vh - 110rpx);
		padding: 20rpx;
		box-sizing: border-box;
	}
	
	.product-item {
		display: flex;
		padding: 30rpx;
		background-color: #1a1a1a;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
	}
	
	.product-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
		background-color: #262626;
	}
	
	.product-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	
	.product-name {
		font-size: 28rpx;
		color: #ffffff;
		margin-bottom: 10rpx;
		font-weight: bold;
	}
	
	.product-description {
		font-size: 24rpx;
		color: #888888;
		margin-bottom: 10rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	
	.product-bottom {
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
	
	.add-icon {
		width: 30rpx;
		height: 30rpx;
	}
	
	/* 加载状态 */
	.load-more, .loading-more {
		text-align: center;
		padding: 20rpx 0;
	}
	
	.load-more text, .loading-more text {
		font-size: 24rpx;
		color: #888888;
		vertical-align: middle;
	}
	
	.loading-more .loading-spinner {
		width: 30rpx;
		height: 30rpx;
		margin-right: 10rpx;
		margin-bottom: 0;
		display: inline-block;
		vertical-align: middle;
	}
	
	/* 搜索无结果 */
	.no-results {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 50vh;
	}
	
	.empty-icon {
		width: 120rpx;
		height: 120rpx;
		margin-bottom: 20rpx;
		opacity: 0.5;
	}
	
	.no-results-text {
		font-size: 28rpx;
		color: #888888;
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
	
	/* 商品详情头部 */
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
		margin-bottom: 20rpx;
	}
	
	.spec-icon {
		width: 24rpx;
		height: 24rpx;
		margin-right: 10rpx;
	}
	
	.spec-title {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: bold;
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
</style> 