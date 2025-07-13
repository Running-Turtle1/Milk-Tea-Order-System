<template>
  <div class="member-level-container">
    <div class="page-header">
      <div class="title-box">
        <h2 class="page-title">会员等级管理</h2>
        <p class="page-desc">管理会员等级信息与折扣规则</p>
      </div>
      <div class="action-box">
        <el-button 
          type="primary" 
          @click="handleAdd" 
          class="add-button"
        >
          <el-icon><Plus /></el-icon>新增会员等级
        </el-button>
      </div>
    </div>

    <el-card class="table-card" v-loading="loading">
      <!-- 表格区域 -->
      <el-table
        :data="memberLevelList"
        border
        style="width: 100%"
        row-key="id"
        v-loading="tableLoading"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="等级图标" width="100" align="center">
          <template #default="{ row }">
            <el-avatar 
              v-if="row.icon" 
              :src="row.icon" 
              :size="40"
              fit="contain"
            >
              {{ row.name.charAt(0) }}
            </el-avatar>
            <el-avatar v-else :size="40" :style="{ backgroundColor: getLevelColor(row.level) }">
              {{ row.name.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="等级名称" min-width="120" align="center" />
        <el-table-column prop="level" label="等级值" width="80" align="center" />
        <el-table-column prop="pointThreshold" label="积分要求" width="100" align="center" />
        <el-table-column prop="amountThreshold" label="消费要求" width="100" align="center">
          <template #default="{ row }">
            {{ row.amountThreshold ? `¥${row.amountThreshold}` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="折扣" width="100" align="center">
          <template #default="{ row }">
            <span class="discount-tag">{{ (row.discount * 10).toFixed(1) }}折</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="plain">
              {{ row.statusText || (row.status === 1 ? '启用' : '禁用') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              size="small"
              @click.stop="handleToggleStatus(row)"
            >
              <el-icon><component :is="row.status === 1 ? 'Hide' : 'View'" /></el-icon>
              <span>{{ row.status === 1 ? '禁用' : '启用' }}</span>
            </el-button>
            
            <el-button
              type="danger"
              link
              size="small"
              @click.stop="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑会员等级' : '新增会员等级'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="等级名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入会员等级名称，如：银卡会员" 
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="等级值" prop="level">
          <el-input-number
            v-model="form.level"
            :min="0"
            :max="999"
            :step="1"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            等级值越大等级越高，0表示普通会员
          </div>
        </el-form-item>
        
        <el-form-item label="积分要求" prop="pointThreshold">
          <el-input-number
            v-model="form.pointThreshold"
            :min="0"
            :max="999999"
            :step="100"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            达到该等级所需的最少积分
          </div>
        </el-form-item>
        
        <el-form-item label="消费要求" prop="amountThreshold">
          <el-input-number
            v-model="form.amountThreshold"
            :min="0"
            :max="999999"
            :step="100"
            :precision="2"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            达到该等级所需的最低消费金额
          </div>
        </el-form-item>
        
        <el-form-item label="积分比例" prop="pointRate">
          <el-input-number
            v-model="form.pointRate"
            :min="1"
            :max="10"
            :step="0.1"
            :precision="2"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            积分获取倍率，如1.2表示消费获得的积分×1.2
          </div>
        </el-form-item>
        
        <el-form-item label="折扣率" prop="discount">
          <el-slider
            v-model="form.discount"
            :min="0.1"
            :max="1"
            :step="0.01"
            :format-tooltip="formatDiscount"
            show-input
            :show-input-controls="false"
            input-size="small"
            style="width: 100%;"
          />
          <div class="form-tip">
            会员享受的折扣比例，1表示无折扣，0.9表示9折
          </div>
        </el-form-item>
        
        <el-form-item label="会员特权">
          <div class="privileges-options">
            <el-checkbox v-model="form.freeShipping" label="免运费">免运费</el-checkbox>
            <el-checkbox v-model="form.birthdayPrivilege" label="生日特权">生日特权</el-checkbox>
            <el-checkbox v-model="form.priorityProduction" label="优先制作">优先制作</el-checkbox>
          </div>
        </el-form-item>
        
        <el-form-item label="等级图标" prop="icon">
          <el-input 
            v-model="form.icon" 
            placeholder="请输入图标URL地址" 
          />
          <div class="form-tip">
            可选，会员等级的图标URL
          </div>
        </el-form-item>
        
        <el-form-item label="等级描述" prop="description">
          <el-input 
            v-model="form.description" 
            placeholder="请输入等级描述" 
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
          <div class="form-tip">
            可选，会员等级的详细说明
          </div>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Hide, View } from '@element-plus/icons-vue'
import { getMemberLevelList, createMemberLevel, updateMemberLevel, deleteMemberLevel } from '../../api/member-level'

// 加载状态
const loading = ref(false)
const tableLoading = ref(false)
const submitting = ref(false)

// 会员等级列表数据
const memberLevelList = ref([])

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  level: 0,
  pointThreshold: 0,
  amountThreshold: 0,
  pointRate: 1.0,
  discount: 1,
  freeShipping: false,
  birthdayPrivilege: false,
  priorityProduction: false,
  icon: '',
  description: '',
  status: 1
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入等级名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请输入等级值', trigger: 'blur' },
    { type: 'number', min: 0, message: '等级值不能小于0', trigger: 'blur' }
  ],
  pointThreshold: [
    { required: true, message: '请输入积分要求', trigger: 'blur' },
    { type: 'number', min: 0, message: '积分要求不能小于0', trigger: 'blur' }
  ],
  discount: [
    { required: true, message: '请设置折扣率', trigger: 'blur' },
    { type: 'number', min: 0.1, max: 1, message: '折扣率范围为0.1-1', trigger: 'blur' }
  ],
  pointRate: [
    { required: true, message: '请设置积分比例', trigger: 'blur' },
    { type: 'number', min: 1, message: '积分比例不能小于1', trigger: 'blur' }
  ]
}

// 根据等级值获取颜色
const getLevelColor = (level) => {
  const colors = [
    '#909399', // 默认灰色
    '#409EFF', // 蓝色
    '#67C23A', // 绿色
    '#E6A23C', // 黄色
    '#F56C6C', // 红色
    '#9B59B6'  // 紫色
  ]
  return colors[level % colors.length]
}

// 格式化折扣显示
const formatDiscount = (val) => {
  return (val * 10).toFixed(1) + '折'
}

// 获取会员等级列表
const fetchMemberLevelList = async () => {
  try {
    tableLoading.value = true
    const response = await getMemberLevelList()
    
    // 处理不同格式的响应
    if (Array.isArray(response.data)) {
      // 直接返回数组的情况
      memberLevelList.value = response.data
    } else if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
      // 返回 {code, message, data} 格式的情况
      memberLevelList.value = response.data.data
    } else {
      // 其他意外情况
      console.warn('会员等级列表数据格式异常:', response.data)
      memberLevelList.value = []
    }
    
    // 按等级值排序
    memberLevelList.value.sort((a, b) => a.level - b.level)
  } catch (error) {
    console.error('获取会员等级列表失败:', error)
    ElMessage.error('获取会员等级列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 处理添加会员等级
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 处理编辑会员等级
const handleEdit = (row) => {
  isEdit.value = true
  resetForm()
  
  // 填充表单数据
  Object.keys(form).forEach(key => {
    if (key in row) {
      form[key] = row[key]
    }
  })
  
  dialogVisible.value = true
}

// 处理删除会员等级
const handleDelete = async (row) => {
  try {
    const id = row.id
    if (!id) {
      ElMessage.error('无法删除: 无效的会员等级ID')
      return
    }
    
    // 确认操作
    await ElMessageBox.confirm(
      `确定要删除 "${row.name}" 会员等级吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    await deleteMemberLevel(id)
    
    // 从列表中移除
    memberLevelList.value = memberLevelList.value.filter(item => item.id !== id)
    
    ElMessage.success('会员等级删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除会员等级失败:', error)
      ElMessage.error('删除会员等级失败')
    }
  }
}

// 处理切换会员等级状态
const handleToggleStatus = async (row) => {
  try {
    const id = row.id
    if (!id) {
      ElMessage.error('无效的会员等级ID')
      return
    }
    
    const newStatus = row.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'
    
    // 确认操作
    await ElMessageBox.confirm(
      `确定要${statusText} "${row.name}" 会员等级吗？`,
      `${statusText}确认`,
      {
        confirmButtonText: `确定${statusText}`,
        cancelButtonText: '取消',
        type: newStatus === 1 ? 'success' : 'warning'
      }
    )
    
    // 准备当前时间 - 使用ISO标准格式，带T作为日期时间分隔符
    const now = new Date()
    const isoDateTimeStr = now.toISOString().slice(0, 19)
    
    // 更新状态
    const updateData = {
      ...row,
      status: newStatus,
      updatedAt: isoDateTimeStr
    }
    
    await updateMemberLevel(id, updateData)
    
    // 更新本地数据
    const index = memberLevelList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      memberLevelList.value[index].status = newStatus
      memberLevelList.value[index].updatedAt = isoDateTimeStr
    }
    
    ElMessage.success(`会员等级${statusText}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换会员等级状态失败:', error)
      ElMessage.error('切换会员等级状态失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  form.id = null
  form.name = ''
  form.level = 0
  form.pointThreshold = 0
  form.amountThreshold = 0
  form.pointRate = 1.0
  form.discount = 1
  form.freeShipping = false
  form.birthdayPrivilege = false
  form.priorityProduction = false
  form.icon = ''
  form.description = ''
  form.status = 1
  
  // 重置表单验证状态
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    submitting.value = true
    
    // 准备当前时间 - 使用ISO标准格式，带T作为日期时间分隔符
    const now = new Date()
    const isoDateTimeStr = now.toISOString().slice(0, 19) // 输出格式: "2023-04-15T08:30:00"
    
    // 准备提交数据
    const submitData = { ...form }
    
    if (isEdit.value) {
      // 编辑模式 - 只设置更新时间
      submitData.updatedAt = isoDateTimeStr
      await updateMemberLevel(form.id, submitData)
      ElMessage.success('会员等级更新成功')
    } else {
      // 创建模式 - 设置创建和更新时间
      submitData.createdAt = isoDateTimeStr
      submitData.updatedAt = isoDateTimeStr
      await createMemberLevel(submitData)
      ElMessage.success('会员等级创建成功')
    }
    
    // 关闭对话框
    dialogVisible.value = false
    
    // 重新获取列表
    fetchMemberLevelList()
  } catch (error) {
    console.error(isEdit.value ? '更新会员等级失败:' : '创建会员等级失败:', error)
    ElMessage.error(isEdit.value ? '更新会员等级失败' : '创建会员等级失败')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  fetchMemberLevelList()
})
</script>

<style scoped>
.member-level-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title-box {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #303133;
  position: relative;
  padding-left: 12px;
}

.page-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border-radius: 2px;
}

.page-desc {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.add-button {
  padding: 12px 16px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-tip {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

.discount-tag {
  background-color: #f56c6c;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 12px;
}

.privileges-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}

.privileges-options {
  display: flex;
  gap: 16px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .privileges-options {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 