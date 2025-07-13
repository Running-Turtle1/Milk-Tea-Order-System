<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/modules/user'

// 获取用户store
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6个字符', trigger: 'blur' }
  ]
}

// 表单引用
const loginFormRef = ref(null)
// 登录加载状态
const loading = ref(false)

// 登录方法
const handleLogin = async () => {
  try {
    // 表单验证
    await loginFormRef.value.validate()
    
    // 设置加载状态
    loading.value = true
    
    // 调用登录接口
    await userStore.login(loginForm)
    
    // 登录成功提示
    ElMessage.success('登录成功')
    
    // 获取重定向地址，如果没有则跳转到首页
    const redirectPath = route.query.redirect || '/dashboard'
    router.push(redirectPath)
  } catch (error) {
    console.error('登录失败:', error)
    // 显示错误提示
    ElMessage.error(error.response?.data?.message || error.message || '登录失败，请检查用户名和密码')
  } finally {
    // 重置加载状态
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-bubble"></div>
    <div class="login-bubble"></div>
    <div class="login-bubble"></div>
    
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <span class="logo-icon">🧋</span>
        </div>
        <h2>奶茶点单管理系统</h2>
        <p>欢迎回来，请登录您的账户</p>
      </div>
      
      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <div class="form-field">
          <label>用户名</label>
          <div class="input-container">
            <el-icon><User /></el-icon>
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入用户名" 
              class="custom-input"
            />
          </div>
        </div>
        
        <div class="form-field">
          <label>密码</label>
          <div class="input-container">
            <el-icon><Lock /></el-icon>
            <el-input 
              v-model="loginForm.password"
              type="password" 
              placeholder="请输入密码"
              class="custom-input"
              show-password
            />
          </div>
        </div>
        
        <button 
          class="login-button" 
          @click="handleLogin"
          :disabled="loading"
        >
          <span class="button-text" v-if="!loading">登 录</span>
          <span class="loader" v-else></span>
        </button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #8e44ad, #3498db);
  position: relative;
  overflow: hidden;
}

.login-bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  z-index: 0;
}

.login-bubble:nth-child(1) {
  width: 300px;
  height: 300px;
  bottom: -100px;
  right: 10%;
  animation: float 8s ease-in-out infinite;
}

.login-bubble:nth-child(2) {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 15%;
  animation: float 6s ease-in-out infinite 1s;
}

.login-bubble:nth-child(3) {
  width: 150px;
  height: 150px;
  top: 40%;
  right: 15%;
  animation: float 7s ease-in-out infinite 2s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.login-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-logo {
  margin: 0 auto 15px;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #9b59b6, #3498db);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 36px;
}

.login-header h2 {
  color: #333;
  font-size: 28px;
  margin: 0 0 10px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-field {
  margin-bottom: 24px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  text-align: left;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-container .el-icon {
  position: absolute;
  left: 12px;
  color: #9b59b6;
  font-size: 18px;
  z-index: 2;
}

.custom-input :deep(.el-input__wrapper) {
  padding-left: 40px;
  height: 50px;
  border-radius: 10px;
  background: #f5f7fa;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper):hover {
  border-color: #9b59b6;
  box-shadow: 0 0 0 1px rgba(155, 89, 182, 0.1);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #9b59b6;
  box-shadow: 0 0 0 3px rgba(155, 89, 182, 0.2);
}

.login-button {
  height: 50px;
  margin-top: 15px;
  background: linear-gradient(135deg, #9b59b6, #3498db);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.2), rgba(255,255,255,0));
  transform: translateX(-100%);
}

.login-button:hover:not(:disabled)::before {
  animation: shine 1.5s infinite;
}

.login-button:hover:not(:disabled) {
  box-shadow: 0 7px 15px rgba(155, 89, 182, 0.4);
  transform: translateY(-2px);
}

.login-button:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 5px 10px rgba(155, 89, 182, 0.4);
}

.login-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.button-text {
  position: relative;
  z-index: 1;
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  60%, 100% {
    transform: translateX(100%);
  }
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid transparent;
  border-bottom-color: white;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 30px 20px;
  }
}
</style> 