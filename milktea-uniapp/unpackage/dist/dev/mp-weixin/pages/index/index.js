"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      networkError: false,
      tableNumber: "",
      shopInfo: {}
    };
  },
  onLoad() {
    this.loadHomeData();
  },
  onShow() {
    this.loadHomeData();
  },
  onPullDownRefresh() {
    this.loadHomeData();
    common_vendor.index.stopPullDownRefresh();
  },
  methods: {
    // 加载首页数据
    loadHomeData() {
      this.networkError = false;
      this.getShopInfo();
    },
    // 获取门店信息
    getShopInfo() {
      utils_api.api.getShopInfo().then((res) => {
        if (res.data.code === 200) {
          this.shopInfo = res.data.data;
        } else {
          this.showError(res.data.message);
        }
      }).catch(() => {
        this.networkError = true;
      });
    },
    // 拨打门店电话
    callShop() {
      if (this.shopInfo.phone) {
        common_vendor.index.makePhoneCall({
          phoneNumber: this.shopInfo.phone,
          fail: () => {
          }
        });
      }
    },
    // 跳转到点单页面
    goToMenu() {
      common_vendor.index.switchTab({
        url: "/pages/menu/menu"
      });
    },
    // 重试加载
    retryLoad() {
      this.loadHomeData();
    },
    // 显示错误提示
    showError(message) {
      common_vendor.index.showToast({
        title: message || "操作失败",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.shopInfo.logo || "/static/logo.png",
    b: $data.shopInfo.id
  }, $data.shopInfo.id ? {
    c: common_vendor.t($data.shopInfo.shopName),
    d: common_vendor.t($data.shopInfo.businessHours),
    e: common_vendor.t($data.shopInfo.notice),
    f: common_assets._imports_0,
    g: common_vendor.t($data.shopInfo.address),
    h: common_assets._imports_1,
    i: common_vendor.t($data.shopInfo.phone),
    j: common_vendor.o((...args) => $options.callShop && $options.callShop(...args))
  } : {}, {
    k: common_assets._imports_2,
    l: common_vendor.o((...args) => $options.goToMenu && $options.goToMenu(...args)),
    m: common_assets._imports_3,
    n: common_vendor.o((...args) => $options.goToMenu && $options.goToMenu(...args)),
    o: common_assets._imports_4,
    p: common_vendor.o((...args) => $options.goToMenu && $options.goToMenu(...args)),
    q: common_assets._imports_5,
    r: common_vendor.o((...args) => $options.goToMenu && $options.goToMenu(...args)),
    s: $data.networkError
  }, $data.networkError ? {
    t: common_vendor.o((...args) => $options.retryLoad && $options.retryLoad(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
