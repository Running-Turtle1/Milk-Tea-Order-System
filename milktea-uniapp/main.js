import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import api from './utils/api.js'

Vue.config.productionTip = false
App.mpType = 'app'

// 配置API请求拦截器
api.setRequestInterceptor(options => {
  // 注意：token已在api.js统一添加，这里可以添加其他自定义处理
  console.log('请求拦截器:', options.url);
  return options;
});

// 配置API响应拦截器
api.setResponseInterceptor(res => {
  // 注意：401错误已在api.js中统一处理
  // 这里可以添加其他自定义响应处理
  console.log('响应拦截器:', res.statusCode);
  
  // 处理403错误（禁止访问）
  if (res.statusCode === 403 || (res.data && res.data.code === 403)) {
    uni.showToast({
      title: '没有权限访问该资源',
      icon: 'none'
    });
  }
  
  return res;
});

// 将API注入到Vue原型，方便在组件中使用
Vue.prototype.$api = api;

const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif