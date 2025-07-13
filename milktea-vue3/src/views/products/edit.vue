<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  getProductDetail,
  updateProduct, 
  getCategoryList, 
  uploadProductImage 
} from '../../api/admin'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Loading } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()
const route = useRoute()
const productId = route.params.id

// 数据加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 分类列表
const categoryList = ref([])

// 商品表单
const productForm = reactive({
  categoryId: '',
  name: '',
  price: '',
  image: '',
  description: '',
  isRecommend: 0, 
  supportCustom: 0,
  sort: 0,
  status: 1
})

// 图片上传相关
const imageUrl = ref('')
const uploadRef = ref(null)
const uploadLoading = ref(false)

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', message: '价格必须为数字', trigger: 'blur', transform: value => Number(value) }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ]
}

// 表单引用
const formRef = ref(null)

// 加载分类数据
const loadCategoryList = async () => {
  try {
    const response = await getCategoryList()
    if (response.data) {
      categoryList.value = response.data
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
    ElMessage.error('加载分类列表失败')
  }
}

// 加载商品数据
const loadProductData = async () => {
  if (!productId) {
    ElMessage.error('商品ID不存在')
    router.push('/products')
    return
  }
  
  try {
    loading.value = true
    
    const response = await getProductDetail(productId)
    
    if (response.data) {
      // 填充表单数据
      Object.keys(productForm).forEach(key => {
        if (response.data[key] !== undefined) {
          productForm[key] = response.data[key]
        }
      })
      
      // 确保categoryId是字符串类型
      if (productForm.categoryId) {
        productForm.categoryId = productForm.categoryId.toString()
      }
      
      // 设置图片预览
      if (productForm.image) {
        imageUrl.value = productForm.image
      }
    }
  } catch (error) {
    console.error('加载商品数据失败:', error)
    ElMessage.error('加载商品数据失败')
  } finally {
    loading.value = false
  }
}

// 返回列表页
const goBack = () => {
  router.push('/products')
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    // 转换数据类型
    const submitData = { ...productForm }
    submitData.price = parseFloat(submitData.price)
    submitData.sort = parseInt(submitData.sort)
    
    // 发送请求
    await updateProduct(productId, submitData)
    
    ElMessage.success('商品更新成功')
    
    // 返回列表页
    router.push('/products')
  } catch (error) {
    console.error('商品更新失败:', error)
    ElMessage.error('商品更新失败: ' + (error.message || '未知错误'))
  } finally {
    submitLoading.value = false
  }
}

// 上传前校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理图片上传
const handleImageUpload = async (file) => {
  if (!beforeUpload(file)) {
    return
  }
  
  try {
    uploadLoading.value = true
    
    // 创建表单数据
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)
    
    // 发送上传请求
    const response = await uploadProductImage(formData)
    
    if (response.data && response.data.url) {
      imageUrl.value = response.data.url
      productForm.image = response.data.url
      ElMessage.success('图片上传成功')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    uploadLoading.value = false
  }
}

// 初始加载
onMounted(() => {
  loadCategoryList()
  loadProductData()
})
</script>

<template>
  <div class="product-edit-container" v-loading="loading">
    <!-- 顶部返回栏 -->
    <div class="back-bar">
      <el-button @click="goBack" :icon="ArrowLeft" class="back-button">返回商品列表</el-button>
    </div>
    
    <!-- 编辑表单 -->
    <div class="form-card">
      <div class="card-header">
        <h3>编辑商品</h3>
      </div>
      
      <el-form 
        :model="productForm" 
        :rules="rules" 
        ref="formRef" 
        label-width="100px" 
        class="product-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="productForm.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品分类" prop="categoryId">
              <el-select v-model="productForm.categoryId" placeholder="请选择商品分类" style="width: 100%;">
                <el-option 
                  v-for="category in categoryList" 
                  :key="category.id" 
                  :label="category.name" 
                  :value="category.id+''" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品价格" prop="price">
              <el-input-number 
                v-model="productForm.price" 
                :precision="2" 
                :step="0.1" 
                :min="0" 
                style="width: 100%;" 
                placeholder="请输入商品价格" 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="productForm.sort" :min="0" :step="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品图片">
              <el-upload
                ref="uploadRef"
                class="image-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="file => handleImageUpload(file.raw)"
              >
                <img v-if="imageUrl" :src="imageUrl" class="preview-image" />
                <div v-else class="upload-placeholder">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div class="upload-text">点击上传商品图片</div>
                </div>
                <div v-if="uploadLoading" class="loading-mask">
                  <el-icon class="loading-icon is-loading"><Loading /></el-icon>
                </div>
              </el-upload>
              <div class="upload-tip">建议尺寸: 800px * 800px，不超过2MB</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否推荐">
              <el-switch 
                v-model="productForm.isRecommend" 
                :active-value="1" 
                :inactive-value="0"
                class="status-switch"
              />
            </el-form-item>
            
            <el-form-item label="支持定制">
              <el-switch 
                v-model="productForm.supportCustom" 
                :active-value="1" 
                :inactive-value="0"
                class="status-switch"
              />
            </el-form-item>
            
            <el-form-item label="状态">
              <el-switch 
                v-model="productForm.status" 
                :active-value="1" 
                :inactive-value="0"
                class="status-switch"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="商品描述" prop="description">
          <el-input 
            v-model="productForm.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入商品描述"
          ></el-input>
        </el-form-item>
        
        <el-form-item class="form-buttons">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading" class="submit-button">保存修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.product-edit-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

/* 返回栏 */
.back-bar {
  margin-bottom: 24px;
}

.back-button {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #dcdfe6;
}

.back-button:hover {
  color: #1976d2;
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

/* 表单卡片 */
.form-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  position: relative;
  padding-left: 12px;
}

.card-header h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border-radius: 2px;
}

.product-form {
  padding: 0 20px;
}

/* 图片上传样式 */
.image-uploader {
  width: 100%;
  display: block;
  position: relative;
}

.preview-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.upload-placeholder {
  width: 200px;
  height: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-placeholder:hover {
  border-color: #1976d2;
  color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 200px;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.loading-icon {
  font-size: 30px;
  color: #1976d2;
}

/* 表单按钮 */
.form-buttons {
  margin-top: 40px;
  text-align: center;
}

.submit-button {
  width: 160px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border: none;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transition: all 0.3s;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(25, 118, 210, 0.4);
}

/* 状态开关样式 */
.status-switch {
  margin-right: 20px;
}

/* 修复按钮点击后的黑色边框问题 */
:deep(.el-button) {
  outline: none !important;
}

:deep(.el-button:focus) {
  outline: none !important;
  box-shadow: none;
}

:deep(.el-button:focus-visible) {
  outline: none !important;
}
</style> 