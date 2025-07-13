<template>
  <div class="role-container">
    <div class="page-header">
      <div class="title-box">
        <h2 class="page-title">角色管理</h2>
        <p class="page-desc">管理系统角色与权限</p>
      </div>
      <div class="action-box">
        <el-button 
          type="primary" 
          @click="handleAdd" 
          class="add-button"
        >
          <el-icon><Plus /></el-icon>新增角色
        </el-button>
      </div>
    </div>

    <el-card class="table-card" v-loading="loading">
      <!-- 表格区域 -->
      <el-table
        :data="roleList"
        border
        style="width: 100%"
        row-key="id"
        v-loading="tableLoading"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="角色名称" min-width="150" align="center" />
        <el-table-column prop="isSystem" label="系统角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isSystem ? 'danger' : 'info'" effect="plain">
              {{ row.isSystem ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="角色描述" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="updatedAt" label="更新时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
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
              type="success"
              link
              size="small"
              @click.stop="handlePermission(row)"
            >
              <el-icon><Setting /></el-icon>
              <span>权限设置</span>
            </el-button>
            
            <el-button
              type="danger"
              link
              size="small"
              @click.stop="handleDelete(row)"
              :disabled="!!row.isSystem"
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
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="750px"
      destroy-on-close
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            status-icon
          >
            <el-form-item label="角色名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="请输入角色名称" 
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="角色描述" prop="description">
              <el-input 
                v-model="form.description" 
                placeholder="请输入角色描述" 
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
              />
              <div class="form-tip">
                描述该角色的职责和权限范围
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="权限设置" name="permissions">
          <div v-loading="permissionsLoading" class="permission-tab-content">
            <div class="permission-tip">
              <el-alert
                title="权限设置说明"
                type="info"
                :closable="false"
                show-icon
              >
                <p>请至少选择一个权限，新角色必须具有权限才能创建</p>
                <p>权限代码格式为：资源:操作，如 product:view（查看商品）</p>
              </el-alert>
            </div>
            
            <div class="permission-groups">
              <template v-for="(group, groupName) in permissionGroups" :key="groupName">
                <div class="permission-group">
                  <div class="group-header">
                    <h3 class="group-title">{{ groupName }}</h3>
                    <div class="group-actions">
                      <el-button 
                        type="primary" 
                        link 
                        size="small" 
                        @click="selectAllInGroup(groupName)"
                      >
                        全选
                      </el-button>
                      <el-button 
                        type="danger" 
                        link 
                        size="small" 
                        @click="deselectAllInGroup(groupName)"
                      >
                        清空
                      </el-button>
                    </div>
                  </div>
                  
                  <div class="group-permissions">
                    <el-checkbox
                      v-for="item in group"
                      :key="item.code"
                      v-model="form.permissions"
                      :label="item.code"
                    >
                      <span class="permission-label">{{ item.name }}</span>
                      <el-tag size="small" effect="plain" class="permission-code">{{ item.code }}</el-tag>
                    </el-checkbox>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="permissionDialog.visible"
      :title="`设置权限 - ${permissionDialog.roleName}`"
      width="680px"
      destroy-on-close
    >
      <div v-loading="permissionDialog.loading" class="permission-dialog-content">
        <div class="permission-tip">
          <el-alert
            title="权限说明"
            type="info"
            :closable="false"
            show-icon
          >
            <p>权限代码格式为：资源:操作，如 product:view（查看商品）</p>
            <p>请根据角色职责选择相应权限</p>
          </el-alert>
        </div>
        
        <div class="permission-groups">
          <template v-for="(group, groupName) in permissionGroups" :key="groupName">
            <div class="permission-group">
              <div class="group-header">
                <h3 class="group-title">{{ groupName }}</h3>
                <div class="group-actions">
                  <el-button 
                    type="primary" 
                    link 
                    size="small" 
                    @click="selectAllInGroup(groupName)"
                  >
                    全选
                  </el-button>
                  <el-button 
                    type="danger" 
                    link 
                    size="small" 
                    @click="deselectAllInGroup(groupName)"
                  >
                    清空
                  </el-button>
                </div>
              </div>
              
              <div class="group-permissions">
                <el-checkbox
                  v-for="item in group"
                  :key="item.code"
                  v-model="permissionDialog.selectedPermissions"
                  :label="item.code"
                >
                  <span class="permission-label">{{ item.name }}</span>
                  <el-tag size="small" effect="plain" class="permission-code">{{ item.code }}</el-tag>
                </el-checkbox>
              </div>
            </div>
          </template>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions" :loading="permissionDialog.submitting">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Setting } from '@element-plus/icons-vue'
import { formatDateTime } from '../../utils/format'
import request from '../../utils/request'

// 加载状态
const loading = ref(false)
const tableLoading = ref(false)
const submitting = ref(false)
const permissionsLoading = ref(false)

// 角色列表数据
const roleList = ref([])

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const activeTab = ref('basic')

// 表单数据
const form = reactive({
  id: null,
  name: '',
  description: '',
  permissions: []
})

// 权限设置对话框
const permissionDialog = reactive({
  visible: false,
  roleId: null,
  roleName: '',
  loading: false,
  submitting: false,
  selectedPermissions: [],
  allPermissions: []
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ]
}

// 按资源分组的权限列表
const permissionGroups = computed(() => {
  const groups = {}
  const permissions = permissionDialog.visible 
    ? permissionDialog.allPermissions 
    : permissionDialog.allPermissions
  
  permissions.forEach(permission => {
    const [resource] = permission.code.split(':')
    const groupName = getResourceGroupName(resource)
    
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    
    groups[groupName].push(permission)
  })
  
  return groups
})

// 监听标签页切换
watch(activeTab, (newVal) => {
  // 当切换到权限标签页，且权限列表为空时，自动加载权限列表
  if (newVal === 'permissions' && permissionDialog.allPermissions.length === 0) {
    fetchAllPermissions()
  }
})

// 获取资源组名称
const getResourceGroupName = (resource) => {
  const resourceMap = {
    'product': '商品管理',
    'category': '分类管理',
    'specification': '规格管理',
    'ingredient': '配料管理',
    'order': '订单管理',
    'user': '用户管理',
    'role': '角色管理',
    'permission': '权限管理',
    'system': '系统设置',
    'point': '积分管理',
    'coupon': '优惠券管理',
    'store': '门店管理',
    'staff': '员工管理',
    'report': '报表统计',
    'member': '会员管理',
    'promotion': '营销管理',
    'stats': '统计分析'
  }
  
  return resourceMap[resource] || '其他'
}

// 获取角色列表
const getRoleList = (params) => {
  return request({
    url: '/admin/roles',
    method: 'get',
    params
  })
}

// 获取角色详情
const getRoleDetail = (id) => {
  return request({
    url: `/admin/roles/${id}`,
    method: 'get'
  })
}

// 创建角色
const createRole = (data) => {
  return request({
    url: '/admin/roles',
    method: 'post',
    data
  })
}

// 更新角色
const updateRole = (id, data) => {
  return request({
    url: `/admin/roles/${id}`,
    method: 'put',
    data
  })
}

// 删除角色
const deleteRole = (id) => {
  return request({
    url: `/admin/roles/${id}`,
    method: 'delete'
    })
}

// 获取所有权限
const getAllPermissions = () => {
  return request({
    url: '/admin/permissions',
    method: 'get'
  })
}

// 获取角色列表
const fetchRoleList = async () => {
  try {
    tableLoading.value = true
    const response = await getRoleList()
    
    // 根据实际响应结构处理数据
    if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
      // 返回 {code, message, data} 格式的情况
      roleList.value = response.data.data
    } else if (Array.isArray(response.data)) {
      // 直接返回数组的情况
      roleList.value = response.data
    } else {
      // 其他意外情况
      console.warn('角色列表数据格式异常:', response.data)
      roleList.value = []
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 获取所有权限
const fetchAllPermissions = async () => {
  try {
    permissionsLoading.value = true
    permissionDialog.loading = permissionDialog.visible // 仅当权限对话框可见时显示加载状态
    
    const response = await getAllPermissions()
    
    // 处理响应数据 - 后端返回字符串数组
    let permissionList = []
    
    if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
      // 将字符串数组转换为对象数组，添加显示名称
      permissionList = response.data.data.map(code => ({
        code,
        name: getPermissionName(code)
      }))
    } else if (Array.isArray(response.data)) {
      // 直接返回数组的情况
      permissionList = response.data.map(code => ({
        code,
        name: getPermissionName(code)
      }))
    } else {
      console.warn('权限列表数据格式异常:', response.data)
    }
    
    permissionDialog.allPermissions = permissionList
  } catch (error) {
    console.error('获取权限列表失败:', error)
    ElMessage.error('获取权限列表失败')
  } finally {
    permissionsLoading.value = false
    permissionDialog.loading = false
  }
}

// 根据权限代码获取友好的显示名称
const getPermissionName = (code) => {
  if (!code || typeof code !== 'string') return '未知权限'
  
  const [resource, action] = code.split(':')
  
  // 资源映射
  const resourceMap = {
    'user': '用户',
    'product': '商品',
    'category': '分类',
    'ingredient': '配料',
    'specification': '规格',
    'order': '订单',
    'member': '会员',
    'coupon': '优惠券',
    'promotion': '促销活动',
    'system': '系统',
    'stats': '统计'
  }
  
  // 操作映射
  const actionMap = {
    'view': '查看',
    'add': '新增',
    'edit': '编辑',
    'delete': '删除',
    'process': '处理',
    'cancel': '取消',
    'distribute': '发放'
  }
  
  const resourceName = resourceMap[resource] || resource
  const actionName = actionMap[action] || action
  
  return `${resourceName}${actionName}`
}

// 处理添加角色
const handleAdd = async () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
  activeTab.value = 'basic'
  
  // 如果还没有获取过权限列表，预加载权限列表
  if (permissionDialog.allPermissions.length === 0) {
    await fetchAllPermissions()
  }
}

// 处理编辑角色
const handleEdit = async (row) => {
  isEdit.value = true
  resetForm()
  
  // 填充表单数据
  Object.keys(form).forEach(key => {
    if (key in row) {
      form[key] = row[key]
    }
  })
  
  // 如果权限是一个数组，直接使用
  if (Array.isArray(row.permissions)) {
    form.permissions = [...row.permissions]
  }
  
  dialogVisible.value = true
  activeTab.value = 'basic'
  
  // 如果还没有获取过权限列表，预加载权限列表
  if (permissionDialog.allPermissions.length === 0) {
    await fetchAllPermissions()
  }
}

// 处理权限设置
const handlePermission = async (row) => {
  permissionDialog.roleId = row.id
  permissionDialog.roleName = row.name
  permissionDialog.selectedPermissions = [...(row.permissions || [])]
  permissionDialog.visible = true
  
  // 如果还没有获取过权限列表，先获取
  if (permissionDialog.allPermissions.length === 0) {
    await fetchAllPermissions()
  }
}

// 全选分组内权限
const selectAllInGroup = (groupName) => {
  if (!permissionGroups.value[groupName]) return
  
  const groupPermissions = permissionGroups.value[groupName].map(item => item.code)
  
  if (permissionDialog.visible) {
    // 添加未选中的权限到权限对话框
    groupPermissions.forEach(code => {
      if (!permissionDialog.selectedPermissions.includes(code)) {
        permissionDialog.selectedPermissions.push(code)
      }
    })
  } else {
    // 添加未选中的权限到表单
    groupPermissions.forEach(code => {
      if (!form.permissions.includes(code)) {
        form.permissions.push(code)
      }
    })
  }
}

// 取消选择分组内权限
const deselectAllInGroup = (groupName) => {
  if (!permissionGroups.value[groupName]) return
  
  const groupPermissions = permissionGroups.value[groupName].map(item => item.code)
  
  if (permissionDialog.visible) {
    // 从权限对话框中移除已选中的权限
    permissionDialog.selectedPermissions = permissionDialog.selectedPermissions.filter(
      code => !groupPermissions.includes(code)
    )
  } else {
    // 从表单中移除已选中的权限
    form.permissions = form.permissions.filter(
      code => !groupPermissions.includes(code)
    )
  }
}

// 保存角色权限
const savePermissions = async () => {
  try {
    if (!permissionDialog.roleId) return
    
    // 检查是否选择了权限
    if (permissionDialog.selectedPermissions.length === 0) {
      ElMessage.warning('请至少选择一个权限')
      return
    }
    
    permissionDialog.submitting = true
    
    // 获取当前角色的完整数据
    const currentRole = roleList.value.find(role => role.id === permissionDialog.roleId)
    if (!currentRole) {
      throw new Error('角色数据不存在')
    }
    
    // 保留角色的原有数据，只更新权限
    const roleData = {
      id: currentRole.id,
      name: currentRole.name,
      description: currentRole.description,
      isSystem: currentRole.isSystem,
      createdAt: currentRole.createdAt,
      updatedAt: currentRole.updatedAt
    }
    
    await setRolePermissions(
      permissionDialog.roleId, 
      permissionDialog.selectedPermissions,
      roleData
    )
    
    // 更新本地数据
    const roleIndex = roleList.value.findIndex(role => role.id === permissionDialog.roleId)
    if (roleIndex !== -1) {
      roleList.value[roleIndex].permissions = [...permissionDialog.selectedPermissions]
    }
    
    ElMessage.success('权限设置成功')
    permissionDialog.visible = false
  } catch (error) {
    console.error('保存权限设置失败:', error)
    ElMessage.error('保存权限设置失败')
  } finally {
    permissionDialog.submitting = false
  }
}

// 处理删除角色
const handleDelete = async (row) => {
  try {
    const id = row.id
    if (!id) {
      ElMessage.error('无法删除: 无效的角色ID')
      return
    }
    
    // 如果是系统角色，不允许删除
    if (row.isSystem) {
      ElMessage.warning('系统内置角色不可删除')
      return
    }
    
    // 确认操作
    await ElMessageBox.confirm(
      `确定要删除 "${row.name}" 角色吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    await deleteRole(id)
    
    // 从列表中移除
    roleList.value = roleList.value.filter(item => item.id !== id)
    
    ElMessage.success('角色删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除角色失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  form.id = null
  form.name = ''
  form.description = ''
  form.permissions = []
  
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
    
    // 检查是否选择了权限
    if (form.permissions.length === 0) {
      ElMessage.warning('请至少选择一个权限')
      activeTab.value = 'permissions'
      return
    }
    
    submitting.value = true
    
    // 准备提交数据
    const submitData = { ...form }
    
    if (isEdit.value) {
      // 编辑模式
      // 获取当前角色的完整数据，包括权限
      const currentRole = roleList.value.find(role => role.id === form.id)
      if (!currentRole) {
        throw new Error('角色数据不存在')
      }
      
      // 更新角色，包含权限
      await updateRole(form.id, submitData)
      ElMessage.success('角色更新成功')
      
      // 更新本地数据，包含权限
      const index = roleList.value.findIndex(item => item.id === form.id)
      if (index !== -1) {
        roleList.value[index] = { 
          ...roleList.value[index], 
          ...submitData,
          permissions: form.permissions
        }
      }
    } else {
      // 创建模式 - 包含权限
      await createRole(submitData)
      ElMessage.success('角色创建成功')
      
      // 重新获取列表确保数据同步
      fetchRoleList()
    }
    
    // 关闭对话框
    dialogVisible.value = false
  } catch (error) {
    console.error(isEdit.value ? '更新角色失败:' : '创建角色失败:', error)
    ElMessage.error(isEdit.value ? '更新角色失败' : '创建角色失败')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  fetchRoleList()
})
</script>

<style scoped>
.role-container {
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

.permission-dialog-content,
.permission-tab-content {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
  /* 隐藏滚动条但保留滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* 隐藏WebKit浏览器(Chrome, Safari)的滚动条 */
.permission-dialog-content::-webkit-scrollbar,
.permission-tab-content::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
  background: transparent;
}

.permission-tip {
  margin-bottom: 16px;
}

.permission-tip p {
  margin: 4px 0;
  line-height: 1.5;
}

.permission-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.permission-group {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #F5F7FA;
  border-bottom: 1px solid #EBEEF5;
}

.group-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.group-permissions {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.permission-label {
  margin-right: 6px;
}

.permission-code {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .group-permissions {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 