<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRefundDetail, getOrderDetail, processRefund } from '../../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Document, Money, CircleClose } from '@element-plus/icons-vue'

// 获取路由参数
const route = useRoute()
const router = useRouter()
const refundId = route.params.id

// 数据加载状态
const loading = ref(false)
const refundInfo = ref(null)
const orderInfo = ref(null)

// 处理相关
const processDialogVisible = ref(false)
const processForm = reactive({
  refundId: null,
  result: null, // 1-同意，2-拒绝
  comment: '',
  processor: 'admin' // 默认处理人
})

// 加载退款数据
const loadRefundData = async () => {
  if (!refundId) {
    ElMessage.error('退款ID不存在')
    router.push('/refunds')
    return
  }
  
  try {
    loading.value = true
    
    // 加载退款基本信息
    const refundResponse = await getRefundDetail(refundId)
    refundInfo.value = refundResponse.data
    
    // 加载关联订单信息
    if (refundInfo.value?.orderId) {
      const orderResponse = await getOrderDetail(refundInfo.value.orderId)
      orderInfo.value = orderResponse.data
    }
    
    // 设置处理表单的退款ID
    processForm.refundId = refundId
  } catch (error) {
    console.error('加载退款数据失败:', error)
    ElMessage.error('加载退款数据失败')
  } finally {
    loading.value = false
  }
}

// 返回退款列表
const goBack = () => {
  router.push('/refunds')
}

// 退款状态格式化
const formatStatus = (status) => {
  const statusMap = {
    0: { label: '待处理', type: 'warning' },
    1: { label: '已退款', type: 'success' },
    2: { label: '已拒绝', type: 'danger' }
  }
  
  return statusMap[status] || { label: '未知状态', type: 'info' }
}

// 退款方式格式化
const formatRefundMethod = (method) => {
  const methodMap = {
    1: '原路返回',
    2: '退到余额'
  }
  
  return methodMap[method] || '未知方式'
}

// 日期时间格式化
const formatDateTime = (time) => {
  if (!time) return '--'
  
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 处理退款
const handleProcess = async (result) => {
  try {
    // 只有待处理的退款才能处理
    if (refundInfo.value.status !== 0) {
      ElMessage.warning('只有待处理的退款才能处理')
      return
    }
    
    // 确认提示
    const confirmMsg = result === 1 ? '确定同意该退款申请吗？' : '确定拒绝该退款申请吗？'
    const confirmTitle = result === 1 ? '同意退款确认' : '拒绝退款确认'
    
    await ElMessageBox.confirm(
      confirmMsg,
      confirmTitle,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: result === 1 ? 'warning' : 'info'
      }
    )
    
    // 打开处理对话框
    processForm.result = result
    processDialogVisible.value = true
  } catch (error) {
    if (error !== 'cancel') {
      console.error('处理操作失败:', error)
      ElMessage.error('处理操作失败')
    }
  }
}

// 提交处理结果
const submitProcess = async () => {
  if (!processForm.comment) {
    ElMessage.warning('请填写处理说明')
    return
  }
  
  try {
    loading.value = true
    
    // 调用处理API
    await processRefund(processForm)
    
    // 关闭对话框
    processDialogVisible.value = false
    
    // 更新本地退款状态
    if (refundInfo.value) {
      refundInfo.value.status = processForm.result
      refundInfo.value.processTime = new Date().toISOString()
      refundInfo.value.processor = processForm.processor
      refundInfo.value.comment = processForm.comment
    }
    
    const successMsg = processForm.result === 1 ? '退款申请已同意' : '退款申请已拒绝'
    ElMessage.success(successMsg)
    
  } catch (error) {
    console.error('处理退款失败:', error)
    ElMessage.error('处理退款失败')
  } finally {
    loading.value = false
  }
}

// 查看订单详情
const viewOrderDetail = () => {
  if (orderInfo.value?.id) {
    router.push(`/orders/detail/${orderInfo.value.id}`)
  }
}

// 初始加载
onMounted(() => {
  loadRefundData()
})
</script>

<template>
  <div class="refund-detail-container" v-loading="loading">
    <!-- 顶部返回栏 -->
    <div class="back-bar">
      <el-button @click="goBack" :icon="ArrowLeft" class="back-button">返回退款列表</el-button>
      
      <div class="actions" v-if="refundInfo && refundInfo.status === 0">
        <el-button 
          type="success" 
          @click="handleProcess(1)" 
          class="approve-button"
        >
          同意退款
        </el-button>
        <el-button 
          type="danger" 
          @click="handleProcess(2)" 
          class="reject-button"
        >
          拒绝退款
        </el-button>
      </div>
    </div>
    
    <!-- 退款基本信息 -->
    <div class="detail-card" v-if="refundInfo">
      <div class="card-header">
        <div class="header-title">
          <span class="icon-box">
            <el-icon><Money /></el-icon>
          </span>
          <h3>退款信息</h3>
        </div>
        
        <el-tag 
          :type="formatStatus(refundInfo.status).type" 
          size="large"
          effect="dark"
          class="status-tag"
        >
          {{ formatStatus(refundInfo.status).label }}
        </el-tag>
      </div>
      
      <div class="info-content">
        <div class="info-row">
          <div class="info-item">
            <span class="label">退款ID</span>
            <span class="value">{{ refundInfo.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">关联订单号</span>
            <span class="value highlight clickable" @click="viewOrderDetail">{{ refundInfo.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">退款金额</span>
            <span class="value price">¥{{ refundInfo.refundAmount?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-item">
            <span class="label">用户名</span>
            <span class="value">{{ refundInfo.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">退款方式</span>
            <span class="value">{{ formatRefundMethod(refundInfo.refundMethod) }}</span>
          </div>
          <div class="info-item">
            <span class="label">申请时间</span>
            <span class="value">{{ formatDateTime(refundInfo.createdAt) }}</span>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-item full-width">
            <span class="label">退款原因</span>
            <span class="value">{{ refundInfo.reason || '无' }}</span>
          </div>
        </div>
        
        <div class="info-row" v-if="refundInfo.remark">
          <div class="info-item full-width">
            <span class="label">备注信息</span>
            <span class="value">{{ refundInfo.remark }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 处理信息 -->
    <div class="detail-card" v-if="refundInfo && refundInfo.status !== 0">
      <div class="card-header">
        <div class="header-title">
          <span class="icon-box" :class="refundInfo.status === 1 ? 'approved' : 'rejected'">
            <el-icon>
              <Money v-if="refundInfo.status === 1" />
              <CircleClose v-else />
            </el-icon>
          </span>
          <h3>处理信息</h3>
        </div>
      </div>
      
      <div class="info-content">
        <div class="info-row">
          <div class="info-item">
            <span class="label">处理人</span>
            <span class="value">{{ refundInfo.processor || '--' }}</span>
          </div>
          <div class="info-item">
            <span class="label">处理时间</span>
            <span class="value">{{ formatDateTime(refundInfo.processTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">处理结果</span>
            <span class="value">
              <el-tag 
                :type="refundInfo.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ refundInfo.status === 1 ? '已退款' : '已拒绝' }}
              </el-tag>
            </span>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-item full-width">
            <span class="label">处理说明</span>
            <span class="value">{{ refundInfo.comment || '无' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 关联订单信息 -->
    <div class="detail-card" v-if="orderInfo">
      <div class="card-header">
        <div class="header-title">
          <span class="icon-box order">
            <el-icon><Document /></el-icon>
          </span>
          <h3>关联订单信息</h3>
        </div>
        
        <el-button type="primary" link @click="viewOrderDetail">查看完整订单</el-button>
      </div>
      
      <div class="info-content">
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单ID</span>
            <span class="value">{{ orderInfo.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单号</span>
            <span class="value">{{ orderInfo.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单金额</span>
            <span class="value">¥{{ orderInfo.paymentAmount?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-item">
            <span class="label">用户名</span>
            <span class="value">{{ orderInfo.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">手机号</span>
            <span class="value">{{ orderInfo.phone || '--' }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付时间</span>
            <span class="value">{{ formatDateTime(orderInfo.paymentTime) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 处理弹窗 -->
    <el-dialog
      v-model="processDialogVisible"
      :title="processForm.result === 1 ? '同意退款' : '拒绝退款'"
      width="500px"
      center
      destroy-on-close
      class="process-dialog"
    >
      <div class="refund-info-block" v-if="refundInfo">
        <div class="refund-icon">
          <el-icon class="icon-receipt">
            <Money v-if="processForm.result === 1" />
            <CircleClose v-else />
          </el-icon>
        </div>
        <div class="refund-info">
          <div class="refund-no">订单号: {{ refundInfo.orderNo }}</div>
          <div class="refund-amount">
            退款金额: <span class="amount-value">¥{{ refundInfo.refundAmount?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="refund-reason">
            退款原因: {{ refundInfo.reason }}
          </div>
        </div>
      </div>
      
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理说明" required>
          <el-input
            v-model="processForm.comment"
            type="textarea"
            placeholder="请输入处理说明"
            rows="3"
          />
        </el-form-item>
        
        <el-form-item label="处理人">
          <el-input v-model="processForm.processor" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button 
            :type="processForm.result === 1 ? 'success' : 'danger'" 
            @click="submitProcess" 
            class="confirm-button" 
            :loading="loading"
          >
            {{ processForm.result === 1 ? '确认退款' : '确认拒绝' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.refund-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

/* 返回栏 */
.back-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.back-button {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #dcdfe6;
}

.back-button:hover {
  color: #1976d2;
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.actions {
  display: flex;
  gap: 12px;
}

.approve-button {
  background: linear-gradient(45deg, #67c23a, #85ce61);
  border: none;
  border-radius: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(103, 194, 58, 0.2);
}

.approve-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(103, 194, 58, 0.3);
}

.reject-button {
  background: linear-gradient(45deg, #f56c6c, #f78989);
  border: none;
  border-radius: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(245, 108, 108, 0.2);
}

.reject-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(245, 108, 108, 0.3);
}

/* 详情卡片 */
.detail-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.detail-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px dashed #f0f0f0;
  margin-bottom: 20px;
}

.header-title {
  display: flex;
  align-items: center;
}

.icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(45deg, #f56c6c, #f78989);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.icon-box.order {
  background: linear-gradient(45deg, #1976d2, #64b5f6);
}

.icon-box.approved {
  background: linear-gradient(45deg, #67c23a, #85ce61);
}

.icon-box.rejected {
  background: linear-gradient(45deg, #f56c6c, #f78989);
}

.header-title h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.status-tag {
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 6px;
}

/* 退款信息内容 */
.info-content {
  padding: 8px 0;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 16px;
}

.info-item:first-child {
  padding-left: 0;
}

.info-item.full-width {
  flex: 3;
}

.info-item .label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.info-item .value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.value.highlight {
  color: #1976d2;
  font-size: 18px;
  font-weight: 600;
}

.value.clickable {
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: all 0.3s;
}

.value.clickable:hover {
  color: #64b5f6;
}

.value.price {
  color: #f56c6c;
  font-weight: 600;
}

/* 处理弹窗 */
.process-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #f0f0f0;
}

.process-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
  position: relative;
  padding-left: 12px;
}

.process-dialog :deep(.el-dialog__title)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: linear-gradient(45deg, #f56c6c, #f78989);
  border-radius: 2px;
}

.process-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.process-dialog :deep(.el-dialog__footer) {
  padding: 10px 24px 24px;
  border-top: 0;
}

.refund-info-block {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 24px;
  padding: 16px;
}

.refund-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f56c6c, #f78989);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.icon-receipt {
  font-size: 24px;
}

.refund-info {
  flex: 1;
}

.refund-no {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.refund-amount, .refund-reason {
  color: #606266;
  font-size: 14px;
  margin-bottom: 4px;
}

.amount-value {
  font-weight: 600;
  color: #f56c6c;
}

.confirm-button {
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

/* 修复按钮点击后的黑色边框问题 */
:deep(.el-button) {
  outline: none !important;
}

:deep(.el-button:focus) {
  outline: none !important;
  box-shadow: none;
}

:deep(.el-button:focus-visible) {
  outline: none !important;
}
</style> 