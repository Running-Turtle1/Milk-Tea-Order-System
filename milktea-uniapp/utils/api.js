// api.js - 统一管理API请求

// API基础URL
// http://39.105.25.33:8081/api	localhost:8081/api
const baseUrl = 'http://39.105.25.33:8081/api';

// 获取基础URL - 便于后期可能的环境切换
const getBaseUrl = () => {
  return baseUrl;
};

// 请求拦截器
const interceptors = {
  request: null,
  response: null
};

// 图片URL处理 - 添加时间戳破坏缓存
const processImageUrl = (url) => {
  if (!url) return url;
  // 只处理系统上传图片的URL
  if (url.includes('/api/uploads/')) {
    return url + (url.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
  }
  return url;
};

// 设置请求拦截器
const setRequestInterceptor = (callback) => {
  interceptors.request = callback;
};

// 设置响应拦截器
const setResponseInterceptor = (callback) => {
  interceptors.response = callback;
};

// 统一请求方法
const request = (options) => {
  // 默认配置
  const defaultOptions = {
    url: '',
    method: 'GET',
    data: {},
    header: {
      'content-type': 'application/json'
    }
  };

  // 合并配置
  let mergedOptions = {
    ...defaultOptions,
    ...options
  };

  // 处理URL
  if (!mergedOptions.url.startsWith('http')) {
    mergedOptions.url = `${baseUrl}${mergedOptions.url.startsWith('/') ? '' : '/'}${mergedOptions.url}`;
  }

  // 添加token到请求头
  const token = uni.getStorageSync('token');
  if (token) {
    // 检查token是否过期
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expTime = tokenPayload.exp * 1000; // 转换为毫秒
      const currentTime = new Date().getTime();
      
      // 如果token已过期或即将过期（5分钟内）
      if (currentTime >= expTime - 300000) {
        console.log('Token已过期或即将过期，跳转到登录页面');
        
        // 清除token
        uni.removeStorageSync('token');
        
        // 显示提示
        uni.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none',
          duration: 2000
        });
        
        // 延迟跳转到登录页
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }, 1500);
        
        // 终止请求
        throw new Error('Token expired');
      }
      
      // token有效，添加到请求头
    mergedOptions.header = {
      ...mergedOptions.header,
      'Authorization': `Bearer ${token}`
    };
    } catch (e) {
      console.error('Token解析错误:', e);
      
      // 解析错误也视为token无效，清除并跳转登录
      if (e.message !== 'Token expired') {
        uni.removeStorageSync('token');
      }
    }
  }

  // 请求拦截
  if (interceptors.request) {
    const interceptedOptions = interceptors.request(mergedOptions);
    if (interceptedOptions) {
      mergedOptions = interceptedOptions;
    }
  }

  // 发起请求
  return new Promise((resolve, reject) => {
    uni.request({
      ...mergedOptions,
      success: (res) => {
        // 检测HTML响应 - 通常表示被重定向到登录页面
        if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
          console.error('收到HTML响应而非JSON数据，可能是认证问题');
          
          // 清除可能已失效的token
          uni.removeStorageSync('token');
          
          // 创建一个模拟的401响应
          const authErrorResponse = {
            ...res,
            statusCode: 401,
            data: {
              code: 401,
              message: '请先登录或登录已过期'
            }
          };
          
          // 显示提示
          uni.showToast({
            title: '请先登录或登录已过期',
            icon: 'none',
            duration: 2000
          });
          
          // 延迟跳转到登录页
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/login/login'
            });
          }, 1500);
          
          resolve(authErrorResponse);
          return;
        }
        
        // 处理401错误（未授权）
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          // 清除token
          uni.removeStorageSync('token');
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/login/login'
            });
          }, 1500);
        }
        
        // 响应拦截
        if (interceptors.response) {
          const interceptedRes = interceptors.response(res);
          if (interceptedRes) {
            resolve(interceptedRes);
            return;
          }
        }
        resolve(res);
      },
      fail: (err) => {
        console.error('请求失败:', err);
        reject(err);
      }
    });
  });
};

// API方法
const api = {
  // 获取门店信息
  getShopInfo: () => {
    return request({
      url: '/shop/info',
      method: 'GET'
    });
  },

  // 商品分类
  getCategories: () => {
    return request({
      url: '/product/categories',
      method: 'GET'
    });
  },
  
  // 获取分类商品
  getCategoryProducts: (categoryId, page, size) => {
    return request({
      url: '/product/list',
      method: 'GET',
      data: {
        categoryId,
        page,
        size
      }
    });
  },
  
  // 获取推荐商品
  getRecommendProducts: () => {
    return request({
      url: '/product/recommend',
      method: 'GET'
    });
  },
  
  // 获取商品详情
  getProductDetail: (productId) => {
    return request({
      url: `/product/detail/${productId}`,
      method: 'GET'
    });
  },
  
  // 获取配料列表
  getIngredients: () => {
    return request({
      url: '/ingredient/list',
      method: 'GET'
    });
  },
  
  // 登录
  login: (username, password) => {
    return request({
      url: '/user/login',
      method: 'POST',
      data: {
        username,
        password
      }
    });
  },
  
  // 注册
  register: (userData) => {
    return request({
      url: '/user/register',
      method: 'POST',
      data: userData
    });
  },
  
  // 获取用户信息
  getUserInfo: () => {
    return request({
      url: '/user/profile',
      method: 'GET'
    });
  },
  
  // 更新用户信息
  updateUserInfo: (userInfo) => {
    return request({
      url: '/user/update',
      method: 'POST',
      data: userInfo
    });
  },
  
  // 上传头像
  uploadAvatar: (filePath) => {
    return new Promise((resolve, reject) => {
      // 获取token
      const token = uni.getStorageSync('token');
      
      uni.uploadFile({
        url: `${baseUrl}/files/avatar`,
        filePath: filePath,
        name: 'file',
        header: token ? { 'Authorization': `Bearer ${token}` } : {},
        success: (res) => {
          if (typeof res.data === 'string') {
            try {
              const data = JSON.parse(res.data);
              resolve(data);
            } catch (e) {
              resolve(res.data);
            }
          } else {
            resolve(res.data);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },
  
  // 提交订单
  createOrder: (orderData) => {
    return request({
      url: '/order/create',
      method: 'POST',
      data: orderData
    });
  },
  
  // 获取订单列表
  getOrders: (status, page, size) => {
    // 创建请求数据对象
    const requestData = {
      page,
      size
    };
    
    // 只有当status不是null或undefined时才添加到请求数据
    if (status !== null && status !== undefined) {
      requestData.status = status;
    }
    
    return request({
      url: '/order/list',
      method: 'GET',
      data: requestData
    });
  },
  
  // 获取订单详情
  getOrderDetail: (orderNo) => {
    return request({
      url: `/order/detail/${orderNo}`,
      method: 'GET'
    });
  },
  
  // 取消订单
  cancelOrder: (orderNo) => {
    return request({
      url: `/order/cancel/${orderNo}`,
      method: 'POST'
    });
  },
  
  // 支付订单
  payOrder: (orderNo, paymentMethod) => {
    console.log('API开始调用支付接口，支付方式:', paymentMethod, '订单号:', orderNo);
    return request({
      url: `/order/pay/${orderNo}?paymentMethod=${paymentMethod}`,
      method: 'POST',
      data: {}
    });
  },
  
  // 获取积分记录
  getPointsRecords: (page, size) => {
    return request({
      url: '/user/points/records',
      method: 'GET',
      data: {
        page,
        size
      }
    });
  },
  
  // 获取优惠券列表
  getCoupons: (status) => {
    return request({
      url: '/user/coupons',
      method: 'GET',
      data: {
        status
      }
    });
  },
  
  // 兑换优惠券
  exchangeCoupon: (code) => {
    return request({
      url: '/user/exchange-coupon',
      method: 'POST',
      data: {
        code
      }
    });
  },
  
  // 刷新优惠券状态
  refreshCoupons: () => {
    return request({
      url: '/user/coupons',
      method: 'GET'
    });
  },
  
  // 获取购物车信息
  getCart: () => {
    return request({
      url: '/cart',
      method: 'GET'
    });
  },
  
  // 清空已选择的购物车商品
  clearSelectedCartItems: () => {
    return request({
      url: '/cart/selected',
      method: 'DELETE'
    });
  },
  
  // 验证购物车库存
  verifyCartStock: () => {
    return request({
      url: '/cart/verify-stock',
      method: 'GET'
    });
  },
  
  // 删除订单
  deleteOrder: (orderNo) => {
    return request({
      url: `/order/${orderNo}`,
      method: 'DELETE'
    });
  },
  
  // 申请退款
  applyRefund: (refundData) => {
    return request({
      url: '/refund/apply',
      method: 'POST',
      data: refundData
    });
  },
  
  // 获取会员信息
  getMemberInfo: () => {
    return request({
      url: '/member/info',
      method: 'GET'
    });
  }
};

export default {
  baseUrl,
  getBaseUrl,
  request,
  processImageUrl,
  setRequestInterceptor,
  setResponseInterceptor,
  ...api
}; 