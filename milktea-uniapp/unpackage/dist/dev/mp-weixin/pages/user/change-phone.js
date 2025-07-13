"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return {
      currentPhone: "",
      newPhone: "",
      loading: false
    };
  },
  onLoad() {
    this.checkLoginStatus();
    this.getUserInfo();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.promptLogin();
      }
    },
    // 获取用户信息
    getUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo && userInfo.phone) {
        this.currentPhone = userInfo.phone;
      } else {
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          this.promptLogin();
          return;
        }
        utils_api.api.getUserInfo().then((res) => {
          if (res.data.code === 200 && res.data.data) {
            this.currentPhone = res.data.data.phone || "";
            common_vendor.index.setStorageSync("userInfo", res.data.data);
          } else if (res.data.code === 403) {
            this.showToast("登录已过期，请重新登录");
            setTimeout(() => {
              common_vendor.index.removeStorageSync("token");
              common_vendor.index.removeStorageSync("userInfo");
              common_vendor.index.reLaunch({
                url: "/pages/login/login"
              });
            }, 1500);
          }
        }).catch((err) => {
          common_vendor.index.__f__("error", "at pages/user/change-phone.vue:82", "获取用户信息失败:", err);
          if (err.statusCode === 403) {
            this.showToast("登录已过期，请重新登录");
            setTimeout(() => {
              common_vendor.index.reLaunch({
                url: "/pages/login/login"
              });
            }, 1500);
          }
        });
      }
    },
    // 手机号脱敏显示
    maskPhone(phone) {
      if (!phone || phone.length !== 11) {
        return "";
      }
      return phone.substring(0, 3) + "****" + phone.substring(7);
    },
    // 验证手机号
    validatePhone() {
      if (!this.newPhone) {
        this.showToast("请输入新手机号");
        return false;
      }
      if (!/^1[3-9]\d{9}$/.test(this.newPhone)) {
        this.showToast("请输入正确的手机号格式");
        return false;
      }
      if (this.newPhone === this.currentPhone) {
        this.showToast("新手机号不能与当前手机号相同");
        return false;
      }
      return true;
    },
    // 提交更换手机号
    submitChange() {
      if (!this.validatePhone()) {
        return;
      }
      this.loading = true;
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.showToast("请先登录");
        this.promptLogin();
        return;
      }
      utils_api.api.updateUserInfo({
        phone: this.newPhone
      }).then((res) => {
        if (res.data.code === 200) {
          this.showToast("手机号更换成功", "success");
          const userInfo = common_vendor.index.getStorageSync("userInfo") || {};
          userInfo.phone = this.newPhone;
          common_vendor.index.setStorageSync("userInfo", userInfo);
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          if (res.data.code === 403) {
            this.showToast("没有权限，请重新登录");
            setTimeout(() => {
              common_vendor.index.removeStorageSync("token");
              common_vendor.index.removeStorageSync("userInfo");
              common_vendor.index.reLaunch({
                url: "/pages/login/login"
              });
            }, 1500);
          } else {
            this.showToast(res.data.message || "手机号更换失败");
          }
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/user/change-phone.vue:176", "请求失败:", err);
        if (err.statusCode === 403) {
          this.showToast("登录已过期，请重新登录");
          setTimeout(() => {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.reLaunch({
              url: "/pages/login/login"
            });
          }, 1500);
        } else {
          this.showToast("网络错误，请稍后再试");
        }
      }).finally(() => {
        this.loading = false;
      });
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
    a: common_vendor.t($options.maskPhone($data.currentPhone)),
    b: $data.newPhone,
    c: common_vendor.o(($event) => $data.newPhone = $event.detail.value),
    d: common_vendor.o((...args) => $options.submitChange && $options.submitChange(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/change-phone.js.map
