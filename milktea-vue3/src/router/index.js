import { createRouter, createWebHistory } from 'vue-router'
import adminRoutes from './modules/admin'
import Layout from '../layouts/default/index.vue'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/home/index.vue'),
        meta: { title: '首页', requiresAuth: true }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../views/users/index.vue'),
        meta: { title: '用户管理', requiresAuth: true }
      },
      {
        path: 'users/detail/:id',
        name: 'UserDetail',
        component: () => import('../views/users/detail.vue'),
        meta: { title: '用户详情', requiresAuth: true }
      },
      // 分类管理相关路由
      {
        path: 'categories',
        name: 'CategoryList',
        component: () => import('../views/categories/index.vue'),
        meta: { title: '分类管理', icon: 'Menu', requiresAuth: true }
      },
      {
        path: 'categories/create',
        name: 'CategoryCreate',
        component: () => import('../views/categories/edit.vue'),
        meta: { title: '新增分类', activeMenu: '/categories', requiresAuth: true },
        hidden: true
      },
      {
        path: 'categories/edit/:id',
        name: 'CategoryEdit',
        component: () => import('../views/categories/edit.vue'),
        meta: { title: '编辑分类', activeMenu: '/categories', requiresAuth: true },
        props: true,
        hidden: true
      },
      // 配料管理路由
      {
        path: 'ingredients',
        name: 'IngredientList',
        component: () => import('../views/ingredients/index.vue'),
        meta: { title: '配料管理', icon: 'Sugar', requiresAuth: true }
      },
      {
        path: 'ingredients/create',
        name: 'IngredientCreate',
        component: () => import('../views/ingredients/edit.vue'),
        meta: { title: '新增配料', activeMenu: '/ingredients', requiresAuth: true },
        hidden: true
      },
      {
        path: 'ingredients/edit/:id',
        name: 'IngredientEdit',
        component: () => import('../views/ingredients/edit.vue'),
        meta: { title: '编辑配料', activeMenu: '/ingredients', requiresAuth: true },
        props: true,
        hidden: true
      },
      // 规格管理路由
      {
        path: 'specifications',
        name: 'SpecificationList',
        component: () => import('../views/specifications/index.vue'),
        meta: { title: '规格管理', icon: 'SetUp', requiresAuth: true }
      },
      {
        path: 'specifications/create',
        name: 'SpecificationCreate',
        component: () => import('../views/specifications/edit.vue'),
        meta: { title: '新增规格', activeMenu: '/specifications', requiresAuth: true },
        hidden: true
      },
      {
        path: 'specifications/edit/:id',
        name: 'SpecificationEdit',
        component: () => import('../views/specifications/edit.vue'),
        meta: { title: '编辑规格', activeMenu: '/specifications', requiresAuth: true },
        props: true,
        hidden: true
      },
      // 会员等级管理路由
      {
        path: 'member-levels',
        name: 'MemberLevelList',
        component: () => import('../views/member-levels/index.vue'),
        meta: { title: '会员等级', icon: 'Medal', requiresAuth: true }
      },
      {
        path: 'member-levels/create',
        name: 'MemberLevelCreate',
        component: () => import('../views/member-levels/edit.vue'),
        meta: { title: '新增会员等级', activeMenu: '/member-levels', requiresAuth: true },
        hidden: true
      },
      {
        path: 'member-levels/edit/:id',
        name: 'MemberLevelEdit',
        component: () => import('../views/member-levels/edit.vue'),
        meta: { title: '编辑会员等级', activeMenu: '/member-levels', requiresAuth: true },
        props: true,
        hidden: true
      },
      // 积分规则管理路由
      {
        path: 'point-rules',
        name: 'PointRuleList',
        component: () => import('../views/point-rules/index.vue'),
        meta: { title: '积分规则', icon: 'CreditCard', requiresAuth: true }
      },
      {
        path: 'point-rules/create',
        name: 'PointRuleCreate',
        component: () => import('../views/point-rules/edit.vue'),
        meta: { title: '新增积分规则', activeMenu: '/point-rules', requiresAuth: true },
        hidden: true
      },
      {
        path: 'point-rules/edit/:id',
        name: 'PointRuleEdit',
        component: () => import('../views/point-rules/edit.vue'),
        meta: { title: '编辑积分规则', activeMenu: '/point-rules', requiresAuth: true },
        props: true,
        hidden: true
      },
      // 角色管理路由
      {
        path: 'roles',
        name: 'RoleList',
        component: () => import('../views/roles/index.vue'),
        meta: { title: '角色管理', icon: 'Lock', requiresAuth: true }
      },
      {
        path: 'roles/create',
        name: 'RoleCreate',
        component: () => import('../views/roles/edit.vue'),
        meta: { title: '新增角色', activeMenu: '/roles', requiresAuth: true },
        hidden: true
      },
      {
        path: 'roles/edit/:id',
        name: 'RoleEdit',
        component: () => import('../views/roles/edit.vue'),
        meta: { title: '编辑角色', activeMenu: '/roles', requiresAuth: true },
        props: true,
        hidden: true
      },
      // 添加修改密码路由到主布局的子路由中
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: () => import('../views/admin/ChangePassword.vue'),
        meta: { title: '修改密码', requiresAuth: true }
      },
      // 添加订单管理路由
      ...adminRoutes
    ]
  },
  {
    path: '/orders',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('../views/orders/index.vue'),
        meta: { title: '订单管理', requiresAuth: true }
      },
      {
        path: 'detail/:id',
        component: () => import('../views/orders/detail.vue'),
        meta: { title: '订单详情', requiresAuth: true }
      }
    ]
  },
  {
    path: '/refunds',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('../views/refunds/index.vue'),
        meta: { title: '退款管理', requiresAuth: true }
      },
      {
        path: 'detail/:id',
        component: () => import('../views/refunds/detail.vue'),
        meta: { title: '退款详情', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/error/404.vue'),
    meta: { title: '页面不存在', requiresAuth: false }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 奶茶点单系统` : '奶茶点单系统'
  
  // 判断是否需要登录权限
  if (to.meta.requiresAuth) {
    // 获取token
    const token = localStorage.getItem('token')
    if (!token) {
      // 如果没有token，跳转到登录页
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // 验证token是否过期
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = tokenData.exp * 1000 // 转换为毫秒
      
      if (Date.now() >= expirationTime) {
        // token已过期，清除token并跳转到登录页
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
      }
    } catch (error) {
      // token解析失败，清除token并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
    
    next()
  } else {
    next()
  }
})

export default router 