<template>
  <div class="point-rule-edit-container">
    <!-- 返回按钮 - 与订单详情样式一致，靠左显示 -->
    <div class="back-navigation">
      <el-button 
        type="primary" 
        plain 
        icon="ArrowLeft" 
        @click="goBack" 
        class="back-btn"
      >
        返回积分规则列表
      </el-button>
    </div>
    
    <div class="page-header">
      <div class="page-title">
        <h2>{{ isEdit ? '编辑积分规则' : '创建积分规则' }}</h2>
        <p>{{ isEdit ? '修改积分规则信息' : '添加新的积分规则' }}</p>
      </div>
    </div>
    
    <div class="form-card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="ruleForm"
        :rules="rules"
        label-width="120px"
        label-position="right"
        status-icon
      >
        <el-form-item label="规则名称" prop="name">
          <el-input 
            v-model="ruleForm.name" 
            placeholder="请输入规则名称" 
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="规则类型" prop="type">
          <el-select 
            v-model="ruleForm.type" 
            placeholder="请选择规则类型" 
            style="width: 100%;"
            :disabled="isEdit"
          >
            <el-option label="消费获取积分" :value="1" />
            <el-option label="每日签到积分" :value="2" />
            <el-option label="首次注册积分" :value="3" />
          </el-select>
          <div class="form-tip" v-if="isEdit">
            规则类型不可修改
          </div>
        </el-form-item>
        
        <el-form-item label="积分值" prop="point">
          <el-input-number
            v-model="ruleForm.point"
            :min="1"
            :max="10000"
            controls-position="right"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item 
          label="条件值" 
          prop="condition" 
          v-if="ruleForm.type === 1"
        >
          <el-input-number
            v-model="ruleForm.condition"
            :min="1"
            :max="10000"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            消费满多少元可获得积分，如：消费满100元获得10积分
          </div>
        </el-form-item>

        <el-form-item 
          label="每日上限" 
          prop="dailyLimit" 
          v-if="ruleForm.type === 2"
        >
          <el-input-number
            v-model="ruleForm.dailyLimit"
            :min="1"
            :max="100"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">
            每日可获得积分的次数上限，默认为1次
          </div>
        </el-form-item>
        
        <el-form-item label="规则状态" prop="status">
          <el-switch
            v-model="ruleForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        
        <el-form-item label="规则描述" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入规则描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="submitting"
            class="submit-button"
          >
            {{ isEdit ? '保存修改' : '创建规则' }}
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 获取积分规则ID（编辑模式）
const ruleId = computed(() => route.params.id)

// 判断是否为编辑模式
const isEdit = computed(() => !!ruleId.value)

// 加载和提交状态
const loading = ref(false)
const submitting = ref(false)

// 表单引用
const formRef = ref(null)

// 表单数据
const ruleForm = reactive({
  name: '',
  type: 1,
  point: 10,
  condition: 100,
  dailyLimit: 1,
  status: 1,
  description: ''
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ],
  point: [
    { required: true, message: '请设置积分值', trigger: 'blur' },
    { type: 'number', min: 1, message: '积分值必须大于0', trigger: 'blur' }
  ],
  condition: [
    { required: true, message: '请设置条件值', trigger: 'blur' },
    { type: 'number', min: 1, message: '条件值必须大于0', trigger: 'blur' }
  ],
  dailyLimit: [
    { type: 'number', min: 1, message: '每日上限必须大于0', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述最多200个字符', trigger: 'blur' }
  ]
}

// 监听类型变化，设置默认值
watch(() => ruleForm.type, (newType) => {
  if (newType === 1 && !ruleForm.condition) {
    ruleForm.condition = 100
  } else if (newType === 2 && !ruleForm.dailyLimit) {
    ruleForm.dailyLimit = 1
  }
})

// 返回列表页
const goBack = () => {
  router.push('/point-rules')
}

// 加载积分规则详情
const loadRuleDetail = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    
    // 此处应该调用实际的API接口
    // const response = await getPointRuleDetail(ruleId.value)
    
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 根据ID模拟不同的数据
    let mockData = {}
    
    switch (ruleId.value) {
      case '1':
        mockData = {
          id: 1,
          name: '消费积分奖励',
          type: 1, // 消费获取积分
          point: 10,
          condition: 100, // 每消费100元
          status: 1,
          description: '每消费100元获得10积分'
        }
        break
      case '2':
        mockData = {
          id: 2,
          name: '每日签到',
          type: 2, // 每日签到积分
          point: 5,
          dailyLimit: 1,
          status: 1,
          description: '每日签到获得5积分'
        }
        break
      case '3':
        mockData = {
          id: 3,
          name: '注册奖励',
          type: 3, // 首次注册积分
          point: 100,
          status: 1,
          description: '新用户注册奖励100积分'
        }
        break
      case '4':
        mockData = {
          id: 4,
          name: '分享获得积分',
          type: 1,
          point: 20,
          condition: 1, // 每次分享
          status: 0,
          description: '分享商品获得20积分（每日限3次）'
        }
        break
      default:
        mockData = {
          id: ruleId.value,
          name: '未知积分规则',
          type: 1,
          point: 10,
          condition: 100,
          status: 1,
          description: '描述信息'
        }
    }
    
    // 填充表单数据
    Object.keys(ruleForm).forEach(key => {
      if (key in mockData) {
        ruleForm[key] = mockData[key]
      }
    })
    
  } catch (error) {
    console.error('加载积分规则详情失败:', error)
    ElMessage.error('加载积分规则详情失败')
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
    
    // 准备提交的数据
    const submitData = { ...ruleForm }
    
    // 根据类型移除不需要的字段
    if (submitData.type !== 1) {
      delete submitData.condition
    }
    
    if (submitData.type !== 2) {
      delete submitData.dailyLimit
    }
    
    // 此处应该调用实际的API接口
    if (isEdit.value) {
      // 编辑模式
      // await updatePointRule(ruleId.value, submitData)
    } else {
      // 创建模式
      // await createPointRule(submitData)
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success(isEdit.value ? '积分规则更新成功' : '积分规则创建成功')
    
    // 回到列表页
    goBack()
  } catch (error) {
    console.error(isEdit.value ? '更新积分规则失败:' : '创建积分规则失败:', error)
    ElMessage.error(isEdit.value ? '更新积分规则失败' : '创建积分规则失败')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadRuleDetail()
  }
})
</script>

<style scoped>
.point-rule-edit-container {
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