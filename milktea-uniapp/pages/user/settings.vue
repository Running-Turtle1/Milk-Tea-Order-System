<template>
	<view class="settings-container">
		<view class="settings-header">
			<view class="header-title">设置</view>
		</view>
		
		<view class="settings-section">
			<view class="section-title">账户设置</view>
			
			<view class="settings-list">
				<view class="settings-item" @click="changePassword">
					<image src="/static/icons/settings/password.svg" class="settings-icon-img"></image>
					<text class="settings-text">修改密码</text>
					<text class="arrow">></text>
				</view>
				
				<view class="settings-item" @click="changePhone">
					<image src="/static/icons/settings/phone.svg" class="settings-icon-img"></image>
					<text class="settings-text">更换手机号</text>
					<text class="arrow">></text>
				</view>
				
				<view class="settings-item" @click="updateUserInfo">
					<image src="/static/icons/settings/user.svg" class="settings-icon-img"></image>
					<text class="settings-text">修改个人信息</text>
					<text class="arrow">></text>
				</view>
			</view>
		</view>
		
		<view class="settings-section">
			<view class="logout-btn">
				<button type="default" @click="logout">退出登录</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				token: uni.getStorageSync('token') || ''
			}
		},
		onLoad() {
			// 检查登录状态
			this.checkLoginStatus();
		},
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				const token = uni.getStorageSync('token');
				if (!token) {
					this.promptLogin();
				}
			},
			
			// 修改密码
			changePassword() {
				uni.navigateTo({
					url: '/pages/user/change-password'
				});
			},
			
			// 更换手机号
			changePhone() {
				uni.navigateTo({
					url: '/pages/user/change-phone'
				});
			},
			
			// 修改个人信息
			updateUserInfo() {
				uni.navigateTo({
					url: '/pages/user/user-info'
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
			
			// 处理退出登录
			handleLogout() {
				// 清除用户数据
				uni.removeStorageSync('token');
				uni.removeStorageSync('userInfo');
				
				// 跳转到登录页
				uni.reLaunch({
					url: '/pages/login/login'
				});
				
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
							uni.navigateTo({
								url: '/pages/login/login'
							});
						} else {
							uni.navigateBack();
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
	.settings-container {
		padding: 20rpx;
		background-color: #121212;
		min-height: 100vh;
	}
	
	.settings-header {
		padding: 30rpx 0;
		margin-bottom: 20rpx;
	}
	
	.header-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	.settings-section {
		margin-bottom: 30rpx;
	}
	
	.section-title {
		font-size: 28rpx;
		color: #888888;
		margin-bottom: 15rpx;
		padding: 0 10rpx;
	}
	
	.settings-list {
		background-color: #1a1a1a;
		border-radius: 20rpx;
		overflow: hidden;
	}
	
	.settings-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		position: relative;
		border-bottom: 2rpx solid #2a2a2a;
	}
	
	.settings-item:last-child {
		border-bottom: none;
	}
	
	.settings-item:active {
		background-color: #2a2a2a;
	}
	
	.settings-icon-img {
		width: 50rpx;
		height: 50rpx;
		margin-right: 20rpx;
	}
	
	.settings-text {
		flex: 1;
		font-size: 28rpx;
		color: #ffffff;
	}
	
	.arrow {
		font-size: 28rpx;
		color: #888888;
	}
	
	.logout-btn {
		margin-top: 50rpx;
	}
	
	.logout-btn button {
		background-color: #333;
		color: #fff;
		border: none;
	}
</style> 