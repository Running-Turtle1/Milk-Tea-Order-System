<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCouponDetail, issueCoupon, batchIssueCoupon, getUserCouponList, getUserList, checkUserCoupon } from '../../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Search, Refresh } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()
const route = useRoute()

// 获取优惠券ID，可能从路由参数中获取
const couponId = computed(() => route.query.couponId || '')

// 加载状态和提交状态
const loading = ref(false)
const submitting = ref(false)
const userLoading = ref(false)
const userTableLoading = ref(false)

// 表单引用
const formRef = ref(null)

// 优惠券信息
const couponInfo = ref({})

// 发放表单数据
const issueForm = reactive({
  couponId: '',
  batchType: 'single', // single-单个发放, batch-批量发放
  selectedUser: null, // 单个发放选中的用户
  selectedUsers: [] // 批量发放选中的用户列表
})

// 用户列表数据
const userList = ref([])
const userTotal = ref(0)
const receivedUserIds = ref([]) // 已领取优惠券的用户ID列表

// 用户搜索条件
const userSearchForm = reactive({
  username: '',
  mobile: '',
  status: '1'
})

// 用户分页参数
const userPageQuery = reactive({
  page: 0,
  size: 10
})

// 已发放记录
const issuedRecords = ref([])
const total = ref(0)

// 分页参数
const pageQuery = reactive({
  page: 0,
  size: 10,
  couponId: ''
})

// 表单验证规则
const rules = {
  couponId: [
    { required: true, message: '请选择优惠券', trigger: 'change' }
  ],
  selectedUser: [
    { 
      required: true, 
      message: '请选择用户', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (issueForm.batchType === 'single' && !value) {
          callback(new Error('请选择用户'))
        } else {
          callback()
        }
      }
    }
  ],
  selectedUsers: [
    {
      validator: (rule, value, callback) => {
        if (issueForm.batchType === 'batch' && (!value || value.length === 0)) {
          callback(new Error('请至少选择一个用户'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 加载已领取优惠券的用户
const loadReceivedUsers = async (couponId) => {
  if (!couponId) return
  
  try {
    receivedUserIds.value = [] // 清空列表
    
    // 通过发放记录获取已领取用户列表
    // 设置大的分页值，尽可能获取所有记录
    const tempPageQuery = {
      page: 0,
      size: 1000, // 尝试获取大量记录
      couponId: couponId
    }
    
    const recordsResponse = await getUserCouponList(tempPageQuery)
    if (recordsResponse?.data?.content) {
      // 从发放记录中提取用户ID
      const records = recordsResponse.data.content || []
      receivedUserIds.value = records.map(record => record.userId)
      console.log('已领取优惠券的用户ID列表:', receivedUserIds.value)
    }
  } catch (error) {
    console.error('加载已领取用户列表失败:', error)
    ElMessage.warning('无法获取已领取用户信息，领取状态可能不准确')
  }
}

// 判断用户是否已领取当前优惠券
const hasReceivedCoupon = (userId) => {
  // 确保userId是相同类型再比较
  return receivedUserIds.value.some(id => String(id) === String(userId))
}

// 加载优惠券详情
const loadCouponDetail = async (id) => {
  if (!id) return
  
  try {
    loading.value = true
    
    const response = await getCouponDetail(id)
    
    if (response.data) {
      couponInfo.value = response.data
      issueForm.couponId = id
      
      // 加载已领取此优惠券的用户
      await loadReceivedUsers(id)
    }
  } catch (error) {
    console.error('加载优惠券详情失败:', error)
    ElMessage.error('加载优惠券详情失败')
  } finally {
    loading.value = false
  }
}

// 监听优惠券ID变化
watch(() => couponId.value, async (newId) => {
  if (newId) {
    await loadReceivedUsers(newId)
  }
})

// 加载用户列表
const loadUserList = async () => {
  try {
    userTableLoading.value = true
    
    // 构建查询参数
    const params = {
      ...userSearchForm,
      ...userPageQuery
    }
    
    const response = await getUserList(params)
    
    if (response.data) {
      userList.value = response.data.content || []
      // 打印第一个用户数据查看结构
      if (userList.value.length > 0) {
        console.log('用户数据示例:', userList.value[0])
      }
      userTotal.value = response.data.totalElements || 0
      
      // 如果已加载领取状态，重新计算用户状态标记
      updateUserReceiveStatus()
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    userTableLoading.value = false
  }
}

// 更新用户领取状态标记
const updateUserReceiveStatus = () => {
  if (!userList.value.length || !receivedUserIds.value.length) return
  
  // 将所有用户ID转为字符串，便于比较
  const receivedIdsStr = receivedUserIds.value.map(id => String(id))
  console.log('更新用户领取状态，已领取ID:', receivedIdsStr)
  
  // 为每个用户添加hasReceived标记属性
  userList.value.forEach(user => {
    user.hasReceived = receivedIdsStr.includes(String(user.id))
  })
  
  console.log('用户领取状态更新完成，示例:', userList.value.slice(0, 3))
}

// 用户搜索
const handleUserSearch = () => {
  userPageQuery.page = 0 // 重置页码
  loadUserList()
}

// 重置用户搜索
const resetUserSearch = () => {
  Object.keys(userSearchForm).forEach(key => {
    userSearchForm[key] = key === 'status' ? '1' : ''
  })
  userPageQuery.page = 0
  loadUserList()
}

// 用户分页变化处理
const handleUserPageChange = (newPage) => {
  userPageQuery.page = newPage - 1 // Element Plus分页从1开始，后端从0开始
  loadUserList()
}

// 用户每页条数变化处理
const handleUserSizeChange = (newSize) => {
  userPageQuery.size = newSize
  userPageQuery.page = 0
  loadUserList()
}

// 单个用户选择
const handleUserSelect = (user) => {
  issueForm.selectedUser = user
}

// 加载已发放记录，同时更新已领取用户列表
const loadIssuedRecords = async () => {
  try {
    userLoading.value = true
    
    // 设置要查询的优惠券ID
    pageQuery.couponId = couponId.value
    
    const response = await getUserCouponList(pageQuery)
    
    if (response.data) {
      issuedRecords.value = response.data.content || []
      total.value = response.data.totalElements || 0
      
      // 从发放记录中更新已领取用户列表
      if (issuedRecords.value.length > 0) {
        // 合并当前页的发放记录中的用户ID到已领取用户列表
        const currentPageUserIds = issuedRecords.value.map(record => record.userId)
        receivedUserIds.value = [...new Set([...receivedUserIds.value, ...currentPageUserIds])]
        console.log('更新后的已领取用户列表:', receivedUserIds.value)
      }
    }
  } catch (error) {
    console.error('加载已发放记录失败:', error)
    ElMessage.error('加载已发放记录失败')
  } finally {
    userLoading.value = false
  }
}

// 返回列表页
const goBack = () => {
  router.push('/coupons')
}

// 发放类型切换
const handleBatchTypeChange = (type) => {
  if (type === 'batch') {
    issueForm.selectedUser = null
  } else {
    issueForm.selectedUsers = []
  }
}

// 提交表单 - 单个发放
const submitSingleIssue = async () => {
  if (!issueForm.selectedUser) {
    ElMessage.warning('请选择要发放的用户')
    return
  }
  
  // 检查用户是否已经领取
  if (issueForm.selectedUser.hasReceived) {
    ElMessage.warning('该用户已领取过此优惠券，不能重复发放')
    return
  }
  
  try {
    submitting.value = true
    
    // 打印选中的用户信息以便调试
    console.log('选中的用户信息:', issueForm.selectedUser)
    
    // 构造URLSearchParams对象以便以x-www-form-urlencoded格式提交
    const formData = new URLSearchParams()
    formData.append('couponId', issueForm.couponId)
    formData.append('userId', issueForm.selectedUser.id)
    
    // 打印提交的数据以便调试
    console.log('发放优惠券提交的数据:', formData.toString())
    
    // 发送请求
    const response = await issueCoupon(formData)
    
    ElMessage.success('优惠券发放成功')
    
    // 更新已领取用户列表
    receivedUserIds.value.push(issueForm.selectedUser.id)
    
    // 直接标记用户已领取状态
    issueForm.selectedUser.hasReceived = true
    
    // 重新加载发放记录
    loadIssuedRecords()
    
    // 重置表单
    issueForm.selectedUser = null
    
  } catch (error) {
    console.error('发放优惠券失败:', error)
    ElMessage.error(`发放失败: ${error.message || '未知错误'}`)
    
    // 打印更详细的错误信息便于调试
    if (error.response) {
      console.error('错误响应数据:', error.response.data)
    }
  } finally {
    submitting.value = false
  }
}

// 提交表单 - 批量发放
const submitBatchIssue = async () => {
  // 判断是否有选择用户
  if (!issueForm.selectedUsers.length) {
    ElMessage.warning('请至少选择一个用户')
    return
  }
  
  // 过滤出未领取的用户
  const validUsers = issueForm.selectedUsers.filter(user => !user.hasReceived)
  
  if (validUsers.length === 0) {
    ElMessage.warning('选中的用户均已领取过此优惠券，不能重复发放')
    return
  }
  
  if (validUsers.length < issueForm.selectedUsers.length) {
    const skippedCount = issueForm.selectedUsers.length - validUsers.length
    await ElMessageBox.confirm(
      `已选${issueForm.selectedUsers.length}个用户中有${skippedCount}个已领取过优惠券，将跳过这些用户。确定继续发放给剩余${validUsers.length}个用户吗？`,
      '批量发放确认',
      {
        confirmButtonText: '确定发放',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } else {
    // 全部是有效用户时的确认
    await ElMessageBox.confirm(
      `确定要向 ${validUsers.length} 个用户发放优惠券吗？`,
      '批量发放确认',
      {
        confirmButtonText: '确定发放',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  }
  
  try {
    submitting.value = true
    
    // 获取所有有效用户的ID
    const userIds = validUsers.map(user => user.id)
    console.log('有效的用户IDs:', userIds)
    
    // 创建对象数据
    const data = {
      couponId: issueForm.couponId,
      userIds: userIds
    }
    
    console.log('批量发放提交的数据:', data)
    
    // 发送请求
    const response = await batchIssueCoupon(data)
    
    console.log('批量发放响应数据:', response)
    
    // 显示详细的发放结果
    if (response.data) {
      const result = response.data
      
      // 构建HTML格式的详细信息
      let detailMessage = `<div style="text-align:left;margin-top:10px;">
        <p>共选择 <strong>${result.totalSelected}</strong> 个用户</p>
        <p>成功发放 <strong>${result.successCount}</strong> 张优惠券</p>
      `
      
      // 添加已领取用户信息
      if (result.alreadyReceived && result.alreadyReceived.length > 0) {
        detailMessage += `<p>已领取用户 (${result.alreadyReceived.length} 人):</p>
        <ul style="margin:0;padding-left:20px;">
        `
        result.alreadyReceived.forEach(user => {
          detailMessage += `<li>${user.username} (${user.phone || '无手机号'})</li>`
        })
        detailMessage += `</ul>`
        
        // 将这些用户也标记为已领取
        const alreadyReceivedIds = result.alreadyReceived.map(user => user.userId)
        alreadyReceivedIds.forEach(userId => {
          const user = userList.value.find(u => String(u.id) === String(userId))
          if (user) user.hasReceived = true
        })
        
        // 添加到已领取ID列表
        receivedUserIds.value = [...new Set([...receivedUserIds.value, ...alreadyReceivedIds])]
      }
      
      // 添加失败用户信息
      if (result.failedUsers && result.failedUsers.length > 0) {
        detailMessage += `<p>发放失败用户 (${result.failedUsers.length} 人):</p>
        <ul style="margin:0;padding-left:20px;">
        `
        result.failedUsers.forEach(user => {
          detailMessage += `<li>${user.username} (${user.phone || '无手机号'}) - ${user.failReason || '未知原因'}</li>`
        })
        detailMessage += `</ul>`
      }
      
      detailMessage += `</div>`
      
      // 弹出详细结果
      ElMessageBox.alert(
        detailMessage,
        '批量发放结果',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        }
      )
      
      // 标记成功发放的用户为已领取
      if (result.successCount > 0) {
        // 找出成功发放的用户ID（从总用户中排除已领取和失败的用户）
        const alreadyReceivedIds = result.alreadyReceived ? result.alreadyReceived.map(u => u.userId) : []
        const failedUserIds = result.failedUsers ? result.failedUsers.map(u => u.userId) : []
        
        const successUserIds = userIds.filter(id => 
          !alreadyReceivedIds.some(rid => String(rid) === String(id)) && 
          !failedUserIds.some(fid => String(fid) === String(id))
        )
        
        // 更新已领取用户列表
        receivedUserIds.value = [...new Set([...receivedUserIds.value, ...successUserIds])]
        
        // 更新用户的领取状态
        successUserIds.forEach(userId => {
          const user = userList.value.find(u => String(u.id) === String(userId))
          if (user) user.hasReceived = true
        })
      }
    } else {
      // 简单提示，兼容旧版API
      ElMessage.success(`成功向 ${response.data?.successCount || 0} 个用户发放优惠券`)
    }
    
    // 重新加载发放记录
    loadIssuedRecords()
    
    // 重置表单
    issueForm.selectedUsers = []
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量发放优惠券失败:', error)
      ElMessage.error(`批量发放失败: ${error.message || '未知错误'}`)
      
      // 打印更详细的错误信息便于调试
      if (error.response) {
        console.error('错误响应数据:', error.response.data)
      }
    }
  } finally {
    submitting.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    if (issueForm.batchType === 'single') {
      await submitSingleIssue()
    } else {
      await submitBatchIssue()
    }
  } catch (error) {
    // 表单验证错误，不做处理
  }
}

// 分页变化处理
const handlePageChange = (newPage) => {
  pageQuery.page = newPage - 1 // Element Plus分页从1开始，后端从0开始
  loadIssuedRecords()
}

// 每页条数变化处理
const handleSizeChange = (newSize) => {
  pageQuery.size = newSize
  pageQuery.page = 0
  loadIssuedRecords()
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 获取会员等级文本
const getMemberLevelText = (level) => {
  if (level === 0) return '所有会员'
  return level ? `等级${level}` : '所有会员'
}

// 初始加载
onMounted(async () => {
  if (couponId.value) {
    await loadCouponDetail(couponId.value)
    await loadIssuedRecords() // 先加载发放记录和领取状态
  }
  await loadUserList() // 然后加载用户列表并计算状态
})

// 优惠券加载完成后的操作
watch(() => couponInfo.value.id, async (newId) => {
  if (newId) {
    await loadReceivedUsers(newId)
    updateUserReceiveStatus() // 领取状态变更时更新用户状态
  }
})

// 监听已领取用户列表变化
watch(() => receivedUserIds.value, () => {
  updateUserReceiveStatus() // 领取状态变更时更新用户状态
}, { deep: true })
</script>

<template>
  <div class="coupon-issue-container">
    <!-- 返回按钮 - 与创建优惠券页面样式保持一致 -->
    <div class="back-navigation">
      <el-button 
        type="primary" 
        plain 
        icon="ArrowLeft" 
        @click="goBack" 
        class="back-btn"
      >
        返回优惠券列表
      </el-button>
    </div>
    
    <div class="page-header">
      <div class="page-title">
        <h2>发放优惠券</h2>
        <p>向指定用户发放优惠券或批量发放优惠券</p>
      </div>
    </div>
    
    <!-- 优惠券信息卡片 -->
    <div v-if="couponInfo.id" class="coupon-card">
      <div class="coupon-info">
        <div class="coupon-name">{{ couponInfo.name }}</div>
        <div class="coupon-type">
          <el-tag size="small" :type="couponInfo.type === 1 ? 'success' : 'warning'">
            {{ couponInfo.typeText || (couponInfo.type === 1 ? '满减券' : '折扣券') }}
          </el-tag>
        </div>
        <div class="coupon-value">
          <template v-if="couponInfo.type === 1">
            <span class="value">¥{{ couponInfo.amount?.toFixed(2) }}</span>
          </template>
          <template v-else>
            <span class="value">{{ (couponInfo.amount * 10).toFixed(1) }}折</span>
          </template>
        </div>
        <div class="coupon-limit">
          <template v-if="couponInfo.minConsumption > 0">
            满¥{{ couponInfo.minConsumption?.toFixed(2) }}可用
          </template>
          <template v-else>
            无使用门槛
          </template>
        </div>
        <div class="coupon-details">
          <span class="detail-item">
            <span class="detail-label">使用范围：</span>
            <span class="detail-value">{{ couponInfo.useScopeText || (couponInfo.useScope === 0 ? '全场通用' : '部分商品') }}</span>
          </span>
          <span class="detail-item">
            <span class="detail-label">适用会员：</span>
            <span class="detail-value">{{ couponInfo.memberLevelText || getMemberLevelText(couponInfo.memberLevel) }}</span>
          </span>
          <span class="detail-item" v-if="couponInfo.perLimit !== null">
            <span class="detail-label">每人限领：</span>
            <span class="detail-value">{{ couponInfo.perLimit || '不限' }}</span>
          </span>
        </div>
        <div class="coupon-period">
          {{ formatDate(couponInfo.startTime) }} 至 {{ formatDate(couponInfo.endTime) }}
        </div>
        <div class="coupon-description" v-if="couponInfo.description">
          {{ couponInfo.description }}
        </div>
        <div class="coupon-count">
          <span class="count-item">
            <span class="count-label">总数量：</span>
            <span class="count-value">{{ couponInfo.total || 0 }}</span>
          </span>
          <span class="count-item">
            <span class="count-label">已发放：</span>
            <span class="count-value">{{ couponInfo.issued || 0 }}</span>
          </span>
          <span class="count-item">
            <span class="count-label">已使用：</span>
            <span class="count-value">{{ couponInfo.used || 0 }}</span>
          </span>
          <span class="count-item">
            <span class="count-label">剩余：</span>
            <span class="count-value">{{ couponInfo.remaining || (couponInfo.total - couponInfo.issued) || 0 }}</span>
          </span>
          <span class="count-item status-tag">
            <el-tag 
              :type="couponInfo.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ couponInfo.statusText || (couponInfo.status === 1 ? '已启用' : '已禁用') }}
            </el-tag>
            <el-tag 
              v-if="couponInfo.expired"
              type="info"
              size="small"
              style="margin-left: 4px;"
            >
              已过期
            </el-tag>
          </span>
        </div>
      </div>
    </div>
    
    <!-- 表单区域 -->
    <div class="form-card">
      <el-form
        ref="formRef"
        :model="issueForm"
        :rules="rules"
        label-width="120px"
        label-position="right"
        status-icon
      >
        <el-form-item label="选择优惠券" prop="couponId" v-if="!couponId">
          <el-input 
            v-model="issueForm.couponId" 
            placeholder="请输入优惠券ID" 
            style="width: 300px;"
          />
          <el-button 
            type="primary" 
            @click="loadCouponDetail(issueForm.couponId)"
            :disabled="!issueForm.couponId"
            style="margin-left: 10px;"
          >
            查询
          </el-button>
        </el-form-item>
        
        <el-form-item label="发放方式" prop="batchType">
          <el-radio-group v-model="issueForm.batchType" @change="handleBatchTypeChange">
            <el-radio label="single">单个发放</el-radio>
            <el-radio label="batch">批量发放</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <!-- 用户搜索区域 -->
      <div class="user-search-card">
        <div class="search-title">用户列表</div>
        <el-form :model="userSearchForm" inline>
          <el-form-item label="用户名">
            <el-input v-model="userSearchForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="userSearchForm.mobile" placeholder="请输入手机号" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="userSearchForm.status" placeholder="选择状态" clearable style="width: 120px">
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <div class="button-group">
              <el-button type="primary" @click="handleUserSearch" :icon="Search" class="search-button">
                查询
              </el-button>
              <el-button @click="resetUserSearch" :icon="Refresh" class="reset-button">
                重置
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 用户列表 -->
      <div class="user-table-card">
        <el-table
          :data="userList"
          stripe
          border
          style="width: 100%"
          v-loading="userTableLoading"
          @selection-change="val => issueForm.selectedUsers = val"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column 
            type="selection" 
            width="55" 
            :selectable="row => issueForm.batchType === 'batch' && !row.hasReceived"
          />
          <el-table-column label="用户ID" prop="id" width="100" align="center" />
          <el-table-column label="用户名" prop="username" min-width="120" align="center" />
          <el-table-column label="手机号" width="120" align="center">
            <template #default="scope">
              {{ scope.row.mobile || scope.row.phone || scope.row.phoneNumber || '未设置' }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优惠券状态" width="120" align="center">
            <template #default="scope">
              <el-tag 
                v-if="scope.row.hasReceived"
                type="info"
                size="small"
              >
                已领取
              </el-tag>
              <span v-else>未领取</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" v-if="issueForm.batchType === 'single'">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleUserSelect(scope.row)"
                :disabled="scope.row.hasReceived"
                :class="{ 'user-selected': issueForm.selectedUser && issueForm.selectedUser.id === scope.row.id }"
              >
                <template v-if="scope.row.hasReceived">
                  已领取
                </template>
                <template v-else>
                  {{ issueForm.selectedUser && issueForm.selectedUser.id === scope.row.id ? '已选择' : '选择' }}
                </template>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 用户分页 -->
        <div class="pagination-container">
          <el-pagination
            :current-page="userPageQuery.page + 1"
            :page-size="userPageQuery.size"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="userTotal"
            @size-change="handleUserSizeChange"
            @current-change="handleUserPageChange"
            background
          />
        </div>
      </div>
      
      <!-- 发放按钮 -->
      <div class="issue-action">
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitting"
          :disabled="!couponInfo.id || (issueForm.batchType === 'single' && !issueForm.selectedUser) || (issueForm.batchType === 'batch' && !issueForm.selectedUsers.length)"
          size="large"
          class="submit-button"
        >
          {{ issueForm.batchType === 'single' ? '发放优惠券' : '批量发放' }}
        </el-button>
        <el-button @click="goBack" size="large" class="cancel-button">取消</el-button>
      </div>
    </div>
    
    <!-- 发放记录 -->
    <div class="records-card">
      <div class="card-title">
        <h3>发放记录</h3>
      </div>
      
      <el-table
        :data="issuedRecords"
        stripe
        border
        style="width: 100%"
        v-loading="userLoading"
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column label="用户ID" prop="userId" width="80" align="center" />
        <el-table-column label="用户名" prop="username" min-width="100" align="center" />
        <el-table-column label="手机号" prop="mobile" width="120" align="center" />
        <el-table-column label="优惠券" prop="couponName" min-width="150" align="center" />
        <el-table-column label="优惠券类型" width="100" align="center">
          <template #default="scope">
            <el-tag size="small" :type="scope.row.couponType === 1 ? 'success' : 'warning'">
              {{ scope.row.couponType === 1 ? '满减券' : '折扣券' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="券值" width="100" align="center">
          <template #default="scope">
            <template v-if="scope.row.couponType === 1">
              ¥{{ scope.row.amount?.toFixed(2) }}
            </template>
            <template v-else>
              {{ (scope.row.amount * 10).toFixed(1) }}折
            </template>
          </template>
        </el-table-column>
        <el-table-column label="发放时间" width="160" align="center">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="使用状态" width="100" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === 1 ? 'success' : scope.row.status === 0 ? 'info' : 'danger'"
              size="small"
            >
              {{ scope.row.status === 1 ? '已使用' : scope.row.status === 0 ? '未使用' : '已过期' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用时间" width="160" align="center">
          <template #default="scope">
            {{ scope.row.useTime ? formatDate(scope.row.useTime) : '--' }}
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
  </div>
</template>

<style scoped>
.coupon-issue-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

/* 返回导航 */
.back-navigation {
  margin-bottom: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 8px 15px;
}

.back-btn .el-icon {
  margin-right: 6px;
  font-size: 12px;
}

/* 页面头部 */
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

/* 优惠券卡片 */
.coupon-card {
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  position: relative;
}

.coupon-info {
  padding: 32px;
  position: relative;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.coupon-name {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.coupon-type {
  position: absolute;
  top: 20px;
  right: 20px;
}

.coupon-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.coupon-value .value {
  margin-right: 8px;
}

.coupon-limit {
  font-size: 14px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.coupon-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 15px;
}

.detail-label {
  opacity: 0.9;
  margin-right: 4px;
}

.detail-value {
  font-weight: 600;
}

.coupon-period {
  font-size: 14px;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.coupon-description {
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-style: italic;
}

.coupon-count {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
}

.count-item {
  display: flex;
  align-items: center;
}

.count-label {
  opacity: 0.8;
}

.count-value {
  font-weight: 600;
  font-size: 16px;
}

.status-tag {
  margin-left: auto;
}

/* 表单卡片 */
.form-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

/* 用户搜索卡片 */
.user-search-card {
  margin-top: 20px;
  margin-bottom: 20px;
  border-top: 1px dashed #e0e0e0;
  padding-top: 20px;
}

.search-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.button-group {
  display: flex;
  gap: 10px;
}

.search-button {
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border: none;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transition: all 0.3s;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(25, 118, 210, 0.4);
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

.user-table-card {
  margin-bottom: 24px;
}

/* 用户选择样式 */
.user-selected {
  color: #67c23a !important;
  font-weight: bold;
}

/* 发放按钮区域 */
.issue-action {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed #e0e0e0;
}

/* 记录卡片 */
.records-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.card-title {
  margin-bottom: 20px;
}

.card-title h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #303133;
  position: relative;
  padding-left: 12px;
}

.card-title h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border-radius: 1.5px;
}

/* 按钮样式 */
.submit-button {
  width: 160px;
  height: 48px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border: none;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.submit-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.3s;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(25, 118, 210, 0.4);
}

.submit-button:hover::after {
  left: 100%;
}

.cancel-button {
  width: 120px;
  height: 48px;
  border: 1px solid #dcdfe6;
  background: white;
  transition: all 0.3s;
}

.cancel-button:hover {
  color: #f56c6c;
  border-color: #f56c6c;
  background: rgba(245, 108, 108, 0.05);
}

/* 分页容器 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .form-card,
  .records-card {
    padding: 24px 16px;
  }
  
  .coupon-info {
    padding: 24px 16px;
  }
  
  .coupon-value {
    font-size: 28px;
  }
  
  .coupon-type {
    position: relative;
    top: 0;
    right: 0;
    margin-bottom: 12px;
  }
  
  .submit-button,
  .cancel-button {
    width: 100%;
    margin-bottom: 12px;
    margin-left: 0 !important;
  }
}
</style> 