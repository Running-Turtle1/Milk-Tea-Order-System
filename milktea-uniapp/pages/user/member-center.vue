<template>
  <view class="page-wrapper">
    <scroll-view scroll-y class="member-center" :style="{ height: scrollHeight + 'px' }">
      <!-- 会员信息头部 -->
      <view class="member-header">
        <view class="header-bg"></view>
        <view class="member-info">
          <image :src="userInfo.avatar || '/static/tabbar/user.png'" class="avatar" mode="aspectFill"></image>
          <view class="info-content">
            <view class="username">{{userInfo.username}}</view>
            <view class="member-level">
              <text class="level-name">{{memberInfo.levelName || '普通会员'}}</text>
              <text class="level-desc">{{memberInfo.benefits || ''}}</text>
              <text class="discount-badge" v-if="memberInfo.discount && memberInfo.discount < 1">{{(memberInfo.discount * 10).toFixed(1)}}折</text>
            </view>
          </view>
        </view>
        
        <!-- 会员等级按钮 -->
        <view class="point-rules-btn" @click="toggleMemberLevelModal">
          <text class="point-rules-text">会员等级</text>
          <text class="point-rules-icon">?</text>
        </view>
      </view>
      
      <!-- 会员数据卡片 -->
      <view class="data-card">
        <view class="data-item">
          <text class="data-value">{{userInfo.totalPoints || memberInfo.currentPoints || 0}}</text>
          <text class="data-label">我的积分</text>
        </view>
        <view class="divider"></view>
        <view class="data-item">
          <text class="data-value">{{getUnusedCouponCount()}}</text>
          <text class="data-label">可用优惠券</text>
        </view>
        <view class="divider"></view>
        <view class="data-item">
          <text class="data-value">{{memberInfo.pointsToNextLevel || 0}}</text>
          <text class="data-label">升级还需</text>
        </view>
      </view>
      
      <!-- 签到模块 -->
      <view class="section checkin-section">
        <view class="section-header">
          <text class="section-title">每日签到</text>
          <text class="section-subtitle">已连续签到 {{checkinInfo.continuesDays || 0}} 天</text>
        </view>
        <view class="checkin-calendar">
          <view class="calendar-header">
            <text>{{currentYear}}年{{currentMonth}}月</text>
          </view>
          <view class="calendar-days">
            <view class="weekday-row">
              <text v-for="(day, index) in ['日','一','二','三','四','五','六']" :key="index" class="weekday">{{day}}</text>
            </view>
            <view class="days-grid">
              <view v-for="(day, index) in calendarDays" :key="index" class="calendar-day" 
                    :class="{
                      'empty': !day,
                      'checked': checkinInfo.days && checkinInfo.days.includes(day), 
                      'today': isToday(day)
                    }">
                <text v-if="day">{{day}}</text>
              </view>
            </view>
          </view>
        </view>
        <button class="checkin-btn" 
                :class="{'checked': todayChecked}" 
                :disabled="todayChecked"
                @click="handleCheckin">
          {{todayChecked ? '今日已签到' : '立即签到'}}
        </button>
      </view>
      
      <!-- 积分和优惠券标签栏 -->
      <view class="tab-container">
        <view class="tab-header">
          <view class="tab-item" 
                :class="{'active': activeTab === 0}" 
                @click="activeTab = 0">
            积分记录
            <text class="point-rules-icon" @click.stop="togglePointRules">?</text>
          </view>
          <view class="tab-item" 
                :class="{'active': activeTab === 1}" 
                @click="activeTab = 1">我的优惠券
          </view>
          <view class="tab-item" 
                :class="{'active': activeTab === 2}" 
                @click="activeTab = 2">可领优惠券</view>
        </view>
        
        <!-- 积分记录 -->
        <scroll-view v-if="activeTab === 0" 
                    scroll-y 
                    class="tab-content points-record"
                    @scrolltolower="handlePointsScrollToLower">
          <view class="empty-tip" v-if="pointRecords.length === 0 && !loadingPoints">
            <text>暂无积分记录</text>
          </view>
          <view v-else class="record-list">
            <view class="record-item" v-for="record in pointRecords" :key="record.id">
              <view class="record-info">
                <text class="record-desc">{{record.description}}</text>
                <text class="record-time">{{record.createdAt}}</text>
              </view>
              <text :class="['record-points', record.point > 0 ? 'positive' : 'negative']">
                {{record.point > 0 ? '+' : ''}}{{record.point}}
              </text>
            </view>
            <!-- 加载状态显示 -->
            <view class="loading-more" v-if="loadingPoints">
              <view class="loading-spinner"></view>
              <text>加载中...</text>
            </view>
            <!-- 已加载全部 -->
            <view class="no-more" v-if="!hasMorePointRecords && pointRecords.length > 0">
              <text>— 已加载全部 —</text>
            </view>
          </view>
        </scroll-view>
        
        <!-- 我的优惠券 -->
        <scroll-view v-if="activeTab === 1" scroll-y class="tab-content my-coupons">
          <view class="empty-tip" v-if="coupons.length === 0">
            <text v-if="loadingCoupons">加载中...</text>
            <text v-else>暂无优惠券</text>
          </view>
          <view v-else class="coupon-list">
            <view class="coupon-item" v-for="item in coupons" :key="item.id"
                  :class="{
                    'used': item.status === 1,
                    'expired': item.status === 2
                  }">
              <view class="coupon-left">
                <view class="coupon-amount">
                  <text class="amount-prefix" v-if="item.coupon && item.coupon.type === 1">¥</text>
                  <text class="amount-value">{{formatAmount(item.coupon)}}</text>
                  <text class="amount-postfix" v-if="item.coupon && item.coupon.type === 2">折</text>
                </view>
                <text class="condition" v-if="item.coupon && item.coupon.minConsumption > 0">满{{item.coupon.minConsumption}}元可用</text>
              </view>
              <view class="coupon-right">
                <text class="coupon-name">{{item.coupon ? item.coupon.name : '优惠券'}}</text>
                <text class="coupon-time">{{formatDate(item.coupon ? item.coupon.startTime : '')}} - {{formatDate(item.coupon ? item.coupon.endTime : '')}}</text>
                <text class="coupon-status">
                  {{item.statusText || getCouponStatusText(item.status)}}
                </text>
              </view>
              <view class="debug-info" v-if="debugMode">
                <text>原始数据: {{JSON.stringify(item)}}</text>
              </view>
            </view>
          </view>
          <view class="load-more" v-if="hasMoreCoupons && !loadingCoupons" @click="loadMoreCoupons">
            加载更多
          </view>
          <view class="loading" v-if="loadingCoupons">加载中...</view>
        </scroll-view>
        
        <!-- 可领优惠券 -->
        <scroll-view v-if="activeTab === 2" scroll-y class="tab-content receivable-coupons">
          <view class="empty-tip" v-if="receivableCoupons.length === 0">
            <text>暂无可领取的优惠券</text>
          </view>
          <view v-else class="coupon-list">
            <view class="coupon-item receivable" v-for="coupon in receivableCoupons" :key="coupon.id">
              <view class="coupon-left">
                <view class="coupon-amount">
                  <text class="amount-prefix" v-if="coupon.type === 1">¥</text>
                  <text class="amount-value">{{formatAmount(coupon)}}</text>
                  <text class="amount-postfix" v-if="coupon.type === 2">折</text>
                </view>
                <text class="condition" v-if="coupon.minConsumption > 0">满{{coupon.minConsumption}}元可用</text>
              </view>
              <view class="coupon-right">
                <text class="coupon-name">{{coupon.name || '优惠券'}}</text>
                <text class="coupon-time">{{formatDate(coupon.startTime)}} - {{formatDate(coupon.endTime)}}</text>
                <button class="receive-btn" @click.stop="receiveCoupon(coupon.id)">领取</button>
              </view>
              <view class="debug-info" v-if="debugMode">
                <text>原始数据: {{JSON.stringify(coupon)}}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </scroll-view>
    
    <!-- 会员等级说明弹窗 -->
    <view class="member-level-modal" v-if="showMemberLevelModal">
      <view class="modal-mask" @click="toggleMemberLevelModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">会员等级与权益</text>
          <text class="modal-close" @click="toggleMemberLevelModal">×</text>
        </view>
        <view class="modal-body">
          <view class="level-item" v-for="(level, index) in memberLevelList" :key="index"
                :class="{'current-level': level.level === memberInfo.currentLevel}">
            <view class="level-header">
              <view class="level-name">
                <text>{{level.name}}</text>
                <text class="level-tag" v-if="level.level === memberInfo.currentLevel">当前等级</text>
              </view>
              <view class="level-points">所需积分: {{level.pointThreshold}}+</view>
            </view>
            <view class="level-benefits">
              <view class="level-discount">
                <text class="benefit-label">折扣权益:</text>
                <text class="benefit-value">{{ level.discount == 1.0 ? '无折扣' : (level.discount * 10).toFixed(1) + '折' }}</text>
              </view>
              <view class="level-other-benefits">
                <text class="benefit-label">其他权益:</text>
                <text class="benefit-value">{{level.benefits || '无特殊权益'}}</text>
              </view>
            </view>
          </view>
          <view class="empty-tip" v-if="memberLevelList.length === 0">
            <text>暂无会员等级信息</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 积分规则弹窗 -->
    <view class="point-rules-modal" v-if="showPointRules">
      <view class="modal-mask" @click="togglePointRules"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">积分获取规则</text>
          <text class="modal-close" @click="togglePointRules">×</text>
        </view>
        <view class="modal-body">
          <view class="rule-item" v-for="(rule, index) in pointRules" :key="index">
            <view class="rule-name">{{rule.name}}</view>
            <view class="rule-desc">{{rule.description}}</view>
            <view class="rule-value" v-if="rule.isRatio">
              比例：{{rule.pointValue * 100}}%
            </view>
            <view class="rule-value" v-else>
              固定积分：{{rule.pointValue}}分
            </view>
          </view>
          <view class="empty-tip" v-if="pointRules.length === 0">
            <text>暂无积分规则</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js';

export default {
  data() {
    const now = new Date();
    return {
      userInfo: {},
      memberInfo: {
        currentLevel: 0,
        levelName: '普通会员',
        currentPoints: 0,
        nextLevelPoints: 1000,
        pointsToNextLevel: 1000,
        discount: 1.0,
        benefits: '无折扣'
      },
      
      // 会员等级列表
      memberLevelList: [],
      showMemberLevelModal: false,
      
      // 积分记录
      pointRecords: [],
      pointPage: 0,
      pointSize: 10,
      hasMorePointRecords: true,
      loadingPoints: false,
      
      // 优惠券
      coupons: [],
      couponPage: 0,
      couponSize: 10,
      hasMoreCoupons: true,
      loadingCoupons: false,
      
      // 可领取的优惠券
      receivableCoupons: [],
      
      // 签到相关
      checkinInfo: {
        days: [],
        continuesDays: 0,
        currentMonthDays: 30
      },
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      todayChecked: false,
      calendarDays: [],
      
      // 选项卡
      activeTab: 0,
      
      // 调试模式
      debugMode: false,
      
      // 积分规则相关
      pointRules: [],
      showPointRules: false,
      
      // 页面高度
      scrollHeight: 0
    };
  },
  onLoad() {
    this.getUserInfo();
    this.getMemberLevel();
    this.getPointRecords();
    this.getCoupons();
    this.getReceivableCoupons();
    this.getCheckinRecords();
    this.generateCalendar();
    this.getPointRules();
    this.getMemberLevelList();
    this.setScrollHeight();
  },
  onPullDownRefresh() {
    // 刷新数据
    this.getUserInfo();
    this.getMemberLevel();
    this.getPointRecords();
    this.getCoupons();
    this.getReceivableCoupons();
    this.getCheckinRecords();
    
    // 完成后停止下拉刷新
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
  },
  onReady() {
    // 在页面渲染完成后再次获取高度，确保准确
    this.setScrollHeight();
  },
  onShow() {
    // 每次页面显示时更新高度
    this.setScrollHeight();
  },
  // 监听窗口尺寸变化
  onResize() {
    this.setScrollHeight();
  },
  computed: {
    isToday() {
      const today = new Date();
      const currentDay = today.getDate();
      return (day) => day === currentDay && 
             this.currentMonth === (today.getMonth() + 1) && 
             this.currentYear === today.getFullYear();
    }
  },
  methods: {
    // 设置滚动区域高度
    setScrollHeight() {
      const that = this;
      uni.getSystemInfo({
        success: function(res) {
          // 设置滚动视图高度为屏幕高度
          that.scrollHeight = res.windowHeight;
          console.log('设置滚动区域高度:', that.scrollHeight);
        }
      });
    },
    // 获取用户信息
    async getUserInfo() {
      try {
        const res = await api.getUserInfo();
        if (res.data && res.data.code === 200) {
          this.userInfo = res.data.data;
        }
      } catch (error) {
        console.error('获取用户信息失败', error);
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    },
    
    // 获取会员等级信息
    async getMemberLevel() {
      try {
        const res = await api.request({
          url: '/user/member-level',
          method: 'GET'
        });
        
        if (res.data && res.data.code === 200) {
          this.memberInfo = res.data.data;
          
          // 不需要计算nextLevelPoints，直接使用响应中的值
        }
      } catch (error) {
        console.error('获取会员等级信息失败', error);
      }
    },
    
    // 处理积分记录滚动到底部
    handlePointsScrollToLower() {
      console.log('积分记录滚动到底部');
      if (this.hasMorePointRecords && !this.loadingPoints) {
        this.loadMorePointRecords();
      }
    },
    
    // 获取积分记录
    async getPointRecords(loadMore = false) {
      if (this.loadingPoints) return;
      
      try {
        this.loadingPoints = true;
        
        if (loadMore) {
          this.pointPage++;
        } else {
          this.pointPage = 0;
          this.pointRecords = [];
        }
        
        const res = await api.request({
          url: '/user/point-records',
          method: 'GET',
          data: {
            page: this.pointPage,
            size: this.pointSize
          }
        });
        
        if (res.data && res.data.code === 200) {
          const data = res.data.data;
          
          if (loadMore) {
            this.pointRecords = [...this.pointRecords, ...data.content];
          } else {
            this.pointRecords = data.content;
          }
          
          this.hasMorePointRecords = this.pointRecords.length < data.totalElements;
          console.log('积分记录加载完成，是否还有更多:', this.hasMorePointRecords);
        }
      } catch (error) {
        console.error('获取积分记录失败', error);
        uni.showToast({
          title: '获取积分记录失败',
          icon: 'none'
        });
      } finally {
        this.loadingPoints = false;
      }
    },
    
    // 加载更多积分记录
    loadMorePointRecords() {
      if (this.hasMorePointRecords && !this.loadingPoints) {
        console.log('加载更多积分记录，当前页:', this.pointPage);
        this.getPointRecords(true);
      }
    },
    
    // 获取优惠券
    async getCoupons(loadMore = false) {
      if (this.loadingCoupons) return;
      
      try {
        this.loadingCoupons = true;
        
        if (loadMore) {
          this.couponPage++;
        } else {
          this.couponPage = 0;
          this.coupons = [];
        }
        
        const res = await api.request({
          url: '/user/coupons',
          method: 'GET',
          data: {
            page: this.couponPage,
            size: this.couponSize
          }
        });
        
        if (res.data && res.data.code === 200) {
          const data = res.data.data;
          
          // 确保返回数据是分页格式
          if (data && data.content) {
            if (loadMore) {
              this.coupons = [...this.coupons, ...data.content];
            } else {
              this.coupons = data.content;
            }
            
            this.hasMoreCoupons = this.coupons.length < data.totalElements;
          } else {
            // 如果不是分页格式，可能是直接返回的数组
            const couponsArray = Array.isArray(data) ? data : [];
            
            if (loadMore) {
              this.coupons = [...this.coupons, ...couponsArray];
            } else {
              this.coupons = couponsArray;
            }
            
            this.hasMoreCoupons = false;
          }
          
          // 排序优惠券：未使用 > 已使用 > 已过期
          this.coupons.sort((a, b) => {
            // 首先按状态排序
            if (a.status !== b.status) {
              return a.status - b.status; // 0(未使用) < 1(已使用) < 2(已过期)
            }
            
            // 如果状态相同，对于未使用的优惠券，按有效期结束时间从近到远排序
            if (a.status === 0) {
              const aEndTime = a.coupon ? new Date(a.coupon.endTime).getTime() : 0;
              const bEndTime = b.coupon ? new Date(b.coupon.endTime).getTime() : 0;
              return aEndTime - bEndTime; // 越早到期的越靠前
            }
            
            // 其他情况按创建时间从新到旧排序
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return bTime - aTime;
          });
        }
      } catch (error) {
        console.error('获取优惠券失败', error);
        uni.showToast({
          title: '获取优惠券失败',
          icon: 'none'
        });
      } finally {
        this.loadingCoupons = false;
      }
    },
    
    // 加载更多优惠券
    loadMoreCoupons() {
      if (this.hasMoreCoupons && !this.loadingCoupons) {
        this.getCoupons(true);
      }
    },
    
    // 获取可领取的优惠券
    async getReceivableCoupons() {
      try {
        const res = await api.request({
          url: '/user/receivable-coupons',
          method: 'GET'
        });
        
        if (res.data && res.data.code === 200) {
          this.receivableCoupons = Array.isArray(res.data.data) ? res.data.data : [];
          
          // 可领取优惠券按有效期结束时间从近到远排序
          this.receivableCoupons.sort((a, b) => {
            const aEndTime = a.endTime ? new Date(a.endTime).getTime() : 0;
            const bEndTime = b.endTime ? new Date(b.endTime).getTime() : 0;
            return aEndTime - bEndTime; // 越早到期的越靠前
          });
        }
      } catch (error) {
        console.error('获取可领取优惠券失败', error);
        uni.showToast({
          title: '获取可领取优惠券失败',
          icon: 'none'
        });
      }
    },
    
    // 领取优惠券
    async receiveCoupon(couponId) {
      try {
        const res = await api.request({
          url: `/user/receive-coupon/${couponId}`,
          method: 'POST'
        });
        
        if (res.data && res.data.code === 200) {
          uni.showToast({
            title: '领取成功',
            icon: 'success'
          });
          
          // 刷新可领取的优惠券列表和我的优惠券
          this.getReceivableCoupons();
          this.getCoupons();
        }
      } catch (error) {
        console.error('领取优惠券失败', error);
        uni.showToast({
          title: '领取失败，请稍后再试',
          icon: 'none'
        });
      }
    },
    
    // 获取签到记录
    async getCheckinRecords() {
      try {
        const res = await api.request({
          url: '/member/checkin/records',
          method: 'GET',
          data: {
            year: this.currentYear,
            month: this.currentMonth
          }
        });
        
        if (res.data && res.data.code === 200) {
          this.checkinInfo = res.data.data;
          
          const today = new Date().getDate();
          this.todayChecked = this.checkinInfo.days && this.checkinInfo.days.includes(today);
        }
      } catch (error) {
        console.error('获取签到记录失败', error);
      }
    },
    
    // 生成日历数据
    generateCalendar() {
      const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
      const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
      
      // 创建一个包含当月所有日期的数组，并在前面填充空值
      this.calendarDays = Array(firstDay).fill(null);
      
      for (let i = 1; i <= daysInMonth; i++) {
        this.calendarDays.push(i);
      }
      
      // 确保日历总格子数为42（6行7列）
      const paddingDays = 42 - this.calendarDays.length;
      if (paddingDays > 0) {
        this.calendarDays = [...this.calendarDays, ...Array(paddingDays).fill(null)];
      }
    },
    
    // 用户签到
    async handleCheckin() {
      if (this.todayChecked) return;
      
      try {
        const res = await api.request({
          url: '/member/checkin',
          method: 'POST'
        });
        
        if (res.data && res.data.code === 200) {
          const data = res.data.data;
          
          uni.showToast({
            title: `签到成功，获得${data.points}积分`,
            icon: 'success'
          });
          
          this.todayChecked = true;
          
          // 增加连续签到天数显示
          if (this.checkinInfo.continuesDays) {
            this.checkinInfo.continuesDays += 1;
          }
          
          // 添加今天的日期到已签到日期中
          const today = new Date().getDate();
          if (this.checkinInfo.days && !this.checkinInfo.days.includes(today)) {
            this.checkinInfo.days.push(today);
          }
          
          // 更新签到信息和用户积分
          this.getUserInfo();
          this.getPointRecords();
        }
      } catch (error) {
        console.error('签到失败', error);
        uni.showToast({
          title: '签到失败，请稍后再试',
          icon: 'none'
        });
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      
      // 检查是否包含时间
      if (dateString.includes(':')) {
        // 如果有时间，只返回日期部分
        return dateString.split(' ')[0];
      }
      return dateString;
    },
    
    // 格式化优惠券金额展示
    formatAmount(coupon) {
      if (!coupon) return '0';
      
      try {
        // 根据类型判断如何显示金额
        if (coupon.type === 1) { // 满减券 - 显示整数金额
          // 检查amount是否为数字或可以转为数字的字符串
          const amount = Number(coupon.amount);
          return !isNaN(amount) ? amount.toFixed(0) : '0';
        } else if (coupon.type === 2) { // 折扣券 - 显示折扣值
          // 检查是否已经是折扣格式（小于10的数）
          const amount = Number(coupon.amount);
          if (!isNaN(amount)) {
            // 如果小于1，说明是小数表示法（如0.8表示8折）
            if (amount < 1) {
              return (amount * 10).toFixed(1);
            } else {
              // 否则可能是整数表示法（如8表示8折）
              return amount.toFixed(1);
            }
          }
          return '0.0';
        } else {
          // 未知类型，尝试直接显示金额
          const amount = Number(coupon.amount);
          return !isNaN(amount) ? amount.toFixed(1) : '0';
        }
      } catch (e) {
        console.error('格式化金额出错', e, coupon);
        return '0';
      }
    },
    
    // 获取优惠券状态文本
    getCouponStatusText(status) {
      switch (status) {
        case 0: 
          return '可使用';
        case 1: 
          return '已使用';
        case 2: 
          return '已过期';
        default: 
          return '未知状态';
      }
    },
    
    // 切换调试模式
    toggleDebug() {
      this.debugMode = !this.debugMode;
      if (this.debugMode) {
        uni.showToast({
          title: '已开启调试模式',
          icon: 'none'
        });
      }
    },
    
    // 获取未使用的优惠券数量
    getUnusedCouponCount() {
      if (!this.coupons || !this.coupons.length) {
        return 0;
      }
      
      // 统计状态为0（未使用）的优惠券数量
      return this.coupons.filter(coupon => coupon.status === 0).length;
    },
    
    // 获取积分规则
    async getPointRules() {
      try {
        const res = await api.request({
          url: '/member/point-rules',
          method: 'GET'
        });
        
        if (res.data && res.data.code === 200) {
          this.pointRules = res.data.data || [];
        }
      } catch (error) {
        console.error('获取积分规则失败', error);
      }
    },
    
    // 显示积分规则弹窗
    togglePointRules() {
      this.showPointRules = !this.showPointRules;
    },
    
    // 获取会员等级列表
    async getMemberLevelList() {
      try {
        const res = await api.request({
          url: '/member/levels',
          method: 'GET'
        });
        
        if (res.data && res.data.code === 200) {
          this.memberLevelList = res.data.data || [];
          console.log('会员等级列表:', this.memberLevelList);
        }
      } catch (error) {
        console.error('获取会员等级列表失败', error);
      }
    },
    
    // 显示会员等级弹窗
    toggleMemberLevelModal() {
      this.showMemberLevelModal = !this.showMemberLevelModal;
    }
  }
};
</script>

<style lang="scss" scoped>
.page-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #111111;
}

.member-center {
  width: 100%;
  height: 100%;
  background-color: #111111;
  padding-bottom: 30rpx;
  
  .member-header {
    background-color: #222222;
    padding-bottom: 20rpx;
    position: relative;
    
    .header-bg {
      height: 200rpx;
      background: linear-gradient(45deg, #7b68ee, #9370db);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      opacity: 0.8;
      z-index: 0;
    }
    
    .member-info {
      display: flex;
      align-items: center;
      padding: 30rpx 20rpx;
      position: relative;
      z-index: 1;
      
      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        border: 4rpx solid rgba(255,255,255,0.2);
        margin-right: 20rpx;
      }
      
      .info-content {
        flex: 1;
        
        .username {
          font-size: 32rpx;
          color: #ffffff;
          margin-bottom: 10rpx;
          font-weight: bold;
        }
        
        .member-level {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          
          .level-name {
            font-size: 26rpx;
            color: #ffffff;
            padding: 4rpx 12rpx;
            background-color: rgba(15, 1, 95, 0.2);
            border-radius: 20rpx;
            margin-right: 16rpx;
          }
          
          .level-desc {
            font-size: 24rpx;
            color: #e7e7e7;
            margin-right: 16rpx;
          }
          
          .discount-badge {
            font-size: 22rpx;
            color: #ffffff;
            background-color: #7b68ee;
            padding: 4rpx 12rpx;
            border-radius: 20rpx;
            margin-left: 16rpx;
          }
        }
      }
    }
    
    .point-rules-btn {
      position: absolute;
      top: 30rpx;
      right: 20rpx;
      z-index: 2;
      display: flex;
      align-items: center;
      padding: 6rpx 16rpx;
      background-color: rgba(0,0,0,0.3);
      border-radius: 30rpx;
      
      .point-rules-text {
        font-size: 24rpx;
        color: #ffffff;
        margin-right: 8rpx;
      }
      
      .point-rules-icon {
        font-size: 20rpx;
        width: 24rpx;
        height: 24rpx;
        line-height: 24rpx;
        text-align: center;
        border-radius: 50%;
        border: 1rpx solid #ffffff;
        color: #ffffff;
      }
    }
  }
  
  .data-card {
    position: relative;
    z-index: 3;
    margin: -40rpx 30rpx 0;
    background-color: #1a1a1a;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
    display: flex;
    padding: 30rpx 0;
    
    .data-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .data-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
        margin-bottom: 10rpx;
      }
      
      .data-label {
        font-size: 24rpx;
        color: #aaa;
      }
    }
    
    .divider {
      width: 2rpx;
      background-color: #333;
      margin: 0 10rpx;
    }
  }
  
  .section {
    margin: 30rpx;
    background-color: #1a1a1a;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
    
    .section-header {
      padding: 24rpx 30rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2rpx solid #333;
      
      .section-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #fff;
      }
      
      .section-subtitle {
        font-size: 24rpx;
        color: #aaa;
      }
    }
  }
  
  .checkin-section {
    .checkin-calendar {
      padding: 20rpx 30rpx;
      
      .calendar-header {
        text-align: center;
        margin-bottom: 20rpx;
        font-size: 28rpx;
        color: #fff;
      }
      
      .weekday-row {
        display: flex;
        justify-content: space-around;
        margin-bottom: 10rpx;
        
        .weekday {
          flex: 1;
          text-align: center;
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .days-grid {
        display: flex;
        flex-wrap: wrap;
        
        .calendar-day {
          width: 14.28%;
          height: 70rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 26rpx;
          color: #ddd;
          position: relative;
          
          &.empty {
            background: none;
          }
          
          &.checked {
            color: #7b68ee;
            font-weight: bold;
          }
          
          &.today {
            color: #7b68ee;
            font-weight: bold;
            position: relative;
            
            &::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 50rpx;
              height: 50rpx;
              border-radius: 50%;
              background-color: #7b68ee;
              opacity: 0.2;
              z-index: 0;
            }
          }
        }
      }
    }
    
    .checkin-btn {
      margin: 20rpx 30rpx 30rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background-color: #7b68ee;
      color: #fff;
      font-size: 28rpx;
      border-radius: 40rpx;
      
      &.checked {
        background-color: #444;
      }
    }
  }
  
  .tab-container {
    margin: 30rpx;
    background-color: #1a1a1a;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
    position: relative;
    
    .tab-header {
      display: flex;
      border-bottom: 1rpx solid #333333;
      
      .tab-item {
        flex: 1;
        text-align: center;
        padding: 20rpx 0;
        font-size: 28rpx;
        color: #999999;
        position: relative;
        
        .point-rules-icon {
          display: inline-block;
          margin-left: 6rpx;
          font-size: 24rpx;
          color: #888888;
          width: 24rpx;
          height: 24rpx;
          line-height: 24rpx;
          text-align: center;
          border-radius: 50%;
          border: 1rpx solid #888888;
        }
        
        &.active {
          color: #7b68ee;
          font-weight: bold;
          
          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 40rpx;
            height: 4rpx;
            background-color: #7b68ee;
            border-radius: 2rpx;
          }
        }
      }
    }
    
    .tab-content {
      max-height: 600rpx;
    }
    
    .empty-tip {
      padding: 100rpx 0;
      text-align: center;
      color: #999;
      font-size: 26rpx;
    }
    
    .load-more {
      text-align: center;
      padding: 20rpx 0;
      font-size: 24rpx;
      color: #7b68ee;
    }
    
    .loading {
      text-align: center;
      padding: 20rpx 0;
      font-size: 24rpx;
      color: #999;
    }
    
    .loading-more {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx 0;
      
      .loading-spinner {
        width: 30rpx;
        height: 30rpx;
        margin-right: 10rpx;
        border: 3rpx solid #7b68ee;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 0.8s linear infinite;
      }
      
      text {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .no-more {
      text-align: center;
      padding: 20rpx 0;
      font-size: 24rpx;
      color: #666;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .points-record {
      .record-list {
        padding: 10rpx 30rpx;
        
        .record-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20rpx 0;
          border-bottom: 2rpx solid #292929;
          
          .record-info {
            .record-desc {
              font-size: 28rpx;
              color: #ddd;
              margin-bottom: 8rpx;
              display: block;
            }
            
            .record-time {
              font-size: 22rpx;
              color: #777;
            }
          }
          
          .record-points {
            font-size: 30rpx;
            font-weight: bold;
            
            &.positive {
              color: #ff6b6b;
            }
            
            &.negative {
              color: #4ecdc4;
            }
          }
        }
      }
    }
    
    .coupon-list {
      padding: 20rpx 30rpx;
      
      .coupon-item {
        display: flex;
        margin-bottom: 20rpx;
        border-radius: 12rpx;
        overflow: hidden;
        height: 180rpx;
        background: linear-gradient(to right, #222, #1a1a1a);
        box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
        position: relative;
        
        &.used, &.expired {
          opacity: 0.5;
        }
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 10rpx;
          background-color: #ff6b6b;
        }
        
        .coupon-left {
          width: 220rpx;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding-left: 30rpx;
          
          .coupon-amount {
            display: flex;
            align-items: baseline;
            margin-bottom: 10rpx;
            
            .amount-prefix {
              font-size: 26rpx;
              color: #ff6b6b;
              font-weight: bold;
            }
            
            .amount-value {
              font-size: 48rpx;
              color: #ff6b6b;
              font-weight: bold;
              margin: 0 4rpx;
            }
            
            .amount-postfix {
              font-size: 26rpx;
              color: #ff6b6b;
              font-weight: bold;
            }
          }
          
          .condition {
            font-size: 22rpx;
            color: #999;
          }
        }
        
        .coupon-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 30rpx;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 20rpx;
            bottom: 20rpx;
            width: 2rpx;
            background-color: #333;
            border-radius: 1rpx;
          }
          
          .coupon-name {
            font-size: 28rpx;
            color: #fff;
            font-weight: bold;
            margin-bottom: 10rpx;
          }
          
          .coupon-time {
            font-size: 22rpx;
            color: #999;
            margin-bottom: 10rpx;
            padding-right: 130rpx; /* 为按钮留出空间 */
          }
          
          .coupon-status {
            font-size: 22rpx;
            color: #ff6b6b;
          }
          
          .receive-btn {
            position: absolute;
            right: 30rpx;
            top: 50%;
            transform: translateY(-50%);
            width: 120rpx;
            height: 50rpx;
            line-height: 50rpx;
            text-align: center;
            background-color: #ff6b6b;
            color: #fff;
            font-size: 24rpx;
            border-radius: 25rpx;
            padding: 0;
          }
        }
        
        &.receivable {
          background: linear-gradient(to right, #222833, #1a1a25);
          
          &::before {
            background-color: #9370db;
          }
          
          .coupon-left {
            .coupon-amount {
              .amount-prefix, .amount-value, .amount-postfix {
                color: #9370db;
              }
            }
          }
          
          .coupon-right {
            .receive-btn {
              background-color: #9370db;
            }
          }
        }
      }
    }
  }
  
  .debug-info {
    padding: 10rpx;
    background-color: #222;
    font-size: 22rpx;
    color: #999;
    word-break: break-all;
    white-space: normal;
    max-height: 200rpx;
    overflow-y: auto;
  }
  
  .point-rules-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    
    .modal-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
    }
    
    .modal-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      max-height: 70%;
      background-color: #202020;
      border-radius: 16rpx;
      overflow: hidden;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx;
        border-bottom: 2rpx solid #333;
        
        .modal-title {
          font-size: 32rpx;
          font-weight: bold;
          color: #fff;
        }
        
        .modal-close {
          font-size: 40rpx;
          color: #999;
          padding: 0 10rpx;
        }
      }
      
      .modal-body {
        padding: 20rpx 30rpx;
        max-height: 600rpx;
        overflow-y: auto;
        
        .rule-item {
          padding: 20rpx 0;
          border-bottom: 2rpx solid #333;
          
          &:last-child {
            border-bottom: none;
          }
          
          .rule-name {
            font-size: 30rpx;
            font-weight: bold;
            color: #fff;
            margin-bottom: 10rpx;
          }
          
          .rule-desc {
            font-size: 26rpx;
            color: #aaa;
            margin-bottom: 10rpx;
          }
          
          .rule-value {
            font-size: 24rpx;
            color: #7b68ee;
          }
        }
        
        .empty-tip {
          padding: 50rpx 0;
          text-align: center;
          color: #999;
          font-size: 26rpx;
        }
      }
    }
  }
  
  .member-level-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    
    .modal-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
    }
    
    .modal-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      max-height: 70%;
      background-color: #202020;
      border-radius: 16rpx;
      overflow: hidden;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx;
        border-bottom: 2rpx solid #333;
        
        .modal-title {
          font-size: 32rpx;
          font-weight: bold;
          color: #fff;
        }
        
        .modal-close {
          font-size: 40rpx;
          color: #999;
          padding: 0 10rpx;
        }
      }
      
      .modal-body {
        padding: 20rpx 30rpx;
        max-height: 600rpx;
        overflow-y: auto;
        
        .level-item {
          padding: 20rpx 0;
          border-bottom: 2rpx solid #333;
          
          &:last-child {
            border-bottom: none;
          }
          
          .level-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10rpx;
            
            .level-name {
              font-size: 30rpx;
              font-weight: bold;
              color: #fff;
            }
            
            .level-points {
              font-size: 24rpx;
              color: #999;
            }
          }
          
          .level-benefits {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .level-discount {
              .benefit-label {
                font-size: 26rpx;
                color: #ff6b6b;
                font-weight: bold;
              }
              
              .benefit-value {
                font-size: 24rpx;
                color: #ff6b6b;
              }
            }
            
            .level-other-benefits {
              .benefit-label {
                font-size: 26rpx;
                color: #999;
              }
              
              .benefit-value {
                font-size: 24rpx;
                color: #999;
              }
            }
          }
        }
        
        .empty-tip {
          padding: 50rpx 0;
          text-align: center;
          color: #999;
          font-size: 26rpx;
        }
      }
    }
  }
}
</style> 