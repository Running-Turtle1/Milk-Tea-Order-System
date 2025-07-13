import { defineStore } from 'pinia'
import { login } from '../../api/admin'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  
  getters: {
    // 是否已登录
    isLogin: (state) => !!state.token,
    // 获取用户信息
    user: (state) => state.userInfo
  },
  
  actions: {
    // 登录
    async login(loginForm) {
      try {
        const res = await login(loginForm)
        
        // 保存token和用户信息
        this.token = res.data.token
        this.userInfo = res.data.user
        
        // 保存到本地存储
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify(res.data.user))
        
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 退出登录
    logout() {
      // 清空store中的状态
      this.token = ''
      this.userInfo = {}
      
      // 清空本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
}) 