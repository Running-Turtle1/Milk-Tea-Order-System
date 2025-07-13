<template>
  <div class="specification-container">
    <div class="page-header">
      <div class="title-box">
        <h2 class="page-title">规格管理</h2>
        <p class="page-desc">管理奶茶规格信息</p>
      </div>
      <div class="action-box">
        <el-button 
          type="primary" 
          @click="handleAdd" 
          class="add-button"
        >
          <el-icon><Plus /></el-icon>新增规格
        </el-button>
      </div>
    </div>

    <!-- 分类标签页 -->
    <el-tabs v-model="activeTab" class="spec-tabs" @tab-click="handleTabChange">
      <el-tab-pane label="全部规格" name="all"></el-tab-pane>
      <el-tab-pane label="温度" name="temperature"></el-tab-pane>
      <el-tab-pane label="甜度" name="sweetness"></el-tab-pane>
    </el-tabs>

    <el-card class="table-card" v-loading="loading">
      <!-- 表格区域 -->
      <el-table
        :data="filteredSpecList"
        border
        style="width: 100%"
        row-key="id"
        v-loading="tableLoading"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="规格名称" min-width="120" align="center" />
        <el-table-column prop="type" label="规格分类" width="120" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="getTypeTagColor(row.type)"
              effect="plain"
            >
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序值" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
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
      :title="isEdit ? '编辑规格' : '新增规格'"
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
        <el-form-item label="规格名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入规格名称，如：无糖、常温等" 
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="规格分类" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="temperature">温度</el-radio>
            <el-radio label="sweetness">甜度</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="排序值" prop="sort">
          <el-input-number
            v-model="form.sort"
            :min="0"
            :max="999"
            :step="1"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            数字越小排序越靠前
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
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getSpecificationList, createSpecification, updateSpecification, updateSpecificationStatus, deleteSpecification } from '../../api/specification'

// 加载状态
const loading = ref(false)
const tableLoading = ref(false)
const submitting = ref(false)

// 当前选中的Tab
const activeTab = ref('all')

// 规格列表数据
const specificationList = ref([])

// 按当前Tab过滤的规格列表
const filteredSpecList = computed(() => {
  if (activeTab.value === 'all') {
    return specificationList.value
  } else {
    return specificationList.value.filter(item => item.type === activeTab.value)
  }
})

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  type: 'temperature', // 默认温度类型
  sort: 0,
  status: 1
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入规格名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择规格分类', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序值不能小于0', trigger: 'blur' }
  ]
}

// 获取规格分类的显示名称
const getTypeLabel = (type) => {
  const typeMap = {
    'temperature': '温度',
    'sweetness': '甜度'
  }
  return typeMap[type] || type
}

// 获取规格分类的标签颜色
const getTypeTagColor = (type) => {
  const colorMap = {
    'temperature': 'danger',
    'sweetness': 'success'
  }
  return colorMap[type] || ''
}

// 处理标签页切换
const handleTabChange = () => {
  // 切换标签页时，可以进行一些额外操作
  console.log('当前标签页:', activeTab.value)
}

// 获取规格列表
const fetchSpecificationList = async () => {
  try {
    tableLoading.value = true
    const response = await getSpecificationList()
    
    // 处理不同格式的响应
    if (Array.isArray(response.data)) {
      // 直接返回数组的情况
      specificationList.value = response.data
    } else if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
      // 返回 {code, message, data} 格式的情况
      specificationList.value = response.data.data
    } else {
      // 其他意外情况
      console.warn('规格列表数据格式异常:', response.data)
      specificationList.value = []
    }
  } catch (error) {
    console.error('获取规格列表失败:', error)
    ElMessage.error('获取规格列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 处理添加规格
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 处理编辑规格
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

// 处理删除规格
const handleDelete = async (row) => {
  try {
    const id = row.id
    if (!id) {
      ElMessage.error('无法删除: 无效的规格ID')
      return
    }
    
    // 确认操作
    await ElMessageBox.confirm(
      `确定要删除 "${row.name}" 规格吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    await deleteSpecification(id)
    
    // 从列表中移除
    specificationList.value = specificationList.value.filter(item => item.id !== id)
    
    ElMessage.success('规格删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除规格失败:', error)
      ElMessage.error('删除规格失败')
    }
  }
}

// 处理状态变更
const handleStatusChange = async (row) => {
  try {
    await updateSpecificationStatus(row.id, row.status)
    ElMessage.success(`${row.status === 1 ? '启用' : '禁用'}规格成功`)
  } catch (error) {
    console.error('修改状态失败:', error)
    ElMessage.error('修改状态失败')
    // 恢复状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 重置表单
const resetForm = () => {
  form.id = null
  form.name = ''
  form.type = 'temperature'
  form.sort = 0
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
      await updateSpecification(form.id, submitData)
      ElMessage.success('规格更新成功')
    } else {
      // 创建模式 - 设置创建和更新时间
      submitData.createdAt = isoDateTimeStr
      submitData.updatedAt = isoDateTimeStr
      await createSpecification(submitData)
      ElMessage.success('规格创建成功')
    }
    
    // 关闭对话框
    dialogVisible.value = false
    
    // 重新获取列表
    fetchSpecificationList()
  } catch (error) {
    console.error(isEdit.value ? '更新规格失败:' : '创建规格失败:', error)
    ElMessage.error(isEdit.value ? '更新规格失败' : '创建规格失败')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  fetchSpecificationList()
})
</script>

<style scoped>
.specification-container {
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

.spec-tabs {
  margin-bottom: 16px;
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style> 