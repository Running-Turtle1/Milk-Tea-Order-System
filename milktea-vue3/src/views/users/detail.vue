<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserDetail, getUserPoints } from '../../api/admin'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const userId = route.params.id

// 用户详情数据
const userInfo = ref({})

// 积分记录数据
const pointsRecords = ref([])
const pointsTotal = ref(0)

// 分页参数
const pointsPageQuery = reactive({
  page: 0,
  size: 10
})

// 获取积分类型标签样式
const getTypeTagType = (type) => {
  const types = {
    0: 'info',    // 系统奖励
    1: 'success', // 消费获得
    2: 'warning', // 管理员调整
    3: 'danger',   // 积分兑换
    4: 'success', // 消费获得
  }
  return types[type] || 'info'
}

// 获取积分类型标签文本
const getTypeLabel = (type) => {
  const labels = {
    0: '系统奖励',
    1: '消费获得',
    5: '管理员调整',
    3: '积分兑换',
    4: '签到获得'
  }
  return labels[type] || '未知类型'
}

// 加载用户详情
const loadUserDetail = async () => {
  try {
    loading.value = true
    const response = await getUserDetail(userId)
    
    if (response.data) {
      userInfo.value = response.data
    }
  } catch (error) {
    console.error('加载用户详情失败:', error)
    ElMessage.error('加载用户详情失败')
  } finally {
    loading.value = false
  }
}

// 加载积分记录
const loadUserPoints = async () => {
  try {
    loading.value = true
    
    const params = {
      ...pointsPageQuery
    }
    
    const response = await getUserPoints(userId, params)
    
    if (response.data) {
      pointsRecords.value = response.data.content || []
      pointsTotal.value = response.data.totalElements || 0
    }
  } catch (error) {
    console.error('加载积分记录失败:', error)
    ElMessage.error('加载积分记录失败')
  } finally {
    loading.value = false
  }
}

// 积分分页变化处理
const handlePointsPageChange = (newPage) => {
  pointsPageQuery.page = newPage - 1 // Element Plus分页从1开始，后端从0开始
  loadUserPoints()
}

// 每页条数变化处理
const handlePointsSizeChange = (newSize) => {
  pointsPageQuery.size = newSize
  pointsPageQuery.page = 0
  loadUserPoints()
}

// 格式化会员等级
const formatMemberLevel = (level) => {
  const levels = {
    0: '普通会员',
    1: '银卡会员',
    2: '金卡会员',
    3: '黑卡会员'
  }
  return levels[level] || '未知等级'
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '--'
  
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 返回用户列表
const goBack = () => {
  router.push('/users')
}

// 初始加载
onMounted(() => {
  loadUserDetail()
  loadUserPoints()
})
</script>

<template>
  <div class="user-detail-container">
    <!-- 标题和返回按钮 -->
    <div class="page-header">
      <div class="page-title">
        <el-button @click="goBack" type="default" :icon="ArrowLeft" class="back-button">
          返回列表
        </el-button>
        <h2>用户详情</h2>
      </div>
    </div>
    
    <el-row :gutter="20" class="detail-row">
      <!-- 用户基本信息卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <div class="detail-card user-info-card">
          <div class="card-header">
            <h3>基本信息</h3>
          </div>
          
          <el-skeleton :loading="loading" animated>
            <template #default>
              <div class="user-profile">
                <div class="avatar-container">
                  <div class="avatar" v-if="!userInfo.avatar">
                    {{ userInfo.username?.charAt(0) || 'U' }}
                  </div>
                  <el-avatar v-else :src="userInfo.avatar" :size="100" class="user-avatar-img"></el-avatar>
                  <div class="member-badge" :class="`level-${userInfo.memberLevel}`">
                    {{ userInfo.memberLevelText || formatMemberLevel(userInfo.memberLevel) }}
                  </div>
                </div>
                
                <div class="user-name">{{ userInfo.username }}</div>
                <div class="username">{{ userInfo.phone }}</div>
                
                <el-divider />
                
                <ul class="info-list">
                  <li>
                    <span class="info-label">会员ID</span>
                    <span class="info-value">{{ userInfo.id }}</span>
                  </li>
                  <li>
                    <span class="info-label">性别</span>
                    <span class="info-value">{{ userInfo.genderText || '未设置' }}</span>
                  </li>
                  <li v-if="userInfo.birthday">
                    <span class="info-label">生日</span>
                    <span class="info-value">{{ userInfo.birthday }}</span>
                  </li>
                  <li>
                    <span class="info-label">会员积分</span>
                    <span class="info-value points">{{ userInfo.totalPoints || 0 }}</span>
                  </li>
                  <li>
                    <span class="info-label">订单数量</span>
                    <span class="info-value">{{ userInfo.orderCount || 0 }}</span>
                  </li>
                  <li>
                    <span class="info-label">消费金额</span>
                    <span class="info-value amount">¥{{ userInfo.totalAmount?.toFixed(2) || '0.00' }}</span>
                  </li>
                  <li>
                    <span class="info-label">账号状态</span>
                    <span class="info-value">
                      <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'" size="small">
                        {{ userInfo.statusText || (userInfo.status === 1 ? '启用' : '禁用') }}
                      </el-tag>
                    </span>
                  </li>
                  <li>
                    <span class="info-label">注册时间</span>
                    <span class="info-value">{{ formatDateTime(userInfo.createdAt) }}</span>
                  </li>
                  <li v-if="userInfo.lastOrderTime">
                    <span class="info-label">最后下单</span>
                    <span class="info-value">{{ formatDateTime(userInfo.lastOrderTime) }}</span>
                  </li>
                </ul>
              </div>
            </template>
          </el-skeleton>
        </div>
      </el-col>
      
      <!-- 积分记录卡片 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <div class="detail-card points-record-card">
          <div class="card-header">
            <h3>积分记录</h3>
          </div>
          
          <el-table
            :data="pointsRecords"
            style="width: 100%"
            v-loading="loading"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column prop="id" label="记录ID" width="80" align="center" />
            <el-table-column label="积分变动" align="center">
              <template #default="scope">
                <span :class="{ 'positive': scope.row.point > 0, 'negative': scope.row.point < 0 }">
                  {{ scope.row.point > 0 ? '+' + scope.row.point : scope.row.point }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" align="center">
              <template #default="scope">
                <el-tag :type="getTypeTagType(scope.row.type)" size="small">
                  {{ getTypeLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" align="center" />
            <el-table-column label="时间" align="center">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              :current-page="pointsPageQuery.page + 1"
              :page-size="pointsPageQuery.size"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pointsTotal"
              @size-change="handlePointsSizeChange"
              @current-change="handlePointsPageChange"
              background
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.user-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

/* 页面标题区域 */
.page-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.page-title {
  display: flex;
  align-items: center;
}

.back-button {
  margin-right: 16px;
  border-radius: 8px;
  transition: all 0.3s;
}

.back-button:hover {
  background-color: #ecf5ff;
  color: #1976d2;
}

.page-title h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
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

/* 详情卡片通用样式 */
.detail-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  height: 100%;
  transition: all 0.3s ease;
}

.detail-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.card-header {
  margin-bottom: 20px;
  position: relative;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  position: relative;
  padding-left: 15px;
}

.card-header h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 20px;
  background: linear-gradient(to bottom, #409EFF, #64b5f6);
  border-radius: 10px;
}

/* 用户信息卡片样式 */
.user-info-card {
  display: flex;
  flex-direction: column;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-container {
  position: relative;
  margin-bottom: 15px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  box-shadow: 0 10px 20px rgba(25, 118, 210, 0.3);
}

.user-avatar-img {
  box-shadow: 0 10px 20px rgba(25, 118, 210, 0.3);
}

.member-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  color: #333;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.level-0 {
  background: #f0f2f5;
  color: #606266;
}

.level-1 {
  background: linear-gradient(45deg, #B0BEC5, #CFD8DC);
  color: #37474F;
}

.level-2 {
  background: linear-gradient(45deg, #FFC107, #FFD54F);
  color: #5D4037;
}

.level-3 {
  background: linear-gradient(45deg, #212121, #424242);
  color: #E0E0E0;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 10px 0 5px;
}

.username {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}

.info-list {
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px dashed #ebeef5;
}

.info-list li:last-child {
  border-bottom: none;
}

.info-label {
  color: #909399;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.info-value.points {
  color: #f56c6c;
  font-weight: 700;
}

.info-value.amount {
  color: #67C23A;
  font-weight: 700;
}

/* 积分记录卡片样式 */
.points-record-card {
  display: flex;
  flex-direction: column;
}

.positive {
  color: #67C23A;
  font-weight: 600;
}

.negative {
  color: #F56C6C;
  font-weight: 600;
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

.detail-row {
  display: flex;
  flex-wrap: wrap;
}

.detail-row > .el-col {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.detail-row .detail-card {
  flex: 1;
  display: flex;
  flex-direction: column;
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