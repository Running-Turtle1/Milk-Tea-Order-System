"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      cartInfo: {
        items: [],
        totalPrice: 0,
        totalQuantity: 0,
        selectedTotalPrice: 0,
        selectedTotalQuantity: 0,
        allProductsAvailable: true
      },
      isEditMode: false,
      loading: false,
      // 左滑删除相关数据
      deleteButtonWidth: 70,
      // 调整删除按钮宽度为70px，与下面的px单位保持一致
      touchStartX: 0,
      touchStartY: 0,
      direction: "",
      activeIndex: -1,
      isMoving: false
    };
  },
  computed: {
    // 是否全选
    allSelected() {
      if (!this.cartInfo.items || this.cartInfo.items.length === 0) {
        return false;
      }
      return this.cartInfo.items.every((item) => item.selected);
    }
  },
  onShow() {
    this.fetchCartData();
  },
  methods: {
    // 计算单个商品总价（包含配料）
    calculateItemTotalPrice(item) {
      let price = item.productPrice || 0;
      if (item.ingredients && item.ingredients.length > 0) {
        const ingredientsPrice = item.ingredients.reduce((sum, ing) => {
          return sum + (parseFloat(ing.price) || 0);
        }, 0);
        price += ingredientsPrice;
      }
      return price;
    },
    // 获取购物车数据
    fetchCartData() {
      this.loading = true;
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.loading = false;
        common_vendor.index.showModal({
          title: "未登录提示",
          content: "您尚未登录，是否前往登录页面？",
          confirmText: "去登录",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              this.redirectToLogin();
            } else {
              common_vendor.index.switchTab({
                url: "/pages/menu/menu"
              });
            }
          }
        });
        return;
      }
      utils_api.api.request({
        url: "/cart",
        method: "GET"
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/cart/cart.vue:196", "获取购物车响应:", res.data);
        if (res.data.code === 200) {
          this.cartInfo = res.data.data;
          if (!this.cartInfo.items) {
            this.cartInfo.items = [];
          }
        } else if (res.data.code === 401) {
          this.handleTokenExpired();
        } else {
          this.showToast(res.data.message || "获取购物车失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:212", "网络请求失败:", err);
        this.showToast("网络请求失败");
      }).finally(() => {
        this.loading = false;
      });
    },
    // 调整商品数量
    adjustQuantity(itemId, newQuantity) {
      if (newQuantity < 1) {
        newQuantity = 1;
      }
      const itemIndex = this.cartInfo.items.findIndex((item2) => item2.id === itemId);
      if (itemIndex === -1) {
        this.showToast("找不到商品信息");
        return;
      }
      const item = this.cartInfo.items[itemIndex];
      utils_api.api.request({
        url: `/cart/${itemId}`,
        method: "PUT",
        data: {
          productId: item.productId,
          quantity: newQuantity,
          temperature: item.temperature || "",
          sweetness: item.sweetness || "",
          ingredients: item.ingredients || []
        }
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/cart/cart.vue:247", "更新购物车响应:", res.data);
        if (res.data.code === 200) {
          this.cartInfo = res.data.data;
        } else if (res.data.code === 401) {
          this.handleTokenExpired();
        } else {
          this.showToast(res.data.message || "更新购物车失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:257", "网络请求失败:", err);
        this.showToast("网络请求失败");
      });
    },
    // 切换商品选中状态
    toggleItemSelect(itemId, selected) {
      utils_api.api.request({
        url: `/cart/select/${itemId}?selected=${selected}`,
        method: "PUT"
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/cart/cart.vue:269", "切换选中状态响应:", res.data);
        if (res.data.code === 200) {
          this.cartInfo = res.data.data;
        } else if (res.data.code === 401) {
          this.handleTokenExpired();
        } else {
          this.showToast(res.data.message || "更新选中状态失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:279", "网络请求失败:", err);
        this.showToast("网络请求失败");
      });
    },
    // 切换全选状态
    toggleSelectAll(selected) {
      utils_api.api.request({
        url: `/cart/select-all?selected=${selected}`,
        method: "PUT"
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/cart/cart.vue:291", "全选/取消全选响应:", res.data);
        if (res.data.code === 200) {
          this.cartInfo = res.data.data;
        } else if (res.data.code === 401) {
          this.handleTokenExpired();
        } else {
          this.showToast(res.data.message || "操作失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:301", "网络请求失败:", err);
        this.showToast("网络请求失败");
      });
    },
    // 移除商品
    removeItem(itemId) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要从购物车中移除该商品吗？",
        success: (res) => {
          if (res.confirm) {
            utils_api.api.request({
              url: `/cart/${itemId}`,
              method: "DELETE"
            }).then((res2) => {
              common_vendor.index.__f__("log", "at pages/cart/cart.vue:318", "移除商品响应:", res2.data);
              if (res2.data.code === 200) {
                this.cartInfo = res2.data.data;
                this.resetSwipeStatus();
                this.showToast("删除成功", "success");
              } else if (res2.data.code === 401) {
                this.handleTokenExpired();
              } else {
                this.showToast(res2.data.message || "移除商品失败");
              }
            }).catch((err) => {
              common_vendor.index.__f__("error", "at pages/cart/cart.vue:330", "网络请求失败:", err);
              this.showToast("网络请求失败");
            });
          }
        }
      });
    },
    // 移除选中的商品
    removeSelectedItems() {
      if (this.cartInfo.selectedTotalQuantity === 0) {
        this.showToast("请选择要删除的商品");
        return;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除选中的商品吗？",
        success: (res) => {
          if (res.confirm) {
            utils_api.api.request({
              url: "/cart/selected",
              method: "DELETE"
            }).then((res2) => {
              common_vendor.index.__f__("log", "at pages/cart/cart.vue:355", "删除选中商品响应:", res2.data);
              if (res2.data.code === 200) {
                this.cartInfo = res2.data.data;
                this.resetSwipeStatus();
                this.showToast("删除成功", "success");
              } else if (res2.data.code === 401) {
                this.handleTokenExpired();
              } else {
                this.showToast(res2.data.message || "删除选中商品失败");
              }
            }).catch((err) => {
              common_vendor.index.__f__("error", "at pages/cart/cart.vue:367", "网络请求失败:", err);
              this.showToast("网络请求失败");
            });
          }
        }
      });
    },
    // 清空购物车
    clearCart() {
      if (this.cartInfo.totalQuantity === 0) {
        this.showToast("购物车已经是空的了");
        return;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要清空购物车吗？",
        success: (res) => {
          if (res.confirm) {
            utils_api.api.request({
              url: "/cart",
              method: "DELETE"
            }).then((res2) => {
              common_vendor.index.__f__("log", "at pages/cart/cart.vue:392", "清空购物车响应:", res2.data);
              if (res2.data.code === 200) {
                this.cartInfo = res2.data.data;
                this.showToast("已清空购物车", "success");
              } else if (res2.data.code === 401) {
                this.handleTokenExpired();
              } else {
                this.showToast(res2.data.message || "清空购物车失败");
              }
            }).catch((err) => {
              common_vendor.index.__f__("error", "at pages/cart/cart.vue:403", "网络请求失败:", err);
              this.showToast("网络请求失败");
            });
          }
        }
      });
    },
    // 检查库存
    checkStock() {
      if (this.cartInfo.selectedTotalQuantity === 0) {
        this.showToast("请先选择商品");
        return false;
      }
      return true;
    },
    // 结算
    async checkout() {
      if (this.cartInfo.selectedTotalQuantity === 0) {
        this.showToast("请选择要结算的商品");
        return;
      }
      try {
        const selectedItems = this.cartInfo.items.filter((item) => item.selected).map((item) => {
          if (!item.productPrice && typeof item.productPrice !== "number") {
            common_vendor.index.__f__("error", "at pages/cart/cart.vue:433", "商品缺少价格信息:", item);
          }
          return {
            ...item,
            price: item.productPrice || 0,
            // 添加price字段作为备用
            quantity: item.quantity || 1,
            // 确保配料信息完整
            ingredients: Array.isArray(item.ingredients) ? item.ingredients : []
          };
        });
        common_vendor.index.__f__("log", "at pages/cart/cart.vue:446", "传递到确认订单页面的商品数据:", selectedItems);
        common_vendor.index.navigateTo({
          url: `/pages/order/confirm?items=${encodeURIComponent(JSON.stringify(selectedItems))}`
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:453", "结算前检查失败:", error);
        this.showToast("网络请求失败，请重试");
      }
    },
    // 切换编辑模式
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
    },
    // 前往点单页
    goToMenu() {
      common_vendor.index.switchTab({
        url: "/pages/menu/menu"
      });
    },
    // 重定向到登录页
    redirectToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    },
    // 处理Token过期
    handleTokenExpired() {
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.showToast({
        title: "登录已过期，请重新登录",
        icon: "none"
      });
      setTimeout(() => {
        this.redirectToLogin();
      }, 1500);
    },
    // 显示提示信息
    showToast(title, icon = "none") {
      common_vendor.index.showToast({
        title,
        icon
      });
    },
    // 修改触摸事件处理方法，提高灵敏度
    touchStart(e, index) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.direction = "";
      this.isMoving = false;
      this.activeIndex = index;
      this.cartInfo.items.forEach((item, idx) => {
        if (idx !== index && item.offset) {
          this.$set(item, "offset", 0);
        }
      });
    },
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
        if (deltaX > 0 && !(this.cartInfo.items[index].offset < 0)) {
          offset = 0;
        }
        if (offset < -72) {
          offset = -72;
        }
        this.$set(this.cartInfo.items[index], "offset", offset);
        e.preventDefault();
      }
    },
    touchEnd(e, index) {
      if (this.activeIndex !== index || !this.isMoving)
        return;
      const item = this.cartInfo.items[index];
      const offset = item.offset || 0;
      if (offset < -20) {
        this.$set(item, "offset", -72);
      } else {
        this.$set(item, "offset", 0);
      }
      this.isMoving = false;
    },
    // 关闭所有滑动项
    closeAllSwipe() {
      if (!this.cartInfo.items)
        return;
      this.cartInfo.items.forEach((item, index) => {
        if (item.offset) {
          this.$set(item, "offset", 0);
        }
      });
    },
    // 在删除商品或批量删除后重置滑动状态
    resetSwipeStatus() {
      this.closeAllSwipe();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.cartInfo.items && $data.cartInfo.items.length === 0
  }, $data.cartInfo.items && $data.cartInfo.items.length === 0 ? {
    b: common_assets._imports_0$2,
    c: common_vendor.o((...args) => $options.goToMenu && $options.goToMenu(...args))
  } : common_vendor.e({
    d: common_vendor.t($data.isEditMode ? "完成" : "编辑"),
    e: common_vendor.o((...args) => $options.toggleEditMode && $options.toggleEditMode(...args)),
    f: common_vendor.f($data.cartInfo.items, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => $options.removeItem(item.id), index),
        b: common_vendor.n(item.selected ? "checked" : ""),
        c: common_vendor.o(($event) => $options.toggleItemSelect(item.id, !item.selected), index),
        d: item.productImage || "/static/default-product.png",
        e: common_vendor.t(item.productName),
        f: item.temperature || item.sweetness
      }, item.temperature || item.sweetness ? common_vendor.e({
        g: common_vendor.t(item.temperature || ""),
        h: item.temperature && item.sweetness
      }, item.temperature && item.sweetness ? {} : {}, {
        i: common_vendor.t(item.sweetness || "")
      }) : {}, {
        j: item.ingredients && item.ingredients.length > 0
      }, item.ingredients && item.ingredients.length > 0 ? {
        k: common_vendor.f(item.ingredients, (ing, i, i1) => {
          return {
            a: common_vendor.t(ing.name),
            b: common_vendor.t(i < item.ingredients.length - 1 ? "、" : ""),
            c: i
          };
        })
      } : {}, {
        l: common_vendor.t($options.calculateItemTotalPrice(item).toFixed(2)),
        m: common_vendor.o(($event) => $options.adjustQuantity(item.id, item.quantity - 1), index),
        n: item.quantity,
        o: common_vendor.o(($event) => $options.adjustQuantity(item.id, item.quantity + 1), index)
      }, $data.isEditMode ? {
        p: common_vendor.o(($event) => $options.removeItem(item.id), index)
      } : {}, {
        q: `translateX(${item.offset || 0}px)`,
        r: index,
        s: common_vendor.o(($event) => $options.touchStart($event, index), index),
        t: common_vendor.o(($event) => $options.touchMove($event, index), index),
        v: common_vendor.o(($event) => $options.touchEnd($event, index), index)
      });
    }),
    g: $data.isEditMode,
    h: common_vendor.o(() => {
    }),
    i: common_vendor.n($options.allSelected ? "checked" : ""),
    j: common_vendor.o(($event) => $options.toggleSelectAll(!$options.allSelected)),
    k: !$data.isEditMode
  }, !$data.isEditMode ? {
    l: common_vendor.t($data.cartInfo.selectedTotalPrice.toFixed(2)),
    m: common_vendor.t($data.cartInfo.selectedTotalQuantity),
    n: common_vendor.o((...args) => $options.checkout && $options.checkout(...args)),
    o: $data.cartInfo.selectedTotalQuantity === 0 ? 1 : ""
  } : {
    p: common_vendor.o((...args) => $options.removeSelectedItems && $options.removeSelectedItems(...args))
  }, {
    q: common_vendor.o((...args) => $options.closeAllSwipe && $options.closeAllSwipe(...args))
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/cart/cart.js.map
