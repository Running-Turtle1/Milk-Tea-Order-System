"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    const now = /* @__PURE__ */ new Date();
    return {
      userInfo: {},
      memberInfo: {
        currentLevel: 0,
        levelName: "普通会员",
        currentPoints: 0,
        nextLevelPoints: 1e3,
        pointsToNextLevel: 1e3,
        discount: 1,
        benefits: "无折扣"
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
    this.getUserInfo();
    this.getMemberLevel();
    this.getPointRecords();
    this.getCoupons();
    this.getReceivableCoupons();
    this.getCheckinRecords();
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
    }, 1e3);
  },
  onReady() {
    this.setScrollHeight();
  },
  onShow() {
    this.setScrollHeight();
  },
  // 监听窗口尺寸变化
  onResize() {
    this.setScrollHeight();
  },
  computed: {
    isToday() {
      const today = /* @__PURE__ */ new Date();
      const currentDay = today.getDate();
      return (day) => day === currentDay && this.currentMonth === today.getMonth() + 1 && this.currentYear === today.getFullYear();
    }
  },
  methods: {
    // 设置滚动区域高度
    setScrollHeight() {
      const that = this;
      common_vendor.index.getSystemInfo({
        success: function(res) {
          that.scrollHeight = res.windowHeight;
          common_vendor.index.__f__("log", "at pages/user/member-center.vue:376", "设置滚动区域高度:", that.scrollHeight);
        }
      });
    },
    // 获取用户信息
    async getUserInfo() {
      try {
        const res = await utils_api.api.getUserInfo();
        if (res.data && res.data.code === 200) {
          this.userInfo = res.data.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:388", "获取用户信息失败", error);
        common_vendor.index.showToast({
          title: "获取用户信息失败",
          icon: "none"
        });
      }
    },
    // 获取会员等级信息
    async getMemberLevel() {
      try {
        const res = await utils_api.api.request({
          url: "/user/member-level",
          method: "GET"
        });
        if (res.data && res.data.code === 200) {
          this.memberInfo = res.data.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:410", "获取会员等级信息失败", error);
      }
    },
    // 处理积分记录滚动到底部
    handlePointsScrollToLower() {
      common_vendor.index.__f__("log", "at pages/user/member-center.vue:416", "积分记录滚动到底部");
      if (this.hasMorePointRecords && !this.loadingPoints) {
        this.loadMorePointRecords();
      }
    },
    // 获取积分记录
    async getPointRecords(loadMore = false) {
      if (this.loadingPoints)
        return;
      try {
        this.loadingPoints = true;
        if (loadMore) {
          this.pointPage++;
        } else {
          this.pointPage = 0;
          this.pointRecords = [];
        }
        const res = await utils_api.api.request({
          url: "/user/point-records",
          method: "GET",
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
          common_vendor.index.__f__("log", "at pages/user/member-center.vue:455", "积分记录加载完成，是否还有更多:", this.hasMorePointRecords);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:458", "获取积分记录失败", error);
        common_vendor.index.showToast({
          title: "获取积分记录失败",
          icon: "none"
        });
      } finally {
        this.loadingPoints = false;
      }
    },
    // 加载更多积分记录
    loadMorePointRecords() {
      if (this.hasMorePointRecords && !this.loadingPoints) {
        common_vendor.index.__f__("log", "at pages/user/member-center.vue:471", "加载更多积分记录，当前页:", this.pointPage);
        this.getPointRecords(true);
      }
    },
    // 获取优惠券
    async getCoupons(loadMore = false) {
      if (this.loadingCoupons)
        return;
      try {
        this.loadingCoupons = true;
        if (loadMore) {
          this.couponPage++;
        } else {
          this.couponPage = 0;
          this.coupons = [];
        }
        const res = await utils_api.api.request({
          url: "/user/coupons",
          method: "GET",
          data: {
            page: this.couponPage,
            size: this.couponSize
          }
        });
        if (res.data && res.data.code === 200) {
          const data = res.data.data;
          if (data && data.content) {
            if (loadMore) {
              this.coupons = [...this.coupons, ...data.content];
            } else {
              this.coupons = data.content;
            }
            this.hasMoreCoupons = this.coupons.length < data.totalElements;
          } else {
            const couponsArray = Array.isArray(data) ? data : [];
            if (loadMore) {
              this.coupons = [...this.coupons, ...couponsArray];
            } else {
              this.coupons = couponsArray;
            }
            this.hasMoreCoupons = false;
          }
          this.coupons.sort((a, b) => {
            if (a.status !== b.status) {
              return a.status - b.status;
            }
            if (a.status === 0) {
              const aEndTime = a.coupon ? new Date(a.coupon.endTime).getTime() : 0;
              const bEndTime = b.coupon ? new Date(b.coupon.endTime).getTime() : 0;
              return aEndTime - bEndTime;
            }
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return bTime - aTime;
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:545", "获取优惠券失败", error);
        common_vendor.index.showToast({
          title: "获取优惠券失败",
          icon: "none"
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
        const res = await utils_api.api.request({
          url: "/user/receivable-coupons",
          method: "GET"
        });
        if (res.data && res.data.code === 200) {
          this.receivableCoupons = Array.isArray(res.data.data) ? res.data.data : [];
          this.receivableCoupons.sort((a, b) => {
            const aEndTime = a.endTime ? new Date(a.endTime).getTime() : 0;
            const bEndTime = b.endTime ? new Date(b.endTime).getTime() : 0;
            return aEndTime - bEndTime;
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:581", "获取可领取优惠券失败", error);
        common_vendor.index.showToast({
          title: "获取可领取优惠券失败",
          icon: "none"
        });
      }
    },
    // 领取优惠券
    async receiveCoupon(couponId) {
      try {
        const res = await utils_api.api.request({
          url: `/user/receive-coupon/${couponId}`,
          method: "POST"
        });
        if (res.data && res.data.code === 200) {
          common_vendor.index.showToast({
            title: "领取成功",
            icon: "success"
          });
          this.getReceivableCoupons();
          this.getCoupons();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:608", "领取优惠券失败", error);
        common_vendor.index.showToast({
          title: "领取失败，请稍后再试",
          icon: "none"
        });
      }
    },
    // 获取签到记录
    async getCheckinRecords() {
      try {
        const res = await utils_api.api.request({
          url: "/member/checkin/records",
          method: "GET",
          data: {
            year: this.currentYear,
            month: this.currentMonth
          }
        });
        if (res.data && res.data.code === 200) {
          this.checkinInfo = res.data.data;
          const today = (/* @__PURE__ */ new Date()).getDate();
          this.todayChecked = this.checkinInfo.days && this.checkinInfo.days.includes(today);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:635", "获取签到记录失败", error);
      }
    },
    // 生成日历数据
    generateCalendar() {
      const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
      const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
      this.calendarDays = Array(firstDay).fill(null);
      for (let i = 1; i <= daysInMonth; i++) {
        this.calendarDays.push(i);
      }
      const paddingDays = 42 - this.calendarDays.length;
      if (paddingDays > 0) {
        this.calendarDays = [...this.calendarDays, ...Array(paddingDays).fill(null)];
      }
    },
    // 用户签到
    async handleCheckin() {
      if (this.todayChecked)
        return;
      try {
        const res = await utils_api.api.request({
          url: "/member/checkin",
          method: "POST"
        });
        if (res.data && res.data.code === 200) {
          const data = res.data.data;
          common_vendor.index.showToast({
            title: `签到成功，获得${data.points}积分`,
            icon: "success"
          });
          this.todayChecked = true;
          if (this.checkinInfo.continuesDays) {
            this.checkinInfo.continuesDays += 1;
          }
          const today = (/* @__PURE__ */ new Date()).getDate();
          if (this.checkinInfo.days && !this.checkinInfo.days.includes(today)) {
            this.checkinInfo.days.push(today);
          }
          this.getUserInfo();
          this.getPointRecords();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:694", "签到失败", error);
        common_vendor.index.showToast({
          title: "签到失败，请稍后再试",
          icon: "none"
        });
      }
    },
    // 格式化日期
    formatDate(dateString) {
      if (!dateString)
        return "";
      if (dateString.includes(":")) {
        return dateString.split(" ")[0];
      }
      return dateString;
    },
    // 格式化优惠券金额展示
    formatAmount(coupon) {
      if (!coupon)
        return "0";
      try {
        if (coupon.type === 1) {
          const amount = Number(coupon.amount);
          return !isNaN(amount) ? amount.toFixed(0) : "0";
        } else if (coupon.type === 2) {
          const amount = Number(coupon.amount);
          if (!isNaN(amount)) {
            if (amount < 1) {
              return (amount * 10).toFixed(1);
            } else {
              return amount.toFixed(1);
            }
          }
          return "0.0";
        } else {
          const amount = Number(coupon.amount);
          return !isNaN(amount) ? amount.toFixed(1) : "0";
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:743", "格式化金额出错", e, coupon);
        return "0";
      }
    },
    // 获取优惠券状态文本
    getCouponStatusText(status) {
      switch (status) {
        case 0:
          return "可使用";
        case 1:
          return "已使用";
        case 2:
          return "已过期";
        default:
          return "未知状态";
      }
    },
    // 切换调试模式
    toggleDebug() {
      this.debugMode = !this.debugMode;
      if (this.debugMode) {
        common_vendor.index.showToast({
          title: "已开启调试模式",
          icon: "none"
        });
      }
    },
    // 获取未使用的优惠券数量
    getUnusedCouponCount() {
      if (!this.coupons || !this.coupons.length) {
        return 0;
      }
      return this.coupons.filter((coupon) => coupon.status === 0).length;
    },
    // 获取积分规则
    async getPointRules() {
      try {
        const res = await utils_api.api.request({
          url: "/member/point-rules",
          method: "GET"
        });
        if (res.data && res.data.code === 200) {
          this.pointRules = res.data.data || [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:795", "获取积分规则失败", error);
      }
    },
    // 显示积分规则弹窗
    togglePointRules() {
      this.showPointRules = !this.showPointRules;
    },
    // 获取会员等级列表
    async getMemberLevelList() {
      try {
        const res = await utils_api.api.request({
          url: "/member/levels",
          method: "GET"
        });
        if (res.data && res.data.code === 200) {
          this.memberLevelList = res.data.data || [];
          common_vendor.index.__f__("log", "at pages/user/member-center.vue:814", "会员等级列表:", this.memberLevelList);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/member-center.vue:817", "获取会员等级列表失败", error);
      }
    },
    // 显示会员等级弹窗
    toggleMemberLevelModal() {
      this.showMemberLevelModal = !this.showMemberLevelModal;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userInfo.avatar || "/static/tabbar/user.png",
    b: common_vendor.t($data.userInfo.username),
    c: common_vendor.t($data.memberInfo.levelName || "普通会员"),
    d: common_vendor.t($data.memberInfo.benefits || ""),
    e: $data.memberInfo.discount && $data.memberInfo.discount < 1
  }, $data.memberInfo.discount && $data.memberInfo.discount < 1 ? {
    f: common_vendor.t(($data.memberInfo.discount * 10).toFixed(1))
  } : {}, {
    g: common_vendor.o((...args) => $options.toggleMemberLevelModal && $options.toggleMemberLevelModal(...args)),
    h: common_vendor.t($data.userInfo.totalPoints || $data.memberInfo.currentPoints || 0),
    i: common_vendor.t($options.getUnusedCouponCount()),
    j: common_vendor.t($data.memberInfo.pointsToNextLevel || 0),
    k: common_vendor.t($data.checkinInfo.continuesDays || 0),
    l: common_vendor.t($data.currentYear),
    m: common_vendor.t($data.currentMonth),
    n: common_vendor.f(["日", "一", "二", "三", "四", "五", "六"], (day, index, i0) => {
      return {
        a: common_vendor.t(day),
        b: index
      };
    }),
    o: common_vendor.f($data.calendarDays, (day, index, i0) => {
      return common_vendor.e({
        a: day
      }, day ? {
        b: common_vendor.t(day)
      } : {}, {
        c: index,
        d: !day ? 1 : "",
        e: $data.checkinInfo.days && $data.checkinInfo.days.includes(day) ? 1 : "",
        f: $options.isToday(day) ? 1 : ""
      });
    }),
    p: common_vendor.t($data.todayChecked ? "今日已签到" : "立即签到"),
    q: $data.todayChecked ? 1 : "",
    r: $data.todayChecked,
    s: common_vendor.o((...args) => $options.handleCheckin && $options.handleCheckin(...args)),
    t: common_vendor.o((...args) => $options.togglePointRules && $options.togglePointRules(...args)),
    v: $data.activeTab === 0 ? 1 : "",
    w: common_vendor.o(($event) => $data.activeTab = 0),
    x: $data.activeTab === 1 ? 1 : "",
    y: common_vendor.o(($event) => $data.activeTab = 1),
    z: $data.activeTab === 2 ? 1 : "",
    A: common_vendor.o(($event) => $data.activeTab = 2),
    B: $data.activeTab === 0
  }, $data.activeTab === 0 ? common_vendor.e({
    C: $data.pointRecords.length === 0 && !$data.loadingPoints
  }, $data.pointRecords.length === 0 && !$data.loadingPoints ? {} : common_vendor.e({
    D: common_vendor.f($data.pointRecords, (record, k0, i0) => {
      return {
        a: common_vendor.t(record.description),
        b: common_vendor.t(record.createdAt),
        c: common_vendor.t(record.point > 0 ? "+" : ""),
        d: common_vendor.t(record.point),
        e: common_vendor.n(record.point > 0 ? "positive" : "negative"),
        f: record.id
      };
    }),
    E: $data.loadingPoints
  }, $data.loadingPoints ? {} : {}, {
    F: !$data.hasMorePointRecords && $data.pointRecords.length > 0
  }, !$data.hasMorePointRecords && $data.pointRecords.length > 0 ? {} : {}), {
    G: common_vendor.o((...args) => $options.handlePointsScrollToLower && $options.handlePointsScrollToLower(...args))
  }) : {}, {
    H: $data.activeTab === 1
  }, $data.activeTab === 1 ? common_vendor.e({
    I: $data.coupons.length === 0
  }, $data.coupons.length === 0 ? common_vendor.e({
    J: $data.loadingCoupons
  }, $data.loadingCoupons ? {} : {}) : {
    K: common_vendor.f($data.coupons, (item, k0, i0) => {
      return common_vendor.e({
        a: item.coupon && item.coupon.type === 1
      }, item.coupon && item.coupon.type === 1 ? {} : {}, {
        b: common_vendor.t($options.formatAmount(item.coupon)),
        c: item.coupon && item.coupon.type === 2
      }, item.coupon && item.coupon.type === 2 ? {} : {}, {
        d: item.coupon && item.coupon.minConsumption > 0
      }, item.coupon && item.coupon.minConsumption > 0 ? {
        e: common_vendor.t(item.coupon.minConsumption)
      } : {}, {
        f: common_vendor.t(item.coupon ? item.coupon.name : "优惠券"),
        g: common_vendor.t($options.formatDate(item.coupon ? item.coupon.startTime : "")),
        h: common_vendor.t($options.formatDate(item.coupon ? item.coupon.endTime : "")),
        i: common_vendor.t(item.statusText || $options.getCouponStatusText(item.status))
      }, $data.debugMode ? {
        j: common_vendor.t(JSON.stringify(item))
      } : {}, {
        k: item.id,
        l: item.status === 1 ? 1 : "",
        m: item.status === 2 ? 1 : ""
      });
    }),
    L: $data.debugMode
  }, {
    M: $data.hasMoreCoupons && !$data.loadingCoupons
  }, $data.hasMoreCoupons && !$data.loadingCoupons ? {
    N: common_vendor.o((...args) => $options.loadMoreCoupons && $options.loadMoreCoupons(...args))
  } : {}, {
    O: $data.loadingCoupons
  }, $data.loadingCoupons ? {} : {}) : {}, {
    P: $data.activeTab === 2
  }, $data.activeTab === 2 ? common_vendor.e({
    Q: $data.receivableCoupons.length === 0
  }, $data.receivableCoupons.length === 0 ? {} : {
    R: common_vendor.f($data.receivableCoupons, (coupon, k0, i0) => {
      return common_vendor.e({
        a: coupon.type === 1
      }, coupon.type === 1 ? {} : {}, {
        b: common_vendor.t($options.formatAmount(coupon)),
        c: coupon.type === 2
      }, coupon.type === 2 ? {} : {}, {
        d: coupon.minConsumption > 0
      }, coupon.minConsumption > 0 ? {
        e: common_vendor.t(coupon.minConsumption)
      } : {}, {
        f: common_vendor.t(coupon.name || "优惠券"),
        g: common_vendor.t($options.formatDate(coupon.startTime)),
        h: common_vendor.t($options.formatDate(coupon.endTime)),
        i: common_vendor.o(($event) => $options.receiveCoupon(coupon.id), coupon.id)
      }, $data.debugMode ? {
        j: common_vendor.t(JSON.stringify(coupon))
      } : {}, {
        k: coupon.id
      });
    }),
    S: $data.debugMode
  }) : {}, {
    T: $data.scrollHeight + "px",
    U: $data.showMemberLevelModal
  }, $data.showMemberLevelModal ? common_vendor.e({
    V: common_vendor.o((...args) => $options.toggleMemberLevelModal && $options.toggleMemberLevelModal(...args)),
    W: common_vendor.o((...args) => $options.toggleMemberLevelModal && $options.toggleMemberLevelModal(...args)),
    X: common_vendor.f($data.memberLevelList, (level, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(level.name),
        b: level.level === $data.memberInfo.currentLevel
      }, level.level === $data.memberInfo.currentLevel ? {} : {}, {
        c: common_vendor.t(level.pointThreshold),
        d: common_vendor.t(level.discount == 1 ? "无折扣" : (level.discount * 10).toFixed(1) + "折"),
        e: common_vendor.t(level.benefits || "无特殊权益"),
        f: index,
        g: level.level === $data.memberInfo.currentLevel ? 1 : ""
      });
    }),
    Y: $data.memberLevelList.length === 0
  }, $data.memberLevelList.length === 0 ? {} : {}) : {}, {
    Z: $data.showPointRules
  }, $data.showPointRules ? common_vendor.e({
    aa: common_vendor.o((...args) => $options.togglePointRules && $options.togglePointRules(...args)),
    ab: common_vendor.o((...args) => $options.togglePointRules && $options.togglePointRules(...args)),
    ac: common_vendor.f($data.pointRules, (rule, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(rule.name),
        b: common_vendor.t(rule.description),
        c: rule.isRatio
      }, rule.isRatio ? {
        d: common_vendor.t(rule.pointValue * 100)
      } : {
        e: common_vendor.t(rule.pointValue)
      }, {
        f: index
      });
    }),
    ad: $data.pointRules.length === 0
  }, $data.pointRules.length === 0 ? {} : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-24edc527"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/member-center.js.map
