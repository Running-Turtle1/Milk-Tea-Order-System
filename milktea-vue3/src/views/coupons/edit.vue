<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCouponDetail, updateCoupon } from '../../api/admin'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()
const route = useRoute()

// 获取优惠券ID
const couponId = route.params.id

// 提交状态
const submitting = ref(false)
const loading = ref(false)

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
  perLimit: null, // 每人限领数量，null表示不限制
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

// 加载优惠券详情
const loadCouponDetail = async () => {
  if (!couponId) {
    ElMessage.error('优惠券ID不能为空')
    router.push('/coupons')
    return
  }
  
  try {
    loading.value = true
    
    const response = await getCouponDetail(couponId)
    console.log('优惠券详情:', response.data)
    
    if (response.data) {
      // 填充表单数据
      const couponData = response.data
      
      // 设置表单数据
      Object.keys(couponForm).forEach(key => {
        if (key in couponData) {
          // 特殊处理日期字段
          if (key === 'startTime' || key === 'endTime') {
            const date = new Date(couponData[key])
            couponForm[key] = formatDateTime(date)
          } else {
            couponForm[key] = couponData[key]
          }
        }
      })
      
      // 保存其他信息，用于显示
      couponInfo.issued = couponData.issued || 0
      couponInfo.used = couponData.used || 0
      couponInfo.remaining = couponData.remaining || 0
      couponInfo.expired = couponData.expired || false
      couponInfo.createdAt = couponData.createdAt
      couponInfo.updatedAt = couponData.updatedAt
    }
  } catch (error) {
    console.error('加载优惠券详情失败:', error)
    ElMessage.error('加载优惠券详情失败')
    router.push('/coupons')
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
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
      perLimit: couponForm.perLimit,
      status: couponForm.status,
      description: couponForm.description,
      startTime: couponForm.startTime,
      endTime: couponForm.endTime
    }
    
    // 发送请求
    await updateCoupon(couponId, submitData)
    
    ElMessage.success('优惠券更新成功')
    
    // 跳转回列表页
    goBack()
  } catch (error) {
    if (error !== 'cancel' && error.message) {
      console.error('更新优惠券失败:', error)
      ElMessage.error(error.message || '更新优惠券失败')
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  // 重新加载优惠券详情
  loadCouponDetail()
}

// 优惠券额外信息（只读）
const couponInfo = reactive({
  issued: 0,
  used: 0,
  remaining: 0,
  expired: false,
  createdAt: '',
  updatedAt: ''
})

// 初始加载
onMounted(() => {
  loadCouponDetail()
})
</script>

<template>
  <div class="coupon-edit-container">
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
        <h2>编辑优惠券</h2>
        <p>修改优惠券的类型、金额、使用条件等信息</p>
      </div>
    </div>
    
    <!-- 优惠券信息卡片 -->
    <div class="info-card" v-if="couponId">
      <div class="card-title">当前优惠券信息</div>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="8">
          <div class="info-item">
            <div class="info-label">发放情况</div>
            <div class="info-value">
              已发放: <span class="highlight">{{ couponInfo.issued }}</span> 张，
              已使用: <span class="highlight">{{ couponInfo.used }}</span> 张，
              剩余: <span class="highlight">{{ couponInfo.remaining }}</span> 张
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="info-item">
            <div class="info-label">创建时间</div>
            <div class="info-value">{{ couponInfo.createdAt || '--' }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="info-item">
            <div class="info-label">过期状态</div>
            <div class="info-value">
              <el-tag :type="couponInfo.expired ? 'info' : 'success'" size="small">
                {{ couponInfo.expired ? '已过期' : '未过期' }}
              </el-tag>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="form-card" v-loading="loading">
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
            <el-form-item label="发放总量" prop="total">
              <el-input-number
                v-model="couponForm.total"
                :min="1"
                :step="10"
                style="width: 100%;"
              />
              <div class="form-tip">
                优惠券发放的最大数量
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
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
        </el-row>
        
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="每人限领数量" prop="perLimit">
              <el-input-number
                v-model="couponForm.perLimit"
                :min="0"
                :step="1"
                style="width: 100%;"
                placeholder="0或空表示不限制"
              />
              <div class="form-tip">
                限制每个用户可领取的数量，不填或填0表示不限制
              </div>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
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
            保存修改
          </el-button>
          <el-button @click="resetForm" size="large" class="reset-button">重置</el-button>
          <el-button @click="goBack" size="large" class="cancel-button">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.coupon-edit-container {
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

/* 优惠券信息卡片 */
.info-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
  position: relative;
  padding-left: 12px;
}

.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: #1976d2;
  border-radius: 1.5px;
}

.info-item {
  margin-bottom: 12px;
}

.info-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  color: #606266;
}

.highlight {
  color: #1976d2;
  font-weight: 600;
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