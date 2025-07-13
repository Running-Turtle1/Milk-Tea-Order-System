"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      token: common_vendor.index.getStorageSync("token") || ""
    };
  },
  onLoad() {
    this.checkLoginStatus();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.promptLogin();
      }
    },
    // 修改密码
    changePassword() {
      common_vendor.index.navigateTo({
        url: "/pages/user/change-password"
      });
    },
    // 更换手机号
    changePhone() {
      common_vendor.index.navigateTo({
        url: "/pages/user/change-phone"
      });
    },
    // 修改个人信息
    updateUserInfo() {
      common_vendor.index.navigateTo({
        url: "/pages/user/user-info"
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
    // 处理退出登录
    handleLogout() {
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.reLaunch({
        url: "/pages/login/login"
      });
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
            common_vendor.index.navigateTo({
              url: "/pages/login/login"
            });
          } else {
            common_vendor.index.navigateBack();
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
  return {
    a: common_assets._imports_0$6,
    b: common_vendor.o((...args) => $options.changePassword && $options.changePassword(...args)),
    c: common_assets._imports_1$4,
    d: common_vendor.o((...args) => $options.changePhone && $options.changePhone(...args)),
    e: common_assets._imports_2$4,
    f: common_vendor.o((...args) => $options.updateUserInfo && $options.updateUserInfo(...args)),
    g: common_vendor.o((...args) => $options.logout && $options.logout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/settings.js.map
