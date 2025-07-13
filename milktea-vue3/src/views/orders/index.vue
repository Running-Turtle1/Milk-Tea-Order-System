<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOrderList } from '../../api/admin'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 获取路由实例
const router = useRouter()

// 数据加载状态
const loading = ref(false)

// 订单列表数据
const orderList = ref([])
const total = ref(0)

// 搜索条件
const searchForm = reactive({
  orderNo: '',
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
  { label: '订单ID', prop: 'id', width: '80px' },
  { label: '订单号', prop: 'orderNo', width: '180px' },
  { label: '取餐号', prop: 'takeNo', width: '100px' },
  { label: '用户名', prop: 'username' },
  { label: '支付金额', prop: 'paymentAmount', formatter: formatAmount, width: '100px' },
  { label: '支付时间', prop: 'paymentTime', formatter: formatDateTime },
  { label: '创建时间', prop: 'createdAt', formatter: formatDateTime },
  { label: '订单状态', prop: 'status', formatter: formatStatus, width: '100px' }
]

// 加载订单列表数据
const loadOrderList = async () => {
  try {
    loading.value = true
    
    // 构建查询参数
    const params = {
      ...searchForm,
      ...pageQuery
    }
    
    // 发送请求
    const response = await getOrderList(params)
    console.log('订单列表数据:', response.data)
    
    if (response.data) {
      orderList.value = response.data.content || []
      total.value = response.data.totalElements || 0
    }
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageQuery.page = 0 // 重置页码
  loadOrderList()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pageQuery.page = 0
  loadOrderList()
}

// 分页变化处理
const handlePageChange = (newPage) => {
  pageQuery.page = newPage - 1 // Element Plus分页从1开始，后端从0开始
  loadOrderList()
}

// 每页条数变化处理
const handleSizeChange = (newSize) => {
  pageQuery.size = newSize
  pageQuery.page = 0
  loadOrderList()
}

// 金额格式化
function formatAmount(row) {
  return row.paymentAmount ? `¥${row.paymentAmount.toFixed(2)}` : '¥0.00'
}

// 状态格式化
function formatStatus(row) {
  const statusMap = {
    0: { label: '待支付', type: 'warning' },
    1: { label: '已支付', type: 'success' },
    2: { label: '已完成', type: 'success' },
    3: { label: '退款中', type: 'warning' },
    4: { label: '已退款', type: 'info' },
    5: { label: '已取消', type: 'danger' },
    6: { label: '拒绝退款', type: 'danger' }
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

// 查看订单详情
const viewOrderDetail = (row) => {
  // 使用路由跳转到订单详情页
  router.push(`/orders/detail/${row.id}`)
}

// 初始加载
onMounted(() => {
  loadOrderList()
})
</script>

<template>
  <div class="orders-container">
    <!-- 标题和搜索区域 -->
    <div class="page-header">
      <div class="page-title">
        <h2>订单管理</h2>
        <p>查看订单信息、管理订单状态</p>
      </div>
      
      <div class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="订单号">
            <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
              <el-option label="待支付" value="0" />
              <el-option label="已支付" value="1" />
              <el-option label="已完成" value="2" />
              <el-option label="退款中" value="3" />
              <el-option label="已退款" value="4" />
              <el-option label="已取消" value="5" />
              <el-option label="拒绝退款" value="6" />
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
    
    <!-- 订单列表表格 -->
    <div class="orders-table-card">
      <el-table
        :data="orderList"
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
              :type="scope.row.status === 0 ? 'warning' : 
                    scope.row.status === 1 ? 'success' : 
                    scope.row.status === 2 ? 'success' : 
                    scope.row.status === 3 ? 'warning' : 
                    scope.row.status === 4 ? 'info' : 'danger'"
              size="small"
            >
              {{ scope.row.status === 0 ? '待支付' : 
                 scope.row.status === 1 ? '已支付' : 
                 scope.row.status === 2 ? '已完成' : 
                 scope.row.status === 3 ? '退款中' : 
                 scope.row.status === 4 ? '已退款' : 
                 scope.row.status === 5 ? '已取消' : '拒绝退款' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                link
                size="small"
                @click="viewOrderDetail(scope.row)"
                class="action-button"
              >
                查看详情
              </el-button>
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
  </div>
</template>

<style scoped>
.orders-container {
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
.orders-table-card {
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
</style> 