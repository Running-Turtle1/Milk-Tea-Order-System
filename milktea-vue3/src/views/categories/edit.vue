<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  getCategoryDetail, 
  updateCategory,
  createCategory, 
  uploadCategoryImage 
} from '../../api/admin'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Delete, Loading } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()
const route = useRoute()

// 分类ID
const categoryId = route.params.id

// 判断是否为编辑模式
const isEdit = !!categoryId

// 提交状态
const submitting = ref(false)
const loading = ref(false)

// 表单引用
const formRef = ref(null)
const uploadRef = ref(null)

// 图片上传相关
const imageUrl = ref('')
const uploadLoading = ref(false)

// 表单数据
const categoryForm = reactive({
  name: '',
  image: '',
  sort: 1,
  status: 1
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传分类图片', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 1, message: '排序值必须大于0', trigger: 'blur' }
  ]
}

// 直接处理文件输入
const fileInputRef = ref(null)

// 加载分类详情
const loadCategoryDetail = async () => {
  if (!isEdit) return
  
  try {
    loading.value = true
    
    const response = await getCategoryDetail(categoryId)
    
    if (response.data) {
      // 适配不同的数据结构
      const data = response.data
      
      // 填充表单数据
      categoryForm.name = data.name || ''
      categoryForm.image = data.image || ''
      categoryForm.sort = data.sort || data.orderNum || 1
      categoryForm.status = typeof data.status === 'number' ? data.status : 1
      
      // 设置图片URL
      imageUrl.value = categoryForm.image
    }
  } catch (error) {
    console.error('加载分类详情失败:', error)
    ElMessage.error('加载分类详情失败')
    router.push('/categories')
  } finally {
    loading.value = false
  }
}

// 上传图片前验证
const beforeUpload = (file) => {
  if (!file) {
    ElMessage.error('无效的文件')
    return false
  }

  // 验证图片类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const isValidType = file.type && allowedTypes.includes(file.type)
  
  if (!isValidType) {
    ElMessage.error('图片只能是JPG, PNG, GIF或WEBP格式!')
    return false
  }
  
  // 验证图片大小
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  
  return true
}

// 触发文件选择
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// 处理文件变化
const handleFileChange = (e) => {
  const files = e.target.files
  if (!files || !files.length) return
  
  const file = files[0]
  if (!beforeUpload(file)) {
    // 重置文件输入
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }
  
  uploadImage(file)
}

// 上传图片
const uploadImage = async (file) => {
  try {
    uploadLoading.value = true
    
    // 创建FormData
    const formData = new FormData()
    formData.append('file', file)
    
    // 如果是编辑模式，则上传时直接关联分类ID
    if (isEdit) {
      formData.append('categoryId', categoryId)
    }
    
    // 上传图片
    const response = await uploadCategoryImage(formData)
    
    if (response.data && response.data.url) {
      // 更新图片URL
      imageUrl.value = response.data.url
      categoryForm.image = response.data.url
      
      ElMessage.success('图片上传成功')
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    uploadLoading.value = false
    // 重置文件输入
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

// 删除图片
const handleRemoveImage = (e) => {
  if (e) {
    e.stopPropagation()
  }
  imageUrl.value = ''
  categoryForm.image = ''
  
  // 触发表单验证
  if (formRef.value) {
    formRef.value.validateField('image')
  }
}

// 返回列表页
const goBack = () => {
  router.push('/categories')
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    submitting.value = true
    
    // 构造提交数据
    const submitData = { ...categoryForm }
    
    // 发送请求
    if (isEdit) {
      // 编辑模式
      await updateCategory(categoryId, submitData)
      ElMessage.success('分类更新成功')
    } else {
      // 创建模式
      await createCategory(submitData)
      ElMessage.success('分类创建成功')
    }
    
    // 跳转回列表页
    goBack()
  } catch (error) {
    if (error !== 'cancel' && error.message) {
      console.error('保存分类失败:', error)
      ElMessage.error(error.message || '保存分类失败')
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (isEdit) {
    // 编辑模式下重新加载数据
    loadCategoryDetail()
  } else {
    // 创建模式下重置为初始值
    Object.keys(categoryForm).forEach(key => {
      if (key === 'status') {
        categoryForm[key] = 1
      } else if (key === 'sort') {
        categoryForm[key] = 1
      } else {
        categoryForm[key] = ''
      }
    })
    imageUrl.value = ''
    
    // 重置表单验证状态
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }
}

// 初始加载
onMounted(() => {
  if (isEdit) {
    loadCategoryDetail()
  }
})
</script>

<template>
  <div class="category-edit-container">
    <!-- 返回按钮 - 与订单详情样式一致，靠左显示 -->
    <div class="back-navigation">
      <el-button 
        type="primary" 
        plain 
        icon="ArrowLeft" 
        @click="goBack" 
        class="back-btn"
      >
        返回分类列表
      </el-button>
    </div>
    
    <div class="page-header">
      <div class="page-title">
        <h2>{{ isEdit ? '编辑分类' : '创建分类' }}</h2>
        <p>{{ isEdit ? '修改商品分类信息' : '创建新的商品分类' }}</p>
      </div>
    </div>
    
    <div class="form-card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="categoryForm"
        :rules="rules"
        label-width="120px"
        label-position="right"
        status-icon
      >
        <el-form-item label="分类名称" prop="name">
          <el-input 
            v-model="categoryForm.name" 
            placeholder="请输入分类名称" 
            maxlength="20" 
            show-word-limit
            style="width: 350px;"
          />
        </el-form-item>
        
        <el-form-item label="分类图片" prop="image">
          <!-- 隐藏的文件输入 -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style="display: none"
            @change="handleFileChange"
          />
          
          <!-- 自定义上传区域 -->
          <div class="category-image-uploader">
            <div v-if="imageUrl" class="image-preview">
              <img :src="imageUrl" class="preview-img" />
              <div class="image-actions">
                <el-button
                  type="danger"
                  circle
                  size="small"
                  @click.stop="handleRemoveImage"
                  class="remove-btn"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div v-else-if="uploadLoading" class="upload-loading">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>上传中...</span>
            </div>
            <div v-else class="upload-placeholder" @click="triggerFileInput">
              <el-icon><Plus /></el-icon>
              <div class="text">点击上传图片</div>
              <div class="upload-tip">支持JPG、PNG、GIF、WEBP格式，大小不超过2MB</div>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="categoryForm.sort"
            :min="1"
            :max="999"
            style="width: 180px;"
          />
          <div class="form-tip">
            排序值越小，显示越靠前
          </div>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="categoryForm.status"
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
            size="large"
            class="submit-button"
          >
            {{ isEdit ? '保存修改' : '创建分类' }}
          </el-button>
          <el-button @click="resetForm" size="large" class="reset-button">重置</el-button>
          <el-button @click="goBack" size="large" class="cancel-button">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.category-edit-container {
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

:deep(.el-form-item__label) {
  font-weight: 500;
}

/* 图片上传区域 */
.category-image-uploader {
  width: 160px;
}

.upload-placeholder {
  width: 160px;
  height: 160px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
  background-color: #fbfdff;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  border-color: #409EFF;
  color: #409EFF;
  background-color: #f1f7ff;
}

.upload-placeholder .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-placeholder .text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  text-align: center;
  padding: 0 8px;
  line-height: 1.4;
}

.upload-loading {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #409EFF;
  background-color: #f5f7fa;
}

.loading-icon {
  animation: rotating 2s linear infinite;
  font-size: 24px;
  margin-bottom: 8px;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.image-preview {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.remove-btn {
  transition: all 0.3s;
}

.remove-btn:hover {
  transform: scale(1.1);
  background-color: #f56c6c;
}

/* 表单提示文本 */
.form-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

/* 按钮样式 */
.submit-button {
  width: 160px;
  height: 48px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border: none;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transition: all 0.3s;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(25, 118, 210, 0.4);
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

/* 响应式布局 */
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