<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getRefundList, processRefund } from '../../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 获取路由实例
const router = useRouter()

// 数据加载状态
const loading = ref(false)

// 退款列表数据
const refundList = ref([])
const total = ref(0)

// 搜索条件
const searchForm = reactive({
  orderNo: '',
  keyword: '',
  status: '',
  startDate: '',
  endDate: ''
})

// 分页参数
const pageQuery = reactive({
  page: 0,
  size: 10
})

// 表格列配置
const columns = [
  { label: '退款ID', prop: 'id', width: '80px' },
  { label: '订单号', prop: 'orderNo', width: '180px' },
  { label: '用户名', prop: 'username' },
  { label: '退款金额', prop: 'refundAmount', formatter: formatAmount, width: '100px' },
  { label: '申请时间', prop: 'createdAt', formatter: formatDateTime },
  { label: '处理时间', prop: 'processTime', formatter: formatDateTime },
  { label: '退款状态', prop: 'status', formatter: formatStatus, width: '100px' }
]

// 加载退款列表数据
const loadRefundList = async () => {
  try {
    loading.value = true
    
    // 构建查询参数
    const params = {
      ...searchForm,
      ...pageQuery
    }
    
    // 发送请求
    const response = await getRefundList(params)
    console.log('退款列表数据:', response.data)
    
    if (response.data) {
      refundList.value = response.data.content || []
      total.value = response.data.totalElements || 0
    }
  } catch (error) {
    console.error('加载退款列表失败:', error)
    ElMessage.error('加载退款列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageQuery.page = 0 // 重置页码
  loadRefundList()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pageQuery.page = 0
  loadRefundList()
}

// 分页变化处理
const handlePageChange = (newPage) => {
  pageQuery.page = newPage - 1 // Element Plus分页从1开始，后端从0开始
  loadRefundList()
}

// 每页条数变化处理
const handleSizeChange = (newSize) => {
  pageQuery.size = newSize
  pageQuery.page = 0
  loadRefundList()
}

// 金额格式化
function formatAmount(row) {
  return row.refundAmount ? `¥${row.refundAmount.toFixed(2)}` : '¥0.00'
}

// 状态格式化
function formatStatus(row) {
  const statusMap = {
    0: { label: '待处理', type: 'warning' },
    1: { label: '已退款', type: 'success' },
    2: { label: '已拒绝', type: 'danger' }
  }
  
  const status = statusMap[row.status] || { label: '未知状态', type: 'info' }
  
  return `<el-tag type="${status.type}" size="small">${status.label}</el-tag>`
}

// 日期时间格式化
function formatDateTime(row, column) {
  if (!row[column.property]) {
    return '--'
  }
  
  const date = new Date(row[column.property])
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 处理退款
const handleProcess = async (row, result) => {
  try {
    // 只有待处理的退款才能处理
    if (row.status !== 0) {
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
    currentRefund.value = row
    processForm.refundId = row.id
    processForm.result = result
    processDialogVisible.value = true
  } catch (error) {
    if (error !== 'cancel') {
      console.error('处理操作失败:', error)
      ElMessage.error('处理操作失败')
    }
  }
}

// 处理弹窗
const processDialogVisible = ref(false)
const currentRefund = ref(null)
const processForm = reactive({
  refundId: null,
  result: null, // 1-同意，2-拒绝
  comment: '',
  processor: 'admin' // 默认处理人
})

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
    if (currentRefund.value) {
      currentRefund.value.status = processForm.result
      currentRefund.value.processTime = new Date().toISOString()
    }
    
    const successMsg = processForm.result === 1 ? '退款申请已同意' : '退款申请已拒绝'
    ElMessage.success(successMsg)
    
    // 重新加载数据
    loadRefundList()
  } catch (error) {
    console.error('处理退款失败:', error)
    ElMessage.error('处理退款失败')
  } finally {
    loading.value = false
  }
}

// 查看退款详情
const viewRefundDetail = (row) => {
  // 使用路由跳转到退款详情页
  router.push(`/refunds/detail/${row.id}`)
}

// 初始加载
onMounted(() => {
  loadRefundList()
})
</script>

<template>
  <div class="refunds-container">
    <!-- 标题和搜索区域 -->
    <div class="page-header">
      <div class="page-title">
        <h2>退款管理</h2>
        <p>查看退款申请、处理退款申请</p>
      </div>
      
      <div class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="订单号">
            <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="searchForm.keyword" placeholder="用户名/手机号" clearable />
          </el-form-item>
          <el-form-item label="退款状态">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
              <el-option label="待处理" value="0" />
              <el-option label="已退款" value="1" />
              <el-option label="已拒绝" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="起始日期">
            <el-date-picker
              v-model="searchForm.startDate"
              type="date"
              placeholder="选择起始日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 160px"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="searchForm.endDate"
              type="date"
              placeholder="选择结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 160px"
            />
          </el-form-item>
          <el-form-item>
            <div class="button-group">
              <el-button type="primary" @click="handleSearch" :icon="Search" class="search-button">
                查询
              </el-button>
              <el-button @click="resetSearch" :icon="Refresh" class="reset-button">
                重置
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 退款列表表格 -->
    <div class="refunds-table-card">
      <el-table
        :data="refundList"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :formatter="col.formatter"
          align="center"
        >
          <template #default="scope" v-if="col.prop === 'status'">
            <el-tag 
              :type="scope.row.status === 0 ? 'warning' : scope.row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.status === 0 ? '待处理' : scope.row.status === 1 ? '已退款' : '已拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="reason" label="退款原因" min-width="180" align="center">
          <template #default="scope">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="scope.row.reason"
              placement="top"
              v-if="scope.row.reason && scope.row.reason.length > 20"
            >
              <span>{{ scope.row.reason.slice(0, 20) }}...</span>
            </el-tooltip>
            <span v-else>{{ scope.row.reason || '--' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                link
                size="small"
                @click="viewRefundDetail(scope.row)"
                class="action-button"
              >
                查看详情
              </el-button>
              
              <template v-if="scope.row.status === 0">
                <el-button
                  type="success"
                  link
                  size="small"
                  @click="handleProcess(scope.row, 1)"
                  class="action-button"
                >
                  同意
                </el-button>
                
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="handleProcess(scope.row, 2)"
                  class="action-button"
                >
                  拒绝
                </el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pageQuery.page + 1"
          :page-size="pageQuery.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          background
          prev-text="上一页"
          next-text="下一页"
          :pager-count="5"
        >
          <template #total>
            共 <strong>{{ total }}</strong> 条数据
          </template>
          <template #sizes="{ handleSizeChange }">
            <span class="el-pagination__sizes">
              每页
              <el-select
                v-model="pageQuery.size"
                @change="val => handleSizeChange(val)"
              >
                <el-option
                  v-for="item in [10, 20, 50, 100]"
                  :key="item"
                  :value="item"
                  :label="`${item}条/页`"
                />
              </el-select>
            </span>
          </template>
        </el-pagination>
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
      <div class="refund-info-block" v-if="currentRefund">
        <div class="refund-icon">
          <el-icon class="icon-receipt">
            <Money v-if="processForm.result === 1" />
            <CircleClose v-else />
          </el-icon>
        </div>
        <div class="refund-info">
          <div class="refund-no">订单号: {{ currentRefund.orderNo }}</div>
          <div class="refund-amount">
            退款金额: <span class="amount-value">¥{{ currentRefund.refundAmount?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="refund-reason">
            退款原因: {{ currentRefund.reason }}
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
.refunds-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

/* 页面标题区域 */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  margin-bottom: 20px;
}

.page-title h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #303133;
  position: relative;
  padding-left: 16px;
}

.page-title h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border-radius: 2px;
}

.page-title p {
  color: #909399;
  font-size: 14px;
  margin: 0;
  padding-left: 16px;
}

/* 搜索卡片 */
.search-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

/* 按钮样式 */
.button-group {
  display: flex;
  gap: 10px;
}

.search-button {
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border: none;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.search-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.3s;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(25, 118, 210, 0.4);
}

.search-button:hover::after {
  left: 100%;
}

.reset-button {
  border: 1px solid #dcdfe6;
  background: white;
  transition: all 0.3s;
}

.reset-button:hover {
  color: #1976d2;
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

/* 表格卡片 */
.refunds-table-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

/* 表格内操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-button {
  position: relative;
  padding: 2px 0;
}

.action-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background-color: currentColor;
  transition: width 0.3s ease;
}

.action-button:hover::after {
  width: 100%;
}

/* 分页容器 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-hover-color: #1976d2;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: #f5f7fa;
}

:deep(.el-pagination .el-pagination__jump) {
  margin-left: 16px;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.3);
}

:deep(.el-select__wrapper) {
  margin: 0 8px;
}

:deep(.el-pagination__total) {
  margin-right: 16px;
}

:deep(.el-pagination__total strong) {
  color: #1976d2;
  font-weight: 600;
  margin: 0 4px;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.2);
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