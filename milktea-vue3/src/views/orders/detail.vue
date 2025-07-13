<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, getOrderDetails, getOrderRefunds } from '../../api/admin'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Document, Box, Money } from '@element-plus/icons-vue'

// 获取路由参数
const route = useRoute()
const router = useRouter()
const orderId = route.params.id

// 数据加载状态
const loading = ref(false)
const orderInfo = ref(null)
const orderDetails = ref([])

// 退款记录
const refundRecords = ref([])

// 加载订单数据
const loadOrderData = async () => {
  if (!orderId) {
    ElMessage.error('订单ID不存在')
    router.push('/orders')
    return
  }
  
  try {
    loading.value = true
    
    // 加载订单基本信息
    const orderResponse = await getOrderDetail(orderId)
    orderInfo.value = orderResponse.data
    
    // 加载订单商品详情
    const detailsResponse = await getOrderDetails(orderId)
    orderDetails.value = detailsResponse.data || []
    
    // 处理每个商品的规格信息
    orderDetails.value.forEach(item => {
      const attributes = []
      
      // 添加温度信息
      if (item.temperature) {
        attributes.push({ name: '温度', value: item.temperature })
      }
      
      // 添加甜度信息
      if (item.sweetness) {
        attributes.push({ name: '甜度', value: item.sweetness })
      }
      
      // 处理配料信息
      if (item.ingredients) {
        try {
          const ingredientsArray = JSON.parse(item.ingredients)
          ingredientsArray.forEach(ing => {
            attributes.push({
              name: '加料',
              value: `${ing.name}(+¥${ing.price})`
            })
          })
        } catch (e) {
          console.error('解析配料信息失败:', e)
        }
      }
      
      // 将处理后的规格信息添加到商品对象中
      item.attributes = attributes
    })
    
    // 加载订单退款记录
    try {
      const refundResponse = await getOrderRefunds(orderId)
      refundRecords.value = refundResponse.data || []
    } catch (refundError) {
      console.error('加载退款记录失败:', refundError)
      // 不阻止页面加载
    }
  } catch (error) {
    console.error('加载订单数据失败:', error)
    ElMessage.error('加载订单数据失败')
  } finally {
    loading.value = false
  }
}

// 返回订单列表
const goBack = () => {
  router.push('/orders')
}

// 订单状态格式化
const formatStatus = (status) => {
  const statusMap = {
    0: { label: '待支付', type: 'warning' },
    1: { label: '已支付', type: 'success' },
    2: { label: '已完成', type: 'success' },
    3: { label: '退款中', type: 'warning' },
    4: { label: '已退款', type: 'info' },
    5: { label: '已取消', type: 'danger' },
    6: { label: '拒绝退款', type: 'danger' }
  }
  
  return statusMap[status] || { label: '未知状态', type: 'info' }
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

// 查看退款详情
const viewRefundDetail = (refundId) => {
  router.push(`/refunds/detail/${refundId}`)
}

// 初始加载
onMounted(() => {
  loadOrderData()
})
</script>

<template>
  <div class="order-detail-container" v-loading="loading">
    <!-- 顶部返回栏 -->
    <div class="back-bar">
      <el-button @click="goBack" :icon="ArrowLeft" class="back-button">返回订单列表</el-button>
    </div>
    
    <!-- 订单基本信息 -->
    <div class="detail-card" v-if="orderInfo">
      <div class="card-header">
        <div class="header-title">
          <span class="icon-box">
            <el-icon><Document /></el-icon>
          </span>
          <h3>订单信息</h3>
        </div>
        
        <el-tag 
          :type="formatStatus(orderInfo.status).type" 
          size="large"
          effect="dark"
          class="status-tag"
        >
          {{ formatStatus(orderInfo.status).label }}
        </el-tag>
      </div>
      
      <div class="info-content">
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单号</span>
            <span class="value">{{ orderInfo.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">取餐号</span>
            <span class="value highlight">{{ orderInfo.takeNo || '--' }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付金额</span>
            <span class="value price">¥{{ orderInfo.paymentAmount?.toFixed(2) }}</span>
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
            <span class="label">订单备注</span>
            <span class="value">{{ orderInfo.remark || '无' }}</span>
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-item">
            <span class="label">创建时间</span>
            <span class="value">{{ formatDateTime(orderInfo.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付时间</span>
            <span class="value">{{ formatDateTime(orderInfo.paymentTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式</span>
            <span class="value">{{ orderInfo.paymentMethod || '--' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 订单商品详情 -->
    <div class="detail-card products-card">
      <div class="card-header">
        <div class="header-title">
          <span class="icon-box products">
            <el-icon><Box /></el-icon>
          </span>
          <h3>商品信息</h3>
        </div>
      </div>
      
      <div class="products-list">
        <el-table
          :data="orderDetails"
          style="width: 100%"
          border
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column prop="productImage" label="商品图片" width="100" align="center">
            <template #default="scope">
              <el-image 
                v-if="scope.row.productImage" 
                :src="scope.row.productImage" 
                style="width: 60px; height: 60px; border-radius: 6px;"
                fit="cover"
                lazy
              />
              <span v-else>无图片</span>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="100" align="right">
            <template #default="scope">
              ¥{{ scope.row.price?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="subTotal" label="小计" width="120" align="right">
            <template #default="scope">
              ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="attributes" label="规格" min-width="200">
            <template #default="scope">
              <div class="attribute-tags" v-if="scope.row.attributes && scope.row.attributes.length">
                <el-tag
                  v-for="(attr, index) in scope.row.attributes"
                  :key="index"
                  size="small"
                  effect="plain"
                  class="attribute-tag"
                >
                  {{ attr.name }}: {{ attr.value }}
                </el-tag>
              </div>
              <span v-else>--</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 订单汇总信息 -->
      <div class="order-summary" v-if="orderInfo">
        <div class="summary-item">
          <span>商品总数:</span>
          <span>{{ orderDetails.length || 0 }} 件</span>
        </div>
        <div class="summary-item">
          <span>商品总额:</span>
          <span>¥{{ orderInfo.totalAmount?.toFixed(2) || '0.00' }}</span>
        </div>
        <div class="summary-item">
          <span>优惠金额:</span>
          <span>¥{{ orderInfo.discountAmount?.toFixed(2) || '0.00' }}</span>
        </div>
        <div class="summary-item total">
          <span>订单总计:</span>
          <span class="total-amount">¥{{ orderInfo.paymentAmount?.toFixed(2) || '0.00' }}</span>
        </div>
      </div>
    </div>
    
    <!-- 退款记录列表 -->
    <div class="detail-card" v-if="refundRecords.length > 0">
      <div class="card-header">
        <div class="header-title">
          <span class="icon-box refund">
            <el-icon><Money /></el-icon>
          </span>
          <h3>退款记录</h3>
        </div>
      </div>
      
      <div class="refund-list">
        <el-table
          :data="refundRecords"
          style="width: 100%"
          border
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column prop="id" label="退款ID" width="80" align="center" />
          <el-table-column prop="refundAmount" label="退款金额" width="120" align="right">
            <template #default="scope">
              <span class="refund-amount">¥{{ scope.row.refundAmount?.toFixed(2) || '0.00' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="退款原因" min-width="200" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === 0 ? 'warning' : scope.row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ scope.row.status === 0 ? '待处理' : scope.row.status === 1 ? '已退款' : '已拒绝' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="申请时间" width="160" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="processTime" label="处理时间" width="160" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.processTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                @click="viewRefundDetail(scope.row.id)"
                class="action-button"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-detail-container {
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
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.icon-box.products {
  background: linear-gradient(45deg, #67c23a, #95d475);
}

.icon-box.refund {
  background: linear-gradient(45deg, #e6a23c, #f3d19e);
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

/* 订单信息内容 */
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

.value.price {
  color: #f56c6c;
  font-weight: 600;
}

/* 商品列表 */
.products-list {
  margin-bottom: 24px;
}

.attribute-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.attribute-tag {
  margin-right: 0;
}

.refund-amount {
  color: #e6a23c;
  font-weight: 600;
}

/* 订单汇总 */
.order-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 16px;
  border-top: 1px dashed #f0f0f0;
}

.summary-item {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
  min-width: 200px;
}

.summary-item span:first-child {
  color: #606266;
  margin-right: 16px;
}

.summary-item span:last-child {
  font-weight: 500;
  color: #303133;
  min-width: 80px;
  text-align: right;
}

.summary-item.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.total-amount {
  color: #f56c6c !important;
  font-size: 18px;
  font-weight: 600 !important;
}

/* 退款弹窗 */
.refund-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #f0f0f0;
}

.refund-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
  position: relative;
  padding-left: 12px;
}

.refund-dialog :deep(.el-dialog__title)::before {
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

.refund-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.refund-dialog :deep(.el-dialog__footer) {
  padding: 10px 24px 24px;
  border-top: 0;
}

.order-info-block {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 24px;
  padding: 16px;
}

.order-icon {
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

.order-info {
  flex: 1;
}

.order-no {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.order-amount {
  color: #606266;
  font-size: 14px;
}

.amount-value {
  font-weight: 600;
  color: #f56c6c;
}

.confirm-button {
  background: linear-gradient(45deg, #f56c6c, #f78989);
  border: none;
  box-shadow: 0 4px 10px rgba(245, 108, 108, 0.3);
  transition: all 0.3s;
}

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(245, 108, 108, 0.4);
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