"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      loading: false
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
    // 验证密码
    validatePassword() {
      if (!this.oldPassword) {
        this.showToast("请输入原密码");
        return false;
      }
      if (!this.newPassword) {
        this.showToast("请输入新密码");
        return false;
      }
      if (this.newPassword.length < 8) {
        this.showToast("新密码长度不能少于8个字符");
        return false;
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(this.newPassword)) {
        this.showToast("新密码必须包含大小写字母和数字");
        return false;
      }
      if (this.newPassword === this.oldPassword) {
        this.showToast("新密码不能与原密码相同");
        return false;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.showToast("两次输入的新密码不一致");
        return false;
      }
      return true;
    },
    // 提交密码修改
    submitPassword() {
      if (!this.validatePassword()) {
        return;
      }
      this.loading = true;
      utils_api.api.request({
        url: "/user/change-password",
        method: "PUT",
        data: {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword
        },
        success: (res) => {
          if (res.data.code === 200) {
            this.showToast("密码修改成功，请重新登录", "success");
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("userInfo");
            setTimeout(() => {
              common_vendor.index.reLaunch({
                url: "/pages/login/login"
              });
            }, 1500);
          } else {
            this.showToast(res.data.message || "密码修改失败");
          }
        },
        fail: () => {
          this.showToast("网络错误，请稍后再试");
        },
        complete: () => {
          this.loading = false;
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
    a: $data.oldPassword,
    b: common_vendor.o(($event) => $data.oldPassword = $event.detail.value),
    c: $data.newPassword,
    d: common_vendor.o(($event) => $data.newPassword = $event.detail.value),
    e: $data.confirmPassword,
    f: common_vendor.o(($event) => $data.confirmPassword = $event.detail.value),
    g: common_vendor.o((...args) => $options.submitPassword && $options.submitPassword(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/change-password.js.map
