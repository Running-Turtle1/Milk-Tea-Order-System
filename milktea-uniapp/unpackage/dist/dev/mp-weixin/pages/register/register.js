"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        username: "",
        password: "",
        confirmPassword: "",
        agreed: false
      },
      shopLogo: ""
    };
  },
  onLoad() {
    this.getShopInfo();
  },
  methods: {
    // 获取店铺信息
    getShopInfo() {
      utils_api.api.getShopInfo().then((res) => {
        if (res.data.code === 200 && res.data.data) {
          this.shopLogo = res.data.data.logo;
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/register/register.vue:121", "获取店铺信息失败", err);
      });
    },
    handleRegister() {
      if (!this.formData.username) {
        common_vendor.index.showToast({
          title: "请输入用户名",
          icon: "none"
        });
        return;
      }
      if (!this.formData.phone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      if (!/^1\d{10}$/.test(this.formData.phone)) {
        common_vendor.index.showToast({
          title: "手机号格式不正确",
          icon: "none"
        });
        return;
      }
      if (!this.formData.password) {
        common_vendor.index.showToast({
          title: "请设置密码",
          icon: "none"
        });
        return;
      }
      if (this.formData.password.length < 6 || this.formData.password.length > 20) {
        common_vendor.index.showToast({
          title: "密码长度应为6-20位",
          icon: "none"
        });
        return;
      }
      if (this.formData.password !== this.formData.confirmPassword) {
        common_vendor.index.showToast({
          title: "两次密码输入不一致",
          icon: "none"
        });
        return;
      }
      if (!this.formData.agreed) {
        common_vendor.index.showToast({
          title: "请阅读并同意用户协议与隐私政策",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "注册中..."
      });
      common_vendor.index.request({
        url: `${this.baseUrl}/user/register`,
        method: "POST",
        data: {
          username: this.formData.username,
          password: this.formData.password,
          phone: this.formData.phone
        },
        success: (res) => {
          common_vendor.index.hideLoading();
          if (res.data.code === 200) {
            common_vendor.index.showToast({
              title: "注册成功",
              icon: "success",
              duration: 1500,
              success: () => {
                setTimeout(() => {
                  common_vendor.index.navigateTo({
                    url: "/pages/login/login"
                  });
                }, 1500);
              }
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.message || "注册失败，请稍后重试",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "网络异常，请稍后重试",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at pages/register/register.vue:221", "注册请求失败", err);
        }
      });
    },
    goToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f(8, (i, k0, i0) => {
      return {
        a: i
      };
    }),
    b: common_vendor.s("--size:" + (30 + Math.random() * 60) + "rpx; --delay:" + Math.random() * 5 + "s; --duration:" + (10 + Math.random() * 20) + "s"),
    c: $data.shopLogo || "/static/logo.png",
    d: $data.formData.username,
    e: common_vendor.o(($event) => $data.formData.username = $event.detail.value),
    f: $data.formData.phone,
    g: common_vendor.o(($event) => $data.formData.phone = $event.detail.value),
    h: $data.formData.password,
    i: common_vendor.o(($event) => $data.formData.password = $event.detail.value),
    j: $data.formData.confirmPassword,
    k: common_vendor.o(($event) => $data.formData.confirmPassword = $event.detail.value),
    l: $data.formData.agreed ? 1 : "",
    m: common_vendor.o(($event) => $data.formData.agreed = !$data.formData.agreed),
    n: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args)),
    o: !$data.formData.agreed,
    p: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/register.js.map
