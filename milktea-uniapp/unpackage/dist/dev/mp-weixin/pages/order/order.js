"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      tabs: ["全部", "待支付", "已支付", "已取消", "售后"],
      activeTab: 0,
      orders: [],
      loading: false,
      refreshing: false,
      hasMore: true,
      page: 0,
      size: 5,
      emptyText: "暂无订单",
      // 左滑删除相关数据
      deleteButtonWidth: 70,
      // 删除按钮宽度为70px
      refundButtonWidth: 100,
      // 退款按钮宽度为100px
      touchStartX: 0,
      touchStartY: 0,
      direction: "",
      activeIndex: -1,
      isMoving: false
    };
  },
  onLoad() {
    this.checkLoginStatus();
    this.loadOrders();
  },
  onShow() {
    this.refreshOrders();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showModal({
          title: "未登录提示",
          content: "您尚未登录，是否前往登录页面？",
          confirmText: "去登录",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            } else {
              common_vendor.index.switchTab({
                url: "/pages/menu/menu"
              });
            }
          }
        });
      }
    },
    // 切换标签
    switchTab(index) {
      if (this.activeTab !== index) {
        this.activeTab = index;
        this.refreshOrders();
      }
    },
    // 刷新订单
    refreshOrders() {
      this.orders = [];
      this.page = 0;
      this.hasMore = true;
      this.loadOrders();
    },
    // 下拉刷新
    onRefresh() {
      this.refreshing = true;
      this.refreshOrders();
      setTimeout(() => {
        this.refreshing = false;
      }, 1500);
    },
    // 加载订单列表
    loadOrders() {
      if (this.loading || !this.hasMore)
        return;
      this.loading = true;
      let status = void 0;
      switch (this.activeTab) {
        case 1:
          status = 0;
          break;
        case 2:
          status = 1;
          break;
        case 3:
          status = 5;
          break;
        case 4:
          this.loadRefundOrders();
          return;
      }
      common_vendor.index.__f__("log", "at pages/order/order.vue:246", "请求订单列表，状态:", status, "类型:", typeof status);
      utils_api.api.getOrders(status, this.page, this.size).then((res) => {
        common_vendor.index.__f__("log", "at pages/order/order.vue:250", "获取订单列表响应:", res.data);
        if (res.data.code === 200) {
          const data = res.data.data;
          this.orders = this.orders.concat(data.content || []);
          if (data.last) {
            this.hasMore = false;
          } else {
            this.page++;
          }
          this.updateEmptyText();
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取订单失败",
            icon: "none"
          });
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/order/order.vue:274", "网络请求失败:", err);
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    // 加载退款相关订单
    loadRefundOrders() {
      Promise.all([
        utils_api.api.getOrders(3, this.page, this.size),
        // 退款中
        utils_api.api.getOrders(4, this.page, this.size),
        // 已退款
        utils_api.api.getOrders(6, this.page, this.size)
        // 拒绝退款
      ]).then((responses) => {
        let allRefundOrders = [];
        responses.forEach((res) => {
          if (res.data && res.data.code === 200 && res.data.data) {
            const data = res.data.data;
            allRefundOrders = allRefundOrders.concat(data.content || []);
          }
        });
        allRefundOrders.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        this.orders = this.orders.concat(allRefundOrders);
        this.hasMore = false;
        if (this.orders.length === 0) {
          this.emptyText = "暂无售后订单";
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/order/order.vue:322", "获取退款订单失败:", err);
        common_vendor.index.showToast({
          title: "获取售后订单失败",
          icon: "none"
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    // 更新空数据提示
    updateEmptyText() {
      if (this.orders.length === 0) {
        switch (this.activeTab) {
          case 0:
            this.emptyText = "暂无订单";
            break;
          case 1:
            this.emptyText = "暂无待支付订单";
            break;
          case 2:
            this.emptyText = "暂无已支付订单";
            break;
          case 3:
            this.emptyText = "暂无已取消订单";
            break;
          case 4:
            this.emptyText = "暂无售后订单";
            break;
          default:
            this.emptyText = "暂无订单";
        }
      }
    },
    // 加载更多
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.loadOrders();
      }
    },
    // 取消订单
    cancelOrder(order) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消该订单吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "取消中..."
            });
            utils_api.api.cancelOrder(order.orderNo).then((res2) => {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("log", "at pages/order/order.vue:379", "取消订单响应:", res2.data);
              if (res2.data.code === 200) {
                common_vendor.index.showToast({
                  title: "订单已取消",
                  icon: "success"
                });
                setTimeout(() => {
                  this.refreshOrders();
                }, 1e3);
              } else {
                common_vendor.index.showToast({
                  title: res2.data.message || "取消订单失败",
                  icon: "none"
                });
              }
            }).catch((err) => {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/order/order.vue:399", "网络请求失败:", err);
              common_vendor.index.showToast({
                title: "网络请求失败",
                icon: "none"
              });
            });
          }
        }
      });
    },
    // 查看订单详情
    goToOrderDetail(orderNo) {
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?orderNo=${orderNo}`
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
    // 获取订单总商品数量
    getTotalQuantity(order) {
      if (!order.orderDetails || !order.orderDetails.length)
        return 0;
      return order.orderDetails.reduce((total, product) => {
        return total + product.quantity;
      }, 0);
    },
    // 触摸开始事件处理
    touchStart(e, index) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.direction = "";
      this.isMoving = false;
      this.activeIndex = index;
      this.orders.forEach((order, idx) => {
        if (idx !== index && order.offset) {
          this.$set(order, "offset", 0);
        }
      });
    },
    // 触摸移动事件处理
    touchMove(e, index) {
      if (this.activeIndex !== index)
        return;
      const moveX = e.touches[0].clientX;
      const moveY = e.touches[0].clientY;
      const deltaX = moveX - this.touchStartX;
      const deltaY = moveY - this.touchStartY;
      if (!this.direction) {
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
          this.direction = "horizontal";
        } else {
          this.direction = "vertical";
          return;
        }
      }
      if (this.direction === "horizontal") {
        this.isMoving = true;
        let offset = deltaX;
        if (deltaX > 0 && !(this.orders[index].offset < 0)) {
          offset = 0;
        }
        const maxOffset = this.orders[index].status === 1 ? -(this.deleteButtonWidth + this.refundButtonWidth + 2) : -(this.deleteButtonWidth + 2);
        if (offset < maxOffset) {
          offset = maxOffset;
        }
        this.$set(this.orders[index], "offset", offset);
        e.preventDefault();
      }
    },
    // 触摸结束事件处理
    touchEnd(e, index) {
      if (this.activeIndex !== index || !this.isMoving)
        return;
      const order = this.orders[index];
      const offset = order.offset || 0;
      const maxOffset = order.status === 1 ? -(this.deleteButtonWidth + this.refundButtonWidth + 2) : -(this.deleteButtonWidth + 2);
      if (offset < -20) {
        this.$set(order, "offset", maxOffset);
      } else {
        this.$set(order, "offset", 0);
      }
      this.isMoving = false;
    },
    // 关闭所有滑动项
    closeAllSwipe() {
      if (!this.orders)
        return;
      this.orders.forEach((order, index) => {
        if (order.offset) {
          this.$set(order, "offset", 0);
        }
      });
    },
    // 删除订单
    deleteOrder(orderNo) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该订单吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              title: "删除中..."
            });
            utils_api.api.deleteOrder(orderNo).then((res2) => {
              common_vendor.index.__f__("log", "at pages/order/order.vue:560", "删除订单响应:", res2.data);
              if (res2.data.code === 200) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                setTimeout(() => {
                  this.refreshOrders();
                }, 1e3);
              } else {
                common_vendor.index.showToast({
                  title: res2.data.message || "删除订单失败",
                  icon: "none"
                });
              }
            }).catch((err) => {
              common_vendor.index.__f__("error", "at pages/order/order.vue:579", "网络请求失败:", err);
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
    // 申请退款
    applyRefund(order) {
      common_vendor.index.showModal({
        title: "申请退款",
        content: "确定要申请退款吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateTo({
              url: `/pages/order/refund?orderNo=${order.orderNo}&amount=${order.paymentAmount}`
            });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (tab, index, i0) => {
      return {
        a: common_vendor.t(tab),
        b: index,
        c: common_vendor.n($data.activeTab === index ? "active" : ""),
        d: common_vendor.o(($event) => $options.switchTab(index), index)
      };
    }),
    b: $data.loading && !$data.refreshing && $data.orders.length === 0
  }, $data.loading && !$data.refreshing && $data.orders.length === 0 ? {} : {}, {
    c: $data.orders.length === 0 && !$data.loading
  }, $data.orders.length === 0 && !$data.loading ? {
    d: common_assets._imports_0$3,
    e: common_vendor.t($data.emptyText)
  } : {}, {
    f: common_vendor.f($data.orders, (order, index, i0) => {
      return common_vendor.e({
        a: order.status === 1
      }, order.status === 1 ? {
        b: common_vendor.o(($event) => $options.applyRefund(order), index)
      } : {}, {
        c: common_vendor.o(($event) => $options.deleteOrder(order.orderNo), index),
        d: common_vendor.t(order.orderNo),
        e: common_vendor.t(order.statusText),
        f: common_vendor.f(order.orderDetails, (product, pIndex, i1) => {
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
            j: common_vendor.f(product.ingredients, (ing, iIndex, i2) => {
              return {
                a: common_vendor.t(ing.name),
                b: common_vendor.t(iIndex < product.ingredients.length - 1 ? "、" : ""),
                c: iIndex
              };
            })
          } : {}, {
            k: common_vendor.t(product.price.toFixed(2)),
            l: common_vendor.t(product.quantity),
            m: pIndex
          });
        }),
        g: common_vendor.t($options.getTotalQuantity(order)),
        h: common_vendor.t(order.paymentAmount.toFixed(2)),
        i: common_vendor.t($options.formatDate(order.createdAt)),
        j: order.status === 0
      }, order.status === 0 ? {
        k: common_vendor.o(($event) => $options.cancelOrder(order), index)
      } : {}, {
        l: order.status === 0
      }, order.status === 0 ? {
        m: common_vendor.o(($event) => $options.goToOrderDetail(order.orderNo), index)
      } : {}, {
        n: common_vendor.o(($event) => $options.goToOrderDetail(order.orderNo), index),
        o: common_vendor.o(() => {
        }, index),
        p: `translateX(${order.offset || 0}px)`,
        q: common_vendor.o(($event) => $options.goToOrderDetail(order.orderNo), index),
        r: index,
        s: common_vendor.o(($event) => $options.touchStart($event, index), index),
        t: common_vendor.o(($event) => $options.touchMove($event, index), index),
        v: common_vendor.o(($event) => $options.touchEnd($event, index), index)
      });
    }),
    g: $data.orders.length > 0 && $data.hasMore && !$data.loading
  }, $data.orders.length > 0 && $data.hasMore && !$data.loading ? {} : $data.orders.length > 0 && !$data.hasMore ? {} : {}, {
    h: $data.orders.length > 0 && !$data.hasMore,
    i: $data.loading && $data.orders.length > 0
  }, $data.loading && $data.orders.length > 0 ? {} : {}, {
    j: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    k: $data.refreshing,
    l: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    m: common_vendor.o((...args) => $options.closeAllSwipe && $options.closeAllSwipe(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/order.js.map
