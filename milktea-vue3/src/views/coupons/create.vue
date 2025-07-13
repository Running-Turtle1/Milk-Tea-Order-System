<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createCoupon } from '../../api/admin'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 提交状态
const submitting = ref(false)

// 表单引用
const formRef = ref(null)

// 表单数据
const couponForm = reactive({
  name: '',
  type: 1, // 1-满减券，2-折扣券
  amount: '',
  minConsumption: 0, // 最低使用金额门槛
  useScope: 0, // 使用范围，0-全场通用
  memberLevel: 0, // 适用会员等级，0-所有会员
  total: 100, // 发放总量
  perLimit: 1, // 每人限领数量固定为1张
  status: 1, // 状态：1-启用，0-禁用
  startTime: '',
  endTime: '',
  description: '' // 使用说明
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择优惠券类型', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入优惠金额/折扣', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (couponForm.type === 1) { // 满减券
          if (value <= 0) {
            callback(new Error('优惠金额必须大于0'))
          } else {
            callback()
          }
        } else if (couponForm.type === 2) { // 折扣券
          if (value <= 0 || value >= 1) {
            callback(new Error('折扣必须大于0且小于1'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  total: [
    { required: true, message: '请输入发放总量', trigger: 'blur' },
    { type: 'number', min: 1, message: '发放总量必须大于0', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (couponForm.startTime && value) {
          const start = new Date(couponForm.startTime)
          const end = new Date(value)
          if (end <= start) {
            callback(new Error('结束时间必须晚于开始时间'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 优惠券类型变更
const handleTypeChange = (type) => {
  // 重置优惠金额/折扣
  couponForm.amount = ''
}

// 返回列表页
const goBack = () => {
  router.push('/coupons')
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    submitting.value = true
    
    // 构造提交数据
    const submitData = {
      name: couponForm.name,
      type: couponForm.type,
      amount: couponForm.amount,
      minConsumption: couponForm.minConsumption,
      useScope: couponForm.useScope,
      memberLevel: couponForm.memberLevel,
      total: couponForm.total,
      perLimit: 1, // 固定每人限领1张
      status: couponForm.status,
      description: couponForm.description,
      startTime: couponForm.startTime,
      endTime: couponForm.endTime
    }
    
    // 发送请求
    await createCoupon(submitData)
    
    ElMessage.success('优惠券创建成功')
    
    // 跳转回列表页
    goBack()
  } catch (error) {
    if (error !== 'cancel' && error.message) {
      console.error('创建优惠券失败:', error)
      ElMessage.error(error.message || '创建优惠券失败')
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<template>
  <div class="coupon-create-container">
    <!-- 返回按钮 - 与订单详情样式一致，靠左显示 -->
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
        <h2>创建优惠券</h2>
        <p>设置优惠券类型、金额、使用条件等信息</p>
      </div>
    </div>
    
    <div class="form-card">
      <el-form
        ref="formRef"
        :model="couponForm"
        :rules="rules"
        label-width="140px"
        label-position="right"
        status-icon
      >
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="优惠券名称" prop="name">
              <el-input 
                v-model="couponForm.name" 
                placeholder="例如：首单立减10元" 
                maxlength="30" 
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="优惠券类型" prop="type">
              <el-radio-group v-model="couponForm.type" @change="handleTypeChange">
                <el-radio :label="1">满减券</el-radio>
                <el-radio :label="2">折扣券</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12">
            <el-form-item 
              :label="couponForm.type === 1 ? '优惠金额' : '折扣比例'" 
              prop="amount"
            >
              <template v-if="couponForm.type === 1">
                <el-input-number
                  v-model="couponForm.amount"
                  :min="0.01"
                  :step="1"
                  :precision="2"
                  style="width: 100%;"
                  placeholder="请输入优惠金额"
                >
                  <template #prefix>¥</template>
                </el-input-number>
              </template>
              <template v-else>
                <el-input-number
                  v-model="couponForm.amount"
                  :min="0.1"
                  :max="0.99"
                  :step="0.1"
                  :precision="2"
                  style="width: 100%;"
                  placeholder="请输入折扣比例(0.1-0.99)"
                >
                </el-input-number>
                <div class="form-tip">
                  例如：0.8代表8折，0.5代表5折
                </div>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="使用门槛" prop="minConsumption">
              <el-input-number
                v-model="couponForm.minConsumption"
                :min="0"
                :step="10"
                :precision="2"
                style="width: 100%;"
                placeholder="0表示无限制"
              >
                <template #prefix>满¥</template>
                <template #suffix>元可用</template>
              </el-input-number>
              <div class="form-tip">
                0表示无使用门槛
              </div>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12">
            <el-form-item label="使用范围" prop="useScope">
              <el-select v-model="couponForm.useScope" style="width: 100%;">
                <el-option :value="0" label="全场通用" />
                <el-option :value="1" label="部分商品" disabled />
              </el-select>
              <div class="form-tip">
                目前仅支持全场通用
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="适用会员等级" prop="memberLevel">
              <el-select v-model="couponForm.memberLevel" style="width: 100%;">
                <el-option :value="0" label="所有会员" />
                <el-option :value="1" label="一级会员" />
                <el-option :value="2" label="二级会员" />
                <el-option :value="3" label="三级会员" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12">
            <el-form-item label="发放总量" prop="total">
              <el-input-number
                v-model="couponForm.total"
                :min="1"
                :step="10"
                style="width: 100%;"
              />
              <div class="form-tip">
                优惠券发放的最大数量，每人限领1张
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="有效期" required>
              <el-row :gutter="10">
                <el-col :xs="24" :sm="12">
                  <el-form-item prop="startTime" class="date-form-item">
                    <el-date-picker
                      v-model="couponForm.startTime"
                      type="datetime"
                      placeholder="开始时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item prop="endTime" class="date-form-item">
                    <el-date-picker
                      v-model="couponForm.endTime"
                      type="datetime"
                      placeholder="结束时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%;"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="优惠券状态" prop="status">
              <el-switch
                v-model="couponForm.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="使用说明" prop="description">
              <el-input
                v-model="couponForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入优惠券使用说明"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="submitting"
            size="large"
            class="submit-button"
          >
            创建优惠券
          </el-button>
          <el-button @click="resetForm" size="large" class="reset-button">重置</el-button>
          <el-button @click="goBack" size="large" class="cancel-button">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.coupon-create-container {
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
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

/* 表单元素样式 */
:deep(.el-input .el-input__inner) {
  height: 40px;
}

:deep(.el-textarea .el-textarea__inner) {
  padding: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-radio-group) {
  width: 100%;
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

.reset-button,
.cancel-button {
  width: 120px;
  height: 48px;
  transition: all 0.3s;
}

.reset-button {
  border: 1px solid #dcdfe6;
  background: white;
}

.reset-button:hover {
  color: #1976d2;
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.cancel-button {
  border: 1px solid #dcdfe6;
  background: white;
}

.cancel-button:hover {
  color: #f56c6c;
  border-color: #f56c6c;
  background: rgba(245, 108, 108, 0.05);
}

/* 表单提示文本 */
.form-tip {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

/* 日期选择器表单项 */
.date-form-item {
  margin-bottom: 0;
}

:deep(.el-form-item.is-error .el-input__wrapper),
:deep(.el-form-item.is-error .el-textarea__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.el-input-number.is-controls-right .el-input-number__decrease),
:deep(.el-input-number.is-controls-right .el-input-number__increase) {
  transition: all 0.3s;
}

:deep(.el-input-number.is-controls-right .el-input-number__decrease:hover),
:deep(.el-input-number.is-controls-right .el-input-number__increase:hover) {
  background-color: #f5f7fa;
  color: #1976d2;
}

@media (max-width: 768px) {
  .form-card {
    padding: 24px 16px;
  }
  
  :deep(.el-form-item__label) {
    padding-bottom: 8px;
  }
  
  .submit-button,
  .reset-button,
  .cancel-button {
    width: 100%;
    margin-bottom: 12px;
    margin-left: 0 !important;
  }
}
</style> 