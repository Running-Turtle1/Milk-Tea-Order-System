<template>
  <div class="role-edit-container">
    <!-- 返回按钮 - 与订单详情样式一致，靠左显示 -->
    <div class="back-navigation">
      <el-button 
        type="primary" 
        plain 
        icon="ArrowLeft" 
        @click="goBack" 
        class="back-btn"
      >
        返回角色列表
      </el-button>
    </div>
    
    <div class="page-header">
      <div class="page-title">
        <h2>{{ isEdit ? '编辑角色' : '创建角色' }}</h2>
        <p>{{ isEdit ? '修改角色信息' : '添加新的角色' }}</p>
      </div>
    </div>
    
    <div class="form-card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="roleForm"
        :rules="rules"
        label-width="120px"
        label-position="right"
        status-icon
      >
        <el-form-item label="角色名称" prop="name">
          <el-input 
            v-model="roleForm.name" 
            placeholder="请输入角色名称" 
            maxlength="20"
            show-word-limit
            :disabled="isEdit && isSystemRole"
          />
        </el-form-item>
        
        <el-form-item label="角色标识" prop="code">
          <el-input 
            v-model="roleForm.code" 
            placeholder="请输入角色标识代码，如：ADMIN、MANAGER" 
            maxlength="30"
            show-word-limit
            :disabled="isEdit"
          />
          <div class="form-tip" v-if="isEdit">
            角色标识不可修改
          </div>
        </el-form-item>
        
        <el-form-item label="角色级别" prop="level">
          <el-input-number
            v-model="roleForm.level"
            :min="isEdit && isSystemRole ? roleForm.level : 2"
            :max="9"
            :step="1"
            controls-position="right"
            style="width: 100%;"
            :disabled="isEdit && isSystemRole"
          />
          <div class="form-tip">
            数字越小权限越高，0为超级管理员，1为店长，2开始为普通角色
            <span v-if="isEdit && isSystemRole" class="warning-text">（系统角色级别不可修改）</span>
          </div>
        </el-form-item>

        <el-form-item label="角色状态" prop="status">
          <el-switch
            v-model="roleForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
            :disabled="isEdit && isSystemRole"
          />
          <div class="form-tip warning-text" v-if="isEdit && isSystemRole">
            系统内置角色状态不可修改
          </div>
        </el-form-item>
        
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
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
            {{ isEdit ? '保存修改' : '创建角色' }}
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

const router = useRouter()
const route = useRoute()

// 获取角色ID（编辑模式）
const roleId = computed(() => route.params.id)

// 判断是否为编辑模式
const isEdit = computed(() => !!roleId.value)

// 加载和提交状态
const loading = ref(false)
const submitting = ref(false)

// 表单引用
const formRef = ref(null)

// 表单数据
const roleForm = reactive({
  name: '',
  code: '',
  level: 2,
  status: 1,
  description: '',
  isSystem: false
})

// 判断是否为系统角色
const isSystemRole = computed(() => {
  return roleForm.isSystem || ['SUPER_ADMIN', 'MANAGER', 'CASHIER'].includes(roleForm.code)
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色标识', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '角色标识只能包含大写字母和下划线', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请设置角色级别', trigger: 'blur' },
    { type: 'number', min: 0, message: '级别不能小于0', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述最多200个字符', trigger: 'blur' }
  ]
}

// 返回列表页
const goBack = () => {
  router.push('/roles')
}

// 加载角色详情
const loadRoleDetail = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    
    // 此处应该调用实际的API接口
    // const response = await getRoleDetail(roleId.value)
    
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 根据ID模拟不同的数据
    let mockData = {}
    
    switch (roleId.value) {
      case '1':
        mockData = {
          id: 1,
          name: '超级管理员',
          code: 'SUPER_ADMIN',
          level: 0,
          status: 1,
          description: '系统超级管理员，拥有所有权限',
          isSystem: true
        }
        break
      case '2':
        mockData = {
          id: 2,
          name: '店长',
          code: 'MANAGER',
          level: 1,
          status: 1,
          description: '门店管理员，负责日常运营管理',
          isSystem: true
        }
        break
      case '3':
        mockData = {
          id: 3,
          name: '收银员',
          code: 'CASHIER',
          level: 2,
          status: 1,
          description: '负责订单处理和收银',
          isSystem: true
        }
        break
      case '4':
        mockData = {
          id: 4,
          name: '配送员',
          code: 'DELIVERY',
          level: 3,
          status: 1,
          description: '负责订单配送',
          isSystem: false
        }
        break
      case '5':
        mockData = {
          id: 5,
          name: '营销专员',
          code: 'MARKETING',
          level: 2,
          status: 0,
          description: '负责活动策划和营销',
          isSystem: false
        }
        break
      default:
        mockData = {
          id: roleId.value,
          name: '未知角色',
          code: 'UNKNOWN_ROLE',
          level: 9,
          status: 1,
          description: '描述信息',
          isSystem: false
        }
    }
    
    // 填充表单数据
    Object.keys(roleForm).forEach(key => {
      if (key in mockData) {
        roleForm[key] = mockData[key]
      }
    })
    
  } catch (error) {
    console.error('加载角色详情失败:', error)
    ElMessage.error('加载角色详情失败')
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
    
    // 系统角色验证
    if (isEdit.value && isSystemRole.value) {
      // 系统角色只能修改描述
      const restrictedFields = ['name', 'code', 'level', 'status']
      let hasRestrictedChanges = false
      
      // 获取原始数据进行比较
      const originalData = {
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        level: 0,
        status: 1,
        isSystem: true
        // 这里应该从API获取原始数据
      }
      
      restrictedFields.forEach(field => {
        if (roleForm[field] !== originalData[field]) {
          hasRestrictedChanges = true
        }
      })
      
      if (hasRestrictedChanges) {
        ElMessage.error('系统内置角色只能修改描述信息')
        submitting.value = false
        return
      }
    }
    
    // 此处应该调用实际的API接口
    if (isEdit.value) {
      // 编辑模式
      // await updateRole(roleId.value, roleForm)
    } else {
      // 创建模式
      // await createRole(roleForm)
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success(isEdit.value ? '角色更新成功' : '角色创建成功')
    
    // 回到列表页
    goBack()
  } catch (error) {
    console.error(isEdit.value ? '更新角色失败:' : '创建角色失败:', error)
    ElMessage.error(isEdit.value ? '更新角色失败' : '创建角色失败')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadRoleDetail()
  }
})
</script>

<style scoped>
.role-edit-container {
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

.warning-text {
  color: #e6a23c;
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