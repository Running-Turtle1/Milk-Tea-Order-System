<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getCouponList, 
  updateCouponStatus, 
  deleteCoupon
} from '../../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 数据加载状态
const loading = ref(false)

// 优惠券列表数据
const couponList = ref([])
const total = ref(0)

// 搜索条件
const searchForm = reactive({
  name: '',
  type: '',
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
  { label: '优惠券ID', prop: 'id', width: '80px' },
  { label: '优惠券名称', prop: 'name', minWidth: '160px' },
  { label: '类型', prop: 'type', formatter: formatType, width: '100px' },
  { label: '优惠金额/折扣', prop: 'amount', formatter: formatAmount, width: '120px' },
  { label: '使用门槛', prop: 'minConsumption', formatter: formatMinConsumption, width: '120px' },
  { label: '发放总量', prop: 'total', width: '100px' },
  { label: '已领取', prop: 'issued', width: '100px' },
  { label: '已使用', prop: 'used', width: '100px' },
  { label: '剩余数量', prop: 'remaining', width: '100px' },
  { label: '有效期', prop: 'timePeriod', formatter: formatTimePeriod, minWidth: '200px' },
  { label: '状态', prop: 'status', formatter: formatStatus, width: '100px' }
]

// 加载优惠券列表数据
const loadCouponList = async () => {
  try {
    loading.value = true
    
    // 构建查询参数
    const params = {
      ...searchForm,
      ...pageQuery
    }
    
    // 特殊处理过期状态查询
    if (params.status === '2') {
      params.expired = true
      params.status = '' // 清空状态，由后端根据过期条件筛选
    }
    
    // 发送请求
    const response = await getCouponList(params)
    console.log('优惠券列表数据:', response.data)
    
    if (response.data) {
      couponList.value = response.data.content || []
      total.value = response.data.totalElements || 0
    }
  } catch (error) {
    console.error('加载优惠券列表失败:', error)
    ElMessage.error('加载优惠券列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageQuery.page = 0 // 重置页码
  loadCouponList()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pageQuery.page = 0
  loadCouponList()
}

// 分页变化处理
const handlePageChange = (newPage) => {
  pageQuery.page = newPage - 1 // Element Plus分页从1开始，后端从0开始
  loadCouponList()
}

// 每页条数变化处理
const handleSizeChange = (newSize) => {
  pageQuery.size = newSize
  pageQuery.page = 0
  loadCouponList()
}

// 优惠券类型格式化
function formatType(row) {
  const typeMap = {
    1: { label: '满减券', type: 'success' },
    2: { label: '折扣券', type: 'warning' }
  }
  
  const type = typeMap[row.type] || { label: '未知类型', type: 'info' }
  
  return `<el-tag type="${type.type}" size="small">${type.label}</el-tag>`
}

// 优惠金额/折扣格式化
function formatAmount(row) {
  if (row.type === 1) {
    return row.amount ? `¥${row.amount.toFixed(2)}` : '¥0.00'
  } else if (row.type === 2) {
    return row.amount ? `${row.amount * 10}折` : '0折'
  }
  return '--'
}

// 最低使用门槛格式化
function formatMinConsumption(row) {
  return row.minConsumption ? `满¥${row.minConsumption.toFixed(2)}可用` : '无门槛'
}

// 有效期格式化
function formatTimePeriod(row) {
  if (row.startTime && row.endTime) {
    const startDate = formatDate(row.startTime)
    const endDate = formatDate(row.endTime)
    return `${startDate} 至 ${endDate}`
  }
  return '--'
}

// 日期格式化
function formatDate(dateStr) {
  if (!dateStr) return '--'
  
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 状态格式化
function formatStatus(row) {
  // 检查优惠券是否过期
  const isExpired = checkExpired(row)
  
  if (isExpired) {
    return `<el-tag type="info" size="small">已过期</el-tag>`
  }
  
  const statusMap = {
    0: { label: '禁用', type: 'danger' },
    1: { label: '启用', type: 'success' }
  }
  
  const status = statusMap[row.status] || { label: '未知状态', type: 'info' }
  
  return `<el-tag type="${status.type}" size="small">${status.label}</el-tag>`
}

// 检查优惠券是否过期
function checkExpired(row) {
  if (!row.endTime) return false
  
  const now = new Date()
  const endTime = new Date(row.endTime)
  
  return now > endTime
}

// 切换优惠券状态
const toggleCouponStatus = async (row) => {
  // 检查是否过期
  if (checkExpired(row)) {
    ElMessage.warning('已过期的优惠券不能更改状态')
    return
  }
  
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await updateCouponStatus(row.id, newStatus)
    
    // 更新本地状态
    row.status = newStatus
    
    ElMessage.success(`优惠券已${newStatus === 1 ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('更新优惠券状态失败:', error)
    ElMessage.error('更新优惠券状态失败')
  }
}

// 删除优惠券
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该优惠券吗？删除后不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteCoupon(row.id)
    
    ElMessage.success('优惠券删除成功')
    
    // 重新加载数据
    loadCouponList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除优惠券失败:', error)
      ElMessage.error('删除优惠券失败')
    }
  }
}

// 编辑优惠券
const handleEdit = (row) => {
  router.push(`/coupons/edit/${row.id}`)
}

// 创建优惠券
const handleCreate = () => {
  router.push('/coupons/create')
}

// 发放优惠券
const handleIssue = (row) => {
  router.push({
    path: '/coupons/issue',
    query: { couponId: row.id }
  })
}

// 初始加载
onMounted(() => {
  loadCouponList()
})
</script>

<template>
  <div class="coupons-container">
    <!-- 标题和搜索区域 -->
    <div class="page-header">
      <div class="page-title">
        <h2>优惠券管理</h2>
        <p>创建和管理优惠券，设置优惠券类型、金额等</p>
      </div>
      
      <div class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="优惠券名称">
            <el-input v-model="searchForm.name" placeholder="请输入优惠券名称" clearable />
          </el-form-item>
          <el-form-item label="优惠券类型">
            <el-select v-model="searchForm.type" placeholder="选择类型" clearable style="width: 120px">
              <el-option label="满减券" value="1" />
              <el-option label="折扣券" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
              <el-option label="已过期" value="2" />
            </el-select>
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
    
    <!-- 优惠券列表表格 -->
    <div class="coupons-table-card">
      <div class="table-header">
        <el-button type="primary" @click="handleCreate" :icon="Plus" class="add-button">
          新增优惠券
        </el-button>
      </div>
      
      <el-table
        :data="couponList"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
        highlight-current-row
        table-layout="fixed"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth || ''"
          :formatter="col.formatter"
          align="center"
        >
          <template #default="scope">
            <template v-if="col.prop === 'status'">
              <template v-if="checkExpired(scope.row)">
                <el-tag type="info" size="small">已过期</el-tag>
              </template>
              <template v-else>
                <el-tag 
                  :type="scope.row.status === 1 ? 'success' : 'danger'"
                  size="small"
                >
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </template>
            
            <template v-else-if="col.prop === 'type'">
              <el-tag 
                :type="scope.row.type === 1 ? 'success' : 'warning'"
                size="small"
              >
                {{ scope.row.type === 1 ? '满减券' : '折扣券' }}
              </el-tag>
            </template>
            
            <template v-else-if="col.prop === 'amount'">
              <span class="amount-text" :class="{ 'discount': scope.row.type === 2 }">
                {{ 
                  scope.row.type === 1 
                  ? `¥${scope.row.amount?.toFixed(2) || '0.00'}`
                  : `${scope.row.amount * 10}折`
                }}
              </span>
            </template>
            
            <template v-else-if="col.prop === 'minConsumption'">
              <span>
                {{ scope.row.minConsumption ? `满¥${scope.row.minConsumption.toFixed(2)}可用` : '无门槛' }}
              </span>
            </template>
            
            <template v-else-if="col.prop === 'issued'">
              <span>{{ scope.row.issued || 0 }}</span>
            </template>
            
            <template v-else-if="col.prop === 'used'">
              <span>{{ scope.row.used || 0 }}</span>
            </template>
            
            <template v-else-if="col.prop === 'remaining'">
              <span>{{ scope.row.remaining || 0 }}</span>
            </template>
            
            <template v-else-if="col.prop === 'timePeriod'">
              <div class="time-period">
                <div>{{ formatDate(scope.row.startTime) }} 至</div>
                <div>{{ formatDate(scope.row.endTime) }}</div>
              </div>
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" fixed="right" width="220" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleEdit(scope.row)"
                class="action-button"
              >
                编辑
              </el-button>
              
              <el-button
                :type="scope.row.status === 1 ? 'warning' : 'success'"
                link
                size="small"
                @click="toggleCouponStatus(scope.row)"
                class="action-button"
                :disabled="checkExpired(scope.row)"
                :title="checkExpired(scope.row) ? '已过期的优惠券不能更改状态' : ''"
              >
                {{ scope.row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              
              <el-button
                type="info"
                link
                size="small"
                @click="handleIssue(scope.row)"
                class="action-button"
                :disabled="checkExpired(scope.row) || scope.row.status === 0"
                :title="checkExpired(scope.row) ? '已过期的优惠券不能发放' : (scope.row.status === 0 ? '已禁用的优惠券不能发放' : '')"
              >
                发放
              </el-button>
              
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDelete(scope.row)"
                class="action-button"
              >
                删除
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
.coupons-container {
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

.add-button {
  background: linear-gradient(45deg, #67c23a, #95d475);
  border: none;
  box-shadow: 0 4px 10px rgba(103, 194, 58, 0.3);
  transition: all 0.3s;
  margin-bottom: 16px;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(103, 194, 58, 0.4);
}

/* 表格卡片 */
.coupons-table-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

/* 表格样式 */
:deep(.el-table) {
  width: 100% !important;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  width: 100% !important;
}

:deep(.el-table__body) {
  width: 100% !important;
}

:deep(.el-table--border .el-table__cell) {
  border-right: 1px solid #ebeef5;
}

:deep(.el-table--border::after),
:deep(.el-table--border::before) {
  display: none;
}

.table-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
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

/* 特定样式 */
.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.amount-text.discount {
  color: #e6a23c;
}

.time-period {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
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