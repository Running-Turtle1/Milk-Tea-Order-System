<template>
	<view class="refund-container">
		<view class="header">
			<text class="title">申请退款</text>
		</view>
		
		<view class="refund-form">
			<view class="form-item">
				<text class="item-label">订单编号</text>
				<text class="item-value">{{orderNo}}</text>
			</view>
			
			<view class="form-item">
				<text class="item-label">退款金额</text>
				<view class="amount-input">
					<text class="currency">¥</text>
					<input 
						type="digit"
						v-model="refundAmount"
						placeholder="请输入退款金额"
						class="amount-value"
						:maxlength="10"
						@input="checkAmount"
					/>
				</view>
			</view>
			
			<view class="form-item">
				<text class="item-label">退款原因</text>
				<picker @change="onReasonChange" :value="reasonIndex" :range="reasonOptions">
					<view class="picker-value">
						<text>{{reasonOptions[reasonIndex] || '请选择退款原因'}}</text>
						<view class="arrow"></view>
					</view>
				</picker>
			</view>
			
			<view class="form-item">
				<text class="item-label">退款方式</text>
				<picker @change="onMethodChange" :value="methodIndex" :range="methods" range-key="name">
					<view class="picker-value">
						<text>{{methods[methodIndex].name || '请选择退款方式'}}</text>
						<view class="arrow"></view>
					</view>
				</picker>
			</view>
			
			<view class="form-item textarea-item">
				<text class="item-label">备注说明</text>
				<textarea 
					v-model="remark"
					placeholder="请输入退款说明（选填）"
					class="remark-textarea"
					maxlength="200"
				></textarea>
				<text class="textarea-count">{{remark.length}}/200</text>
			</view>
		</view>
		
		<view class="refund-tips">
			<view class="tip-item">
				<text class="tip-title">退款说明:</text>
				<text class="tip-content">1. 退款金额不能超过订单支付金额</text>
				<text class="tip-content">2. 提交后需等待商家审核，请耐心等待</text>
				<text class="tip-content">3. 退款将原路返回，预计1-7个工作日到账</text>
			</view>
		</view>
		
		<view class="submit-btn" @click="submitRefund">提交申请</view>
	</view>
</template>

<script>
	import api from '@/utils/api.js';
	
	export default {
		data() {
			return {
				orderNo: '',
				orderAmount: 0,
				refundAmount: '',
				reasonOptions: [
					'商品质量问题',
					'商品口味不合适',
					'送达时间过长',
					'商品包装破损',
					'商品错误',
					'重复下单',
					'不想要了',
					'其他原因'
				],
				reasonIndex: 0,
				methods: [
					{ id: 1, name: '原路返回' },
					{ id: 2, name: '退到余额' }
				],
				methodIndex: 0,
				remark: ''
			}
		},
		onLoad(options) {
			if (options.orderNo) {
				this.orderNo = options.orderNo;
			}
			
			if (options.amount) {
				this.orderAmount = parseFloat(options.amount);
				this.refundAmount = this.orderAmount.toFixed(2);
			}
		},
		methods: {
			// 校验退款金额
			checkAmount() {
				// 确保输入的是数字
				if (this.refundAmount && !/^\d+(\.\d{0,2})?$/.test(this.refundAmount)) {
					const value = this.refundAmount;
					this.refundAmount = value.replace(/[^\d.]/g, '');
				}
				
				// 确保不超过订单金额
				if (parseFloat(this.refundAmount) > this.orderAmount) {
					this.refundAmount = this.orderAmount.toFixed(2);
					uni.showToast({
						title: '退款金额不能超过订单金额',
						icon: 'none'
					});
				}
			},
			
			// 选择退款原因
			onReasonChange(e) {
				this.reasonIndex = e.detail.value;
			},
			
			// 选择退款方式
			onMethodChange(e) {
				this.methodIndex = e.detail.value;
			},
			
			// 提交退款申请
			submitRefund() {
				// 表单验证
				if (!this.refundAmount || parseFloat(this.refundAmount) <= 0) {
					uni.showToast({
						title: '请输入有效的退款金额',
						icon: 'none'
					});
					return;
				}
				
				if (this.reasonIndex === undefined) {
					uni.showToast({
						title: '请选择退款原因',
						icon: 'none'
					});
					return;
				}
				
				// 确认对话框
				uni.showModal({
					title: '确认申请',
					content: '确定要提交退款申请吗？',
					success: (res) => {
						if (res.confirm) {
							// 显示加载中
							uni.showLoading({
								title: '提交中...'
							});
							
							// 构建请求数据
							const refundData = {
								orderNo: this.orderNo,
								// 直接使用退款金额（元）
								refundAmount: parseFloat(this.refundAmount),
								// 直接传递选择的原因字符串
								reason: this.reasonOptions[this.reasonIndex],
								remark: this.remark,
								// 设置退款方式ID（1-原路返回，2-退到余额）
								refundMethod: this.methods[this.methodIndex].id
							};
							
							console.log('退款请求数据:', refundData);
							console.log('订单支付金额:', this.orderAmount);
							
							// 调用API
							api.applyRefund(refundData)
								.then(res => {
									console.log('退款申请响应:', res.data);
									if (res.data.code === 200) {
										uni.showToast({
											title: '申请已提交',
											icon: 'success'
										});
										
										// 延迟返回上一页
										setTimeout(() => {
											uni.navigateBack();
										}, 1500);
									} else {
										uni.showToast({
											title: res.data.message || '申请失败',
											icon: 'none'
										});
									}
								})
								.catch(err => {
									console.error('网络请求失败:', err);
									uni.showToast({
										title: '网络请求失败',
										icon: 'none'
									});
								})
								.finally(() => {
									uni.hideLoading();
							});
						}
					}
				});
			}
		}
	}
</script>

<style>
	.refund-container {
		background-color: #121212;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}
	
	.header {
		padding: 30rpx;
		background-color: #1a1a1a;
		text-align: center;
	}
	
	.title {
		font-size: 36rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.refund-form {
		margin: 30rpx;
		padding: 30rpx;
		background-color: #1a1a1a;
		border-radius: 16rpx;
	}
	
	.form-item {
		margin-bottom: 30rpx;
	}
	
	.item-label {
		display: block;
		font-size: 28rpx;
		color: #888888;
		margin-bottom: 10rpx;
	}
	
	.item-value {
		font-size: 30rpx;
		color: #ffffff;
	}
	
	.amount-input {
		display: flex;
		align-items: center;
		border-bottom: 2rpx solid #333333;
		padding-bottom: 10rpx;
	}
	
	.currency {
		font-size: 32rpx;
		color: #ffffff;
		margin-right: 10rpx;
	}
	
	.amount-value {
		flex: 1;
		height: 60rpx;
		color: #ffffff;
		font-size: 32rpx;
	}
	
	.picker-value {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 2rpx solid #333333;
		padding: 15rpx 0;
	}
	
	.picker-value text {
		font-size: 30rpx;
		color: #ffffff;
	}
	
	.arrow {
		width: 20rpx;
		height: 20rpx;
		border-right: 4rpx solid #888888;
		border-bottom: 4rpx solid #888888;
		transform: rotate(45deg);
	}
	
	.textarea-item {
		position: relative;
	}
	
	.remark-textarea {
		width: 100%;
		height: 180rpx;
		background-color: #232323;
		border-radius: 12rpx;
		padding: 20rpx;
		box-sizing: border-box;
		color: #ffffff;
		font-size: 28rpx;
		margin-top: 10rpx;
	}
	
	.textarea-count {
		position: absolute;
		right: 20rpx;
		bottom: 20rpx;
		font-size: 22rpx;
		color: #888888;
	}
	
	.refund-tips {
		margin: 0 30rpx 40rpx;
		padding: 20rpx 30rpx;
		background-color: #1a1a1a;
		border-radius: 12rpx;
	}
	
	.tip-title {
		display: block;
		font-size: 28rpx;
		color: #888888;
		margin-bottom: 10rpx;
	}
	
	.tip-content {
		display: block;
		font-size: 24rpx;
		color: #888888;
		margin-bottom: 6rpx;
	}
	
	.submit-btn {
		margin: 40rpx 30rpx;
		height: 90rpx;
		line-height: 90rpx;
		background-color: #7b68ee;
		color: #ffffff;
		font-size: 32rpx;
		text-align: center;
		border-radius: 45rpx;
	}
</style> 