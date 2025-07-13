<template>
	<view class="home-container">
		<!-- 顶部轮播图 -->
		<swiper class="banner-swiper" circular :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000">
			<swiper-item>
				<image :src="shopInfo.logo || '/static/logo.png'" mode="aspectFill" class="banner-image"></image>
			</swiper-item>
		</swiper>
		
		<!-- 门店信息卡片 -->
		<view class="shop-info-card" v-if="shopInfo.id">
			<view class="shop-header">
				<view class="shop-name">{{shopInfo.shopName}}</view>
				<view class="shop-hours">营业时间: {{shopInfo.businessHours}}</view>
			</view>
			<view class="shop-body">
				<view class="shop-notice">{{shopInfo.notice}}</view>
				<view class="shop-contact">
					<view class="shop-address">
						<image src="/static/icons/common/location-white.svg" class="contact-icon"></image>
						<text>{{shopInfo.address}}</text>
					</view>
					<view class="shop-phone" @click="callShop">
						<image src="/static/icons/common/phone.svg" class="contact-icon" style="width: 28rpx; height: 28rpx;"></image>
						<text>{{shopInfo.phone}}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 店内点单提示 -->
		<view class="store-order-tip">
			<view class="tip-icon">
				<image src="/static/icons/common/shop.svg" class="tip-icon-img"></image>
			</view>
			<view class="tip-text">
				<text class="tip-title">欢迎光临</text>
				<text class="tip-desc">店内点单更便捷</text>
			</view>
			<view class="tip-btn">
				<button size="mini" type="primary" @click="goToMenu">去点餐</button>
			</view>
		</view>
		
		<!-- 新增快捷入口卡片 -->
		<view class="quick-entry-wrapper">
			<view class="entry-item" @click="goToMenu">
				<view class="entry-icon-wrapper drink">
					<image src="/static/icons/common/coffee.svg" class="entry-icon-img"></image>
				</view>
				<text class="entry-text">今天喝点啥</text>
			</view>
			<view class="entry-item" @click="goToMenu">
				<view class="entry-icon-wrapper new">
					<image src="/static/icons/common/new.svg" class="entry-icon-img"></image>
				</view>
				<text class="entry-text">新品上线</text>
			</view>
			<view class="entry-item" @click="goToMenu">
				<view class="entry-icon-wrapper free">
					<image src="/static/icons/common/gift.svg" class="entry-icon-img"></image>
				</view>
				<text class="entry-text">0元兑换</text>
			</view>
		</view>
		
		<!-- 网络错误提示 -->
		<view class="network-error" v-if="networkError">
			<text class="error-text">网络连接失败，请检查网络设置</text>
			<button size="mini" type="primary" @click="retryLoad">重试</button>
		</view>
	</view>
</template>

<script>
	import api from '@/utils/api.js';

	export default {
		data() {
			return {
				networkError: false,
				tableNumber: '',
				shopInfo: {}
			}
		},
		onLoad() {
			this.loadHomeData();
		},
		onShow() {
			// 页面显示时刷新数据
			this.loadHomeData();
		},
		onPullDownRefresh() {
			// 下拉刷新
			this.loadHomeData();
			uni.stopPullDownRefresh();
		},
		methods: {
			// 加载首页数据
			loadHomeData() {
				this.networkError = false;
				this.getShopInfo();
			},
			
			// 获取门店信息
			getShopInfo() {
				api.getShopInfo()
					.then(res => {
						if (res.data.code === 200) {
							this.shopInfo = res.data.data;
						} else {
							this.showError(res.data.message);
						}
					})
					.catch(() => {
						this.networkError = true;
				});
			},
			
			// 拨打门店电话
			callShop() {
				if (this.shopInfo.phone) {
					uni.makePhoneCall({
						phoneNumber: this.shopInfo.phone,
						fail: () => {
							// 用户取消拨打电话不显示错误
						}
					});
				}
			},
			
			// 跳转到点单页面
			goToMenu() {
				uni.switchTab({
					url: '/pages/menu/menu'
				});
			},
			
			// 重试加载
			retryLoad() {
				this.loadHomeData();
			},
			
			// 显示错误提示
			showError(message) {
				uni.showToast({
					title: message || '操作失败',
					icon: 'none'
				});
			}
		}
	}
</script>

<style>
	.home-container {
		padding-bottom: 30rpx;
		background-color: #121212;
	}
	
	/* 轮播图样式 */
	.banner-swiper {
		height: 500rpx;
		width: 100%;
	}
	
	.banner-image {
		width: 100%;
		height: 100%;
	}
	
	/* 门店信息卡片样式 */
	.shop-info-card {
		margin: -30rpx 20rpx 30rpx 20rpx;
		background-color: #1e1e1e;
		border-radius: 50rpx;
		padding: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
		position: relative;
		z-index: 1;
	}
	
	.shop-header {
		border-bottom: 1rpx solid #2e2e2e;
		padding-bottom: 16rpx;
		margin-bottom: 16rpx;
	}
	
	.shop-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 8rpx;
	}
	
	.shop-hours {
		font-size: 24rpx;
		color: #a0a0a0;
	}
	
	.shop-body {
		
	}
	
	.shop-notice {
		font-size: 26rpx;
		color: #a0a0a0;
		background-color: #2a2a2a;
		padding: 16rpx;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
		line-height: 1.5;
	}
	
	.shop-contact {
		display: flex;
		justify-content: space-between;
		font-size: 24rpx;
		color: #a0a0a0;
	}
	
	.shop-address, .shop-phone {
		display: flex;
		align-items: center;
	}
	
	.shop-address .contact-icon, .shop-phone .contact-icon {
		width: 28rpx;
		height: 28rpx;
		margin-right: 8rpx;
		display: inline-block;
	}
	
	.shop-phone {
		color: #7b68ee;
	}
	
	/* 店内点单提示样式 */
	.store-order-tip {
		margin: 20rpx;
		background: linear-gradient(135deg, #3a3a8c, #2d3070);
		border-radius: 50rpx;
		padding: 60rpx 30rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
		height: 240rpx;
		box-sizing: border-box;
		gap: 20rpx;
	}
	
	.tip-icon {
		width: 100rpx;
		height: 100rpx;
		line-height: 100rpx;
		text-align: center;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		margin-right: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.tip-icon-img {
		width: 50rpx;
		height: 50rpx;
	}
	
	.tip-text {
		display: flex;
		flex-direction: column;
		color: #fff;
		flex: 1;
	}
	
	.tip-title {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 15rpx;
	}
	
	.tip-desc {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.7);
	}
	
	.tip-btn button {
		background-color: #7066e2;
		color: #ffffff;
		font-size: 30rpx;
		padding: 0 30rpx;
		height: 70rpx;
		line-height: 70rpx;
		border: none;
	}
	
	/* 新增快捷入口卡片样式 */
	.quick-entry-wrapper {
		margin: 20rpx;
		display: flex;
		justify-content: space-between;
		padding: 10rpx;
	}
	
	.entry-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 31%;
		height: 180rpx;
		background-color: #1e1e1e;
		border-radius: 50rpx;
		padding: 20rpx 0;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.4);
	}
	
	.entry-icon-wrapper {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
	}
	
	.entry-icon-wrapper.drink {
		background: linear-gradient(135deg, #6f42c1, #7066e2);
	}
	
	.entry-icon-wrapper.new {
		background: linear-gradient(135deg, #e83e8c, #ff6b6b);
	}
	
	.entry-icon-wrapper.free {
		background: linear-gradient(135deg, #fd7e14, #ffc107);
	}
	
	.entry-icon-wrapper .entry-icon-img {
		width: 40rpx;
		height: 40rpx;
		display: block;
	}
	
	.entry-text {
		font-size: 28rpx;
		color: #ffffff;
		margin-top: 10rpx;
	}
	
	/* 网络错误提示 */
	.network-error {
		margin: 40rpx;
		padding: 30rpx;
		text-align: center;
		background-color: #1e1e1e;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
	}
	
	.error-text {
		color: #a0a0a0;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.network-error button {
		background: linear-gradient(135deg, #2c2c7c, #1f1a54);
		color: #ffffff;
		border: none;
		border-radius: 30rpx;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.3);
	}
</style>
