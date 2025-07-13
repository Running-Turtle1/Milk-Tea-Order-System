"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      avatarUrl: "",
      isVirtualKeyboardShowing: false,
      imageLoadError: false
    };
  },
  onLoad(options) {
    if (options.url) {
      this.avatarUrl = decodeURIComponent(options.url);
    } else {
      this.loadUserAvatar();
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 加载用户头像
    loadUserAvatar() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.showToast("请先登录");
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
        return;
      }
      utils_api.api.request({
        url: "/user/profile",
        method: "GET",
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/user/avatar-view.vue:70", "获取用户信息响应:", res.data);
          if (res.data.code === 200) {
            this.avatarUrl = utils_api.api.processImageUrl(res.data.data.avatar || "");
          } else if (res.data.code === 401) {
            this.handleTokenExpired();
          } else {
            this.showToast(res.data.message || "获取用户信息失败");
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/user/avatar-view.vue:82", "网络请求失败:", err);
          this.showToast("网络请求失败");
        }
      });
    },
    // 处理图片加载错误
    handleImageError() {
      if (!this.imageLoadError) {
        this.imageLoadError = true;
        this.showToast("图片加载失败，使用默认头像");
        this.avatarUrl = "/static/default-avatar.png";
      }
    },
    // 上传新头像
    uploadAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          const token = common_vendor.index.getStorageSync("token");
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          const baseUrl = utils_api.api.getBaseUrl();
          common_vendor.index.uploadFile({
            url: `${baseUrl}/files/avatar`,
            filePath: tempFilePaths[0],
            name: "file",
            header: {
              "Authorization": "Bearer " + token
            },
            success: (uploadRes) => {
              common_vendor.index.__f__("log", "at pages/user/avatar-view.vue:121", "头像上传响应:", uploadRes);
              try {
                const result = JSON.parse(uploadRes.data);
                if (result.code === 200) {
                  this.avatarUrl = utils_api.api.processImageUrl(result.data.url);
                  this.showToast("头像上传成功", "success");
                  const userInfo = common_vendor.index.getStorageSync("userInfo") || {};
                  userInfo.avatar = result.data.url;
                  common_vendor.index.setStorageSync("userInfo", userInfo);
                } else {
                  this.showToast(result.message || "上传失败");
                }
              } catch (e) {
                common_vendor.index.__f__("error", "at pages/user/avatar-view.vue:137", "解析响应失败:", e);
                this.showToast("响应解析失败");
              }
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/user/avatar-view.vue:142", "上传失败:", err);
              this.showToast("上传失败，请检查网络");
            },
            complete: () => {
              common_vendor.index.hideLoading();
            }
          });
        }
      });
    },
    // 处理Token过期
    handleTokenExpired() {
      common_vendor.index.showToast({
        title: "登录已过期，请重新登录",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
      }, 1500);
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
    a: common_assets._imports_0$5,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.avatarUrl || "/static/default-avatar.png",
    d: common_vendor.o((...args) => $options.handleImageError && $options.handleImageError(...args)),
    e: common_vendor.o((...args) => $options.uploadAvatar && $options.uploadAvatar(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/avatar-view.js.map
