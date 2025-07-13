"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return {
      cartItems: [],
      loading: true,
      availableCoupons: [],
      selectedCoupon: null,
      paymentMethod: "wechat",
      paymentMethods: [
        { name: "微信支付", value: "wechat", icon: "weixin" },
        { name: "支付宝", value: "alipay", icon: "zhifubao" },
        { name: "积分支付", value: "point", icon: "jifen" }
      ],
      note: "",
      deliveryFee: 0,
      // 店内点餐无配送费
      showCouponModal: false,
      // 会员信息相关
      memberInfo: null,
      memberDiscount: 1
      // 默认不打折
    };
  },
  onLoad(options) {
    this.getMemberInfo();
    if (options && options.items) {
      try {
        const passedItems = JSON.parse(decodeURIComponent(options.items));
        if (passedItems && Array.isArray(passedItems) && passedItems.length > 0) {
          this.cartItems = passedItems;
          this.loading = false;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/order/confirm.vue:215", "解析传入商品数据失败:", e);
      }
    }
    if (!this.cartItems || this.cartItems.length === 0) {
      this.loadCartItems();
    }
    this.loadUserCoupons();
  },
  methods: {
    // 加载购物车数据
    loadCartItems() {
      this.loading = true;
      utils_api.api.request({
        url: "/cart",
        method: "GET",
        success: (res) => {
          this.loading = false;
          if (res.statusCode === 200) {
            if (res.data.code === 200 && res.data.data) {
              const cartData = res.data.data;
              this.cartItems = cartData.items ? cartData.items.filter((item) => item.selected) : [];
            } else if (Array.isArray(res.data)) {
              this.cartItems = res.data.filter((item) => item.selected);
            } else if (res.data.items && Array.isArray(res.data.items)) {
              this.cartItems = res.data.items.filter((item) => item.selected);
            }
            if (this.cartItems.length === 0) {
              common_vendor.index.showModal({
                title: "提示",
                content: "请先选择商品后再结算",
                showCancel: false,
                success: () => {
                  common_vendor.index.navigateBack();
                }
              });
            }
          } else if (res.statusCode === 401 || res.data && res.data.code === 401) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.showToast({
              title: "登录已过期，请重新登录",
              icon: "none"
            });
            setTimeout(() => {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }, 1500);
          } else {
            common_vendor.index.showToast({
              title: res.data.message || "获取购物车失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          this.loading = false;
          common_vendor.index.__f__("error", "at pages/order/confirm.vue:287", "获取购物车失败", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    },
    // 加载用户优惠券
    loadUserCoupons() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.__f__("log", "at pages/order/confirm.vue:300", "未找到token，无法获取优惠券");
        return;
      }
      const totalPrice = this.calculateTotalPrice();
      utils_api.api.getCoupons(0).then((res) => {
        if (res.statusCode === 200) {
          let couponsData = [];
          if (res.data && res.data.code === 200 && res.data.data && res.data.data.content) {
            couponsData = res.data.data.content;
          } else {
            this.availableCoupons = [];
            return;
          }
          if (couponsData.length === 0) {
            this.availableCoupons = [];
            return;
          }
          let processedCoupons = couponsData.map((item) => {
            const coupon = item.coupon || item;
            const minConsumption = parseFloat(
              coupon.minConsumption || coupon.minPoint || coupon.min_point || coupon.minAmount || 0
            );
            const type = parseInt(coupon.type || 1);
            const amount = parseFloat(coupon.amount || 0);
            let canUse = typeof item.canUse !== "undefined" ? item.canUse : totalPrice >= minConsumption;
            return {
              id: item.id || coupon.id || "",
              couponId: coupon.id || "",
              name: coupon.name || "优惠券",
              amount,
              type,
              // 1: 满减券, 2: 折扣券
              typeText: coupon.typeText || (type === 2 ? "折扣券" : "满减券"),
              description: coupon.description || "",
              minConsumption,
              startTime: coupon.startTime || "",
              endTime: coupon.endTime || "",
              expireDate: coupon.endTime || "",
              status: item.status || 0,
              statusText: item.statusText || "未使用",
              canUse
            };
          });
          this.availableCoupons = processedCoupons.filter(
            (coupon) => coupon.status === 0 || coupon.statusText === "未使用"
          );
          this.availableCoupons.sort((a, b) => {
            if (a.canUse !== b.canUse) {
              return a.canUse ? -1 : 1;
            }
            if (a.canUse) {
              const aValue = a.type === 2 ? totalPrice * (1 - a.amount) : a.amount;
              const bValue = b.type === 2 ? totalPrice * (1 - b.amount) : b.amount;
              return bValue - aValue;
            }
            return a.minConsumption - b.minConsumption;
          });
        } else {
          this.availableCoupons = [];
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/order/confirm.vue:400", "获取优惠券请求失败，错误详情:", err);
        this.availableCoupons = [];
      });
    },
    // 选择优惠券
    openCouponModal() {
      this.showCouponModal = true;
    },
    // 关闭优惠券选择弹窗
    closeCouponModal() {
      this.showCouponModal = false;
    },
    // 选择优惠券
    selectCoupon(coupon) {
      if (!coupon.canUse) {
        this.showMinAmountTips(coupon);
        return;
      }
      this.selectedCoupon = coupon;
      this.showCouponModal = false;
    },
    // 选择不使用优惠券
    selectNoCoupon() {
      this.selectedCoupon = null;
      this.showCouponModal = false;
    },
    // 确认优惠券选择
    confirmCouponSelection() {
      this.showCouponModal = false;
    },
    // 选择支付方式
    selectPayment(method) {
      this.paymentMethod = method;
    },
    // 计算单个商品价格
    calculateItemPrice(item) {
      common_vendor.index.__f__("log", "at pages/order/confirm.vue:445", "计算商品价格:", item);
      if (!item) {
        common_vendor.index.__f__("error", "at pages/order/confirm.vue:449", "商品数据为空");
        return 0;
      }
      let price = 0;
      if (item.product && typeof item.product.price !== "undefined") {
        price = item.product.price;
      } else if (typeof item.productPrice !== "undefined") {
        price = item.productPrice;
      } else if (typeof item.price !== "undefined") {
        price = item.price;
      } else {
        return 0;
      }
      price = parseFloat(price) || 0;
      if (item.ingredients && item.ingredients.length > 0) {
        const ingredientsPrice = item.ingredients.reduce((sum, ing) => {
          const ingPrice = parseFloat(ing.price) || 0;
          return sum + ingPrice;
        }, 0);
        price += ingredientsPrice;
      }
      const quantity = parseInt(item.quantity) || 1;
      const totalPrice = price * quantity;
      return totalPrice;
    },
    // 计算商品总价
    calculateTotalPrice() {
      return this.cartItems.reduce((sum, item) => sum + this.calculateItemPrice(item), 0);
    },
    // 计算最终价格（含优惠）
    calculateFinalPrice() {
      let total = this.calculateTotalPrice();
      if (this.selectedCoupon) {
        if (this.selectedCoupon.type === 2) {
          const discountRate = this.selectedCoupon.amount;
          const discountAmount = total * (1 - discountRate);
          total = total - discountAmount;
        } else {
          total = Math.max(0, total - this.selectedCoupon.amount);
        }
      }
      if (this.memberDiscount < 1) {
        total = Math.round(total * this.memberDiscount * 100) / 100;
      }
      return total > 0 ? total : 0;
    },
    // 获取优惠券折扣金额方法
    getCouponDiscountAmount() {
      if (!this.selectedCoupon)
        return 0;
      const totalPrice = this.calculateTotalPrice();
      if (this.selectedCoupon.type === 2) {
        return totalPrice * (1 - this.selectedCoupon.amount);
      } else {
        return this.selectedCoupon.amount;
      }
    },
    // 获取会员折扣金额方法
    getMemberDiscountAmount() {
      if (this.memberDiscount >= 1)
        return 0;
      let priceAfterCoupon = this.getPriceAfterCoupon();
      let discountAmount = priceAfterCoupon * (1 - this.memberDiscount);
      discountAmount = Math.round(discountAmount * 100) / 100;
      return discountAmount;
    },
    // 获取优惠券后金额方法
    getPriceAfterCoupon() {
      const totalPrice = this.calculateTotalPrice();
      if (!this.selectedCoupon)
        return totalPrice;
      if (this.selectedCoupon.type === 2) {
        return totalPrice * this.selectedCoupon.amount;
      } else {
        return Math.max(0, totalPrice - this.selectedCoupon.amount);
      }
    },
    // 提交订单
    submitOrder() {
      var _a;
      if (this.cartItems.length === 0) {
        common_vendor.index.showToast({
          title: "请先选择商品",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      const orderData = {
        // 购物车商品ID列表
        cartIds: this.cartItems.map((item) => item.id || 0).filter((id) => id > 0),
        // 直接购买的商品信息（如果有）
        directProduct: this.cartItems.length === 1 && this.cartItems[0].directBuy ? {
          productId: this.cartItems[0].productId || ((_a = this.cartItems[0].product) == null ? void 0 : _a.id),
          quantity: this.cartItems[0].quantity || 1,
          cartId: this.cartItems[0].id || 0,
          temperature: this.cartItems[0].temperature || "",
          sweetness: this.cartItems[0].sweetness || "",
          ingredients: (this.cartItems[0].ingredients || []).map((ing) => ({
            id: ing.id || 0,
            name: ing.name || "",
            price: ing.price || 0
          })),
          selected: true
        } : null,
        // 备注/说明
        remark: this.note || "",
        // 优惠券ID
        userCouponId: this.selectedCoupon ? this.selectedCoupon.id || 0 : null
      };
      if (!orderData.directProduct) {
        delete orderData.directProduct;
      }
      if (!orderData.userCouponId) {
        delete orderData.userCouponId;
      }
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.hideLoading();
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
        return;
      }
      utils_api.api.createOrder(orderData).then((res) => {
        common_vendor.index.hideLoading();
        if (res.statusCode === 200 || res.statusCode === 201) {
          let orderId, orderNo;
          if (res.data && res.data.code === 200 && res.data.data) {
            orderId = res.data.data.id || res.data.data.orderId;
            orderNo = res.data.data.orderNo;
          } else if (res.data) {
            orderId = res.data.orderId || res.data.id;
            orderNo = res.data.orderNo;
          }
          if (orderId || orderNo) {
            common_vendor.index.showToast({
              title: "订单提交成功",
              icon: "success",
              duration: 2e3
            });
            if (this.cartItems.length > 0) {
              this.clearSelectedCartItems();
            }
            setTimeout(() => {
              common_vendor.index.navigateTo({
                url: `/pages/order/detail?orderNo=${orderNo || orderId}`
              });
            }, 1500);
          } else {
            common_vendor.index.showToast({
              title: "订单数据异常",
              icon: "none"
            });
            common_vendor.index.__f__("error", "at pages/order/confirm.vue:663", "订单创建成功但返回数据异常", res.data);
          }
        } else {
          let errorMsg = "创建订单失败";
          if (res.data && res.data.message) {
            errorMsg = res.data.message;
          }
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2e3
          });
          common_vendor.index.__f__("error", "at pages/order/confirm.vue:676", "创建订单失败:", res);
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/order/confirm.vue:681", "提交订单失败:", err);
        common_vendor.index.showToast({
          title: "网络请求失败，请稍后再试",
          icon: "none",
          duration: 2e3
        });
      });
    },
    // 清空已选中的购物车商品
    clearSelectedCartItems() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token)
        return;
      utils_api.api.request({
        url: "/cart/selected",
        method: "DELETE",
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/order/confirm.vue:700", "移除已选择的购物车商品成功:", res.data);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/order/confirm.vue:703", "移除购物车商品失败:", err);
        }
      });
    },
    // 获取商品图片
    getProductImage(item) {
      if (item.product && item.product.image) {
        return item.product.image;
      } else if (item.productImage) {
        return item.productImage;
      }
      return "/static/default-product.png";
    },
    // 获取商品名称
    getProductName(item) {
      if (item.product && item.product.name) {
        return item.product.name;
      } else if (item.productName) {
        return item.productName;
      }
      return "未知商品";
    },
    // 检查是否有配料
    hasIngredients(item) {
      return item.ingredients && item.ingredients.length > 0;
    },
    // 格式化配料显示
    formatIngredients(item) {
      if (!this.hasIngredients(item))
        return "";
      return item.ingredients.map((ing) => {
        return ing.name || ing;
      }).join("、");
    },
    // 显示未满足最低金额的提示
    showMinAmountTips(coupon) {
      const diff = coupon.minConsumption - this.calculateTotalPrice();
      common_vendor.index.showToast({
        title: `还差¥${diff.toFixed(2)}才能使用此${coupon.type === 2 ? "折扣" : ""}优惠券`,
        icon: "none",
        duration: 2e3
      });
    },
    // 获取会员等级信息
    getMemberInfo() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token)
        return;
      utils_api.api.getMemberInfo().then((res) => {
        common_vendor.index.__f__("log", "at pages/order/confirm.vue:760", "获取会员信息响应状态码:", res.statusCode);
        common_vendor.index.__f__("log", "at pages/order/confirm.vue:761", "获取会员信息完整响应:", JSON.stringify(res.data));
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          this.memberInfo = res.data.data;
          if (this.memberInfo && this.memberInfo.discount) {
            this.memberDiscount = parseFloat(this.memberInfo.discount);
          }
        } else {
          common_vendor.index.__f__("error", "at pages/order/confirm.vue:771", "获取会员信息失败:", res.data);
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/order/confirm.vue:775", "获取会员信息请求失败:", err);
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : common_vendor.e({
    b: common_vendor.f($data.cartItems, (item, k0, i0) => {
      return common_vendor.e({
        a: $options.getProductImage(item),
        b: common_vendor.t($options.getProductName(item)),
        c: common_vendor.t(item.quantity || 1),
        d: item.temperature || item.sweetness || $options.hasIngredients(item)
      }, item.temperature || item.sweetness || $options.hasIngredients(item) ? common_vendor.e({
        e: item.temperature
      }, item.temperature ? {
        f: common_vendor.t(item.temperature)
      } : {}, {
        g: item.sweetness
      }, item.sweetness ? {
        h: common_vendor.t(item.sweetness)
      } : {}, {
        i: $options.hasIngredients(item)
      }, $options.hasIngredients(item) ? {
        j: common_vendor.t($options.formatIngredients(item))
      } : {}) : {}, {
        k: common_vendor.t($options.calculateItemPrice(item).toFixed(2)),
        l: item.id
      });
    }),
    c: $data.selectedCoupon
  }, $data.selectedCoupon ? {
    d: common_vendor.t($data.selectedCoupon.name),
    e: common_vendor.t($data.selectedCoupon.amount.toFixed(2))
  } : {}, {
    f: common_vendor.o((...args) => $options.openCouponModal && $options.openCouponModal(...args)),
    g: $data.note,
    h: common_vendor.o(($event) => $data.note = $event.detail.value),
    i: common_vendor.t($options.calculateTotalPrice().toFixed(2)),
    j: $data.selectedCoupon
  }, $data.selectedCoupon ? {
    k: common_vendor.t($data.selectedCoupon.type === 2 ? "(" + ($data.selectedCoupon.amount * 10).toFixed(1) + "折)" : ""),
    l: common_vendor.t($options.getCouponDiscountAmount().toFixed(2))
  } : {}, {
    m: $data.selectedCoupon
  }, $data.selectedCoupon ? {
    n: common_vendor.t($options.getPriceAfterCoupon().toFixed(2))
  } : {}, {
    o: $data.memberDiscount < 1
  }, $data.memberDiscount < 1 ? {
    p: common_vendor.t(($data.memberDiscount * 10).toFixed(1)),
    q: common_vendor.t($options.getMemberDiscountAmount().toFixed(2))
  } : {}, {
    r: common_vendor.t($options.calculateFinalPrice().toFixed(2))
  }), {
    s: common_vendor.t($options.calculateFinalPrice().toFixed(2)),
    t: common_vendor.o((...args) => $options.submitOrder && $options.submitOrder(...args)),
    v: $data.showCouponModal
  }, $data.showCouponModal ? common_vendor.e({
    w: common_vendor.o((...args) => $options.closeCouponModal && $options.closeCouponModal(...args)),
    x: common_vendor.o((...args) => $options.closeCouponModal && $options.closeCouponModal(...args)),
    y: $data.availableCoupons.length > 0
  }, $data.availableCoupons.length > 0 ? common_vendor.e({
    z: $data.selectedCoupon === null
  }, $data.selectedCoupon === null ? {} : {}, {
    A: $data.selectedCoupon === null ? 1 : "",
    B: common_vendor.o((...args) => $options.selectNoCoupon && $options.selectNoCoupon(...args)),
    C: common_vendor.f($data.availableCoupons, (coupon, index, i0) => {
      return common_vendor.e({
        a: coupon.type === 1
      }, coupon.type === 1 ? {
        b: common_vendor.t(coupon.amount.toFixed(2))
      } : {
        c: common_vendor.t((coupon.amount * 10).toFixed(1))
      }, {
        d: coupon.minConsumption > 0
      }, coupon.minConsumption > 0 ? {
        e: common_vendor.t(coupon.minConsumption.toFixed(2)),
        f: !coupon.canUse ? 1 : ""
      } : {}, {
        g: common_vendor.t(coupon.name),
        h: common_vendor.t(coupon.description || coupon.typeText),
        i: common_vendor.t(coupon.expireDate),
        j: $data.selectedCoupon && $data.selectedCoupon.id === coupon.id
      }, $data.selectedCoupon && $data.selectedCoupon.id === coupon.id ? {} : {}, {
        k: !coupon.canUse
      }, !coupon.canUse ? {} : {}, {
        l: index,
        m: $data.selectedCoupon && $data.selectedCoupon.id === coupon.id ? 1 : "",
        n: !coupon.canUse ? 1 : "",
        o: common_vendor.o(($event) => coupon.canUse ? $options.selectCoupon(coupon) : $options.showMinAmountTips(coupon), index)
      });
    })
  }) : {}, {
    D: common_vendor.o((...args) => $options.closeCouponModal && $options.closeCouponModal(...args)),
    E: common_vendor.o((...args) => $options.confirmCouponSelection && $options.confirmCouponSelection(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/confirm.js.map
