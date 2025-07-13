import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 使用代理
  timeout: 10000 // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从本地存储获取token
    const token = localStorage.getItem('token')
    // 如果有token，在请求头中添加token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}` 
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    // 如果状态码不是200，则表示请求失败
    if (res.code !== 200) {
      console.log('返回的完整响应:', res) // 添加更详细的日志
      
      // 如果状态码是401，表示token过期或无效，跳转到登录页
      if (res.code === 401) {
        // 清除本地存储的token和用户信息
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        
        // 获取当前路由
        const currentPath = router.currentRoute.value.fullPath
        
        // 如果当前不在登录页，则跳转到登录页
        if (currentPath !== '/login') {
          router.push({
            path: '/login',
            query: { redirect: currentPath }
          })
        }
      }
      
      // 显示错误消息
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  error => {
    console.error('请求错误详情:', error.response || error) // 添加更详细的错误日志
    
    // 处理网络错误
    if (!error.response) {
      ElMessage.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }
    
    // 处理401错误
    if (error.response.status === 401) {
      // 清除本地存储的token和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      // 获取当前路由
      const currentPath = router.currentRoute.value.fullPath
      
      // 如果当前不在登录页，则跳转到登录页
      if (currentPath !== '/login') {
        router.push({
          path: '/login',
          query: { redirect: currentPath }
        })
      }
    } else {
      // 显示服务器返回的错误消息
      const errorMessage = error.response?.data?.message || error.message || '网络错误'
      ElMessage.error(errorMessage)
    }
    
    return Promise.reject(error)
  }
)

export default request 