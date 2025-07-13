<template>
	<view class="avatar-view-container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @click="goBack">
				<image src="/static/icons/common/back.svg" class="back-icon"></image>
			</view>
			<view class="navbar-title">头像</view>
			<view class="navbar-right"></view>
		</view>
		
		<!-- 头像展示区域 -->
		<view class="avatar-display">
			<image 
				:src="avatarUrl || '/static/default-avatar.png'" 
				mode="aspectFill" 
				class="avatar-image"
				@error="handleImageError"
			></image>
		</view>
		
		<!-- 操作按钮区域 -->
		<view class="action-buttons">
			<button class="action-btn upload-btn" @click="uploadAvatar">更换头像</button>
		</view>
	</view>
</template>

<script>
	import api from '@/utils/api.js';  // 静态导入
	
	export default {
		data() {
			return {
				avatarUrl: '',
				isVirtualKeyboardShowing: false,
				imageLoadError: false
			}
		},
		onLoad(options) {
			// 如果有传入的头像URL，则使用传入的
			if (options.url) {
				this.avatarUrl = decodeURIComponent(options.url);
			} else {
				// 否则加载用户当前头像
				this.loadUserAvatar();
			}
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 加载用户头像
			loadUserAvatar() {
				const token = uni.getStorageSync('token');
				if (!token) {
					this.showToast('请先登录');
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
					return;
				}
				
				api.request({
					url: '/user/profile',
					method: 'GET',
					success: (res) => {
						console.log('获取用户信息响应:', res.data);
						if (res.data.code === 200) {
							// 使用工具方法处理图片URL
							this.avatarUrl = api.processImageUrl(res.data.data.avatar || '');
						} else if (res.data.code === 401) {
							// Token失效
							this.handleTokenExpired();
						} else {
							this.showToast(res.data.message || '获取用户信息失败');
						}
					},
					fail: (err) => {
						console.error('网络请求失败:', err);
						this.showToast('网络请求失败');
					}
				});
			},
			
			// 处理图片加载错误
			handleImageError() {
				if (!this.imageLoadError) {
					this.imageLoadError = true;
					this.showToast('图片加载失败，使用默认头像');
					this.avatarUrl = '/static/default-avatar.png';
				}
			},
			
			// 上传新头像
			uploadAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const tempFilePaths = res.tempFilePaths;
						const token = uni.getStorageSync('token');
						
						uni.showLoading({
							title: '上传中...'
						});
						
						const baseUrl = api.getBaseUrl();
						
						uni.uploadFile({
							url: `${baseUrl}/files/avatar`,
							filePath: tempFilePaths[0],
							name: 'file',
							header: {
								'Authorization': 'Bearer ' + token
							},
							success: (uploadRes) => {
								console.log('头像上传响应:', uploadRes);
								try {
									const result = JSON.parse(uploadRes.data);
									if (result.code === 200) {
										// 使用工具方法处理图片URL
										this.avatarUrl = api.processImageUrl(result.data.url);
										this.showToast('头像上传成功', 'success');
										
										// 更新本地存储的用户信息
										const userInfo = uni.getStorageSync('userInfo') || {};
										userInfo.avatar = result.data.url;
										uni.setStorageSync('userInfo', userInfo);
									} else {
										this.showToast(result.message || '上传失败');
									}
								} catch (e) {
									console.error('解析响应失败:', e);
									this.showToast('响应解析失败');
								}
							},
							fail: (err) => {
								console.error('上传失败:', err);
								this.showToast('上传失败，请检查网络');
							},
							complete: () => {
								uni.hideLoading();
							}
						});
					}
				});
			},
			
			// 处理Token过期
			handleTokenExpired() {
				uni.showToast({
					title: '登录已过期，请重新登录',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/login/login'
					});
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

<style>
	.avatar-view-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #121212;
		gap: 100rpx;
		padding-bottom: 50rpx;
	}
	
	/* 自定义导航栏 */
	.custom-navbar {
		width: 100%;
		height: 90rpx;
		padding-top: var(--status-bar-height);
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #1a1a1a;
		top: 0;
		left: 0;
		z-index: 9999;
	}
	
	.navbar-left {
		padding: 0 30rpx;
		height: 100%;
		display: flex;
		align-items: center;
	}
	
	.navbar-title {
		font-size: 32rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.navbar-right {
		width: 100rpx;
	}
	
	.back-icon {
		width: 40rpx;
		height: 40rpx;
	}
	
	/* 头像展示区域 */
	.avatar-display {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex: 1;
	}
	
	.avatar-image {
		width: 600rpx;
		height: 600rpx;
		border-radius: 20rpx;
		background-color: #1a1a1a;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.3);
	}
	
	/* 操作按钮区域 */
	.action-buttons {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 0 50rpx;
		box-sizing: border-box;
	}
	
	.action-btn {
		width: 80%;
		margin: 0 20rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		border-radius: 40rpx;
	}
	
	.upload-btn {
		background-color: #7b68ee;
		color: #ffffff;
		border: none;
	}
</style> 