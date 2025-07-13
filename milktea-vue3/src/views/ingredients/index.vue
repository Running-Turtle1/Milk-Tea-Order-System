<template>
  <div class="ingredient-container">
    <div class="page-header">
      <div class="title-box">
        <h2 class="page-title">配料管理</h2>
        <p class="page-desc">管理奶茶配料信息</p>
      </div>
      <div class="action-box">
        <el-button 
          type="primary" 
          @click="handleAdd" 
          class="add-button"
        >
          <el-icon><Plus /></el-icon>新增配料
        </el-button>
      </div>
    </div>

    <el-card class="table-card" v-loading="loading">
      <!-- 表格区域 -->
      <el-table
        :data="ingredientList"
        border
        style="width: 100%"
        row-key="id"
        v-loading="tableLoading"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="配料名称" min-width="120" align="center" />
        <el-table-column prop="type" label="配料类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120" align="center">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
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
      :title="isEdit ? '编辑配料' : '新增配料'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="配料名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入配料名称" 
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="配料类型" prop="type">
          <el-input
            v-model="form.type"
            placeholder="请输入配料类型，如：珍珠/芋圆、水果、奶制品等"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="配料价格" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :max="100"
            :precision="2"
            :step="0.5"
            controls-position="right"
            style="width: 100%;"
          />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getIngredientList, createIngredient, updateIngredient, updateIngredientStatus, deleteIngredient } from '../../api/ingredient'

// 加载状态
const loading = ref(false)
const tableLoading = ref(false)
const submitting = ref(false)

// 配料列表数据
const ingredientList = ref([])

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  price: 0,
  sort: 0,
  status: 1,
  stock: 999,
  type: ''
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入配料名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择配料类型', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入配料价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序值不能小于0', trigger: 'blur' }
  ]
}

// 获取配料列表
const fetchIngredientList = async () => {
  try {
    tableLoading.value = true
    const { data } = await getIngredientList()
    ingredientList.value = data || []
  } catch (error) {
    console.error('获取配料列表失败:', error)
    ElMessage.error('获取配料列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 处理添加配料
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 处理编辑配料
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

// 处理删除配料
const handleDelete = async (row) => {
  try {
    const id = row.id
    if (!id) {
      ElMessage.error('无法删除: 无效的配料ID')
      return
    }
    
    // 确认操作
    await ElMessageBox.confirm(
      `确定要删除 "${row.name}" 配料吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    await deleteIngredient(id)
    
    // 从列表中移除
    ingredientList.value = ingredientList.value.filter(item => item.id !== id)
    
    ElMessage.success('配料删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除配料失败:', error)
      ElMessage.error('删除配料失败')
    }
  }
}

// 处理状态变更
const handleStatusChange = async (row) => {
  try {
    await updateIngredientStatus(row.id, row.status)
    ElMessage.success(`${row.status === 1 ? '启用' : '禁用'}配料成功`)
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
  form.price = 0
  form.sort = 0
  form.status = 1
  form.stock = 999
  form.type = ''
  
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
      await updateIngredient(form.id, submitData)
      ElMessage.success('配料更新成功')
    } else {
      // 创建模式 - 设置创建和更新时间
      submitData.createdAt = isoDateTimeStr
      submitData.updatedAt = isoDateTimeStr
      await createIngredient(submitData)
      ElMessage.success('配料创建成功')
    }
    
    // 关闭对话框
    dialogVisible.value = false
    
    // 重新获取列表
    fetchIngredientList()
  } catch (error) {
    console.error(isEdit.value ? '更新配料失败:' : '创建配料失败:', error)
    ElMessage.error(isEdit.value ? '更新配料失败' : '创建配料失败')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  fetchIngredientList()
})
</script>

<style scoped>
.ingredient-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style> 