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
            <el-avatar v-else :size="40">
              {{ row.name.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="等级名称" min-width="120" align="center" />
        <el-table-column prop="level" label="等级值" width="100" align="center" />
        <el-table-column label="积分范围" min-width="160" align="center">
          <template #default="{ row }">
            {{ row.minPoint }} - {{ row.maxPoint === null || row.maxPoint === undefined ? '无上限' : row.maxPoint }}
          </template>
        </el-table-column>
        <el-table-column label="折扣" width="120" align="center">
          <template #default="{ row }">
            <span class="discount-tag">{{ (row.discount * 10).toFixed(1) }}折</span>
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
      :title="isEdit ? '编辑会员等级' : '新增会员等级'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        status-icon
      >
        <el-form-item label="等级名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入会员等级名称，如：黄金会员" 
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
        
        <el-form-item label="最低积分" prop="minPoint">
          <el-input-number
            v-model="form.minPoint"
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
        
        <el-form-item label="最高积分" prop="maxPoint">
          <el-input-number
            v-model="form.maxPoint"
            :min="0"
            :max="999999"
            :step="100"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            该等级的积分上限，如无上限可不填
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
import { getMemberLevelList, createMemberLevel, updateMemberLevel, deleteMemberLevel } from '../../api/memberLevel'

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
  minPoint: 0,
  maxPoint: null,
  discount: 1,
  icon: '',
  description: ''
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
  minPoint: [
    { required: true, message: '请输入最低积分', trigger: 'blur' },
    { type: 'number', min: 0, message: '最低积分不能小于0', trigger: 'blur' }
  ],
  discount: [
    { required: true, message: '请设置折扣率', trigger: 'blur' },
    { type: 'number', min: 0.1, max: 1, message: '折扣率范围为0.1-1', trigger: 'blur' }
  ]
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

// 重置表单
const resetForm = () => {
  form.id = null
  form.name = ''
  form.level = 0
  form.minPoint = 0
  form.maxPoint = null
  form.discount = 1
  form.icon = ''
  form.description = ''
  
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
    
    // 验证等级积分范围
    if (form.maxPoint !== null && form.minPoint >= form.maxPoint) {
      ElMessage.error('最高积分必须大于最低积分')
      return
    }
    
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style> 