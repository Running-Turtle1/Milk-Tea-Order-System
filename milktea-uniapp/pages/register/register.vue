<template>
	<view class="register-container">
		<!-- 动态背景气泡 -->
		<view class="floating-bubbles">
			<view class="bubble" v-for="i in 8" :key="i" :style="'--size:' + (30 + Math.random() * 60) + 'rpx; --delay:' + (Math.random() * 5) + 's; --duration:' + (10 + Math.random() * 20) + 's'"></view>
		</view>
		
		<!-- 奶茶杯装饰 -->
		<view class="decoration-cup left-cup"></view>
		<view class="decoration-cup right-cup"></view>
		
		<view class="register-content">
			<view class="register-header">
				<view class="logo-container">
					<image class="logo" :src="shopLogo || '/static/logo.png'" mode="aspectFill"></image>
					<view class="logo-backdrop"></view>
					<view class="logo-ring"></view>
				</view>
				
				<view class="title-group">
					<text class="title">注册会员</text>
					<text class="subtitle">加入奶茶物语</text>
				</view>
			</view>
			
			<view class="register-form glass-card">
				<view class="form-heading">
					<text class="heading-text">创建账号</text>
					<view class="heading-line"></view>
				</view>
				
				<view class="input-group">
					<text class="input-label">用户名</text>
					<view class="input-wrapper">
						<view class="input-icon">
							<view class="user-icon"></view>
						</view>
						<input class="input-box" type="text" placeholder="请输入用户名" v-model="formData.username" />
					</view>
				</view>
				
				<view class="input-group">
					<text class="input-label">手机号</text>
					<view class="input-wrapper">
						<view class="input-icon">
							<view class="phone-icon"></view>
						</view>
						<input class="input-box" type="number" placeholder="请输入手机号" maxlength="11" v-model="formData.phone" />
					</view>
				</view>
				
				<view class="input-group">
					<text class="input-label">设置密码</text>
					<view class="input-wrapper">
						<view class="input-icon">
							<view class="lock-icon"></view>
						</view>
						<input class="input-box" type="password" placeholder="请设置6-20位密码" v-model="formData.password" />
					</view>
				</view>
				
				<view class="input-group">
					<text class="input-label">确认密码</text>
					<view class="input-wrapper">
						<view class="input-icon">
							<view class="lock-icon"></view>
						</view>
						<input class="input-box" type="password" placeholder="请再次输入密码" v-model="formData.confirmPassword" />
					</view>
				</view>
				
				<view class="agreement">
					<view class="custom-checkbox" @click="formData.agreed = !formData.agreed">
						<view class="checkbox-inner" :class="{'checked': formData.agreed}"></view>
					</view>
					<text class="agreement-text">我已阅读并同意<text class="link">《用户协议》</text>和<text class="link">《隐私政策》</text></text>
				</view>
				
				<button class="register-btn" @click="handleRegister" :disabled="!formData.agreed">
					<text class="btn-text">注册</text>
					<view class="btn-arrow">→</view>
				</button>
				
				<view class="action-links">
					<text class="login-link" @click="goToLogin">已有账号，去登录</text>
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
				formData: {
				username: '',
				password: '',
				confirmPassword: '',
				agreed: false,
				},
				shopLogo: ''
			}
		},
		onLoad() {
			// 加载店铺信息以获取logo
			this.getShopInfo();
		},
		methods: {
			// 获取店铺信息
			getShopInfo() {
				api.getShopInfo()
					.then(res => {
						if (res.data.code === 200 && res.data.data) {
							this.shopLogo = res.data.data.logo;
						}
					})
					.catch(err => {
						console.error('获取店铺信息失败', err);
				});
			},
			handleRegister() {
				// 表单验证
				if (!this.formData.username) {
					uni.showToast({
						title: '请输入用户名',
						icon: 'none'
					});
					return;
				}
				if (!this.formData.phone) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					});
					return;
				}
				if (!/^1\d{10}$/.test(this.formData.phone)) {
					uni.showToast({
						title: '手机号格式不正确',
						icon: 'none'
					});
					return;
				}
				if (!this.formData.password) {
					uni.showToast({
						title: '请设置密码',
						icon: 'none'
					});
					return;
				}
				if (this.formData.password.length < 6 || this.formData.password.length > 20) {
					uni.showToast({
						title: '密码长度应为6-20位',
						icon: 'none'
					});
					return;
				}
				if (this.formData.password !== this.formData.confirmPassword) {
					uni.showToast({
						title: '两次密码输入不一致',
						icon: 'none'
					});
					return;
				}
				if (!this.formData.agreed) {
					uni.showToast({
						title: '请阅读并同意用户协议与隐私政策',
						icon: 'none'
					});
					return;
				}
				
				// 提交注册请求
				uni.showLoading({
					title: '注册中...'
				});
				
				uni.request({
					url: `${this.baseUrl}/user/register`,
					method: 'POST',
					data: {
						username: this.formData.username,
						password: this.formData.password,
						phone: this.formData.phone
					},
					success: (res) => {
						uni.hideLoading();
						
						if (res.data.code === 200) {
							// 注册成功
							uni.showToast({
								title: '注册成功',
								icon: 'success',
								duration: 1500,
								success: () => {
									// 注册成功后跳转到登录页
									setTimeout(() => {
										uni.navigateTo({
											url: '/pages/login/login'
										});
									}, 1500);
								}
							});
						} else {
							// 注册失败
							uni.showToast({
								title: res.data.message || '注册失败，请稍后重试',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						uni.hideLoading();
						uni.showToast({
							title: '网络异常，请稍后重试',
							icon: 'none'
						});
						console.error('注册请求失败', err);
					}
				});
			},
			
			goToLogin() {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			}
		}
	}
</script>

<style>
	.register-container {
		padding: 0;
		background: linear-gradient(135deg, #0c0a1f 0%, #1a1530 100%);
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		position: relative;
		overflow: hidden;
	}
	
	/* 动态气泡背景 */
	.floating-bubbles {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		overflow: hidden;
	}
	
	.bubble {
		position: absolute;
		bottom: -150rpx;
		background: radial-gradient(circle at 75% 30%, rgba(255, 255, 255, 0.15) 5%, rgba(112, 102, 226, 0.05) 60%, rgba(255, 125, 184, 0.03) 100%);
		border-radius: 50%;
		animation: floating var(--duration) ease-in infinite;
		width: var(--size);
		height: var(--size);
		animation-delay: var(--delay);
		opacity: 0;
		box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.05);
	}
	
	.bubble:nth-child(1) { left: 10%; }
	.bubble:nth-child(2) { left: 25%; }
	.bubble:nth-child(3) { left: 40%; }
	.bubble:nth-child(4) { left: 55%; }
	.bubble:nth-child(5) { left: 70%; }
	.bubble:nth-child(6) { left: 85%; }
	.bubble:nth-child(7) { left: 20%; }
	.bubble:nth-child(8) { left: 65%; }
	
	@keyframes floating {
		0% {
			opacity: 0;
			transform: translateY(0) scale(1) rotate(0deg);
		}
		10% {
			opacity: 0.8;
		}
		90% {
			opacity: 0.2;
		}
		100% {
			opacity: 0;
			transform: translateY(-100vh) scale(0.8) rotate(180deg);
		}
	}
	
	/* 奶茶杯装饰 */
	.decoration-cup {
		position: absolute;
		width: 180rpx;
		height: 250rpx;
		background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, rgba(112, 102, 226, 0.05) 70%);
		border-radius: 30rpx 30rpx 60rpx 60rpx;
		box-shadow: 0 0 30rpx rgba(112, 102, 226, 0.3);
		z-index: 1;
	}
	
	.decoration-cup::before {
		content: '';
		position: absolute;
		top: 50rpx;
		left: 20rpx;
		right: 20rpx;
		height: 120rpx;
		background: linear-gradient(180deg, rgba(255, 200, 155, 0.3), rgba(185, 141, 112, 0.1));
		border-radius: 10rpx;
	}
	
	.decoration-cup::after {
		content: '';
		position: absolute;
		top: 20rpx;
		left: 50%;
		width: 40rpx;
		height: 60rpx;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 20rpx;
		transform: translateX(-50%);
	}
	
	.left-cup {
		left: -50rpx;
		bottom: 15%;
		transform: rotate(-20deg);
		opacity: 0.7;
	}
	
	.right-cup {
		right: -30rpx;
		top: 20%;
		transform: rotate(15deg) scale(0.8);
		opacity: 0.6;
	}
	
	/* 主内容 */
	.register-content {
		width: 100%;
		padding: 20rpx 40rpx;
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	/* Logo样式 */
	.register-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20rpx;
		position: relative;
		width: 100%;
	}
	
	.logo-container {
		position: relative;
		width: 160rpx;
		height: 160rpx;
		margin-bottom: 10rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.logo {
		width: 120rpx;
		height: 120rpx;
		position: relative;
		z-index: 3;
		border-radius: 50%;
		overflow: hidden;
	}
	
	.logo-backdrop {
		position: absolute;
		width: 140rpx;
		height: 140rpx;
		background: rgba(255, 207, 178, 0.15);
		border-radius: 50%;
		z-index: 2;
		filter: blur(5rpx);
		animation: pulse 3s ease-in-out infinite alternate;
	}
	
	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 0.7;
		}
		100% {
			transform: scale(1.05);
			opacity: 0.9;
		}
	}
	
	.logo-ring {
		position: absolute;
		width: 170rpx;
		height: 170rpx;
		border-radius: 50%;
		border: 5rpx solid rgba(112, 102, 226, 0.5);
		z-index: 1;
		animation: rotate 10s linear infinite;
	}
	
	.logo-ring::before,
	.logo-ring::after {
		content: '';
		position: absolute;
		width: 20rpx;
		height: 20rpx;
		background: linear-gradient(45deg, #7066e2, #ff7eb3);
		border-radius: 50%;
	}
	
	.logo-ring::before {
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}
	
	.logo-ring::after {
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
	}
	
	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	
	/* 标题样式 */
	.title-group {
		text-align: center;
		margin-bottom: 20rpx;
	}
	
	.title {
		font-size: 48rpx;
		font-weight: bold;
		margin-bottom: 5rpx;
		letter-spacing: 4rpx;
		position: relative;
		color: transparent;
		background: linear-gradient(to right, #ffffff 20%, #d0ccff 40%, #7066e2 60%, #ffffff 80%);
		background-size: 200% auto;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: shine 4s linear infinite;
		text-shadow: 0 0 12rpx rgba(112, 102, 226, 0.7),
					0 0 25rpx rgba(112, 102, 226, 0.5);
	}
	
	@keyframes shine {
		to {
			background-position: 200% center;
		}
	}
	
	.subtitle {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.5);
		letter-spacing: 6rpx;
		font-style: italic;
		margin-top: 0;
	}
	
	/* 玻璃卡片样式 */
	.glass-card {
		background: rgba(30, 30, 50, 0.7);
		backdrop-filter: blur(20rpx);
		border-radius: 30rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.1);
		padding: 30rpx 30rpx;
		width: 100%;
		box-sizing: border-box;
		box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.3);
	}
	
	.form-heading {
		margin-bottom: 25rpx;
	}
	
	.heading-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 15rpx;
		display: block;
	}
	
	.heading-line {
		width: 60rpx;
		height: 4rpx;
		background: linear-gradient(to right, #7066e2, transparent);
	}
	
	/* 输入框样式 */
	.input-group {
		margin-bottom: 25rpx;
	}
	
	.input-label {
		display: block;
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.6);
		margin-bottom: 15rpx;
	}
	
	.input-wrapper {
		display: flex;
		align-items: center;
		background-color: rgba(20, 20, 35, 0.5);
		border-radius: 16rpx;
		overflow: hidden;
		transition: all 0.3s;
		border: 1rpx solid rgba(112, 102, 226, 0.2);
	}
	
	.input-wrapper:focus-within {
		box-shadow: 0 0 0 2rpx rgba(112, 102, 226, 0.3);
		border-color: rgba(112, 102, 226, 0.4);
	}
	
	.input-icon {
		width: 70rpx;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.user-icon, .lock-icon, .phone-icon {
		width: 24rpx;
		height: 24rpx;
		border: 1.5rpx solid rgba(255, 255, 255, 0.5);
	}
	
	.user-icon {
		border-radius: 50%;
		position: relative;
	}
	
	.user-icon::after {
		content: '';
		position: absolute;
		width: 32rpx;
		height: 16rpx;
		border-radius: 16rpx 16rpx 0 0;
		border: 1.5rpx solid rgba(255, 255, 255, 0.5);
		border-bottom: none;
		left: 50%;
		top: 100%;
		transform: translateX(-50%);
	}
	
	.phone-icon {
		border-radius: 4rpx;
		position: relative;
		width: 24rpx;
		height: 24rpx;
		transform: rotate(-15deg);
		border: none;
		box-shadow: 0 0 0 1.5rpx rgba(255, 255, 255, 0.5);
	}
	
	.phone-icon::before {
		content: '';
		position: absolute;
		width: 10rpx;
		height: 10rpx;
		border: 1.5rpx solid rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		top: 7rpx;
		left: 7rpx;
	}
	
	.phone-icon::after {
		content: '';
		position: absolute;
		width: 34rpx;
		height: 34rpx;
		border: 1.5rpx solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		top: -5rpx;
		left: -5rpx;
	}
	
	.lock-icon {
		border-radius: 4rpx;
		position: relative;
	}
	
	.lock-icon::before {
		content: '';
		position: absolute;
		width: 16rpx;
		height: 12rpx;
		border: 1.5rpx solid rgba(255, 255, 255, 0.5);
		border-bottom: none;
		border-radius: 8rpx 8rpx 0 0;
		top: -12rpx;
		left: 50%;
		transform: translateX(-50%);
	}
	
	.input-box {
		flex: 1;
		height: 80rpx;
		color: #ffffff;
		padding: 0 20rpx;
		font-size: 28rpx;
		background: transparent;
	}
	
	/* 协议样式 */
	.agreement {
		display: flex;
		align-items: center;
		margin-bottom: 25rpx;
	}
	
	.custom-checkbox {
		width: 36rpx;
		height: 36rpx;
		border-radius: 8rpx;
		border: 1.5rpx solid rgba(112, 102, 226, 0.6);
		margin-right: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.3s;
	}
	
	.checkbox-inner {
		width: 24rpx;
		height: 24rpx;
		border-radius: 4rpx;
		transition: all 0.2s;
	}
	
	.checked {
		background-color: #7066e2;
	}
	
	.agreement-text {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.6);
		line-height: 1.4;
	}
	
	.link {
		color: #9a62f1;
	}
	
	/* 按钮样式 */
	.register-btn {
		width: 100%;
		height: 90rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background: linear-gradient(to right, #7066e2, #9a62f1);
		border-radius: 45rpx;
		font-weight: bold;
		font-size: 32rpx;
		box-shadow: 0 8rpx 20rpx rgba(112, 102, 226, 0.4);
		color: #ffffff;
		margin-top: 20rpx;
		margin-bottom: 30rpx;
		position: relative;
		overflow: hidden;
	}
	
	.register-btn::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
		transform: rotate(30deg);
		animation: shine-effect 3s infinite;
	}
	
	.register-btn[disabled] {
		opacity: 0.6;
		background: linear-gradient(to right, #505050, #707070);
		box-shadow: none;
	}
	
	@keyframes shine-effect {
		from {
			transform: translateX(-100%) rotate(30deg);
		}
		to {
			transform: translateX(100%) rotate(30deg);
		}
	}
	
	.btn-text {
		margin-right: 10rpx;
	}
	
	.btn-arrow {
		font-size: 32rpx;
		opacity: 0.8;
		transition: transform 0.3s;
	}
	
	.register-btn:active:not([disabled]) .btn-arrow {
		transform: translateX(10rpx);
	}
	
	/* 链接样式 */
	.action-links {
		display: flex;
		justify-content: center;
		margin-top: 30rpx;
		font-size: 26rpx;
	}
	
	.login-link {
		color: rgba(255, 255, 255, 0.7);
		position: relative;
		transition: all 0.3s;
	}
	
	.login-link::after {
		content: '';
		position: absolute;
		bottom: -5rpx;
		left: 0;
		width: 0;
		height: 1rpx;
		background: rgba(255, 255, 255, 0.7);
		transition: width 0.3s;
	}
	
	.login-link:active::after {
		width: 100%;
	}
</style> 