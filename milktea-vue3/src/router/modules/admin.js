export default [
  // 订单管理
  {
    path: 'orders',
    component: () => import('../../views/orders/index.vue'),
    name: 'OrderList',
    meta: {
      title: '订单管理',
      icon: 'ShoppingCart',
      roles: ['admin'],
      keepAlive: true
    }
  },
  {
    path: 'orders/detail/:id',
    component: () => import('../../views/orders/detail.vue'),
    name: 'OrderDetail',
    meta: {
      title: '订单详情',
      roles: ['admin'],
      activeMenu: '/orders',
      hidden: true
    }
  },
  
  // 商品管理
  {
    path: 'products',
    component: () => import('../../views/products/index.vue'),
    name: 'ProductList',
    meta: {
      title: '商品管理',
      icon: 'Coffee',
      roles: ['admin'],
      keepAlive: true
    }
  },
  {
    path: 'products/edit/:id',
    component: () => import('../../views/products/edit.vue'),
    name: 'ProductEdit',
    meta: {
      title: '编辑商品',
      roles: ['admin'],
      activeMenu: '/products',
      hidden: true
    }
  },
  {
    path: 'products/create',
    component: () => import('../../views/products/create.vue'),
    name: 'ProductCreate',
    meta: {
      title: '新增商品',
      roles: ['admin'],
      activeMenu: '/products',
      hidden: true
    }
  },
  
  // 优惠券管理
  {
    path: 'coupons',
    component: () => import('../../views/coupons/index.vue'),
    name: 'CouponList',
    meta: {
      title: '优惠券管理',
      icon: 'Ticket',
      roles: ['admin'],
      keepAlive: true
    }
  },
  {
    path: 'coupons/edit/:id',
    component: () => import('../../views/coupons/edit.vue'),
    name: 'CouponEdit',
    meta: {
      title: '编辑优惠券',
      roles: ['admin'],
      activeMenu: '/coupons',
      hidden: true
    }
  },
  {
    path: 'coupons/create',
    component: () => import('../../views/coupons/create.vue'),
    name: 'CouponCreate',
    meta: {
      title: '新增优惠券',
      roles: ['admin'],
      activeMenu: '/coupons',
      hidden: true
    }
  },
  {
    path: 'coupons/issue',
    component: () => import('../../views/coupons/issue.vue'),
    name: 'CouponIssue',
    meta: {
      title: '发放优惠券',
      roles: ['admin'],
      activeMenu: '/coupons',
      hidden: true
    }
  },
  
  // 店铺管理
  {
    path: 'shop',
    component: () => import('../../views/shop/index.vue'),
    name: 'ShopManage',
    meta: {
      title: '店铺管理',
      icon: 'Shop',
      roles: ['admin'],
      keepAlive: true
    }
  }
] 