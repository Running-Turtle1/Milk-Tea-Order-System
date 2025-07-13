"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {},
      genderOptions: ["请选择", "男", "女"],
      genderIndex: 0,
      birthday: "",
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
      if (userInfo) {
        this.userInfo = userInfo;
        if (userInfo.gender) {
          this.genderIndex = userInfo.gender;
        }
        if (userInfo.birthday) {
          this.birthday = userInfo.birthday;
        }
      } else {
        utils_api.api.request({
          url: "/user/profile",
          method: "GET"
        }).then((res) => {
          if (res.data.code === 200 && res.data.data) {
            this.userInfo = res.data.data;
            common_vendor.index.setStorageSync("userInfo", res.data.data);
            if (this.userInfo.gender) {
              this.genderIndex = this.userInfo.gender;
            }
            if (this.userInfo.birthday) {
              this.birthday = this.userInfo.birthday;
            }
          }
        }).catch((err) => {
          common_vendor.index.__f__("error", "at pages/user/user-info.vue:106", "获取用户信息失败:", err);
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
    // 性别选择器变化事件
    bindGenderChange(e) {
      this.genderIndex = e.detail.value;
    },
    // 日期选择器变化事件
    bindDateChange(e) {
      this.birthday = e.detail.value;
    },
    // 提交更新
    submitUpdate() {
      if (this.genderIndex === 0) {
        this.showToast("请选择性别");
        return;
      }
      if (!this.birthday) {
        this.showToast("请选择生日");
        return;
      }
      this.loading = true;
      utils_api.api.request({
        url: "/user/profile",
        method: "PUT",
        data: {
          avatar: this.userInfo.avatar,
          gender: parseInt(this.genderIndex),
          birthday: this.birthday,
          phone: this.userInfo.phone
        }
      }).then((res) => {
        if (res.data.code === 200) {
          this.showToast("信息更新成功", "success");
          const userInfo = common_vendor.index.getStorageSync("userInfo") || {};
          userInfo.gender = parseInt(this.genderIndex);
          userInfo.birthday = this.birthday;
          common_vendor.index.setStorageSync("userInfo", userInfo);
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          this.showToast(res.data.message || "信息更新失败");
        }
      }).catch(() => {
        this.showToast("网络错误，请稍后再试");
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
    a: common_vendor.t($data.userInfo.username || ""),
    b: common_vendor.t($options.maskPhone($data.userInfo.phone) || ""),
    c: common_vendor.t($data.genderOptions[$data.genderIndex]),
    d: common_vendor.o((...args) => $options.bindGenderChange && $options.bindGenderChange(...args)),
    e: $data.genderIndex,
    f: $data.genderOptions,
    g: common_vendor.t($data.birthday || "请选择生日"),
    h: $data.birthday,
    i: common_vendor.o((...args) => $options.bindDateChange && $options.bindDateChange(...args)),
    j: common_vendor.o((...args) => $options.submitUpdate && $options.submitUpdate(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user-info.js.map
