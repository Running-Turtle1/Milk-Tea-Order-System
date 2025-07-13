"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return {
      username: "",
      password: "",
      shopLogo: "",
      agreedToTerms: false
    };
  },
  onLoad() {
    this.getShopInfo();
  },
  methods: {
    // 切换协议同意状态
    toggleAgreement() {
      this.agreedToTerms = !this.agreedToTerms;
    },
    // 获取店铺信息
    getShopInfo() {
      utils_api.api.getShopInfo().then((res) => {
        if (res.data.code === 200 && res.data.data) {
          this.shopLogo = res.data.data.logo;
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/login/login.vue:114", "获取店铺信息失败", err);
      });
    },
    handleLogin() {
      if (!this.agreedToTerms) {
        common_vendor.index.showToast({
          title: "请先阅读并同意协议",
          icon: "none"
        });
        return;
      }
      if (!this.username) {
        common_vendor.index.showToast({
          title: "请输入用户名或手机号",
          icon: "none"
        });
        return;
      }
      if (!this.password) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      utils_api.api.login(this.username, this.password).then((res) => {
        common_vendor.index.hideLoading();
        if (res.data.code === 200) {
          const token = res.data.data.token;
          const user = res.data.data.user;
          common_vendor.index.setStorageSync("token", token);
          common_vendor.index.setStorageSync("userInfo", user);
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success",
            duration: 1500,
            success: () => {
              common_vendor.index.switchTab({
                url: "/pages/index/index"
              });
            }
          });
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "登录失败，请检查账号密码",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/login/login.vue:184", "登录请求失败", err);
      });
    },
    forgotPassword() {
      common_vendor.index.showToast({
        title: "功能开发中",
        icon: "none"
      });
    },
    goToRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/register/register"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f(8, (i, k0, i0) => {
      return {
        a: i
      };
    }),
    b: common_vendor.s("--size:" + (30 + Math.random() * 60) + "rpx; --delay:" + Math.random() * 5 + "s; --duration:" + (10 + Math.random() * 20) + "s"),
    c: $data.shopLogo || "/static/logo.png",
    d: $data.username,
    e: common_vendor.o(($event) => $data.username = $event.detail.value),
    f: $data.password,
    g: common_vendor.o(($event) => $data.password = $event.detail.value),
    h: $data.agreedToTerms
  }, $data.agreedToTerms ? {} : {}, {
    i: $data.agreedToTerms ? 1 : "",
    j: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args)),
    k: !$data.agreedToTerms ? 1 : "",
    l: !$data.agreedToTerms,
    m: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    n: common_vendor.o((...args) => $options.forgotPassword && $options.forgotPassword(...args)),
    o: common_vendor.o((...args) => $options.goToRegister && $options.goToRegister(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
