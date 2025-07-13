<script setup>
import { ref, onMounted, reactive, computed, watch, nextTick } from 'vue'
import { getTodayOrderStats, getMemberStats, getDateRangeOrderStats, getIncomeStats, getOrderList, getProductSalesRanking, getUserList } from '../../../api/admin'
import * as echarts from 'echarts'

// 统计数据
const orderStats = ref({})
const memberStats = ref({})
const loading = ref(true)
const chartLoading = ref(true)

// 收入数据
const todayIncome = ref(0)

// 已支付订单数据
const paidOrders = ref([])

// 商品销量数据
const productSales = ref([])

// 用户数据
const userList = ref([])
const userGrowthStats = reactive({
  todayNew: 0,
  weekNew: 0,
  monthNew: 0,
  normalUsers: 0,
  silverUsers: 0,
  goldUsers: 0
})

// 获取今日日期
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 加载已支付订单
const loadPaidOrders = async () => {
  try {
    loading.value = true
    
    // 获取已支付状态的订单
    const response = await getOrderList({ status: 1, page: 0, size: 999 })
    
    paidOrders.value = response?.data?.content || []
  } catch (error) {
    console.error('加载已支付订单失败:', error)
  } finally {
    loading.value = false
  }
}

// 时间范围
const dateRange = reactive({
  startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0]
})

// 收入统计时间范围
const incomeTimeRange = ref('7') // 默认显示近7天
const timeRangeOptions = [
  { label: '近7天', value: '7' },
  { label: '近15天', value: '15' },
  { label: '近30天', value: '30' }
]

// 图表引用
const memberChartRef = ref(null)
const incomeChartRef = ref(null)
const salesChartRef = ref(null)
let memberChart = null
let incomeChart = null
let salesChart = null

// 收入统计数据
const incomeStats = ref({})

// 加载商品销量排行数据
const loadProductSales = async () => {
  try {
    const response = await getProductSalesRanking()
    console.log('商品销量排行数据:', response.data)
    productSales.value = response.data || []
  } catch (error) {
    console.error('加载商品销量排行失败:', error)
  }
}

// 加载用户列表数据
const loadUserList = async () => {
  try {
    const response = await getUserList({ page: 0, size: 999 }) // 获取尽可能多的用户
    console.log('用户列表数据:', response.data)
    
    if (response.data && response.data.content) {
      userList.value = response.data.content
      
      // 计算各种用户统计指标
      calculateUserGrowthStats()
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

// 计算用户增长统计数据
const calculateUserGrowthStats = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay()) // 获取本周开始日期（周日为一周开始）
  
  const monthStart = new Date(today)
  monthStart.setDate(1) // 获取本月开始日期
  
  let todayNewCount = 0
  let weekNewCount = 0
  let monthNewCount = 0
  let normalCount = 0
  let silverCount = 0
  let goldCount = 0
  
  userList.value.forEach(user => {
    // 解析用户创建时间
    const createdDate = new Date(user.createdAt)
    
    // 统计今日新增
    if (createdDate >= today) {
      todayNewCount++
    }
    
    // 统计本周新增
    if (createdDate >= weekStart) {
      weekNewCount++
    }
    
    // 统计本月新增
    if (createdDate >= monthStart) {
      monthNewCount++
    }
    
    // 统计会员等级分布
    if (user.memberLevel === 0) {
      normalCount++
    } else if (user.memberLevel === 1) {
      silverCount++
    } else if (user.memberLevel === 2) {
      goldCount++
    }
  })
  
  // 更新统计数据
  userGrowthStats.todayNew = todayNewCount
  userGrowthStats.weekNew = weekNewCount
  userGrowthStats.monthNew = monthNewCount
  userGrowthStats.normalUsers = normalCount
  userGrowthStats.silverUsers = silverCount
  userGrowthStats.goldUsers = goldCount
}

// 加载统计数据
const loadStats = async () => {
  try {
    loading.value = true
    
    // 请求统计数据和今日收入数据
    const [orderRes, memberRes, todayIncomeRes] = await Promise.all([
      getTodayOrderStats(),
      getMemberStats(),
      getIncomeStats({
        startDate: getTodayDate(),
        endDate: getTodayDate()
      })
    ])
    
    // 输出日志检查API返回
    console.log('今日订单统计数据:', orderRes.data)
    console.log('今日收入数据:', todayIncomeRes.data)
    
    // 设置数据
    orderStats.value = orderRes.data
    memberStats.value = memberRes.data
    
    // 从今日收入数据中提取收入金额
    if (todayIncomeRes.data && todayIncomeRes.data.dailyIncome) {
      const today = getTodayDate()
      todayIncome.value = todayIncomeRes.data.dailyIncome[today] || 0
    }
    
    // 加载已支付订单
    await loadPaidOrders()
    
    // 加载商品销量排行
    await loadProductSales()
    
    // 加载用户列表数据
    await loadUserList()
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载图表数据
const loadChartData = async () => {
  try {
    chartLoading.value = true
    
    // 根据选择的时间范围计算开始日期
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = getDateBefore(parseInt(incomeTimeRange.value))
    
    // 调用真实的API获取数据
    const [rangeOrderStats, incomeData] = await Promise.all([
      getDateRangeOrderStats({
        startDate,
        endDate
      }),
      getIncomeStats({
        startDate,
        endDate
      })
    ])
    
    // 设置收入统计数据
    incomeStats.value = incomeData.data
    
    // 初始化图表
    initCharts()
  } catch (error) {
    console.error('加载图表数据失败:', error)
  } finally {
    chartLoading.value = false
  }
}

// 获取指定天数前的日期
const getDateBefore = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

// 处理时间范围变化
const handleTimeRangeChange = (value) => {
  incomeTimeRange.value = value
  loadChartData()
}

// 初始化图表
const initCharts = () => {
  if (memberChartRef.value) {
    memberChart = echarts.init(memberChartRef.value)
    renderMemberChart()
  }
  
  if (incomeChartRef.value) {
    incomeChart = echarts.init(incomeChartRef.value)
    renderIncomeChart()
  }
}

// 渲染会员分布饼图
const renderMemberChart = () => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>数量: {c}<br/>占比: {d}%',
      textStyle: {
        fontSize: 14,
        color: '#ffffff'
      },
      padding: 10,
      backgroundColor: 'rgba(50,50,50,0.8)',
      borderColor: 'rgba(70,70,70,0.9)',
      borderWidth: 1,
      extraCssText: 'box-shadow: 0 3px 6px rgba(0,0,0,0.2)'
    },
    legend: {
      bottom: '10px',
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: '#666',
        fontSize: 14
      }
    },
    series: [
      {
        name: '会员分布',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          color: '#ffffff'
        },
        emphasis: {
          label: {
            show: true,
            fontWeight: 'bold',
            formatter: '{b}: {c} ({d}%)',
            color: '#ffffff',
            textStyle: {
              color: '#ffffff'
            }
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: memberStats.value.normalUsers || 0, name: '普通会员', itemStyle: { color: '#409EFF' } },
          { value: memberStats.value.silverUsers || 0, name: '银卡会员', itemStyle: { color: '#67C23A' } },
          { value: memberStats.value.goldUsers || 0, name: '金卡会员', itemStyle: { color: '#E6A23C' } },
          { value: memberStats.value.blackUsers || 0, name: '黑卡会员', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }
  
  memberChart.setOption(option)
}

// 渲染收入趋势图
const renderIncomeChart = () => {
  // 从API获取的数据
  const dates = Object.keys(incomeStats.value.dailyIncome || {}).sort()
  const incomeData = dates.map(date => incomeStats.value.dailyIncome[date])
  
  // 计算最大值和平均值
  const maxValue = Math.max(...incomeData, 0)
  const avgValue = incomeData.length ? 
    incomeData.reduce((sum, val) => sum + val, 0) / incomeData.length :
    0
  
  const option = {
    backgroundColor: '#ffffff',
    title: {
      text: '收入趋势',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#606266'
      },
      left: 'center',
      top: 5
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      formatter: function(params) {
        const data = params[0];
        return `${dates[data.dataIndex]}<br/>
                <span style="display:inline-block;margin-right:4px;border-radius:50%;width:10px;height:10px;background-color:${data.color};"></span>
                收入：¥${data.value.toFixed(2)}`;
      }
    },
    grid: {
      left: '3%',
      right: '10%', // 增加右侧边距，确保平均值标签有足够空间
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates.map(date => date.substring(5)), // 只显示月-日
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#eee'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#999',
        fontSize: 12,
        formatter: function(value) {
          return value;
        },
        rotate: dates.length > 15 ? 45 : 0
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#999',
        fontSize: 12,
        formatter: function(value) {
          if (value >= 1000) {
            return '¥' + (value / 1000).toFixed(1) + 'k';
          }
          return '¥' + value;
        }
      },
      splitLine: {
        lineStyle: {
          color: '#eee',
          type: 'dashed'
        }
      }
    },
    visualMap: {
      show: false,
      pieces: [{
        gt: avgValue,
        lte: maxValue,
        color: '#26C6DA'
      }, {
        gte: 0,
        lte: avgValue,
        color: '#64B5F6'
      }],
      dimension: 0
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 8,
        showSymbol: false,
        hoverAnimation: true,
        lineStyle: {
          width: 3
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 3,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          lineStyle: {
            color: '#FF9800',
            type: 'dashed',
            width: 1.5
          },
          label: {
            position: 'end',
            formatter: '均值: ¥{c}', // 使用简短的表示
            fontSize: 12,
            color: '#FF9800',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: [2, 4],
            borderRadius: 2
          },
          data: [
            {
              type: 'average',
              name: '平均值'
            }
          ]
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(38, 198, 218, 0.8)'
            },
            {
              offset: 0.5,
              color: 'rgba(38, 198, 218, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(38, 198, 218, 0.1)'
            }
          ])
        },
        data: incomeData
      }
    ],
    animationEasing: 'elasticOut',
    animationDelayUpdate: function(idx) {
      return idx * 5;
    }
  };
  
  incomeChart.setOption(option);
}

// 渲染商品销量柱状图
const renderProductSalesChart = () => {
  // 等待DOM渲染完成后再初始化图表
  nextTick(() => {
    console.log('尝试渲染商品销量图表', {
      refExists: !!salesChartRef.value,
      dataLength: productSales.value ? productSales.value.length : 0,
      loading: loading.value
    })
    
    // 检查ref引用
    if (!salesChartRef.value) {
      console.warn('商品销量图表DOM元素不存在')
      return
    }
    
    // 确保有数据
    if (!productSales.value || productSales.value.length === 0) {
      console.warn('商品销量数据为空')
      return
    }
    
    try {
      // 清理旧的图表实例
      if (salesChart) {
        salesChart.dispose()
      }
      
      // 初始化图表
      salesChart = echarts.init(salesChartRef.value)
      
      // 准备数据
      const products = productSales.value.slice(0, 10) // 取前10名
      
      // 产品名称可能较长，需要处理显示
      const formatProductName = (name) => {
        if (name.length > 6) {
          return name.substring(0, 6) + '...'
        }
        return name
      }
      
      const option = {
        backgroundColor: '#ffffff',
        title: {
          text: '热销商品Top10',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal',
            color: '#606266'
          },
          left: 'center',
          top: 5
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            const data = params[0]
            const product = products[data.dataIndex]
            return `<div style="font-weight:bold;margin-bottom:5px;">${product.name}</div>
                    <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${data.color};"></span>
                    销量：${product.sales}<br/>
                    分类：${product.categoryName}<br/>
                    价格：¥${product.price}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: products.map(item => formatProductName(item.name)),
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            interval: 0,
            rotate: products.length > 6 ? 30 : 0,
            color: '#606266',
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          name: '销量',
          nameTextStyle: {
            color: '#909399',
            fontSize: 12
          },
          axisLabel: {
            color: '#909399',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: '#EBEEF5',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: '销量',
            type: 'bar',
            barWidth: '60%',
            data: products.map(item => ({
              value: item.sales,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#83bff6' },
                  { offset: 0.5, color: '#188df0' },
                  { offset: 1, color: '#188df0' }
                ])
              },
              emphasis: {
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#2378f7' },
                    { offset: 0.7, color: '#2378f7' },
                    { offset: 1, color: '#83bff6' }
                  ])
                }
              }
            }))
          }
        ],
        animationEasing: 'elasticOut'
      }
      
      salesChart.setOption(option)
      console.log('商品销量图表渲染成功', { productsCount: products.length })
    } catch (error) {
      console.error('渲染商品销量图表失败:', error)
    }
  })
}

// 日期范围变化处理
const handleDateRangeChange = () => {
  loadChartData()
}

// 格式化日期显示
const formatTime = (time) => {
  if (!time) return ''
  
  // 如果是完整的ISO时间格式，转换为月-日 时:分格式
  if (time.includes('T')) {
    const dateTime = new Date(time)
    const month = (dateTime.getMonth() + 1).toString().padStart(2, '0')
    const day = dateTime.getDate().toString().padStart(2, '0')
    const hours = dateTime.getHours().toString().padStart(2, '0')
    const minutes = dateTime.getMinutes().toString().padStart(2, '0')
    return `${month}-${day} ${hours}:${minutes}`
  }
  
  return time
}

// 初始加载
onMounted(() => {
  loadStats()
  loadChartData()
  
  // 监听窗口变化
  window.addEventListener('resize', () => {
    if (memberChart) memberChart.resize()
    if (incomeChart) incomeChart.resize()
    if (salesChart) salesChart.resize()
  })
})

// 当数据加载完成后，确保图表初始化
watch([() => incomeStats.value, () => memberStats.value, chartLoading], ([newIncomeStats, newMemberStats, isLoading]) => {
  if (!isLoading && newIncomeStats && newMemberStats) {
    nextTick(() => {
      if (memberChartRef.value && !memberChart) {
        memberChart = echarts.init(memberChartRef.value)
      }
      
      if (incomeChartRef.value && !incomeChart) {
        incomeChart = echarts.init(incomeChartRef.value)
      }
      
      if (memberChart) renderMemberChart()
      if (incomeChart) renderIncomeChart()
      
      // 初始化商品销量图表
      renderProductSalesChart()
    })
  }
})

// 添加对商品销量数据的专门监听
watch(() => productSales.value, (newProductSales) => {
  if (newProductSales && newProductSales.length > 0 && !loading.value) {
    renderProductSalesChart()
  }
}, { deep: true })

// 添加对加载状态的监听，确保在加载完成后重新渲染图表
watch(loading, (isLoading) => {
  if (!isLoading && productSales.value && productSales.value.length > 0) {
    // 延迟一点时间确保DOM已经渲染完成
    setTimeout(() => {
      renderProductSalesChart()
    }, 300)
  }
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 顶部卡片组 -->
    <el-row :gutter="20" class="dashboard-top">
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="overview-card revenue-card">
          <div class="card-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">今日收入</div>
            <div class="card-value" v-if="!loading">¥{{ todayIncome.toFixed(2) }}</div>
            <div class="card-value" v-else>--</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="overview-card orders-card">
          <div class="card-icon">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">今日完成订单</div>
            <div class="card-value" v-if="!loading">{{ (orderStats.totalOrders || 0) - (orderStats.canceledOrders || 0) }}</div>
            <div class="card-value" v-else>--</div>
            <div class="card-sub-values" v-if="!loading">
              <span class="sub-value">已处理: {{ orderStats.pendingOrders || 0 }}</span>
              <span class="sub-value">已取消: {{ orderStats.canceledOrders || 0 }}</span>
            </div>
            <div class="card-sub-values" v-else>
              <span class="sub-value">加载中...</span>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="overview-card paid-card">
          <div class="card-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">已支付订单</div>
            <div class="card-value" v-if="!loading">{{ paidOrders.length || 0 }}</div>
            <div class="card-value" v-else>--</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="overview-card members-card">
          <div class="card-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">会员总数</div>
            <div class="card-value" v-if="!loading">{{ memberStats.totalUsers || 0 }}</div>
            <div class="card-value" v-else>--</div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="dashboard-main">
      <!-- 左侧收入图表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="14">
        <!-- 收入图表 -->
        <div class="main-card income-chart-card">
          <div class="card-header">
            <div class="header-left">
              <h3>收入统计</h3>
              <div class="income-total" v-if="incomeStats.totalIncome">
                总收入: <span class="income-amount">¥{{ incomeStats.totalIncome.toFixed(2) }}</span>
              </div>
            </div>
            <div class="chart-actions">
              <el-radio-group 
                v-model="incomeTimeRange" 
                size="small"
                @change="handleTimeRangeChange"
                class="time-range-selector"
              >
                <el-radio-button v-for="item in timeRangeOptions" :key="item.value" :label="item.value">
                  {{ item.label }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-container income-chart" ref="incomeChartRef" v-loading="chartLoading"></div>
        </div>
        
        <!-- 产品销量排行 -->
        <div class="main-card product-ranking-card">
          <div class="card-header">
            <h3>商品销量排行</h3>
          </div>
          <el-skeleton :loading="loading" animated :rows="5">
            <template #default>
              <div ref="salesChartRef" class="chart-container"></div>
            </template>
          </el-skeleton>
        </div>
      </el-col>
      
      <!-- 右侧会员分布 -->
      <el-col :xs="24" :sm="24" :md="10" :lg="10">
        <div class="main-card member-chart-card">
          <div class="card-header">
            <h3>会员等级分布</h3>
          </div>
          <div class="chart-container" ref="memberChartRef" v-loading="chartLoading"></div>
        </div>
        
        <!-- 新增用户统计 -->
        <div class="main-card new-users-card">
          <div class="card-header">
            <h3>用户增长数据</h3>
          </div>
          <el-skeleton :loading="loading" animated :rows="3">
            <template #default>
              <div class="stats-grid">
                <div class="stats-item">
                  <div class="stats-title">今日新增</div>
                  <div class="stats-value">{{ userGrowthStats.todayNew }}</div>
                </div>
                <div class="stats-item">
                  <div class="stats-title">本周新增</div>
                  <div class="stats-value">{{ userGrowthStats.weekNew }}</div>
                </div>
                <div class="stats-item">
                  <div class="stats-title">本月新增</div>
                  <div class="stats-value">{{ userGrowthStats.monthNew }}</div>
                </div>
                <div class="stats-item">
                  <div class="stats-title">普通会员</div>
                  <div class="stats-value">{{ userGrowthStats.normalUsers }}</div>
                </div>
                <div class="stats-item">
                  <div class="stats-title">银卡会员</div>
                  <div class="stats-value">{{ userGrowthStats.silverUsers }}</div>
                </div>
                <div class="stats-item">
                  <div class="stats-title">金卡会员</div>
                  <div class="stats-value">{{ userGrowthStats.goldUsers }}</div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
}

/* 顶部卡片组 */
.dashboard-top {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
  border-radius: 16px;
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
}

.overview-card::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
  z-index: 1;
}

.overview-card::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  bottom: -100px;
  right: -100px;
  z-index: 0;
}

.revenue-card {
  background: linear-gradient(120deg, #4facfe 0%, #00f2fe 100%);
}

.orders-card {
  background: linear-gradient(120deg, #0ba360 0%, #3cba92 100%);
}

.paid-card {
  background: linear-gradient(120deg, #00c6fb 0%, #005bea 100%);
}

.members-card {
  background: linear-gradient(120deg, #8E2DE2 0%, #4A00E0 100%);
}

.card-icon {
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  margin-right: 24px;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-content {
  flex: 1;
  position: relative;
  z-index: 2;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.card-sub-values {
  font-size: 14px;
  color: white;
  margin-top: 8px;
}

.sub-value {
  margin-right: 16px;
}

/* 主要内容区域 */
.dashboard-main {
  margin-bottom: 20px;
}

.main-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.main-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  position: relative;
  padding-left: 15px;
}

.card-header h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 20px;
  background: linear-gradient(to bottom, #409EFF, #64b5f6);
  border-radius: 10px;
}

.income-chart-card {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.product-ranking-card {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.member-chart-card {
  height: 450px;
  display: flex;
  flex-direction: column;
}

.new-users-card {
  height: 350px;
  display: flex;
  flex-direction: column;
}

.chart-container {
  flex: 1;
  height: 100%;
  width: 100%;
}

.income-total {
  font-size: 14px;
  color: #606266;
  margin-left: 15px;
}

.income-amount {
  font-weight: 600;
  color: #409EFF;
}

.time-range-selector {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 2px;
  overflow: hidden;
}

:deep(.el-radio-button__inner) {
  border: none;
  background: transparent;
  padding: 8px 15px;
  height: auto;
  line-height: 1;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #409EFF;
  box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 10px;
}

.stats-item {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.stats-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.stats-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  font-weight: 500;
}

.stats-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  background: linear-gradient(45deg, #42b983, #33a06f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style> 