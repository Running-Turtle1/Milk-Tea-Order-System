<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryList, deleteCategory, updateCategoryStatus } from '../../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit, Search, Refresh, Check, Close } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 加载状态
const loading = ref(false)

// 分类列表数据
const categoryList = ref([])

// 分页参数
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

// 搜索参数
const searchForm = ref({
  keyword: '',
  status: ''
})

// 筛选后的分类列表
const filteredCategoryList = computed(() => {
  let result = [...categoryList.value]
  
  // 关键词筛选
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword)
    )
  }
  
  // 状态筛选
  if (searchForm.value.status !== '') {
    result = result.filter(item => 
      item.status === parseInt(searchForm.value.status)
    )
  }
  
  return result
})

// 加载分类列表
const loadCategoryList = async () => {
  try {
    loading.value = true
    
    const params = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size
    }
    
    console.log('发送分类列表请求:', params)
    const response = await getCategoryList(params)
    console.log('分类列表响应:', response.data)
    
    if (response.data) {
      // 处理可能的不同数据结构
      if (Array.isArray(response.data)) {
        categoryList.value = response.data
        pagination.value.total = response.data.length
      } else if (response.data.list) {
        categoryList.value = response.data.list
        pagination.value.total = response.data.total || 0
      } else if (response.data.records) {
        categoryList.value = response.data.records
        pagination.value.total = response.data.total || 0
      }
      
      // 检查数据中的ID字段
      if (categoryList.value.length > 0) {
        const firstItem = categoryList.value[0]
        console.log('分类数据示例:', firstItem)
        console.log('ID字段检查:', {
          id: firstItem.id,
          categoryId: firstItem.categoryId,
          cid: firstItem.cid
        })
      }
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
    ElMessage.error('加载分类列表失败')
  } finally {
    loading.value = false
  }
}

// 跳转到新增分类页面
const goToAddCategory = () => {
  router.push('/categories/create')
}

// 获取分类的ID
const getCategoryId = (row) => {
  return row.id || row.categoryId || row.cid || null;
}

// 跳转到编辑分类页面
const goToEditCategory = (row) => {
  const id = getCategoryId(row);
  if (!id) {
    console.error('分类ID不存在', row);
    ElMessage.error('无法编辑: 无效的分类ID');
    return;
  }
  router.push(`/categories/edit/${id}`);
}

// 返回首页
const goToList = () => {
  router.push('/categories')
}

// 切换分类状态
const toggleCategoryStatus = async (row) => {
  try {
    // 获取ID
    const id = getCategoryId(row);
    if (!id) {
      ElMessage.error('无法更新状态: 无效的分类ID');
      return;
    }
    
    // 切换状态值
    const newStatus = row.status === 1 ? 0 : 1;
    
    // 打印请求信息以便调试
    console.log(`更新分类状态: ID=${id}, 新状态=${newStatus}`);
    
    await updateCategoryStatus(id, { status: newStatus });
    
    // 更新本地数据
    row.status = newStatus;
    
    ElMessage.success(`分类已${newStatus === 1 ? '启用' : '禁用'}`);
  } catch (error) {
    console.error('更新分类状态失败:', error);
    ElMessage.error('更新分类状态失败');
    // 失败时恢复原状态
    row.status = row.status === 1 ? 0 : 1;
  }
}

// 删除分类
const handleDeleteCategory = (row) => {
  const id = getCategoryId(row);
  if (!id) {
    ElMessage.error('无法删除: 无效的分类ID');
    return;
  }

  ElMessageBox.confirm(
    '确定要删除该分类吗？删除后将无法恢复。',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await deleteCategory(id);
        
        ElMessage.success('分类删除成功');
        
        // 重新加载列表
        loadCategoryList();
      } catch (error) {
        console.error('删除分类失败:', error);
        ElMessage.error('删除分类失败');
      }
    })
    .catch(() => {
      // 用户取消删除操作
    });
}

// 处理页面变化
const handlePageChange = (newPage) => {
  pagination.value.page = newPage
  loadCategoryList()
}

// 处理每页条数变化
const handleSizeChange = (newSize) => {
  pagination.value.size = newSize
  pagination.value.page = 1
  loadCategoryList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value.keyword = ''
  searchForm.value.status = ''
}

// 使用特定ID和状态强制更新
const forceCategoryStatus = async (row, targetStatus) => {
  try {
    // 确保有有效的ID
    const id = getCategoryId(row);
    if (!id) {
      ElMessage.error('无法更新状态: 无效的分类ID');
      return;
    }
    
    // 打印请求信息以便调试
    console.log(`强制更新分类状态: ID=${id}, 目标状态=${targetStatus}`);
    
    // 发送请求
    const url = `/admin/category/${id}/status?status=${targetStatus}`;
    console.log('请求URL:', url);
    
    // 使用原生fetch调用API
    const token = localStorage.getItem('token');
    const baseURL = 'http://localhost:3000/api'; // 确保与你的项目一致
    
    const response = await fetch(`${baseURL}${url}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      // 更新本地数据
      row.status = targetStatus;
      ElMessage.success(`分类已${targetStatus === 1 ? '启用' : '禁用'}`);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || '操作失败');
    }
  } catch (error) {
    console.error('更新分类状态失败:', error);
    ElMessage.error(error.message || '更新分类状态失败');
  }
}

// 初始加载
onMounted(() => {
  loadCategoryList()
})
</script>

<template>
  <div class="category-container">
    <div class="page-header">
      <h2>分类管理</h2>
      <p>管理店铺商品分类，可以添加、编辑和删除分类</p>
    </div>
    
    <div class="control-panel">
      <div class="search-section">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索分类名称"
          clearable
          prefix-icon="Search"
          class="search-input"
        />
        
        <el-select 
          v-model="searchForm.status" 
          placeholder="分类状态" 
          clearable 
          class="status-select"
        >
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
        
        <el-button @click="resetSearch" class="reset-btn">
          <el-icon><Refresh /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
      
      <div class="action-section">
        <el-button type="primary" @click="goToAddCategory" class="add-btn">
          <el-icon><Plus /></el-icon>
          <span>新增分类</span>
        </el-button>
      </div>
    </div>
    
    <div class="category-table-wrapper">
      <el-table
        :data="filteredCategoryList"
        border
        stripe
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{
          background: '#f5f7fa',
          color: '#606266',
          fontWeight: 'bold'
        }"
        :row-style="{ cursor: 'pointer' }"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        
        <el-table-column prop="name" label="分类名称" min-width="180">
          <template #default="{ row }">
            <div class="category-info">
              <div class="category-image">
                <img v-if="row.image" :src="row.image" alt="分类图片" />
                <div v-else class="no-image">无图片</div>
              </div>
              <span class="category-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="sort" label="排序" width="100" align="center">
          <template #default="{ row }">
            <span class="sort-value">{{ row.sort || row.orderNum || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'info'"
              effect="plain"
              size="small"
              class="status-tag"
            >
              {{ row.status === 1 ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            <span>{{ row.createdAt || row.createTime || row.createDate || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              size="small"
              @click="forceCategoryStatus(row, row.status === 1 ? 0 : 1)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="goToEditCategory(row)"
            >
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            
            <el-button
              type="danger"
              link
              size="small"
              @click.stop="handleDeleteCategory(row)"
            >
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          background
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

/* 页面头部 */
.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #303133;
  position: relative;
  padding-left: 16px;
}

.page-header h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border-radius: 2px;
}

.page-header p {
  color: #909399;
  font-size: 14px;
  margin: 0;
  padding-left: 16px;
}

/* 控制面板 */
.control-panel {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.search-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.search-input {
  width: 240px;
}

.status-select {
  width: 140px;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.action-section {
  display: flex;
  gap: 12px;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  border: none;
  padding: 10px 18px;
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transition: all 0.3s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(25, 118, 210, 0.4);
}

/* 表格区域 */
.category-table-wrapper {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f5f7fa;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #909399;
  font-size: 12px;
}

.category-name {
  font-weight: 500;
}

.sort-value {
  font-family: 'Courier New', monospace;
  background-color: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  color: #606266;
}

.status-tag {
  width: 60px;
  text-align: center;
}

/* 操作按钮间距 */
.el-button + .el-button {
  margin-left: 8px;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    width: 100%;
  }
  
  .search-input, 
  .status-select {
    width: 100%;
  }
  
  .action-section {
    width: 100%;
  }
  
  .add-btn {
    width: 100%;
  }
}
</style> 