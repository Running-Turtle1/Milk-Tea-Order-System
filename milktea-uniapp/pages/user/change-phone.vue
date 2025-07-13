<template>
	<view class="change-phone-container">
		<view class="phone-header">
			<view class="header-title">更换手机号</view>
		</view>
		
		<view class="phone-form">
			<view class="form-item">
				<text class="form-label">当前手机号</text>
				<view class="current-phone">{{ maskPhone(currentPhone) }}</view>
			</view>
			
			<view class="form-item">
				<text class="form-label">新手机号</text>
				<input type="number" v-model="newPhone" placeholder="请输入新手机号" class="form-input" maxlength="11" placeholder-style="color: #666666;" />
			</view>
			
			<button class="submit-btn" @click="submitChange">确认更换</button>
		</view>
	</view>
</template>

<script>
	import api from '@/utils/api.js';
	
	export default {
		data() {
			return {
				currentPhone: '',
				newPhone: '',
				loading: false
			}
		},
		onLoad() {
			// 检查登录状态并获取用户手机号
			this.checkLoginStatus();
			this.getUserInfo();
		},
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				const token = uni.getStorageSync('token');
				if (!token) {
					this.promptLogin();
				}
			},
			
			// 获取用户信息
			getUserInfo() {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo && userInfo.phone) {
					this.currentPhone = userInfo.phone;
				} else {
					// 获取token
					const token = uni.getStorageSync('token');
					if (!token) {
						this.promptLogin();
						return;
					}
					
					// 如果本地没有用户信息，从服务器获取
					api.getUserInfo()
						.then(res => {
							if (res.data.code === 200 && res.data.data) {
								this.currentPhone = res.data.data.phone || '';
								// 更新本地存储的用户信息
								uni.setStorageSync('userInfo', res.data.data);
							} else if (res.data.code === 403) {
								this.showToast('登录已过期，请重新登录');
								setTimeout(() => {
									// 清除token和用户信息
									uni.removeStorageSync('token');
									uni.removeStorageSync('userInfo');
									// 重定向到登录页
									uni.reLaunch({
										url: '/pages/login/login'
									});
								}, 1500);
							}
						})
						.catch(err => {
							console.error('获取用户信息失败:', err);
							if (err.statusCode === 403) {
								this.showToast('登录已过期，请重新登录');
								setTimeout(() => {
									// 重定向到登录页
									uni.reLaunch({
										url: '/pages/login/login'
									});
								}, 1500);
							}
						});
				}
			},
			
			// 手机号脱敏显示
			maskPhone(phone) {
				if (!phone || phone.length !== 11) {
					return '';
				}
				return phone.substring(0, 3) + '****' + phone.substring(7);
			},
			
			// 验证手机号
			validatePhone() {
				if (!this.newPhone) {
					this.showToast('请输入新手机号');
					return false;
				}
				
				if (!/^1[3-9]\d{9}$/.test(this.newPhone)) {
					this.showToast('请输入正确的手机号格式');
					return false;
				}
				
				if (this.newPhone === this.currentPhone) {
					this.showToast('新手机号不能与当前手机号相同');
					return false;
				}
				
				return true;
			},
			
			// 提交更换手机号
			submitChange() {
				if (!this.validatePhone()) {
					return;
				}
				
				this.loading = true;
				
				// 获取token
				const token = uni.getStorageSync('token');
				if (!token) {
					this.showToast('请先登录');
					this.promptLogin();
					return;
				}
				
				// 调用接口更换手机号
				api.updateUserInfo({
					phone: this.newPhone
				})
					.then(res => {
						if (res.data.code === 200) {
							this.showToast('手机号更换成功', 'success');
							
							// 更新本地存储的用户信息
							const userInfo = uni.getStorageSync('userInfo') || {};
							userInfo.phone = this.newPhone;
							uni.setStorageSync('userInfo', userInfo);
							
							// 更换成功后返回上一页
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						} else {
							// 处理各种错误情况
							if (res.data.code === 403) {
								this.showToast('没有权限，请重新登录');
								setTimeout(() => {
									// 清除token和用户信息
									uni.removeStorageSync('token');
									uni.removeStorageSync('userInfo');
									// 重定向到登录页
									uni.reLaunch({
										url: '/pages/login/login'
									});
								}, 1500);
							} else {
								this.showToast(res.data.message || '手机号更换失败');
							}
						}
					})
					.catch(err => {
						console.error('请求失败:', err);
						if (err.statusCode === 403) {
							this.showToast('登录已过期，请重新登录');
							setTimeout(() => {
								// 清除token和用户信息
								uni.removeStorageSync('token');
								uni.removeStorageSync('userInfo');
								// 重定向到登录页
								uni.reLaunch({
									url: '/pages/login/login'
								});
							}, 1500);
						} else {
							this.showToast('网络错误，请稍后再试');
						}
					})
					.finally(() => {
						this.loading = false;
					});
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
	.change-phone-container {
		padding: 20rpx;
		background-color: #121212;
		min-height: 100vh;
	}
	
	.phone-header {
		padding: 30rpx 0;
		margin-bottom: 20rpx;
	}
	
	.header-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	.phone-form {
		background-color: #1a1a1a;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-top: 30rpx;
	}
	
	.form-item {
		margin-bottom: 30rpx;
	}
	
	.form-label {
		display: block;
		font-size: 28rpx;
		color: #ffffff;
		margin-bottom: 15rpx;
	}
	
	.current-phone {
		height: 80rpx;
		line-height: 80rpx;
		background-color: #2a2a2a;
		border-radius: 10rpx;
		padding: 0 20rpx;
		color: #888888;
		font-size: 28rpx;
	}
	
	.form-input {
		background-color: #2a2a2a;
		height: 80rpx;
		border-radius: 10rpx;
		padding: 0 20rpx;
		color: #ffffff;
		width: 100%;
		box-sizing: border-box;
	}
	
	.submit-btn {
		background-color: #7b68ee;
		color: #ffffff;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 32rpx;
		margin-top: 50rpx;
		border-radius: 45rpx;
	}
</style> 