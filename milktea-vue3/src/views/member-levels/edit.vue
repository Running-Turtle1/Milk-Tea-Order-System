<template>
  <div class="member-level-edit-container">
    <!-- 返回按钮 -->
    <div class="back-navigation">
      <el-button 
        type="primary" 
        plain 
        icon="ArrowLeft" 
        @click="goBack" 
        class="back-btn"
      >
        返回会员等级列表
      </el-button>
    </div>
    
    <div class="page-header">
      <div class="page-title">
        <h2>{{ isEdit ? '编辑会员等级' : '创建会员等级' }}</h2>
        <p>{{ isEdit ? '修改会员等级信息与特权' : '添加新的会员等级' }}</p>
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
        
        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="submitting"
            class="submit-button"
          >
            {{ isEdit ? '保存修改' : '创建会员等级' }}
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
import { getMemberLevelDetail, createMemberLevel, updateMemberLevel } from '../../api/member-level'

const router = useRouter()
const route = useRoute()

// 获取会员等级ID（编辑模式）
const memberLevelId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})

// 判断是否为编辑模式
const isEdit = computed(() => !!memberLevelId.value)

// 加载和提交状态
const loading = ref(false)
const submitting = ref(false)

// 表单引用
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

// 返回列表页
const goBack = () => {
  router.push('/member-levels')
}

// 格式化折扣显示
const formatDiscount = (val) => {
  return (val * 10).toFixed(1) + '折'
}

// 加载会员等级详情
const loadMemberLevelDetail = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    
    // 获取会员等级详情
    const response = await getMemberLevelDetail(memberLevelId.value)
    
    // 处理不同格式的响应
    let levelDetail = null
    if (response.data && !response.data.code) {
      // 直接返回对象的情况
      levelDetail = response.data
    } else if (response.data && response.data.code === 200) {
      // 返回 {code, message, data} 格式的情况
      levelDetail = response.data.data
    } else {
      ElMessage.error('获取会员等级数据失败')
      goBack()
      return
    }
    
    if (!levelDetail) {
      ElMessage.error('会员等级不存在或已被删除')
      setTimeout(() => {
        goBack()
      }, 1500)
      return
    }
    
    // 填充表单数据
    Object.keys(form).forEach(key => {
      if (key in levelDetail) {
        form[key] = levelDetail[key]
      }
    })
    
  } catch (error) {
    console.error('加载会员等级详情失败:', error)
    ElMessage.error('加载会员等级详情失败')
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
      await updateMemberLevel(memberLevelId.value, submitData)
      ElMessage.success('会员等级更新成功')
    } else {
      // 创建模式 - 设置创建和更新时间
      submitData.createdAt = isoDateTimeStr
      submitData.updatedAt = isoDateTimeStr
      await createMemberLevel(submitData)
      ElMessage.success('会员等级创建成功')
    }
    
    // 返回列表页
    setTimeout(() => {
      goBack()
    }, 1000)
  } catch (error) {
    console.error(isEdit.value ? '更新会员等级失败:' : '创建会员等级失败:', error)
    ElMessage.error(isEdit.value ? '更新会员等级失败' : '创建会员等级失败')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadMemberLevelDetail()
  }
})
</script>

<style scoped>
.member-level-edit-container {
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

.privileges-options {
  display: flex;
  gap: 16px;
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
  
  .privileges-options {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 