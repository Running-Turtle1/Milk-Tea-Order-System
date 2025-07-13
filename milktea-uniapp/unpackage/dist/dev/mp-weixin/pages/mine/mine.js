"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isLoggedIn: false,
      userInfo: {},
      memberInfo: {
        currentLevel: 0,
        levelName: "普通会员",
        currentPoints: 0,
        nextLevelPoints: 1e3,
        pointsToNextLevel: 1e3,
        discount: 1,
        benefits: "无折扣"
      }
    };
  },
  onShow() {
    this.checkLoginStatus();
    if (this.isLoggedIn) {
      this.loadUserInfo();
      this.loadMemberInfo();
    }
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      this.isLoggedIn = !!token;
    },
    // 加载用户信息
    loadUserInfo() {
      if (!this.isLoggedIn) {
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:106", "未登录，跳过加载用户信息");
        return;
      }
      utils_api.api.request({
        url: "/user/profile",
        method: "GET"
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:115", "用户信息响应:", res.data);
        if (res.data.code === 200) {
          this.userInfo = res.data.data;
        } else if (res.data.code === 401 || res.data.code === 403) {
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:120", "Token无效或权限不足，清除登录状态");
          this.handleLogout();
        } else {
          this.showToast(res.data.message || "获取用户信息失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:127", "请求失败:", err);
        this.showToast("网络请求失败");
      });
    },
    // 加载会员信息
    loadMemberInfo() {
      if (!this.isLoggedIn) {
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:135", "未登录，跳过加载会员信息");
        return;
      }
      utils_api.api.request({
        url: "/user/member-level",
        method: "GET"
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:144", "会员信息响应:", res.data);
        if (res.data.code === 200) {
          this.memberInfo = res.data.data;
        } else if (res.data.code === 401 || res.data.code === 403) {
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:149", "Token无效或权限不足，使用默认会员信息");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:153", "获取会员信息失败:", err);
      });
    },
    // 计算进度条百分比
    calcProgressPercent() {
      if (!this.memberInfo || !this.memberInfo.nextLevelPoints || this.memberInfo.nextLevelPoints === 0) {
        return 0;
      }
      const earned = this.memberInfo.nextLevelPoints - this.memberInfo.pointsToNextLevel;
      return Math.min(100, Math.floor(earned / this.memberInfo.nextLevelPoints * 100));
    },
    // 预览头像
    previewAvatar() {
      const avatarUrl = this.userInfo.avatar || "/static/tabbar/user.png";
      common_vendor.index.navigateTo({
        url: `/pages/user/avatar-view?url=${encodeURIComponent(avatarUrl)}`
      });
    },
    // 查看会员详情
    viewMemberDetail() {
      if (!this.isLoggedIn) {
        this.promptLogin();
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/user/member-center"
      });
    },
    // 前往订单历史页面
    goToOrderHistory() {
      if (!this.isLoggedIn) {
        this.promptLogin();
        return;
      }
      common_vendor.index.switchTab({
        url: "/pages/order/order"
      });
    },
    // 前往设置页面
    goToSettings() {
      common_vendor.index.navigateTo({
        url: "/pages/user/settings"
      });
    },
    // 联系客服
    contactUs() {
      this.showToast("联系客服页面开发中");
    },
    // 关于我们
    aboutUs() {
      this.showToast("关于我们页面开发中");
    },
    // 前往登录页
    goToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    },
    // 退出登录
    logout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            this.handleLogout();
          }
        }
      });
    },
    // 处理退出登录逻辑
    handleLogout() {
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("userInfo");
      this.isLoggedIn = false;
      this.userInfo = {};
      this.showToast("已退出登录", "success");
    },
    // 提示登录
    promptLogin() {
      common_vendor.index.showModal({
        title: "提示",
        content: "请先登录",
        confirmText: "去登录",
        success: (res) => {
          if (res.confirm) {
            this.goToLogin();
          }
        }
      });
    },
    // 显示提示信息
    showToast(title, icon = "none") {
      common_vendor.index.showToast({
        title,
        icon
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isLoggedIn
  }, $data.isLoggedIn ? {
    b: $data.userInfo.avatar || "/static/tabbar/user.png",
    c: common_vendor.o((...args) => $options.previewAvatar && $options.previewAvatar(...args)),
    d: common_vendor.t($data.userInfo.username),
    e: common_vendor.t($data.memberInfo.levelName),
    f: common_vendor.t($data.userInfo.totalPoints || 0)
  } : {
    g: common_assets._imports_0$4,
    h: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  }, {
    i: $data.isLoggedIn
  }, $data.isLoggedIn ? {
    j: common_vendor.t($data.memberInfo.levelName),
    k: common_vendor.t($data.memberInfo.pointsToNextLevel),
    l: $options.calcProgressPercent(),
    m: common_vendor.o((...args) => $options.viewMemberDetail && $options.viewMemberDetail(...args))
  } : {}, {
    n: common_assets._imports_1$2,
    o: common_assets._imports_2$2,
    p: common_vendor.o((...args) => $options.goToOrderHistory && $options.goToOrderHistory(...args)),
    q: common_assets._imports_3$1,
    r: common_assets._imports_2$2,
    s: common_vendor.o((...args) => $options.goToSettings && $options.goToSettings(...args)),
    t: common_assets._imports_4$2,
    v: common_assets._imports_2$2,
    w: common_vendor.o((...args) => $options.contactUs && $options.contactUs(...args)),
    x: common_assets._imports_5$2,
    y: common_assets._imports_2$2,
    z: common_vendor.o((...args) => $options.aboutUs && $options.aboutUs(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
