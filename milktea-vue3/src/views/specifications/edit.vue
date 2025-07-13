<template>
  <div class="specification-edit-container">
    <!-- 返回按钮 -->
    <div class="back-navigation">
      <el-button 
        type="primary" 
        plain 
        icon="ArrowLeft" 
        @click="goBack" 
        class="back-btn"
      >
        返回规格列表
      </el-button>
    </div>
    
    <div class="page-header">
      <div class="page-title">
        <h2>{{ isEdit ? '编辑规格' : '创建规格' }}</h2>
        <p>{{ isEdit ? '修改规格信息' : '添加新的规格' }}</p>
      </div>
    </div>
    
    <div class="form-card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="right"
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
            数字越小排序越靠前，建议间隔10
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
        
        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="submitting"
            class="submit-button"
          >
            {{ isEdit ? '保存修改' : '创建规格' }}
          </el-button>
          <el-button 
            @click="goBack" 
            class="cancel-button"
          >
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSpecificationList, createSpecification, updateSpecification } from '../../api/specification'

const router = useRouter()
const route = useRoute()

// 获取规格ID（编辑模式）
const specificationId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})

// 判断是否为编辑模式
const isEdit = computed(() => !!specificationId.value)

// 加载和提交状态
const loading = ref(false)
const submitting = ref(false)

// 表单引用
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

// 返回列表页
const goBack = () => {
  router.push('/specifications')
}

// 加载规格详情
const loadSpecificationDetail = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    
    // 获取所有规格，找到当前规格
    const response = await getSpecificationList()
    
    // 处理不同格式的响应
    let specList = []
    if (Array.isArray(response.data)) {
      // 直接返回数组的情况
      specList = response.data
    } else if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
      // 返回 {code, message, data} 格式的情况
      specList = response.data.data
    } else {
      ElMessage.error('获取规格数据失败')
      goBack()
      return
    }
    
    const currentSpecification = specList.find(item => item.id == specificationId.value)
    
    if (!currentSpecification) {
      ElMessage.error('规格不存在或已被删除')
      setTimeout(() => {
        goBack()
      }, 1500)
      return
    }
    
    // 填充表单数据
    Object.keys(form).forEach(key => {
      if (key in currentSpecification) {
        form[key] = currentSpecification[key]
      }
    })
    
  } catch (error) {
    console.error('加载规格详情失败:', error)
    ElMessage.error('加载规格详情失败')
    goBack()
  } finally {
    loading.value = false
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
      await updateSpecification(specificationId.value, submitData)
      ElMessage.success('规格更新成功')
    } else {
      // 创建模式 - 设置创建和更新时间
      submitData.createdAt = isoDateTimeStr
      submitData.updatedAt = isoDateTimeStr
      await createSpecification(submitData)
      ElMessage.success('规格创建成功')
    }
    
    // 返回列表页
    setTimeout(() => {
      goBack()
    }, 1000)
  } catch (error) {
    console.error(isEdit.value ? '更新规格失败:' : '创建规格失败:', error)
    ElMessage.error(isEdit.value ? '更新规格失败' : '创建规格失败')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadSpecificationDetail()
  }
})
</script>

<style scoped>
.specification-edit-container {
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

/* 表单卡片 */
.form-card {
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 表单元素样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
}

.form-tip {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

.value-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.value-tag {
  margin-right: 0;
}

.preview-values {
  margin-top: 12px;
  display: flex;
  align-items: center;
}

.preview-label {
  font-size: 12px;
  color: #909399;
  margin-right: 8px;
}

.submit-button {
  padding: 10px 24px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border: none;
  font-weight: 500;
  transition: all 0.3s;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
}

.cancel-button {
  padding: 10px 24px;
  margin-left: 16px;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
  font-weight: 500;
  transition: all 0.3s;
}

.cancel-button:hover {
  color: #f56c6c;
  border-color: #f56c6c;
}

@media (max-width: 768px) {
  .form-card {
    padding: 20px 16px;
  }
  
  .back-navigation {
    margin-bottom: 16px;
  }
  
  .page-header {
    margin-bottom: 16px;
  }
  
  .submit-button,
  .cancel-button {
    width: 100%;
    margin-left: 0;
    margin-bottom: 12px;
  }
}
</style> 