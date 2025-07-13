"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      loading: true,
      orderNo: "",
      orderDetail: {},
      showPaymentPopup: false,
      paymentMethod: "wechat",
      scrollTop: 0
      // 新增滚动位置控制
    };
  },
  computed: {
    orderStatusText() {
      switch (this.orderDetail.status) {
        case 0:
          return "待支付";
        case 1:
          return "已支付";
        case 2:
          return "已完成";
        case 3:
          return "退款中";
        case 4:
          return "已退款";
        case 5:
          return "已取消";
        case 6:
          return "拒绝退款";
        default:
          return "未知状态";
      }
    }
  },
  onLoad(options) {
    if (options.orderNo) {
      this.orderNo = options.orderNo;
      this.loadOrderDetail();
    } else {
      common_vendor.index.showToast({
        title: "订单号不存在",
        icon: "none"
      });
      setTimeout(() => {
        this.goBack();
      }, 1500);
    }
  },
  methods: {
    // 新增滚动事件处理
    onScroll(e) {
    },
    // 返回上一页
    goBack() {
      if (this.orderDetail && (this.orderDetail.status === 0 || this.orderDetail.status === 5)) {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:273", "订单状态:", this.orderDetail.status, "跳转到订单列表页");
        common_vendor.index.switchTab({
          url: "/pages/order/order"
        });
      } else {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:279", "订单状态:", this.orderDetail.status, "返回上一页");
        common_vendor.index.navigateBack();
      }
    },
    // 加载订单详情
    loadOrderDetail() {
      this.loading = true;
      utils_api.api.getOrderDetail(this.orderNo).then((res) => {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:290", "订单详情响应:", res.data);
        if (res.data.code === 200) {
          let orderData = res.data.data;
          if (typeof orderData.couponAmount === "undefined") {
            if (orderData.totalAmount && orderData.paymentAmount) {
              orderData.couponAmount = orderData.totalAmount - orderData.paymentAmount;
            } else {
              orderData.couponAmount = 0;
            }
          }
          this.orderDetail = orderData;
          common_vendor.index.__f__("log", "at pages/order/detail.vue:305", "处理后的订单数据:", this.orderDetail);
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取订单详情失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:314", "网络请求失败:", err);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr)
        return "";
      const parts = dateStr.split(" ");
      if (parts.length >= 1) {
        const datePart = parts[0];
        const timePart = parts.length > 1 ? parts[1] : "";
        return `${datePart} ${timePart.substring(0, 5)}`;
      }
      return dateStr;
    },
    // 获取支付方式文本
    getPaymentMethodText(method) {
      switch (method) {
        case "wechat":
          return "微信支付";
        case "alipay":
          return "支付宝";
        default:
          return method || "未知方式";
      }
    },
    // 取消订单
    cancelOrder() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消该订单吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "取消中..."
            });
            utils_api.api.cancelOrder(this.orderNo).then((res2) => {
              common_vendor.index.__f__("log", "at pages/order/detail.vue:366", "取消订单响应:", res2.data);
              if (res2.data.code === 200) {
                common_vendor.index.showToast({
                  title: "订单已取消",
                  icon: "success"
                });
                setTimeout(() => {
                  if (this.orderDetail) {
                    this.orderDetail.status = 5;
                  }
                  common_vendor.index.switchTab({
                    url: "/pages/order/order"
                  });
                }, 1500);
              } else {
                common_vendor.index.showToast({
                  title: res2.data.message || "取消订单失败",
                  icon: "none"
                });
              }
            }).catch((err) => {
              common_vendor.index.__f__("error", "at pages/order/detail.vue:391", "网络请求失败:", err);
              common_vendor.index.showToast({
                title: "网络请求失败",
                icon: "none"
              });
            }).finally(() => {
              common_vendor.index.hideLoading();
            });
          }
        }
      });
    },
    // 显示支付弹窗
    payOrder() {
      this.showPaymentPopup = true;
      this.paymentMethod = "wechat";
    },
    // 关闭弹窗
    closePopup() {
      this.showPaymentPopup = false;
    },
    // 确认支付
    confirmPayment() {
      common_vendor.index.showLoading({
        title: "支付中..."
      });
      const currentPaymentMethod = this.paymentMethod;
      common_vendor.index.__f__("log", "at pages/order/detail.vue:425", "[确认支付] 准备支付订单:", this.orderNo);
      common_vendor.index.__f__("log", "at pages/order/detail.vue:426", "[确认支付] 选择的支付方式:", currentPaymentMethod);
      utils_api.api.payOrder(this.orderNo, currentPaymentMethod).then((res) => {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:431", "[API调用] 支付订单响应:", res.data);
        if (res.data.code === 200) {
          common_vendor.index.showToast({
            title: "支付成功",
            icon: "success"
          });
          this.closePopup();
          this.checkAndUpdateCart();
          this.refreshCouponsAfterPayment();
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/order/order"
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "支付失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:461", "[API调用] 网络请求失败:", err);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    // 刷新优惠券状态
    refreshCouponsAfterPayment() {
      utils_api.api.refreshCoupons().then((res) => {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:477", "支付后刷新优惠券状态:", res.data);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:481", "刷新优惠券状态失败:", err);
      });
    },
    // 检查并更新购物车状态
    checkAndUpdateCart() {
      utils_api.api.getCart().then((res) => {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:490", "获取购物车信息:", res.data);
        let hasSelectedItems = false;
        if (res.data && res.data.code === 200 && res.data.data && res.data.data.items) {
          hasSelectedItems = res.data.data.items.some((item) => item.selected);
        } else if (Array.isArray(res.data)) {
          hasSelectedItems = res.data.some((item) => item.selected);
        } else if (res.data && res.data.items) {
          hasSelectedItems = res.data.items.some((item) => item.selected);
        }
        if (hasSelectedItems) {
          this.clearSelectedCartItems();
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:510", "获取购物车信息失败:", err);
      });
    },
    // 清空已选中的购物车商品
    clearSelectedCartItems() {
      utils_api.api.clearSelectedCartItems().then((res) => {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:518", "移除已选择的购物车商品成功:", res.data);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:521", "移除购物车商品失败:", err);
      });
    },
    // 选择支付方式
    selectPaymentMethod(method) {
      this.paymentMethod = method;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$5,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.loading
  }, $data.loading ? {} : common_vendor.e({
    d: common_vendor.t($options.orderStatusText),
    e: common_vendor.t($data.orderDetail.orderNo),
    f: $data.orderDetail.status !== 5
  }, $data.orderDetail.status !== 5 ? common_vendor.e({
    g: $data.orderDetail.createdAt
  }, $data.orderDetail.createdAt ? {
    h: common_vendor.t($options.formatDate($data.orderDetail.createdAt))
  } : {}, {
    i: $data.orderDetail.status >= 0 ? 1 : "",
    j: $data.orderDetail.status >= 1 ? 1 : "",
    k: $data.orderDetail.paymentTime
  }, $data.orderDetail.paymentTime ? {
    l: common_vendor.t($options.formatDate($data.orderDetail.paymentTime))
  } : {}, {
    m: $data.orderDetail.takeNo
  }, $data.orderDetail.takeNo ? {
    n: common_vendor.t($data.orderDetail.takeNo)
  } : {}, {
    o: $data.orderDetail.status >= 1 ? 1 : ""
  }) : common_vendor.e({
    p: $data.orderDetail.cancelTime
  }, $data.orderDetail.cancelTime ? {
    q: common_vendor.t($options.formatDate($data.orderDetail.cancelTime))
  } : {}, {
    r: $data.orderDetail.refundInfo
  }, $data.orderDetail.refundInfo ? common_vendor.e({
    s: common_vendor.t($data.orderDetail.refundInfo.reason || "无"),
    t: $data.orderDetail.refundInfo.refundTime
  }, $data.orderDetail.refundInfo.refundTime ? {
    v: common_vendor.t($options.formatDate($data.orderDetail.refundInfo.refundTime))
  } : {}) : {}), {
    w: $data.orderDetail.status === 1
  }, $data.orderDetail.status === 1 ? {
    x: common_vendor.t($data.orderDetail.takeNo)
  } : {}, {
    y: common_vendor.f($data.orderDetail.orderDetails, (product, index, i0) => {
      return common_vendor.e({
        a: product.productImage,
        b: common_vendor.t(product.productName),
        c: product.temperature || product.sweetness
      }, product.temperature || product.sweetness ? common_vendor.e({
        d: product.temperature
      }, product.temperature ? {
        e: common_vendor.t(product.temperature)
      } : {}, {
        f: product.temperature && product.sweetness
      }, product.temperature && product.sweetness ? {} : {}, {
        g: product.sweetness
      }, product.sweetness ? {
        h: common_vendor.t(product.sweetness)
      } : {}) : {}, {
        i: product.ingredients && product.ingredients.length > 0
      }, product.ingredients && product.ingredients.length > 0 ? {
        j: common_vendor.f(product.ingredients, (ing, iIndex, i1) => {
          return {
            a: common_vendor.t(ing.name),
            b: common_vendor.t(iIndex < product.ingredients.length - 1 ? "、" : ""),
            c: iIndex
          };
        })
      } : {}, {
        k: common_vendor.t(product.price.toFixed(2)),
        l: common_vendor.t(product.quantity),
        m: index
      });
    }),
    z: common_vendor.t($data.orderDetail.totalAmount.toFixed(2)),
    A: $data.orderDetail.couponAmount > 0
  }, $data.orderDetail.couponAmount > 0 ? {
    B: common_vendor.t($data.orderDetail.couponAmount.toFixed(2))
  } : {}, {
    C: common_vendor.t(($data.orderDetail.displayAmount || $data.orderDetail.paymentAmount).toFixed(2)),
    D: $data.orderDetail.status > 0
  }, $data.orderDetail.status > 0 ? common_vendor.e({
    E: common_vendor.t($options.getPaymentMethodText($data.orderDetail.paymentMethod)),
    F: $data.orderDetail.paymentTime
  }, $data.orderDetail.paymentTime ? {
    G: common_vendor.t($options.formatDate($data.orderDetail.paymentTime))
  } : {}, {
    H: $data.orderDetail.transactionId
  }, $data.orderDetail.transactionId ? {
    I: common_vendor.t($data.orderDetail.transactionId)
  } : {}) : {}, {
    J: $data.orderDetail.status === 0
  }, $data.orderDetail.status === 0 ? {
    K: common_vendor.o((...args) => $options.cancelOrder && $options.cancelOrder(...args)),
    L: common_vendor.o((...args) => $options.payOrder && $options.payOrder(...args))
  } : {}, {
    M: $data.scrollTop,
    N: common_vendor.o((...args) => $options.onScroll && $options.onScroll(...args))
  }), {
    O: $data.showPaymentPopup
  }, $data.showPaymentPopup ? common_vendor.e({
    P: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args)),
    Q: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args)),
    R: common_vendor.t($data.orderDetail.paymentAmount.toFixed(2)),
    S: common_vendor.t($data.orderDetail.orderNo || ""),
    T: common_assets._imports_1$3,
    U: $data.paymentMethod === "wechat"
  }, $data.paymentMethod === "wechat" ? {} : {}, {
    V: $data.paymentMethod === "wechat" ? 1 : "",
    W: common_vendor.o(($event) => $options.selectPaymentMethod("wechat")),
    X: common_assets._imports_2$3,
    Y: $data.paymentMethod === "alipay"
  }, $data.paymentMethod === "alipay" ? {} : {}, {
    Z: $data.paymentMethod === "alipay" ? 1 : "",
    aa: common_vendor.o(($event) => $options.selectPaymentMethod("alipay")),
    ab: common_vendor.o((...args) => $options.confirmPayment && $options.confirmPayment(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map
