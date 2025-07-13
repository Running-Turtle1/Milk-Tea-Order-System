<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUserList, updateUserStatus, adjustUserPoints, syncMemberLevels } from '../../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

// 数据加载状态
const loading = ref(false)
const syncingLevels = ref(false)

// 搜索条件
const searchForm = reactive({
  username: '',
  phone: '',
  status: '',
  memberLevel: ''
})

// 用户列表数据
const userList = ref([])
const total = ref(0)

// 分页参数
const pageQuery = reactive({
  page: 0,
  size: 10
})

// 表格列配置
const columns = [
  { label: '用户ID', prop: 'id', width: '70px' },
  { label: '用户名', prop: 'username' },
  { label: '手机号', prop: 'phone' },
  { label: '会员等级', prop: 'memberLevel', formatter: formatMemberLevel },
  { label: '积分', prop: 'totalPoints' },
  { label: '订单数', prop: 'orderCount', width: '80px' },
  { label: '消费金额', prop: 'totalAmount', formatter: formatAmount, width: '100px' },
  { label: '注册时间', prop: 'createdAt', formatter: formatDateTime },
  { label: '最后下单', prop: 'lastOrderTime', formatter: formatDateTime },
  { label: '状态', prop: 'status', formatter: formatStatus, width: '80px' }
]

// 加载用户列表数据
const loadUserList = async () => {
  try {
    loading.value = true
    
    // 构建查询参数
    const params = {
      ...searchForm,
      ...pageQuery
    }
    
    // 发送请求
    const response = await getUserList(params)
    console.log('用户列表数据:', response.data)
    
    if (response.data) {
      userList.value = response.data.content || []
      total.value = response.data.totalElements || 0
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageQuery.page = 0 // 重置页码
  loadUserList()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pageQuery.page = 0
  loadUserList()
}

// 分页变化处理
const handlePageChange = (newPage) => {
  pageQuery.page = newPage - 1 // Element Plus分页从1开始，后端从0开始
  loadUserList()
}

// 每页条数变化处理
const handleSizeChange = (newSize) => {
  pageQuery.size = newSize
  pageQuery.page = 0
  loadUserList()
}

// 会员等级格式化
function formatMemberLevel(row) {
  // 直接使用API返回的会员等级文本
  return row.memberLevelText || '未知等级'
}

// 状态格式化
function formatStatus(row) {
  // 直接使用API返回的状态文本
  return row.statusText || (row.status === 1 ? '启用' : '禁用')
}

// 金额格式化
function formatAmount(row) {
  return row.totalAmount ? `¥${row.totalAmount.toFixed(2)}` : '¥0.00'
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

// 更新用户状态
const changeUserStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    
    // 确认提示
    await ElMessageBox.confirm(
      `确定要${newStatus === 1 ? '启用' : '禁用'}该用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 发送请求
    await updateUserStatus(row.id, newStatus)
    
    // 更新本地状态
    row.status = newStatus
    
    ElMessage.success(`用户${newStatus === 1 ? '启用' : '禁用'}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新用户状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 调整积分弹窗
const pointsDialogVisible = ref(false)
const currentUser = ref(null)
const pointsForm = reactive({
  userId: null,
  point: 0,
  description: ''
})

const openPointsDialog = (row) => {
  currentUser.value = row
  pointsForm.userId = row.id
  pointsForm.point = 0
  pointsForm.description = ''
  pointsDialogVisible.value = true
}

const handleAdjustPoints = async () => {
  try {
    if (!pointsForm.point) {
      ElMessage.warning('请输入调整的积分')
      return
    }
    
    // 发送请求
    await adjustUserPoints(pointsForm)
    
    // 关闭弹窗
    pointsDialogVisible.value = false
    
    // 更新本地积分
    if (currentUser.value) {
      currentUser.value.totalPoints = (currentUser.value.totalPoints || 0) + parseInt(pointsForm.point)
    }
    
    ElMessage.success('积分调整成功')
  } catch (error) {
    console.error('积分调整失败:', error)
    ElMessage.error('积分调整失败')
  }
}

// 手动同步会员等级
const handleSyncMemberLevels = async () => {
  try {
    syncingLevels.value = true
    // 同步会员等级
    await syncMemberLevels()
    ElMessage.success('会员等级同步成功')
    // 重新加载用户列表以获取最新的会员等级
    loadUserList()
  } catch (error) {
    console.error('同步会员等级失败:', error)
    ElMessage.error('会员等级同步失败')
  } finally {
    syncingLevels.value = false
  }
}

// 初始加载
onMounted(async () => {
  // 加载用户列表
  loadUserList()
})
</script>

<template>
  <div class="users-container">
    <!-- 标题和搜索区域 -->
    <div class="page-header">
      <div class="page-title">
        <h2>用户管理</h2>
        <p>管理平台用户，查看用户信息和订单，调整积分等</p>
      </div>
    </div>
    
    <div class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="searchForm.memberLevel" placeholder="选择等级" clearable style="width: 120px">
            <el-option label="普通会员" value="0" />
            <el-option label="银卡会员" value="1" />
            <el-option label="金卡会员" value="2" />
            <el-option label="黑卡会员" value="3" />
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
            <el-button 
              type="info" 
              :icon="Refresh" 
              @click="handleSyncMemberLevels" 
              :loading="syncingLevels"
              class="sync-button"
            >
              同步会员等级
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 用户列表表格 -->
    <div class="users-table-card">
      <el-table
        :data="userList"
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
        ></el-table-column>
        
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                link
                size="small"
                @click="openPointsDialog(scope.row)"
                class="action-button"
              >
                积分调整
              </el-button>
              
              <el-button
                :type="scope.row.status === 1 ? 'danger' : 'success'"
                link
                size="small"
                @click="changeUserStatus(scope.row)"
                class="action-button"
              >
                {{ scope.row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              
              <el-button
                type="info"
                link
                size="small"
                @click="$router.push(`/users/detail/${scope.row.id}`)"
                class="action-button"
              >
                详情
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
        />
      </div>
    </div>
    
    <!-- 积分调整弹窗 -->
    <el-dialog
      v-model="pointsDialogVisible"
      title="积分调整"
      width="500px"
      center
      destroy-on-close
      class="points-dialog"
    >
      <div class="user-info-block" v-if="currentUser">
        <div class="user-avatar">
          {{ currentUser.username?.charAt(0) || 'U' }}
        </div>
        <div class="user-info">
          <div class="username">{{ currentUser.username }}</div>
          <div class="current-points">
            当前积分: <span class="points-value">{{ currentUser.totalPoints || 0 }}</span>
          </div>
        </div>
      </div>
      
      <el-form :model="pointsForm" label-width="100px">
        <el-form-item label="积分变更">
          <el-input-number
            v-model="pointsForm.point"
            :min="-10000"
            :max="10000"
            placeholder="输入积分变更值"
            class="points-input"
          >
            <template #prefix>
              <span class="point-prefix" :class="{ positive: pointsForm.point > 0, negative: pointsForm.point < 0 }">
                {{ pointsForm.point > 0 ? '+' : '' }}
              </span>
            </template>
          </el-input-number>
          <div class="points-tip">
            正数为增加积分，负数为减少积分
          </div>
        </el-form-item>
        
        <el-form-item label="变更原因">
          <el-input
            v-model="pointsForm.description"
            type="textarea"
            placeholder="请输入积分变更原因"
            rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="pointsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAdjustPoints" class="confirm-button">确认调整</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.users-container {
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
.users-table-card {
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

/* 积分调整弹窗 */
.points-dialog :deep(.el-dialog__header) {
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #f0f0f0;
}

.points-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
  position: relative;
  padding-left: 12px;
}

.points-dialog :deep(.el-dialog__title)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border-radius: 2px;
}

.points-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.points-dialog :deep(.el-dialog__footer) {
  padding: 10px 24px 24px;
  border-top: 0;
}

.user-info-block {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 24px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin-right: 16px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.current-points {
  color: #606266;
  font-size: 14px;
}

.points-value {
  font-weight: 600;
  color: #1976d2;
}

.points-input {
  width: 200px;
}

.point-prefix {
  font-weight: bold;
  margin-right: 4px;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

.points-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
  line-height: 1.5;
}

.confirm-button {
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border: none;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transition: all 0.3s;
}

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(25, 118, 210, 0.4);
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