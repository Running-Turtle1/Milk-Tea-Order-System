<template>
  <div class="app-container">
    <div class="page-header">
      <h2 class="page-title">店铺管理</h2>
      <div class="page-desc">管理店铺的基本信息</div>
    </div>
    
    <el-card v-loading="loading" class="box-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
          <el-button type="primary" @click="saveShopInfo">保存信息</el-button>
        </div>
      </template>
      
      <el-form ref="formRef" :model="shopInfo" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="店铺名称" prop="shopName">
              <el-input v-model="shopInfo.shopName" placeholder="请输入店铺名称" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="shopInfo.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="shopInfo.email" placeholder="请输入电子邮箱" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="营业时间" prop="businessHours">
              <el-input v-model="shopInfo.businessHours" placeholder="例如：09:00-22:00" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="店铺地址" prop="address">
          <el-input v-model="shopInfo.address" placeholder="请输入店铺地址" />
        </el-form-item>
        
        <el-form-item label="店铺LOGO" prop="logo">
          <el-upload
            class="avatar-uploader"
            :action="uploadAction"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :on-error="handleLogoError"
            :before-upload="beforeLogoUpload"
            :headers="uploadHeaders"
          >
            <img v-if="shopInfo.logo" :src="shopInfo.logo" class="avatar" alt="店铺LOGO" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议上传JPG或PNG格式的图片</div>
        </el-form-item>
        
        <el-form-item label="店铺描述" prop="description">
          <el-input v-model="shopInfo.description" type="textarea" :rows="4" placeholder="请输入店铺描述信息" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getShopInfo, updateShopInfo } from '../../api/shop'

// 表单引用
const formRef = ref(null)
const loading = ref(false)

// 上传相关配置
const uploadAction = '/api/admin/shop/upload/logo'
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

// 店铺信息表单数据
const shopInfo = reactive({
  id: null,
  shopName: '',
  logo: '',
  address: '',
  phone: '',
  businessHours: '',
  description: '',
  email: '',
  createdAt: '',
  updatedAt: '',
  announcementStatus: 0,
  notice: '',
  announcement: ''
})

// 表单验证规则
const rules = {
  shopName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { max: 50, message: '店铺名称不能超过50个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, message: '请输入正确的电子邮箱', trigger: 'blur' }
  ],
  businessHours: [
    { required: true, message: '请输入营业时间', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入店铺地址', trigger: 'blur' }
  ]
}

// 加载店铺信息
const loadShopInfo = async () => {
  try {
    loading.value = true
    const response = await getShopInfo()
    
    if (response.code === 200 && response.data) {
      const data = response.data
      
      // 更新店铺基本信息
      Object.keys(shopInfo).forEach(key => {
        if (data[key] !== undefined) {
          shopInfo[key] = data[key]
        }
      })
    }
  } catch (error) {
    console.error('加载店铺信息失败:', error)
    ElMessage.error('加载店铺信息失败')
  } finally {
    loading.value = false
  }
}

// LOGO上传成功处理
const handleLogoSuccess = (response) => {
  if (response.code === 200 && response.data) {
    shopInfo.logo = response.data.url
    ElMessage.success('LOGO上传成功')
  } else {
    ElMessage.error(response.message || 'LOGO上传失败')
  }
}

// LOGO上传失败处理
const handleLogoError = (error) => {
  console.error('LOGO上传失败:', error)
  ElMessage.error('LOGO上传失败，请检查图片格式和大小，或联系管理员')
}

// LOGO上传前验证
const beforeLogoUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  
  if (!isImage) {
    ElMessage.error('只能上传JPG或PNG格式的图片!')
    return false
  }
  
  return true
}

// 保存店铺信息
const saveShopInfo = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    const response = await updateShopInfo(shopInfo)
    
    if (response.code === 200) {
      ElMessage.success('店铺信息保存成功')
      // 重新加载店铺信息
      loadShopInfo()
    } else {
      ElMessage.error(response.message || '店铺信息保存失败')
    }
  } catch (error) {
    console.error('保存店铺信息失败:', error)
    ElMessage.error('表单验证失败，请检查填写的内容')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取店铺信息
onMounted(() => {
  loadShopInfo()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: #606266;
}

.box-card {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-uploader {
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style> 