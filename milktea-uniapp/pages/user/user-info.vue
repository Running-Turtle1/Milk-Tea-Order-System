<template>
	<view class="user-info-container">
		<view class="info-header">
			<view class="header-title">个人信息</view>
		</view>
		
		<view class="info-form">
			<view class="form-item">
				<text class="form-label">用户名</text>
				<view class="current-info">{{ userInfo.username || '' }}</view>
			</view>
			
			<view class="form-item">
				<text class="form-label">手机号</text>
				<view class="current-info">{{ maskPhone(userInfo.phone) || '' }}</view>
			</view>
			
			<view class="form-item">
				<text class="form-label">性别</text>
				<picker @change="bindGenderChange" :value="genderIndex" :range="genderOptions">
					<view class="picker-content">
						<text class="picker-text">{{ genderOptions[genderIndex] }}</text>
						<text class="arrow">></text>
					</view>
				</picker>
			</view>
			
			<view class="form-item">
				<text class="form-label">生日</text>
				<picker mode="date" :value="birthday" @change="bindDateChange" start="1950-01-01" end="2010-12-31">
					<view class="picker-content">
						<text class="picker-text">{{ birthday || '请选择生日' }}</text>
						<text class="arrow">></text>
					</view>
				</picker>
			</view>
			
			<button class="submit-btn" @click="submitUpdate">保存修改</button>
		</view>
	</view>
</template>

<script>
	import api from '@/utils/api.js';
	
	export default {
		data() {
			return {
				userInfo: {},
				genderOptions: ['请选择', '男', '女'],
				genderIndex: 0,
				birthday: '',
				loading: false
			}
		},
		onLoad() {
			// 检查登录状态并获取用户信息
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
				if (userInfo) {
					this.userInfo = userInfo;
					// 设置性别选择器的默认值
					if (userInfo.gender) {
						this.genderIndex = userInfo.gender;
					}
					// 设置生日
					if (userInfo.birthday) {
						this.birthday = userInfo.birthday;
					}
				} else {
					// 如果本地没有用户信息，从服务器获取
					api.request({
						url: '/user/profile',
						method: 'GET'
					})
					.then(res => {
							if (res.data.code === 200 && res.data.data) {
								this.userInfo = res.data.data;
								// 更新本地存储的用户信息
								uni.setStorageSync('userInfo', res.data.data);
								
								// 设置性别选择器的默认值
								if (this.userInfo.gender) {
									this.genderIndex = this.userInfo.gender;
								}
								// 设置生日
								if (this.userInfo.birthday) {
									this.birthday = this.userInfo.birthday;
								}
							}
					})
					.catch(err => {
						console.error('获取用户信息失败:', err);
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
			
			// 性别选择器变化事件
			bindGenderChange(e) {
				this.genderIndex = e.detail.value;
			},
			
			// 日期选择器变化事件
			bindDateChange(e) {
				this.birthday = e.detail.value;
			},
			
			// 提交更新
			submitUpdate() {
				if (this.genderIndex === 0) {
					this.showToast('请选择性别');
					return;
				}
				
				if (!this.birthday) {
					this.showToast('请选择生日');
					return;
				}
				
				this.loading = true;
				
				// 调用接口更新用户信息
				api.request({
					url: '/user/profile',
					method: 'PUT',
					data: {
						avatar: this.userInfo.avatar,
						gender: parseInt(this.genderIndex),
						birthday: this.birthday,
						phone: this.userInfo.phone
					}
				})
				.then(res => {
						if (res.data.code === 200) {
							this.showToast('信息更新成功', 'success');
							
							// 更新本地存储的用户信息
							const userInfo = uni.getStorageSync('userInfo') || {};
							userInfo.gender = parseInt(this.genderIndex);
							userInfo.birthday = this.birthday;
							uni.setStorageSync('userInfo', userInfo);
							
							// 更新成功后返回上一页
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						} else {
							this.showToast(res.data.message || '信息更新失败');
						}
				})
				.catch(() => {
						this.showToast('网络错误，请稍后再试');
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
	.user-info-container {
		padding: 20rpx;
		background-color: #121212;
		min-height: 100vh;
	}
	
	.info-header {
		padding: 30rpx 0;
		margin-bottom: 20rpx;
	}
	
	.header-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	.info-form {
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
	
	.current-info {
		height: 80rpx;
		line-height: 80rpx;
		background-color: #2a2a2a;
		border-radius: 10rpx;
		padding: 0 20rpx;
		color: #888888;
		font-size: 28rpx;
		word-break: break-all;
	}
	
	.picker-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 80rpx;
		background-color: #2a2a2a;
		border-radius: 10rpx;
		padding: 0 20rpx;
	}
	
	.picker-text {
		color: #ffffff;
		font-size: 28rpx;
	}
	
	.arrow {
		font-size: 28rpx;
		color: #888888;
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