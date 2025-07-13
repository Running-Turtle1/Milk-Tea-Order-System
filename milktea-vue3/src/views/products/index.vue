<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getProductList, 
  updateProductStatus, 
  updateProductRecommend, 
  deleteProduct,
  getCategoryList 
} from '../../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh, Delete, Edit, View } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 数据加载状态
const loading = ref(false)

// 商品列表数据
const productList = ref([])
const total = ref(0)

// 分类列表
const categoryList = ref([])
const categoryMap = ref({})

// 搜索条件
const searchForm = reactive({
  keyword: '',
  categoryId: ''
})

// 分页参数
const pageQuery = reactive({
  page: 0,
  size: 10
})

// 表格列配置
const columns = [
  { label: '商品ID', prop: 'id', width: '80px' },
  { label: '商品名称', prop: 'name', minWidth: '160px' },
  { label: '商品图片', prop: 'image', type: 'image', width: '100px' },
  { label: '商品价格', prop: 'price', formatter: formatPrice, width: '100px' },
  { label: '所属分类', prop: 'categoryId', formatter: formatCategory, minWidth: '120px' },
  { label: '排序', prop: 'sort', width: '80px' },
  { label: '是否推荐', prop: 'isRecommend', formatter: formatRecommend, width: '100px' },
  { label: '商品状态', prop: 'status', formatter: formatStatus, width: '100px' }
]

// 加载商品列表数据
const loadProductList = async () => {
  try {
    loading.value = true
    
    // 构建查询参数
    const params = {
      ...searchForm,
      ...pageQuery
    }
    
    // 发送请求
    const response = await getProductList(params)
    console.log('商品列表数据:', response.data)
    
    if (response.data) {
      productList.value = response.data.content || []
      total.value = response.data.totalElements || 0
    }
  } catch (error) {
    console.error('加载商品列表失败:', error)
    ElMessage.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

// 加载分类数据
const loadCategoryList = async () => {
  try {
    const response = await getCategoryList()
    if (response.data) {
      categoryList.value = response.data
      
      // 构建分类映射
      categoryMap.value = {}
      response.data.forEach(item => {
        categoryMap.value[item.id] = item.name
      })
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pageQuery.page = 0 // 重置页码
  loadProductList()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pageQuery.page = 0
  loadProductList()
}

// 分页变化处理
const handlePageChange = (newPage) => {
  pageQuery.page = newPage - 1 // Element Plus分页从1开始，后端从0开始
  loadProductList()
}

// 每页条数变化处理
const handleSizeChange = (newSize) => {
  pageQuery.size = newSize
  pageQuery.page = 0
  loadProductList()
}

// 价格格式化
function formatPrice(row) {
  return row.price ? `¥${row.price.toFixed(2)}` : '¥0.00'
}

// 分类格式化
function formatCategory(row) {
  return categoryMap.value[row.categoryId] || '未分类'
}

// 推荐状态格式化
function formatRecommend(row) {
  return row.isRecommend === 1 ? 
    '<span class="recommend-tag"><i class="el-icon-star-on"></i> 推荐</span>' : 
    '<span class="no-recommend-tag">普通</span>'
}

// 状态格式化
function formatStatus(row) {
  const statusMap = {
    0: { label: '下架', type: 'danger' },
    1: { label: '上架', type: 'success' }
  }
  
  const status = statusMap[row.status] || { label: '未知状态', type: 'info' }
  
  return `<el-tag type="${status.type}" size="small">${status.label}</el-tag>`
}

// 切换商品状态
const toggleProductStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await updateProductStatus(row.id, newStatus)
    
    // 更新本地状态
    row.status = newStatus
    
    ElMessage.success(`商品已${newStatus === 1 ? '上架' : '下架'}`)
  } catch (error) {
    console.error('更新商品状态失败:', error)
    ElMessage.error('更新商品状态失败')
  }
}

// 切换推荐状态
const toggleRecommendStatus = async (row) => {
  try {
    const newRecommend = row.isRecommend === 1 ? 0 : 1
    await updateProductRecommend(row.id, newRecommend)
    
    // 更新本地状态
    row.isRecommend = newRecommend
    
    ElMessage.success(`商品已${newRecommend === 1 ? '设为推荐' : '取消推荐'}`)
  } catch (error) {
    console.error('更新推荐状态失败:', error)
    ElMessage.error('更新推荐状态失败')
  }
}

// 删除商品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该商品吗？删除后不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteProduct(row.id)
    
    ElMessage.success('商品删除成功')
    
    // 重新加载数据
    loadProductList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  }
}

// 编辑商品
const handleEdit = (row) => {
  router.push(`/products/edit/${row.id}`)
}

// 创建商品
const handleCreate = () => {
  router.push('/products/create')
}

// 初始加载
onMounted(() => {
  loadCategoryList()
  loadProductList()
})
</script>

<template>
  <div class="products-container">
    <!-- 标题和搜索区域 -->
    <div class="page-header">
      <div class="page-title">
        <h2>商品管理</h2>
        <p>管理店铺商品，设置商品价格、上下架状态等</p>
      </div>
      
      <div class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.keyword" placeholder="请输入商品名称" clearable />
          </el-form-item>
          <el-form-item label="商品分类">
            <el-select v-model="searchForm.categoryId" placeholder="选择分类" clearable style="width: 180px">
              <el-option 
                v-for="category in categoryList" 
                :key="category.id" 
                :label="category.name" 
                :value="category.id+''" 
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <div class="button-group">
              <el-button type="primary" @click="handleSearch" :icon="Search" class="search-button">
                查询
              </el-button>
              <el-button @click="resetSearch" :icon="Refresh" class="reset-button">
                重置
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 商品列表表格 -->
    <div class="products-table-card">
      <div class="table-header">
        <el-button type="primary" @click="handleCreate" :icon="Plus" class="add-button">
          新增商品
        </el-button>
      </div>
      
      <el-table
        :data="productList"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
        highlight-current-row
        table-layout="fixed"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth || ''"
          :formatter="col.formatter"
          align="center"
        >
          <template #default="scope">
            <template v-if="col.prop === 'status'">
              <el-tag 
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ scope.row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
            
            <template v-else-if="col.prop === 'isRecommend'">
              <el-tag 
                :type="scope.row.isRecommend === 1 ? 'warning' : 'info'"
                size="small"
                effect="plain"
              >
                {{ scope.row.isRecommend === 1 ? '推荐' : '普通' }}
              </el-tag>
            </template>
            
            <template v-else-if="col.type === 'image'">
              <el-image 
                v-if="scope.row.image" 
                :src="scope.row.image"
                style="width: 60px; height: 60px; border-radius: 6px;"
                fit="cover"
                :preview-src-list="[scope.row.image]"
                preview-teleported
              ></el-image>
              <span v-else class="no-image">无图片</span>
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" fixed="right" width="280" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleEdit(scope.row)"
                class="action-button"
              >
                编辑
              </el-button>
              
              <el-button
                :type="scope.row.status === 1 ? 'warning' : 'success'"
                link
                size="small"
                @click="toggleProductStatus(scope.row)"
                class="action-button"
              >
                {{ scope.row.status === 1 ? '下架' : '上架' }}
              </el-button>
              
              <el-button
                :type="scope.row.isRecommend === 1 ? 'info' : 'warning'"
                link
                size="small"
                @click="toggleRecommendStatus(scope.row)"
                class="action-button"
              >
                {{ scope.row.isRecommend === 1 ? '取消推荐' : '设为推荐' }}
              </el-button>
              
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDelete(scope.row)"
                class="action-button"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pageQuery.page + 1"
          :page-size="pageQuery.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          background
          prev-text="上一页"
          next-text="下一页"
          :pager-count="5"
        >
          <template #total>
            共 <strong>{{ total }}</strong> 条数据
          </template>
          <template #sizes="{ handleSizeChange }">
            <span class="el-pagination__sizes">
              每页
              <el-select
                v-model="pageQuery.size"
                @change="val => handleSizeChange(val)"
              >
                <el-option
                  v-for="item in [10, 20, 50, 100]"
                  :key="item"
                  :value="item"
                  :label="`${item}条/页`"
                />
              </el-select>
            </span>
          </template>
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

/* 页面标题区域 */
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

/* 搜索卡片 */
.search-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

/* 按钮样式 */
.button-group {
  display: flex;
  gap: 10px;
}

.search-button {
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border: none;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.search-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.3s;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(25, 118, 210, 0.4);
}

.search-button:hover::after {
  left: 100%;
}

.reset-button {
  border: 1px solid #dcdfe6;
  background: white;
  transition: all 0.3s;
}

.reset-button:hover {
  color: #1976d2;
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.add-button {
  background: linear-gradient(45deg, #67c23a, #95d475);
  border: none;
  box-shadow: 0 4px 10px rgba(103, 194, 58, 0.3);
  transition: all 0.3s;
  margin-bottom: 16px;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(103, 194, 58, 0.4);
}

/* 表格卡片 */
.products-table-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

/* 表格样式 */
:deep(.el-table) {
  width: 100% !important;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  width: 100% !important;
}

:deep(.el-table__body) {
  width: 100% !important;
}

:deep(.el-table--border .el-table__cell) {
  border-right: 1px solid #ebeef5;
}

:deep(.el-table--border::after),
:deep(.el-table--border::before) {
  display: none;
}

.table-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 表格内操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-button {
  position: relative;
  padding: 2px 0;
}

.action-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background-color: currentColor;
  transition: width 0.3s ease;
}

.action-button:hover::after {
  width: 100%;
}

/* 分页容器 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-hover-color: #1976d2;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: #f5f7fa;
}

:deep(.el-pagination .el-pagination__jump) {
  margin-left: 16px;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.3);
}

:deep(.el-select__wrapper) {
  margin: 0 8px;
}

:deep(.el-pagination__total) {
  margin-right: 16px;
}

:deep(.el-pagination__total strong) {
  color: #1976d2;
  font-weight: 600;
  margin: 0 4px;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.2);
}

.no-image {
  color: #909399;
  font-size: 12px;
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