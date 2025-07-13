<template>
	<view class="mine-container">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-info" v-if="isLoggedIn">
				<image class="avatar" :src="userInfo.avatar || '/static/tabbar/user.png'" @click="previewAvatar"></image>
				<view class="user-detail">
					<view class="username">{{userInfo.username}}</view>
					<view class="member-info">
						<text class="member-level">{{memberInfo.levelName}}</text>
						<text class="member-points">积分: {{userInfo.totalPoints || 0}}</text>
					</view>
				</view>
			</view>
			<view class="not-login" v-else>
				<image class="default-avatar" src="/static/tabbar/user.png"></image>
				<view class="login-btn">
					<button type="primary" size="mini" @click="goToLogin">立即登录</button>
				</view>
			</view>
		</view>
		
		<!-- 会员卡片 -->
		<view class="member-card" v-if="isLoggedIn" @click="viewMemberDetail">
			<view class="member-card-header">
				<text class="card-title">会员卡</text>
				<text class="card-subtitle">查看详情</text>
			</view>
			<view class="member-progress">
				<view class="progress-text">
					<text>{{memberInfo.levelName}}</text>
					<text>下一级: 还需{{memberInfo.pointsToNextLevel}}积分</text>
				</view>
				<progress :percent="calcProgressPercent()" stroke-width="4" activeColor="#7b68ee" backgroundColor="#333" />
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="menu-list">
			<view class="menu-section">
				<view class="menu-item" @click="goToOrderHistory">
					<image src="/static/icons/common/order.svg" class="menu-icon-img"></image>
					<text class="menu-text">我的订单</text>
					<image src="/static/icons/common/right.svg" class="arrow-img"></image>
				</view>
			</view>
			
			<view class="menu-section">
				<view class="menu-item" @click="goToSettings">
					<image src="/static/icons/common/settings.svg" class="menu-icon-img"></image>
					<text class="menu-text">设置</text>
					<image src="/static/icons/common/right.svg" class="arrow-img"></image>
				</view>
				<view class="menu-item" @click="contactUs">
					<image src="/static/icons/common/service.svg" class="menu-icon-img"></image>
					<text class="menu-text">联系客服</text>
					<image src="/static/icons/common/right.svg" class="arrow-img"></image>
				</view>
				<view class="menu-item" @click="aboutUs">
					<image src="/static/icons/common/about.svg" class="menu-icon-img"></image>
					<text class="menu-text">关于我们</text>
					<image src="/static/icons/common/right.svg" class="arrow-img"></image>
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
				isLoggedIn: false,
				userInfo: {},
				memberInfo: {
					currentLevel: 0,
					levelName: '普通会员',
					currentPoints: 0,
					nextLevelPoints: 1000,
					pointsToNextLevel: 1000,
					discount: 1.0,
					benefits: '无折扣'
				}
			}
		},
		onShow() {
			// 每次页面显示时检查登录状态并加载数据
			this.checkLoginStatus();
			if (this.isLoggedIn) {
				this.loadUserInfo();
				this.loadMemberInfo();
			}
		},
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				const token = uni.getStorageSync('token');
				this.isLoggedIn = !!token;
			},
			
			// 加载用户信息
			loadUserInfo() {
				if (!this.isLoggedIn) {
					console.log('未登录，跳过加载用户信息');
					return;
				}
				
				api.request({
					url: '/user/profile',
					method: 'GET'
				})
				.then(res => {
					console.log('用户信息响应:', res.data);
						if (res.data.code === 200) {
							this.userInfo = res.data.data;
						} else if (res.data.code === 401 || res.data.code === 403) {
							// Token失效或权限不足，清除登录状态
							console.log('Token无效或权限不足，清除登录状态');
							this.handleLogout();
						} else {
							this.showToast(res.data.message || '获取用户信息失败');
						}
				})
				.catch(err => {
					console.error('请求失败:', err);
						this.showToast('网络请求失败');
				});
			},
			
			// 加载会员信息
			loadMemberInfo() {
				if (!this.isLoggedIn) {
					console.log('未登录，跳过加载会员信息');
					return;
				}
				
				api.request({
					url: '/user/member-level',
					method: 'GET'
				})
				.then(res => {
					console.log('会员信息响应:', res.data);
						if (res.data.code === 200) {
							this.memberInfo = res.data.data;
						} else if (res.data.code === 401 || res.data.code === 403) {
							// Token失效或权限不足，使用默认值
							console.log('Token无效或权限不足，使用默认会员信息');
						}
				})
				.catch(err => {
					console.error('获取会员信息失败:', err);
				});
			},
			
			// 计算进度条百分比
			calcProgressPercent() {
				if (!this.memberInfo || !this.memberInfo.nextLevelPoints || this.memberInfo.nextLevelPoints === 0) {
					return 0;
				}
				
				const earned = this.memberInfo.nextLevelPoints - this.memberInfo.pointsToNextLevel;
				return Math.min(100, Math.floor((earned / this.memberInfo.nextLevelPoints) * 100));
			},
			
			// 预览头像
			previewAvatar() {
				const avatarUrl = this.userInfo.avatar || '/static/tabbar/user.png';
				
				// 跳转到头像查看页面
				uni.navigateTo({
					url: `/pages/user/avatar-view?url=${encodeURIComponent(avatarUrl)}`
				});
			},
			
			// 查看会员详情
			viewMemberDetail() {
				if (!this.isLoggedIn) {
					this.promptLogin();
					return;
				}
				// 跳转到会员中心页面
				uni.navigateTo({
					url: '/pages/user/member-center'
				});
			},
			
			// 前往订单历史页面
			goToOrderHistory() {
				if (!this.isLoggedIn) {
					this.promptLogin();
					return;
				}
				uni.switchTab({
					url: '/pages/order/order'
				});
			},
			
			// 前往设置页面
			goToSettings() {
				uni.navigateTo({
					url: '/pages/user/settings'
				});
			},
			
			// 联系客服
			contactUs() {
				this.showToast('联系客服页面开发中');
			},
			
			// 关于我们
			aboutUs() {
				this.showToast('关于我们页面开发中');
			},
			
			// 前往登录页
			goToLogin() {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			},
			
			// 退出登录
			logout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							this.handleLogout();
						}
					}
				});
			},
			
			// 处理退出登录逻辑
			handleLogout() {
				uni.removeStorageSync('token');
				uni.removeStorageSync('userInfo');
				this.isLoggedIn = false;
				this.userInfo = {};
				this.showToast('已退出登录', 'success');
			},
			
			// 提示登录
			promptLogin() {
				uni.showModal({
					title: '提示',
					content: '请先登录',
					confirmText: '去登录',
					success: (res) => {
						if (res.confirm) {
							this.goToLogin();
						}
					}
				});
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

<style>
	.mine-container {
		padding: 20rpx;
		background-color: #121212;
	}
	
	/* 用户信息卡片 */
	.user-card {
		background-color: #1a1a1a;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
	}
	
	.user-info {
		display: flex;
		align-items: center;
		position: relative;
	}
	
	.avatar, .default-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
		border: 2rpx solid #7b68ee;
	}
	
	.user-detail {
		margin-left: 30rpx;
		flex: 1;
	}
	
	.username {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		color: #ffffff;
	}
	
	.member-info {
		display: flex;
		align-items: center;
	}
	
	.member-level {
		font-size: 24rpx;
		color: #7b68ee;
		background-color: rgba(123, 104, 238, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		margin-right: 20rpx;
	}
	
	.member-points {
		font-size: 24rpx;
		color: #888888;
	}
	
	.not-login {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.login-btn {
		margin-top: 20rpx;
	}
	
	/* 会员卡片 */
	.member-card {
		background-color: #1a1a1a;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.2);
	}
	
	.member-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.card-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	.card-subtitle {
		font-size: 24rpx;
		color: #888888;
	}
	
	.member-progress {
		margin-top: 20rpx;
	}
	
	.progress-text {
		display: flex;
		justify-content: space-between;
		font-size: 24rpx;
		color: #888888;
		margin-bottom: 10rpx;
	}
	
	/* 功能菜单 */
	.menu-list {
		background-color: #1a1a1a;
		border-radius: 20rpx;
		overflow: hidden;
		margin-bottom: 30rpx;
	}
	
	.menu-section {
		margin-bottom: 20rpx;
	}
	
	.menu-section:not(:last-child) {
		border-bottom: 2rpx solid #2a2a2a;
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		position: relative;
	}
	
	.menu-item:active {
		background-color: #2a2a2a;
	}
	
	.menu-icon-img {
		width: 50rpx;
		height: 50rpx;
		margin-right: 20rpx;
	}
	
	.menu-text {
		flex: 1;
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.arrow-img {
		width: 30rpx;
		height: 30rpx;
	}
</style> 