<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/modules/user'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.user)

// 控制侧边栏折叠
const isCollapse = ref(false)

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 跳转到修改密码页面
const goToChangePassword = () => {
  router.push('/change-password')
}

// 菜单项配置
const menuItems = [
  {
    icon: 'Odometer',
    title: '首页',
    path: '/dashboard'
  },
  {
    icon: 'User',
    title: '用户管理',
    path: '/users'
  },
  {
    icon: 'ShoppingCart',
    title: '订单管理',
    path: '/orders'
  },
  {
    icon: 'Money',
    title: '退款管理',
    path: '/refunds'
  },
  {
    icon: 'Goods',
    title: '商品管理',
    path: '/products'
  },
  {
    icon: 'Discount',
    title: '优惠券管理',
    path: '/coupons'
  },
  {
    icon: 'Shop',
    title: '店铺管理',
    path: '/shop'
  },
  {
    icon: 'Menu',
    title: '分类管理',
    path: '/categories'
  },
  {
    icon: 'Sugar',
    title: '配料管理',
    path: '/ingredients'
  },
  {
    icon: 'SetUp',
    title: '规格管理',
    path: '/specifications'
  },
  {
    icon: 'Medal',
    title: '会员等级',
    path: '/member-levels'
  },
  {
    icon: 'CreditCard',
    title: '积分规则',
    path: '/point-rules'
  }
]
</script>

<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '80px' : '240px'" class="sidebar">
      <div class="logo-container">
        <h2 v-if="!isCollapse" class="logo-text">奶茶点单系统</h2>
        <el-icon v-else class="logo-icon"><Coffee /></el-icon>
      </div>
      
      <el-menu
        :collapse="isCollapse"
        :default-active="$route.path"
        router
        class="sidebar-menu"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path" class="menu-item">
          <el-icon class="menu-icon"><component :is="item.icon" /></el-icon>
          <template #title>
            <span class="menu-title">{{ item.title }}</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <div class="toggle-button" @click="toggleSidebar">
            <el-icon class="toggle-icon">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </div>
        </div>
        
        <div class="header-right">
          <el-dropdown trigger="click">
            <div class="user-profile">
              <div class="avatar">{{ userInfo.realName?.charAt(0) || 'U' }}</div>
              <span class="username">{{ userInfo.realName }}</span>
              <el-icon class="dropdown-icon"><arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToChangePassword" class="menu-item">
                  <el-icon><Lock /></el-icon>
                  <span>修改密码</span>
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout" class="logout-item">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主要内容区域 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

/* 侧边栏样式 */
.sidebar {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(180deg, #304156 0%, #1f2940 100%);
  overflow: hidden;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  padding: 0 20px;
  overflow: hidden;
  position: relative;
}

.logo-text {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  background: linear-gradient(45deg, #64b5f6, #90caf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.logo-icon {
  font-size: 24px;
  color: #64b5f6;
}

.sidebar-menu {
  height: calc(100% - 60px);
  border-right: none;
  background-color: transparent !important;
}

.menu-item {
  margin: 8px 0;
  height: 50px;
  line-height: 50px;
  border-radius: 0 25px 25px 0;
  margin-right: 20px;
  transition: all 0.3s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.el-menu-item.is-active {
  background: linear-gradient(90deg, #1976d2, #3f92e6) !important;
  color: white !important;
  box-shadow: 0 5px 15px rgba(25, 118, 210, 0.3);
}

.menu-icon {
  margin-right: 5px;
  font-size: 18px;
  transition: all 0.3s;
}

.menu-title {
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
}

/* 顶部导航样式 */
.header {
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 9;
}

.toggle-button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-button:hover {
  background-color: #ecf5ff;
}

.toggle-icon {
  font-size: 18px;
  color: #409EFF;
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 40px;
  transition: all 0.3s;
  background-color: #f5f7fa;
}

.user-profile:hover {
  background-color: #ecf5ff;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42b983, #33a06f);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  margin-right: 10px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-right: 5px;
}

.dropdown-icon {
  color: #909399;
  font-size: 12px;
}

.logout-item {
  display: flex;
  align-items: center;
}

.logout-item .el-icon {
  margin-right: 8px;
  font-size: 16px;
  color: #f56c6c;
}

/* 确保 element-plus 组件样式覆盖 */
:deep(.el-menu) {
  background-color: transparent;
  border-right: none;
}

:deep(.el-menu--collapse) {
  width: 80px;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item.is-active) {
  color: white;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #ecf5ff;
  color: #409EFF;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
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