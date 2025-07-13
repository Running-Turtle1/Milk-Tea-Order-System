<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
const backToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="error-page">
    <div class="error-container">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="backToHome">返回首页</el-button>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7f9;
}

.error-container {
  text-align: center;
}

h1 {
  font-size: 120px;
  margin: 0;
  color: #409eff;
}

h2 {
  font-size: 30px;
  margin: 15px 0;
  color: #333;
}

p {
  font-size: 16px;
  color: #666;
  margin-bottom: 25px;
}
</style> 