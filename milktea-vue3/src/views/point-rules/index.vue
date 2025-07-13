<template>
  <div class="point-rule-container">
    <div class="page-header">
      <div class="title-box">
        <h2 class="page-title">积分规则管理</h2>
        <p class="page-desc">管理系统积分获取规则</p>
      </div>
      <div class="action-box">
        <el-button 
          type="primary" 
          @click="handleAdd" 
          class="add-button"
        >
          <el-icon><Plus /></el-icon>新增积分规则
        </el-button>
      </div>
    </div>

    <el-card class="table-card" v-loading="loading">
      <!-- 表格区域 -->
      <el-table
        :data="ruleList"
        border
        style="width: 100%"
        row-key="id"
        v-loading="tableLoading"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="规则名称" min-width="150" align="center" />
        <el-table-column prop="type" label="规则类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ row.typeText || getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="规则说明" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column label="积分值" width="120" align="center">
          <template #default="{ row }">
            <span class="point-value">{{ formatPointValue(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="plain">
              {{ row.statusText || (row.status === 1 ? '启用' : '禁用') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160" align="center" />
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
      :title="isEdit ? '编辑积分规则' : '新增积分规则'"
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
        <el-form-item label="规则名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入规则名称" 
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="规则类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择规则类型" style="width: 100%">
            <el-option label="消费获取" :value="1" />
            <el-option label="每日签到" :value="2" />
            <el-option label="首次注册" :value="3" />
          </el-select>
          <div class="form-tip">
            不同类型的规则应用于不同的业务场景
          </div>
        </el-form-item>
        
        <el-form-item label="比例计算" prop="isRatio" v-if="form.type === 1">
          <el-switch
            v-model="form.isRatio"
            :active-value="true"
            :inactive-value="false"
            active-text="是"
            inactive-text="否"
          />
          <div class="form-tip">
            是否按比例计算积分，如1元=1积分
          </div>
        </el-form-item>
        
        <el-form-item label="积分值" prop="pointValue">
          <el-input-number
            v-model="form.pointValue"
            :min="0"
            :max="9999"
            :step="form.type === 1 ? 0.1 : 1"
            :precision="form.type === 1 ? 2 : 0"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            {{ getPointTip() }}
          </div>
        </el-form-item>
        
        <el-form-item label="最低消费" prop="minAmount" v-if="form.type === 1">
          <el-input-number
            v-model="form.minAmount"
            :min="0"
            :max="1000"
            :step="1"
            :precision="2"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            消费满多少元才能获得积分，0表示无限制
          </div>
        </el-form-item>
        
        <el-form-item label="积分上限" prop="maxPoints">
          <el-input-number
            v-model="form.maxPoints"
            :min="0"
            :max="99999"
            :step="10"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            单次最多可获得的积分上限，0表示无限制
          </div>
        </el-form-item>
        
        <el-form-item label="计算公式" prop="formula" v-if="form.type === 1">
          <el-input 
            v-model="form.formula" 
            placeholder="请输入计算公式" 
            maxlength="100"
            show-word-limit
          />
          <div class="form-tip">
            积分计算公式的简要说明
          </div>
        </el-form-item>
        
        <el-form-item label="规则说明" prop="description">
          <el-input 
            v-model="form.description" 
            placeholder="请输入规则说明" 
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
          <div class="form-tip">
            向用户展示的规则说明文本
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
import { 
  getPointRuleList, 
  createPointRule, 
  updatePointRule, 
  updatePointRuleStatus, 
  deletePointRule 
} from '../../api/point-rule'

// 加载状态
const loading = ref(false)
const tableLoading = ref(false)
const submitting = ref(false)

// 积分规则列表数据
const ruleList = ref([])

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  type: 1,
  typeText: '',
  isRatio: true,
  formula: '消费金额 × 积分比例',
  pointValue: 1.00,
  minAmount: 0,
  maxPoints: 0,
  description: '',
  status: 1
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ],
  pointValue: [
    { required: true, message: '请输入积分值', trigger: 'blur' },
    { type: 'number', min: 0, message: '积分值不能小于0', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入规则说明', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ]
}

// 根据类型获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    1: '消费获取',
    2: '每日签到',
    3: '首次注册'
  }
  return typeMap[type] || '未知类型'
}

// 根据类型获取标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    1: 'primary',
    2: 'success',
    3: 'warning'
  }
  return typeMap[type] || 'info'
}

// 格式化积分值
const formatPointValue = (row) => {
  if (row.type === 1 && row.isRatio) {
    return row.pointValue !== undefined && row.pointValue !== null 
      ? `${Number(row.pointValue).toFixed(2)}积分/元` 
      : '-'
  }
  return row.pointValue !== undefined && row.pointValue !== null 
    ? `${row.pointValue}积分` 
    : '-'
}

// 获取积分提示
const getPointTip = () => {
  switch (form.type) {
    case 1:
      return form.isRatio 
        ? '每消费1元获得的积分值' 
        : '消费后一次性获得的积分值'
    case 2:
      return '每日签到可获得的积分值'
    case 3:
      return '首次注册可获得的积分值'
    default:
      return '用户可获得的积分值'
  }
}

// 获取积分规则列表
const fetchRuleList = async () => {
  try {
    tableLoading.value = true
    const response = await getPointRuleList()
    
    // 处理不同格式的响应
    if (Array.isArray(response.data)) {
      // 直接返回数组的情况
      ruleList.value = response.data
    } else if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
      // 返回 {code, message, data} 格式的情况
      ruleList.value = response.data.data
    } else {
      // 其他意外情况
      console.warn('积分规则列表数据格式异常:', response.data)
      ruleList.value = []
    }
    
    // 按规则类型排序
    ruleList.value.sort((a, b) => a.type - b.type)
  } catch (error) {
    console.error('获取积分规则列表失败:', error)
    ElMessage.error('获取积分规则列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 处理添加积分规则
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 处理编辑积分规则
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

// 处理切换积分规则状态
const handleToggleStatus = async (row) => {
  try {
    const id = row.id
    if (!id) {
      ElMessage.error('无效的积分规则ID')
      return
    }
    
    const newStatus = row.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'
    
    // 确认操作
    await ElMessageBox.confirm(
      `确定要${statusText} "${row.name}" 积分规则吗？`,
      `${statusText}确认`,
      {
        confirmButtonText: `确定${statusText}`,
        cancelButtonText: '取消',
        type: newStatus === 1 ? 'success' : 'warning'
      }
    )
    
    await updatePointRuleStatus(id, newStatus)
    
    // 更新本地数据
    const index = ruleList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      ruleList.value[index].status = newStatus
      // 更新statusText
      ruleList.value[index].statusText = newStatus === 1 ? '启用' : '禁用'
    }
    
    ElMessage.success(`积分规则${statusText}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换积分规则状态失败:', error)
      ElMessage.error('切换积分规则状态失败')
    }
  }
}

// 处理删除积分规则
const handleDelete = async (row) => {
  try {
    const id = row.id
    if (!id) {
      ElMessage.error('无法删除: 无效的积分规则ID')
      return
    }
    
    // 确认操作
    await ElMessageBox.confirm(
      `确定要删除 "${row.name}" 积分规则吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    await deletePointRule(id)
    
    // 从列表中移除
    ruleList.value = ruleList.value.filter(item => item.id !== id)
    
    ElMessage.success('积分规则删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除积分规则失败:', error)
      ElMessage.error('删除积分规则失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  form.id = null
  form.name = ''
  form.type = 1
  form.typeText = ''
  form.isRatio = true
  form.formula = '消费金额 × 积分比例'
  form.pointValue = 1.00
  form.minAmount = 0
  form.maxPoints = 0
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
    
    // 准备提交数据
    const submitData = { ...form }
    
    // 设置typeText
    submitData.typeText = getTypeText(submitData.type)
    
    // 设置statusText
    submitData.statusText = submitData.status === 1 ? '启用' : '禁用'
    
    if (isEdit.value) {
      // 编辑模式
      await updatePointRule(form.id, submitData)
      ElMessage.success('积分规则更新成功')
    } else {
      // 创建模式
      await createPointRule(submitData)
      ElMessage.success('积分规则创建成功')
    }
    
    // 关闭对话框
    dialogVisible.value = false
    
    // 重新获取列表
    fetchRuleList()
  } catch (error) {
    console.error(isEdit.value ? '更新积分规则失败:' : '创建积分规则失败:', error)
    ElMessage.error(isEdit.value ? '更新积分规则失败' : '创建积分规则失败')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  fetchRuleList()
})
</script>

<style scoped>
.point-rule-container {
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

.point-value {
  font-weight: bold;
  color: #67c23a;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style> 