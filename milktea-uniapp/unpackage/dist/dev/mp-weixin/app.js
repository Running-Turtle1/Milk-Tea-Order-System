"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/menu/menu.js";
  "./pages/cart/cart.js";
  "./pages/order/order.js";
  "./pages/mine/mine.js";
  "./pages/login/login.js";
  "./pages/register/register.js";
  "./pages/user/avatar-view.js";
  "./pages/order/detail.js";
  "./pages/order/confirm.js";
  "./pages/menu/search.js";
  "./pages/user/settings.js";
  "./pages/user/change-password.js";
  "./pages/user/change-phone.js";
  "./pages/user/user-info.js";
  "./pages/user/member-center.js";
  "./pages/order/refund.js";
}
const _sfc_main = {
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
