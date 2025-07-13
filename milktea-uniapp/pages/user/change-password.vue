<template>
	<view class="change-password-container">
		<view class="password-header">
			<view class="header-title">修改密码</view>
		</view>
		
		<view class="password-form">
			<view class="form-item">
				<text class="form-label">原密码</text>
				<input type="password" v-model="oldPassword" placeholder="请输入原密码" class="form-input" placeholder-style="color: #666666;" />
			</view>
			
			<view class="form-item">
				<text class="form-label">新密码</text>
				<input type="password" v-model="newPassword" placeholder="请输入新密码" class="form-input" placeholder-style="color: #666666;" />
			</view>
			
			<view class="form-item">
				<text class="form-label">确认新密码</text>
				<input type="password" v-model="confirmPassword" placeholder="请再次输入新密码" class="form-input" placeholder-style="color: #666666;" />
			</view>
			
			<view class="password-rules">
				<text class="rules-title">密码要求：</text>
				<text class="rules-item">• 不少于8个字符</text>
				<text class="rules-item">• 包含大小写字母和数字</text>
				<text class="rules-item">• 不能与旧密码相同</text>
			</view>
			
			<button class="submit-btn" @click="submitPassword">确认修改</button>
		</view>
	</view>
</template>

<script>
	import api from '@/utils/api.js';
	
	export default {
		data() {
			return {
				oldPassword: '',
				newPassword: '',
				confirmPassword: '',
				loading: false
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
			
			// 验证密码
			validatePassword() {
				if (!this.oldPassword) {
					this.showToast('请输入原密码');
					return false;
				}
				
				if (!this.newPassword) {
					this.showToast('请输入新密码');
					return false;
				}
				
				if (this.newPassword.length < 8) {
					this.showToast('新密码长度不能少于8个字符');
					return false;
				}
				
				if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(this.newPassword)) {
					this.showToast('新密码必须包含大小写字母和数字');
					return false;
				}
				
				if (this.newPassword === this.oldPassword) {
					this.showToast('新密码不能与原密码相同');
					return false;
				}
				
				if (this.newPassword !== this.confirmPassword) {
					this.showToast('两次输入的新密码不一致');
					return false;
				}
				
				return true;
			},
			
			// 提交密码修改
			submitPassword() {
				if (!this.validatePassword()) {
					return;
				}
				
				this.loading = true;
				
				// 调用接口修改密码
				api.request({
					url: '/user/change-password',
					method: 'PUT',
					data: {
						oldPassword: this.oldPassword,
						newPassword: this.newPassword
					},
					success: (res) => {
						if (res.data.code === 200) {
							this.showToast('密码修改成功，请重新登录', 'success');
							
							// 清除用户登录状态
							uni.removeStorageSync('token');
							uni.removeStorageSync('userInfo');
							
							// 修改成功后跳转到登录页
							setTimeout(() => {
								uni.reLaunch({
									url: '/pages/login/login'
								});
							}, 1500);
						} else {
							this.showToast(res.data.message || '密码修改失败');
						}
					},
					fail: () => {
						this.showToast('网络错误，请稍后再试');
					},
					complete: () => {
						this.loading = false;
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
	.change-password-container {
		padding: 20rpx;
		background-color: #121212;
		min-height: 100vh;
	}
	
	.password-header {
		padding: 30rpx 0;
		margin-bottom: 20rpx;
	}
	
	.header-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	.password-form {
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
	
	.form-input {
		background-color: #2a2a2a;
		height: 80rpx;
		border-radius: 10rpx;
		padding: 0 20rpx;
		color: #ffffff;
		width: 100%;
		box-sizing: border-box;
	}
	
	.password-rules {
		background-color: #222222;
		padding: 20rpx;
		border-radius: 10rpx;
		margin: 20rpx 0 40rpx;
	}
	
	.rules-title {
		display: block;
		font-size: 26rpx;
		color: #888888;
		margin-bottom: 10rpx;
	}
	
	.rules-item {
		display: block;
		font-size: 24rpx;
		color: #888888;
		line-height: 1.6;
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