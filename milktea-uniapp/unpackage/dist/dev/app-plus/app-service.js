if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const baseUrl = "http://39.105.25.33:8081/api";
  const getBaseUrl = () => {
    return baseUrl;
  };
  const interceptors = {
    request: null,
    response: null
  };
  const processImageUrl = (url) => {
    if (!url)
      return url;
    if (url.includes("/api/uploads/")) {
      return url + (url.includes("?") ? "&" : "?") + "t=" + (/* @__PURE__ */ new Date()).getTime();
    }
    return url;
  };
  const setRequestInterceptor = (callback) => {
    interceptors.request = callback;
  };
  const setResponseInterceptor = (callback) => {
    interceptors.response = callback;
  };
  const request = (options) => {
    const defaultOptions = {
      url: "",
      method: "GET",
      data: {},
      header: {
        "content-type": "application/json"
      }
    };
    let mergedOptions = {
      ...defaultOptions,
      ...options
    };
    if (!mergedOptions.url.startsWith("http")) {
      mergedOptions.url = `${baseUrl}${mergedOptions.url.startsWith("/") ? "" : "/"}${mergedOptions.url}`;
    }
    const token = uni.getStorageSync("token");
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        const expTime = tokenPayload.exp * 1e3;
        const currentTime = (/* @__PURE__ */ new Date()).getTime();
        if (currentTime >= expTime - 3e5) {
          formatAppLog("log", "at utils/api.js:71", "Token已过期或即将过期，跳转到登录页面");
          uni.removeStorageSync("token");
          uni.showToast({
            title: "登录已过期，请重新登录",
            icon: "none",
            duration: 2e3
          });
          setTimeout(() => {
            uni.navigateTo({
              url: "/pages/login/login"
            });
          }, 1500);
          throw new Error("Token expired");
        }
        mergedOptions.header = {
          ...mergedOptions.header,
          "Authorization": `Bearer ${token}`
        };
      } catch (e) {
        formatAppLog("error", "at utils/api.js:100", "Token解析错误:", e);
        if (e.message !== "Token expired") {
          uni.removeStorageSync("token");
        }
      }
    }
    if (interceptors.request) {
      const interceptedOptions = interceptors.request(mergedOptions);
      if (interceptedOptions) {
        mergedOptions = interceptedOptions;
      }
    }
    return new Promise((resolve, reject) => {
      uni.request({
        ...mergedOptions,
        success: (res) => {
          if (typeof res.data === "string" && res.data.includes("<!DOCTYPE html>")) {
            formatAppLog("error", "at utils/api.js:124", "收到HTML响应而非JSON数据，可能是认证问题");
            uni.removeStorageSync("token");
            const authErrorResponse = {
              ...res,
              statusCode: 401,
              data: {
                code: 401,
                message: "请先登录或登录已过期"
              }
            };
            uni.showToast({
              title: "请先登录或登录已过期",
              icon: "none",
              duration: 2e3
            });
            setTimeout(() => {
              uni.navigateTo({
                url: "/pages/login/login"
              });
            }, 1500);
            resolve(authErrorResponse);
            return;
          }
          if (res.statusCode === 401 || res.data && res.data.code === 401) {
            uni.removeStorageSync("token");
            uni.showToast({
              title: "登录已过期，请重新登录",
              icon: "none"
            });
            setTimeout(() => {
              uni.navigateTo({
                url: "/pages/login/login"
              });
            }, 1500);
          }
          if (interceptors.response) {
            const interceptedRes = interceptors.response(res);
            if (interceptedRes) {
              resolve(interceptedRes);
              return;
            }
          }
          resolve(res);
        },
        fail: (err) => {
          formatAppLog("error", "at utils/api.js:183", "请求失败:", err);
          reject(err);
        }
      });
    });
  };
  const api = {
    // 获取门店信息
    getShopInfo: () => {
      return request({
        url: "/shop/info",
        method: "GET"
      });
    },
    // 商品分类
    getCategories: () => {
      return request({
        url: "/product/categories",
        method: "GET"
      });
    },
    // 获取分类商品
    getCategoryProducts: (categoryId, page, size) => {
      return request({
        url: "/product/list",
        method: "GET",
        data: {
          categoryId,
          page,
          size
        }
      });
    },
    // 获取推荐商品
    getRecommendProducts: () => {
      return request({
        url: "/product/recommend",
        method: "GET"
      });
    },
    // 获取商品详情
    getProductDetail: (productId) => {
      return request({
        url: `/product/detail/${productId}`,
        method: "GET"
      });
    },
    // 获取配料列表
    getIngredients: () => {
      return request({
        url: "/ingredient/list",
        method: "GET"
      });
    },
    // 登录
    login: (username, password) => {
      return request({
        url: "/user/login",
        method: "POST",
        data: {
          username,
          password
        }
      });
    },
    // 注册
    register: (userData) => {
      return request({
        url: "/user/register",
        method: "POST",
        data: userData
      });
    },
    // 获取用户信息
    getUserInfo: () => {
      return request({
        url: "/user/profile",
        method: "GET"
      });
    },
    // 更新用户信息
    updateUserInfo: (userInfo) => {
      return request({
        url: "/user/update",
        method: "POST",
        data: userInfo
      });
    },
    // 上传头像
    uploadAvatar: (filePath) => {
      return new Promise((resolve, reject) => {
        const token = uni.getStorageSync("token");
        uni.uploadFile({
          url: `${baseUrl}/files/avatar`,
          filePath,
          name: "file",
          header: token ? { "Authorization": `Bearer ${token}` } : {},
          success: (res) => {
            if (typeof res.data === "string") {
              try {
                const data = JSON.parse(res.data);
                resolve(data);
              } catch (e) {
                resolve(res.data);
              }
            } else {
              resolve(res.data);
            }
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    },
    // 提交订单
    createOrder: (orderData) => {
      return request({
        url: "/order/create",
        method: "POST",
        data: orderData
      });
    },
    // 获取订单列表
    getOrders: (status, page, size) => {
      const requestData = {
        page,
        size
      };
      if (status !== null && status !== void 0) {
        requestData.status = status;
      }
      return request({
        url: "/order/list",
        method: "GET",
        data: requestData
      });
    },
    // 获取订单详情
    getOrderDetail: (orderNo) => {
      return request({
        url: `/order/detail/${orderNo}`,
        method: "GET"
      });
    },
    // 取消订单
    cancelOrder: (orderNo) => {
      return request({
        url: `/order/cancel/${orderNo}`,
        method: "POST"
      });
    },
    // 支付订单
    payOrder: (orderNo, paymentMethod) => {
      formatAppLog("log", "at utils/api.js:360", "API开始调用支付接口，支付方式:", paymentMethod, "订单号:", orderNo);
      return request({
        url: `/order/pay/${orderNo}?paymentMethod=${paymentMethod}`,
        method: "POST",
        data: {}
      });
    },
    // 获取积分记录
    getPointsRecords: (page, size) => {
      return request({
        url: "/user/points/records",
        method: "GET",
        data: {
          page,
          size
        }
      });
    },
    // 获取优惠券列表
    getCoupons: (status) => {
      return request({
        url: "/user/coupons",
        method: "GET",
        data: {
          status
        }
      });
    },
    // 兑换优惠券
    exchangeCoupon: (code) => {
      return request({
        url: "/user/exchange-coupon",
        method: "POST",
        data: {
          code
        }
      });
    },
    // 刷新优惠券状态
    refreshCoupons: () => {
      return request({
        url: "/user/coupons",
        method: "GET"
      });
    },
    // 获取购物车信息
    getCart: () => {
      return request({
        url: "/cart",
        method: "GET"
      });
    },
    // 清空已选择的购物车商品
    clearSelectedCartItems: () => {
      return request({
        url: "/cart/selected",
        method: "DELETE"
      });
    },
    // 验证购物车库存
    verifyCartStock: () => {
      return request({
        url: "/cart/verify-stock",
        method: "GET"
      });
    },
    // 删除订单
    deleteOrder: (orderNo) => {
      return request({
        url: `/order/${orderNo}`,
        method: "DELETE"
      });
    },
    // 申请退款
    applyRefund: (refundData) => {
      return request({
        url: "/refund/apply",
        method: "POST",
        data: refundData
      });
    },
    // 获取会员信息
    getMemberInfo: () => {
      return request({
        url: "/member/info",
        method: "GET"
      });
    }
  };
  const api$1 = {
    baseUrl,
    getBaseUrl,
    request,
    processImageUrl,
    setRequestInterceptor,
    setResponseInterceptor,
    ...api
  };
  const _imports_0$6 = "/static/icons/common/location-white.svg";
  const _imports_1$4 = "/static/icons/common/phone.svg";
  const _imports_2$4 = "/static/icons/common/shop.svg";
  const _imports_3$2 = "/static/icons/common/coffee.svg";
  const _imports_4$2 = "/static/icons/common/new.svg";
  const _imports_5$2 = "/static/icons/common/gift.svg";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$h = {
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
      uni.stopPullDownRefresh();
    },
    methods: {
      // 加载首页数据
      loadHomeData() {
        this.networkError = false;
        this.getShopInfo();
      },
      // 获取门店信息
      getShopInfo() {
        api$1.getShopInfo().then((res) => {
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
          uni.makePhoneCall({
            phoneNumber: this.shopInfo.phone,
            fail: () => {
            }
          });
        }
      },
      // 跳转到点单页面
      goToMenu() {
        uni.switchTab({
          url: "/pages/menu/menu"
        });
      },
      // 重试加载
      retryLoad() {
        this.loadHomeData();
      },
      // 显示错误提示
      showError(message) {
        uni.showToast({
          title: message || "操作失败",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "home-container" }, [
      vue.createCommentVNode(" 顶部轮播图 "),
      vue.createElementVNode("swiper", {
        class: "banner-swiper",
        circular: "",
        "indicator-dots": true,
        autoplay: true,
        interval: 3e3,
        duration: 1e3
      }, [
        vue.createElementVNode("swiper-item", null, [
          vue.createElementVNode("image", {
            src: $data.shopInfo.logo || "/static/logo.png",
            mode: "aspectFill",
            class: "banner-image"
          }, null, 8, ["src"])
        ])
      ]),
      vue.createCommentVNode(" 门店信息卡片 "),
      $data.shopInfo.id ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "shop-info-card"
      }, [
        vue.createElementVNode("view", { class: "shop-header" }, [
          vue.createElementVNode(
            "view",
            { class: "shop-name" },
            vue.toDisplayString($data.shopInfo.shopName),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "shop-hours" },
            "营业时间: " + vue.toDisplayString($data.shopInfo.businessHours),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "shop-body" }, [
          vue.createElementVNode(
            "view",
            { class: "shop-notice" },
            vue.toDisplayString($data.shopInfo.notice),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "shop-contact" }, [
            vue.createElementVNode("view", { class: "shop-address" }, [
              vue.createElementVNode("image", {
                src: _imports_0$6,
                class: "contact-icon"
              }),
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.shopInfo.address),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "shop-phone",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.callShop && $options.callShop(...args))
            }, [
              vue.createElementVNode("image", {
                src: _imports_1$4,
                class: "contact-icon",
                style: { "width": "28rpx", "height": "28rpx" }
              }),
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.shopInfo.phone),
                1
                /* TEXT */
              )
            ])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 店内点单提示 "),
      vue.createElementVNode("view", { class: "store-order-tip" }, [
        vue.createElementVNode("view", { class: "tip-icon" }, [
          vue.createElementVNode("image", {
            src: _imports_2$4,
            class: "tip-icon-img"
          })
        ]),
        vue.createElementVNode("view", { class: "tip-text" }, [
          vue.createElementVNode("text", { class: "tip-title" }, "欢迎光临"),
          vue.createElementVNode("text", { class: "tip-desc" }, "店内点单更便捷")
        ]),
        vue.createElementVNode("view", { class: "tip-btn" }, [
          vue.createElementVNode("button", {
            size: "mini",
            type: "primary",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.goToMenu && $options.goToMenu(...args))
          }, "去点餐")
        ])
      ]),
      vue.createCommentVNode(" 新增快捷入口卡片 "),
      vue.createElementVNode("view", { class: "quick-entry-wrapper" }, [
        vue.createElementVNode("view", {
          class: "entry-item",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.goToMenu && $options.goToMenu(...args))
        }, [
          vue.createElementVNode("view", { class: "entry-icon-wrapper drink" }, [
            vue.createElementVNode("image", {
              src: _imports_3$2,
              class: "entry-icon-img"
            })
          ]),
          vue.createElementVNode("text", { class: "entry-text" }, "今天喝点啥")
        ]),
        vue.createElementVNode("view", {
          class: "entry-item",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.goToMenu && $options.goToMenu(...args))
        }, [
          vue.createElementVNode("view", { class: "entry-icon-wrapper new" }, [
            vue.createElementVNode("image", {
              src: _imports_4$2,
              class: "entry-icon-img"
            })
          ]),
          vue.createElementVNode("text", { class: "entry-text" }, "新品上线")
        ]),
        vue.createElementVNode("view", {
          class: "entry-item",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.goToMenu && $options.goToMenu(...args))
        }, [
          vue.createElementVNode("view", { class: "entry-icon-wrapper free" }, [
            vue.createElementVNode("image", {
              src: _imports_5$2,
              class: "entry-icon-img"
            })
          ]),
          vue.createElementVNode("text", { class: "entry-text" }, "0元兑换")
        ])
      ]),
      vue.createCommentVNode(" 网络错误提示 "),
      $data.networkError ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "network-error"
      }, [
        vue.createElementVNode("text", { class: "error-text" }, "网络连接失败，请检查网络设置"),
        vue.createElementVNode("button", {
          size: "mini",
          type: "primary",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.retryLoad && $options.retryLoad(...args))
        }, "重试")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/index/index.vue"]]);
  const _imports_0$5 = "/static/icons/common/search.svg";
  const _imports_2$3 = "/static/icons/common/add.svg";
  const _imports_1$3 = "/static/icons/common/close.svg";
  const _imports_4$1 = "/static/icons/common/temperature.svg";
  const _imports_5$1 = "/static/icons/common/sweetness.svg";
  const _imports_6 = "/static/icons/common/ingredients.svg";
  const _imports_7 = "/static/icons/common/quantity.svg";
  const _sfc_main$g = {
    data() {
      return {
        // 分类数据
        categories: [],
        currentCategoryIndex: 0,
        scrollToId: "",
        // 商品数据
        recommendProducts: [],
        categoryProducts: {},
        // 按分类ID存储商品列表 {categoryId: [products]}
        categoryPages: {},
        // 分页信息 {categoryId: currentPage}
        categoryLoadingStatus: {},
        // 加载状态 {categoryId: 'loading'|'noMore'|'more'}
        // 商品详情
        showDetail: false,
        currentProduct: {},
        quantity: 1,
        popupStyle: {
          transform: "translateY(100%)",
          transition: "none"
        },
        maskStyle: {
          opacity: 0,
          transition: "none"
        },
        contentStyle: {
          opacity: 0,
          transition: "none"
        },
        // 规格选择
        temperatures: ["常温", "热", "冰", "少冰"],
        sweetness: ["标准糖", "少糖", "半糖", "微糖", "无糖"],
        ingredients: [],
        selectedTemp: "常温",
        selectedSweet: "标准糖",
        selectedIngredients: []
      };
    },
    onLoad(options) {
      this.loadCategories();
      this.loadRecommendProducts();
      this.loadIngredients();
      this.popupAnimation = uni.createAnimation({
        duration: 1e3,
        timingFunction: "ease-out",
        delay: 0
      });
      if (options.productId) {
        this.loadProductDetail(options.productId);
      }
    },
    methods: {
      // 加载商品分类
      loadCategories() {
        api$1.getCategories().then((res) => {
          formatAppLog("log", "at pages/menu/menu.vue:275", "获取商品分类响应:", res.data);
          if (res.data.code === 200) {
            this.categories = [
              { id: 0, name: "全部" },
              ...res.data.data
            ];
            this.categories.forEach((category) => {
              if (category.id !== 0) {
                this.categoryProducts[category.id] = [];
                this.categoryPages[category.id] = 0;
                this.categoryLoadingStatus[category.id] = "more";
                this.loadCategoryProducts(category.id);
              }
            });
          } else {
            this.showToast(res.data.message || "获取商品分类失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/menu/menu.vue:299", "网络请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 加载推荐商品
      loadRecommendProducts() {
        api$1.getRecommendProducts().then((res) => {
          formatAppLog("log", "at pages/menu/menu.vue:308", "获取推荐商品响应:", res.data);
          if (res.data.code === 200) {
            this.recommendProducts = res.data.data;
          } else {
            this.showToast(res.data.message || "获取推荐商品失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/menu/menu.vue:316", "网络请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 加载配料列表
      loadIngredients() {
        api$1.getIngredients().then((res) => {
          formatAppLog("log", "at pages/menu/menu.vue:325", "获取配料列表响应:", res.data);
          if (res.data.code === 200) {
            this.ingredients = res.data.data;
          } else {
            this.showToast(res.data.message || "获取配料列表失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/menu/menu.vue:333", "网络请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 加载分类商品
      loadCategoryProducts(categoryId, isLoadMore = false) {
        if (this.categoryLoadingStatus[categoryId] === "loading" || this.categoryLoadingStatus[categoryId] === "noMore") {
          return;
        }
        this.categoryLoadingStatus[categoryId] = "loading";
        const page = isLoadMore ? this.categoryPages[categoryId] + 1 : this.categoryPages[categoryId];
        const size = 10;
        api$1.getCategoryProducts(categoryId, page, size).then((res) => {
          formatAppLog("log", "at pages/menu/menu.vue:351", `获取分类${categoryId}商品响应:`, res.data);
          if (res.data.code === 200) {
            const data = res.data.data;
            if (isLoadMore) {
              this.categoryProducts[categoryId] = [...this.categoryProducts[categoryId], ...data.content];
            } else {
              this.categoryProducts[categoryId] = data.content;
            }
            this.categoryPages[categoryId] = page;
            if (data.last) {
              this.categoryLoadingStatus[categoryId] = "noMore";
            } else {
              this.categoryLoadingStatus[categoryId] = "more";
            }
          } else {
            this.showToast(res.data.message || "获取分类商品失败");
            this.categoryLoadingStatus[categoryId] = "more";
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/menu/menu.vue:377", "网络请求失败:", err);
          this.showToast("网络请求失败");
          this.categoryLoadingStatus[categoryId] = "more";
        });
      },
      // 切换分类
      switchCategory(index) {
        this.currentCategoryIndex = index;
        if (index === 0)
          return;
        const categoryId = this.categories[index].id;
        this.scrollToId = "category-section-" + categoryId;
      },
      // 加载更多商品
      loadMoreProducts() {
        if (this.currentCategoryIndex === 0)
          return;
        const categoryId = this.categories[this.currentCategoryIndex].id;
        this.loadCategoryProducts(categoryId, true);
      },
      // 预加载商品详情
      loadProductDetail(productId) {
        api$1.getProductDetail(productId).then((res) => {
          if (res.data.code === 200) {
            this.currentProduct = res.data.data;
            this.resetProductOptions();
            this.openDetailPopup();
          } else {
            this.showToast(res.data.message || "获取商品详情失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/menu/menu.vue:418", "网络请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 显示商品详情
      showProductDetail(product) {
        this.resetProductOptions();
        this.showDetail = true;
        this.popupStyle = {
          transform: "translateY(100%)",
          transition: "none"
        };
        this.maskStyle = {
          opacity: 0,
          transition: "none"
        };
        this.contentStyle = {
          opacity: 0,
          transition: "none"
        };
        this.$nextTick(() => {
          setTimeout(() => {
            api$1.getProductDetail(product.id).then((res) => {
              formatAppLog("log", "at pages/menu/menu.vue:450", "获取商品详情响应:", res.data);
              if (res.data.code === 200) {
                this.currentProduct = res.data.data;
                this.openDetailPopup();
              } else {
                this.showToast(res.data.message || "获取商品详情失败");
                this.showDetail = false;
              }
            }).catch((err) => {
              formatAppLog("error", "at pages/menu/menu.vue:463", "网络请求失败:", err);
              this.showToast("网络请求失败");
              this.showDetail = false;
            });
          }, 50);
        });
      },
      // 打开详情弹窗（动画部分）
      openDetailPopup() {
        this.maskStyle = {
          opacity: 1,
          transition: "opacity 0.2s ease-out"
        };
        setTimeout(() => {
          this.popupStyle = {
            transform: "translateY(0)",
            transition: "transform 0.3s ease-out"
          };
          setTimeout(() => {
            this.contentStyle = {
              opacity: 1,
              transition: "opacity 0.2s ease-out"
            };
          }, 150);
        }, 100);
      },
      // 隐藏商品详情
      hideProductDetail() {
        this.contentStyle = {
          opacity: 0,
          transition: "opacity 0.2s ease-in"
        };
        setTimeout(() => {
          this.popupStyle = {
            transform: "translateY(100%)",
            transition: "transform 0.3s ease-in"
          };
          setTimeout(() => {
            this.maskStyle = {
              opacity: 0,
              transition: "opacity 0.2s ease-in"
            };
            setTimeout(() => {
              this.showDetail = false;
            }, 200);
          }, 150);
        }, 100);
      },
      // 重置商品选项
      resetProductOptions() {
        this.quantity = 1;
        this.selectedTemp = "常温";
        this.selectedSweet = "标准糖";
        this.selectedIngredients = [];
      },
      // 调整数量
      adjustQuantity(delta) {
        const newQuantity = this.quantity + delta;
        if (newQuantity >= 1 && newQuantity <= 99) {
          this.quantity = newQuantity;
        }
      },
      // 切换配料选择
      toggleIngredient(ingredient) {
        const index = this.selectedIngredients.findIndex((item) => item.id === ingredient.id);
        if (index > -1) {
          this.selectedIngredients.splice(index, 1);
        } else {
          const ingredientObj = {
            id: ingredient.id,
            name: ingredient.name,
            price: ingredient.price
          };
          formatAppLog("log", "at pages/menu/menu.vue:554", "添加配料:", ingredientObj);
          this.selectedIngredients.push(ingredientObj);
        }
      },
      // 计算总价
      getTotalPrice() {
        if (!this.currentProduct.price)
          return 0;
        let total = this.currentProduct.price * this.quantity;
        this.selectedIngredients.forEach((ing) => {
          total += ing.price * this.quantity;
        });
        return total;
      },
      // 添加到购物车（带规格）
      addToCart() {
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showModal({
            title: "未登录提示",
            content: "您尚未登录，是否前往登录页面？",
            confirmText: "去登录",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                this.redirectToLogin();
              }
            }
          });
          return;
        }
        let ingredientsData = [];
        if (this.selectedIngredients && this.selectedIngredients.length > 0) {
          ingredientsData = this.selectedIngredients.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price
          }));
        }
        formatAppLog("log", "at pages/menu/menu.vue:605", "商品是否允许温度选择:", this.currentProduct.allowTemperature);
        formatAppLog("log", "at pages/menu/menu.vue:606", "商品是否允许甜度选择:", this.currentProduct.allowSweetness);
        formatAppLog("log", "at pages/menu/menu.vue:607", "商品可能的其他控制字段:", Object.keys(this.currentProduct).filter((key) => key.startsWith("allow")));
        formatAppLog("log", "at pages/menu/menu.vue:610", "用户选择的温度:", this.selectedTemp);
        formatAppLog("log", "at pages/menu/menu.vue:611", "用户选择的甜度:", this.selectedSweet);
        const specKey = `${this.selectedTemp}-${this.selectedSweet}-${ingredientsData.map((i) => i.id).join(",")}`;
        formatAppLog("log", "at pages/menu/menu.vue:615", "规格组合标识:", specKey);
        const cartData = {
          productId: this.currentProduct.id,
          quantity: this.quantity,
          temperature: this.selectedTemp,
          sweetness: this.selectedSweet,
          ingredients: ingredientsData,
          forceNewItem: true,
          // 添加标志，表示这是新项目
          selected: true
        };
        formatAppLog("log", "at pages/menu/menu.vue:628", "当前选择的配料原始数据:", this.selectedIngredients);
        formatAppLog("log", "at pages/menu/menu.vue:629", "处理后的配料数据:", ingredientsData);
        formatAppLog("log", "at pages/menu/menu.vue:630", "发送到购物车的数据:", cartData);
        formatAppLog("log", "at pages/menu/menu.vue:631", "当前商品是否允许配料:", this.currentProduct.allowIngredients);
        formatAppLog("log", "at pages/menu/menu.vue:632", "当前商品完整信息:", this.currentProduct);
        api$1.request({
          url: "/cart",
          method: "POST",
          data: cartData
        }).then((res) => {
          formatAppLog("log", "at pages/menu/menu.vue:639", "添加到购物车响应:", res.data);
          if (res.data.code === 200) {
            this.showToast("已添加到购物车", "success");
            this.hideProductDetail();
          } else if (res.data.code === 401) {
            this.handleTokenExpired();
          } else {
            this.showToast(res.data.message || "添加到购物车失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/menu/menu.vue:649", "网络请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 跳转到搜索页
      goToSearch() {
        uni.navigateTo({
          url: "/pages/menu/search"
        });
      },
      // 重定向到登录页
      redirectToLogin() {
        uni.navigateTo({
          url: "/pages/login/login"
        });
      },
      // 处理Token过期
      handleTokenExpired() {
        uni.removeStorageSync("token");
        uni.showToast({
          title: "登录已过期，请重新登录",
          icon: "none"
        });
        setTimeout(() => {
          this.redirectToLogin();
        }, 1500);
      },
      // 显示提示信息
      showToast(title, icon = "none") {
        uni.showToast({
          title,
          icon
        });
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "menu-container" }, [
      vue.createCommentVNode(" 搜索栏 "),
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.createElementVNode("view", {
          class: "search-box",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goToSearch && $options.goToSearch(...args))
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$5,
            class: "search-icon"
          }),
          vue.createElementVNode("text", { class: "search-placeholder" }, "搜索奶茶、果茶、小吃")
        ])
      ]),
      vue.createCommentVNode(" 内容区带分类导航 "),
      vue.createElementVNode("view", { class: "content-with-categories" }, [
        vue.createCommentVNode(" 左侧分类导航 "),
        vue.createElementVNode("scroll-view", {
          "scroll-y": "",
          class: "category-nav"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.categories, (category, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: category.id,
                class: vue.normalizeClass(["category-item", $data.currentCategoryIndex === index ? "active" : ""]),
                onClick: ($event) => $options.switchCategory(index)
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(category.name),
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createCommentVNode(" 右侧商品列表 "),
        vue.createElementVNode("scroll-view", {
          "scroll-y": "",
          class: "product-list",
          onScrolltolower: _cache[1] || (_cache[1] = (...args) => $options.loadMoreProducts && $options.loadMoreProducts(...args)),
          "scroll-into-view": $data.scrollToId
        }, [
          vue.createCommentVNode(" 推荐商品 "),
          $data.currentCategoryIndex === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "section"
          }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", null, "推荐商品")
            ]),
            vue.createElementVNode("view", { class: "product-grid" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.recommendProducts, (product) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "product-card",
                    key: product.id,
                    onClick: ($event) => $options.showProductDetail(product)
                  }, [
                    vue.createElementVNode("image", {
                      src: product.image || "/static/images/default-product.svg",
                      class: "product-image",
                      mode: "aspectFill"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", { class: "product-info" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "product-name" },
                        vue.toDisplayString(product.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "product-price-row" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "product-price" },
                          "¥" + vue.toDisplayString(product.price.toFixed(2)),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", {
                          class: "add-to-cart-btn",
                          onClick: vue.withModifiers(($event) => $options.showProductDetail(product), ["stop"])
                        }, [
                          vue.createElementVNode("image", {
                            src: _imports_2$3,
                            class: "add-icon"
                          })
                        ], 8, ["onClick"])
                      ])
                    ])
                  ], 8, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 分类商品 "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.categories, (category, index) => {
              return vue.withDirectives((vue.openBlock(), vue.createElementBlock("view", {
                class: "section",
                key: category.id,
                id: "category-section-" + category.id
              }, [
                vue.createElementVNode("view", { class: "section-title" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(category.name),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "product-grid" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.categoryProducts[category.id] || [], (product) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: "product-card",
                        key: product.id,
                        onClick: ($event) => $options.showProductDetail(product)
                      }, [
                        vue.createElementVNode("image", {
                          src: product.image || "/static/images/default-product.svg",
                          class: "product-image",
                          mode: "aspectFill"
                        }, null, 8, ["src"]),
                        vue.createElementVNode("view", { class: "product-info" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "product-name" },
                            vue.toDisplayString(product.name),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("view", { class: "product-price-row" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "product-price" },
                              "¥" + vue.toDisplayString(product.price.toFixed(2)),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode("view", {
                              class: "add-to-cart-btn",
                              onClick: vue.withModifiers(($event) => $options.showProductDetail(product), ["stop"])
                            }, [
                              vue.createElementVNode("image", {
                                src: _imports_2$3,
                                class: "add-icon"
                              })
                            ], 8, ["onClick"])
                          ])
                        ])
                      ], 8, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                vue.createCommentVNode(" 加载更多状态 "),
                $data.categoryLoadingStatus[category.id] === "loading" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "load-more"
                }, [
                  vue.createElementVNode("view", { class: "loading-spinner" }),
                  vue.createElementVNode("text", null, "加载中...")
                ])) : $data.categoryLoadingStatus[category.id] === "noMore" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "load-more"
                }, [
                  vue.createElementVNode("text", null, "已加载全部")
                ])) : vue.createCommentVNode("v-if", true)
              ], 8, ["id"])), [
                [vue.vShow, $data.currentCategoryIndex === 0 || $data.currentCategoryIndex === index]
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 40, ["scroll-into-view"])
      ]),
      vue.createCommentVNode(" 商品详情弹窗 - 预先渲染但隐藏 "),
      vue.withDirectives(vue.createElementVNode(
        "view",
        { class: "product-detail-popup" },
        [
          vue.createElementVNode(
            "view",
            {
              class: "popup-mask",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.hideProductDetail && $options.hideProductDetail(...args)),
              style: vue.normalizeStyle($data.maskStyle)
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "popup-content",
              style: vue.normalizeStyle($data.popupStyle)
            },
            [
              vue.createCommentVNode(" 添加内容淡入效果 "),
              vue.createElementVNode(
                "view",
                {
                  class: "popup-inner",
                  style: vue.normalizeStyle($data.contentStyle)
                },
                [
                  vue.createCommentVNode(" 关闭按钮 "),
                  vue.createElementVNode("view", {
                    class: "close-btn",
                    onClick: _cache[3] || (_cache[3] = (...args) => $options.hideProductDetail && $options.hideProductDetail(...args))
                  }, [
                    vue.createElementVNode("image", {
                      src: _imports_1$3,
                      class: "close-icon"
                    })
                  ]),
                  vue.createCommentVNode(" 商品基本信息 "),
                  vue.createElementVNode("view", { class: "detail-header" }, [
                    vue.createElementVNode("image", {
                      src: $data.currentProduct.image || "/static/images/default-product.svg",
                      class: "detail-image",
                      mode: "aspectFill"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", { class: "detail-basic-info" }, [
                      vue.createElementVNode("view", { class: "name-price-row" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "detail-name" },
                          vue.toDisplayString($data.currentProduct.name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "detail-price" },
                          "¥" + vue.toDisplayString($data.currentProduct.price ? $data.currentProduct.price.toFixed(2) : "0.00"),
                          1
                          /* TEXT */
                        )
                      ]),
                      $data.currentProduct.sales ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "detail-sales"
                        },
                        "销量: " + vue.toDisplayString($data.currentProduct.sales),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true)
                    ])
                  ]),
                  vue.createCommentVNode(" 规格选择 "),
                  vue.createElementVNode("view", { class: "specifications" }, [
                    vue.createCommentVNode(" 温度选择 "),
                    vue.createElementVNode("view", { class: "spec-section" }, [
                      vue.createElementVNode("view", { class: "spec-title-row" }, [
                        vue.createElementVNode("image", {
                          src: _imports_4$1,
                          class: "spec-icon"
                        }),
                        vue.createElementVNode("text", { class: "spec-title" }, "温度")
                      ]),
                      vue.createElementVNode("view", { class: "spec-options" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList($data.temperatures, (temp, index) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: index,
                              class: vue.normalizeClass(["spec-option", $data.selectedTemp === temp ? "selected" : ""]),
                              onClick: ($event) => $data.selectedTemp = temp
                            }, [
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(temp),
                                1
                                /* TEXT */
                              )
                            ], 10, ["onClick"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ]),
                    vue.createCommentVNode(" 甜度选择 "),
                    vue.createElementVNode("view", { class: "spec-section" }, [
                      vue.createElementVNode("view", { class: "spec-title-row" }, [
                        vue.createElementVNode("image", {
                          src: _imports_5$1,
                          class: "spec-icon"
                        }),
                        vue.createElementVNode("text", { class: "spec-title" }, "甜度")
                      ]),
                      vue.createElementVNode("view", { class: "spec-options" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList($data.sweetness, (sweet, index) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: index,
                              class: vue.normalizeClass(["spec-option", $data.selectedSweet === sweet ? "selected" : ""]),
                              onClick: ($event) => $data.selectedSweet = sweet
                            }, [
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(sweet),
                                1
                                /* TEXT */
                              )
                            ], 10, ["onClick"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ]),
                    vue.createCommentVNode(" 配料选择 "),
                    $data.ingredients.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "spec-section"
                    }, [
                      vue.createElementVNode("view", { class: "spec-title-row" }, [
                        vue.createElementVNode("image", {
                          src: _imports_6,
                          class: "spec-icon"
                        }),
                        vue.createElementVNode("text", { class: "spec-title" }, "加料")
                      ]),
                      vue.createElementVNode("view", { class: "ingredient-options" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList($data.ingredients, (ing) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: ing.id,
                              class: vue.normalizeClass(["ingredient-item", $data.selectedIngredients.findIndex((i) => i.id === ing.id) > -1 ? "selected" : ""]),
                              onClick: ($event) => $options.toggleIngredient(ing)
                            }, [
                              vue.createElementVNode(
                                "text",
                                { class: "ingredient-name" },
                                vue.toDisplayString(ing.name),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "ingredient-price" },
                                "¥" + vue.toDisplayString(ing.price.toFixed(2)),
                                1
                                /* TEXT */
                              )
                            ], 10, ["onClick"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])) : vue.createCommentVNode("v-if", true)
                  ]),
                  vue.createCommentVNode(" 数量调整 "),
                  vue.createElementVNode("view", { class: "quantity-section" }, [
                    vue.createElementVNode("view", { class: "spec-title-row" }, [
                      vue.createElementVNode("image", {
                        src: _imports_7,
                        class: "spec-icon"
                      }),
                      vue.createElementVNode("text", { class: "quantity-label" }, "数量")
                    ]),
                    vue.createElementVNode("view", { class: "quantity-control" }, [
                      vue.createElementVNode("text", {
                        class: "quantity-btn minus",
                        onClick: _cache[4] || (_cache[4] = ($event) => $options.adjustQuantity(-1))
                      }, "-"),
                      vue.withDirectives(vue.createElementVNode(
                        "input",
                        {
                          type: "number",
                          class: "quantity-input",
                          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.quantity = $event),
                          disabled: ""
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [vue.vModelText, $data.quantity]
                      ]),
                      vue.createElementVNode("text", {
                        class: "quantity-btn plus",
                        onClick: _cache[6] || (_cache[6] = ($event) => $options.adjustQuantity(1))
                      }, "+")
                    ])
                  ]),
                  vue.createCommentVNode(" 底部按钮 "),
                  vue.createElementVNode("view", { class: "detail-footer" }, [
                    vue.createElementVNode("view", { class: "total-price" }, [
                      vue.createElementVNode("text", null, "总计："),
                      vue.createElementVNode(
                        "text",
                        { class: "price-value" },
                        "¥" + vue.toDisplayString($options.getTotalPrice().toFixed(2)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", {
                      class: "add-to-cart",
                      onClick: _cache[7] || (_cache[7] = (...args) => $options.addToCart && $options.addToCart(...args))
                    }, [
                      vue.createElementVNode("text", null, "加入购物车")
                    ])
                  ])
                ],
                4
                /* STYLE */
              )
            ],
            4
            /* STYLE */
          )
        ],
        512
        /* NEED_PATCH */
      ), [
        [vue.vShow, $data.showDetail]
      ])
    ]);
  }
  const PagesMenuMenu = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-388b40d3"], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/menu/menu.vue"]]);
  const _imports_0$4 = "/static/tabbar/cart.png";
  const _sfc_main$f = {
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
        const token = uni.getStorageSync("token");
        if (!token) {
          this.loading = false;
          uni.showModal({
            title: "未登录提示",
            content: "您尚未登录，是否前往登录页面？",
            confirmText: "去登录",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                this.redirectToLogin();
              } else {
                uni.switchTab({
                  url: "/pages/menu/menu"
                });
              }
            }
          });
          return;
        }
        api$1.request({
          url: "/cart",
          method: "GET"
        }).then((res) => {
          formatAppLog("log", "at pages/cart/cart.vue:196", "获取购物车响应:", res.data);
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
          formatAppLog("error", "at pages/cart/cart.vue:212", "网络请求失败:", err);
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
        api$1.request({
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
          formatAppLog("log", "at pages/cart/cart.vue:247", "更新购物车响应:", res.data);
          if (res.data.code === 200) {
            this.cartInfo = res.data.data;
          } else if (res.data.code === 401) {
            this.handleTokenExpired();
          } else {
            this.showToast(res.data.message || "更新购物车失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/cart/cart.vue:257", "网络请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 切换商品选中状态
      toggleItemSelect(itemId, selected) {
        api$1.request({
          url: `/cart/select/${itemId}?selected=${selected}`,
          method: "PUT"
        }).then((res) => {
          formatAppLog("log", "at pages/cart/cart.vue:269", "切换选中状态响应:", res.data);
          if (res.data.code === 200) {
            this.cartInfo = res.data.data;
          } else if (res.data.code === 401) {
            this.handleTokenExpired();
          } else {
            this.showToast(res.data.message || "更新选中状态失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/cart/cart.vue:279", "网络请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 切换全选状态
      toggleSelectAll(selected) {
        api$1.request({
          url: `/cart/select-all?selected=${selected}`,
          method: "PUT"
        }).then((res) => {
          formatAppLog("log", "at pages/cart/cart.vue:291", "全选/取消全选响应:", res.data);
          if (res.data.code === 200) {
            this.cartInfo = res.data.data;
          } else if (res.data.code === 401) {
            this.handleTokenExpired();
          } else {
            this.showToast(res.data.message || "操作失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/cart/cart.vue:301", "网络请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 移除商品
      removeItem(itemId) {
        uni.showModal({
          title: "提示",
          content: "确定要从购物车中移除该商品吗？",
          success: (res) => {
            if (res.confirm) {
              api$1.request({
                url: `/cart/${itemId}`,
                method: "DELETE"
              }).then((res2) => {
                formatAppLog("log", "at pages/cart/cart.vue:318", "移除商品响应:", res2.data);
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
                formatAppLog("error", "at pages/cart/cart.vue:330", "网络请求失败:", err);
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
        uni.showModal({
          title: "提示",
          content: "确定要删除选中的商品吗？",
          success: (res) => {
            if (res.confirm) {
              api$1.request({
                url: "/cart/selected",
                method: "DELETE"
              }).then((res2) => {
                formatAppLog("log", "at pages/cart/cart.vue:355", "删除选中商品响应:", res2.data);
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
                formatAppLog("error", "at pages/cart/cart.vue:367", "网络请求失败:", err);
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
        uni.showModal({
          title: "提示",
          content: "确定要清空购物车吗？",
          success: (res) => {
            if (res.confirm) {
              api$1.request({
                url: "/cart",
                method: "DELETE"
              }).then((res2) => {
                formatAppLog("log", "at pages/cart/cart.vue:392", "清空购物车响应:", res2.data);
                if (res2.data.code === 200) {
                  this.cartInfo = res2.data.data;
                  this.showToast("已清空购物车", "success");
                } else if (res2.data.code === 401) {
                  this.handleTokenExpired();
                } else {
                  this.showToast(res2.data.message || "清空购物车失败");
                }
              }).catch((err) => {
                formatAppLog("error", "at pages/cart/cart.vue:403", "网络请求失败:", err);
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
              formatAppLog("error", "at pages/cart/cart.vue:433", "商品缺少价格信息:", item);
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
          formatAppLog("log", "at pages/cart/cart.vue:446", "传递到确认订单页面的商品数据:", selectedItems);
          uni.navigateTo({
            url: `/pages/order/confirm?items=${encodeURIComponent(JSON.stringify(selectedItems))}`
          });
        } catch (error) {
          formatAppLog("error", "at pages/cart/cart.vue:453", "结算前检查失败:", error);
          this.showToast("网络请求失败，请重试");
        }
      },
      // 切换编辑模式
      toggleEditMode() {
        this.isEditMode = !this.isEditMode;
      },
      // 前往点单页
      goToMenu() {
        uni.switchTab({
          url: "/pages/menu/menu"
        });
      },
      // 重定向到登录页
      redirectToLogin() {
        uni.navigateTo({
          url: "/pages/login/login"
        });
      },
      // 处理Token过期
      handleTokenExpired() {
        uni.removeStorageSync("token");
        uni.showToast({
          title: "登录已过期，请重新登录",
          icon: "none"
        });
        setTimeout(() => {
          this.redirectToLogin();
        }, 1500);
      },
      // 显示提示信息
      showToast(title, icon = "none") {
        uni.showToast({
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
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "cart-container" }, [
      vue.createCommentVNode(" 空购物车提示 "),
      $data.cartInfo.items && $data.cartInfo.items.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "empty-cart"
      }, [
        vue.createElementVNode("image", {
          src: _imports_0$4,
          class: "empty-icon"
        }),
        vue.createElementVNode("text", { class: "empty-text" }, "购物车空空如也"),
        vue.createElementVNode("view", {
          class: "go-shopping-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goToMenu && $options.goToMenu(...args))
        }, [
          vue.createElementVNode("button", {
            type: "primary",
            size: "mini"
          }, "去选购")
        ])
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 购物车内容 "),
          vue.createElementVNode("view", {
            class: "cart-content",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.closeAllSwipe && $options.closeAllSwipe(...args))
          }, [
            vue.createCommentVNode(" 头部操作栏 "),
            vue.createElementVNode("view", { class: "cart-header" }, [
              vue.createElementVNode("text", { class: "cart-title" }, "购物车"),
              vue.createElementVNode(
                "text",
                {
                  class: "edit-btn",
                  onClick: _cache[1] || (_cache[1] = (...args) => $options.toggleEditMode && $options.toggleEditMode(...args))
                },
                vue.toDisplayString($data.isEditMode ? "完成" : "编辑"),
                1
                /* TEXT */
              )
            ]),
            vue.createCommentVNode(" 商品列表 "),
            vue.createElementVNode(
              "scroll-view",
              {
                "scroll-y": "",
                class: "cart-list",
                onTouchstart: vue.withModifiers(() => {
                }, ["stop"])
              },
              [
                vue.createCommentVNode(" 商品项 - 重新实现左滑删除功能 "),
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.cartInfo.items, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "cart-item-wrapper",
                      key: index,
                      onTouchstart: ($event) => $options.touchStart($event, index),
                      onTouchmove: ($event) => $options.touchMove($event, index),
                      onTouchend: ($event) => $options.touchEnd($event, index)
                    }, [
                      vue.createCommentVNode(" 删除按钮放在容器内，但在卡片前面声明，确保它在DOM中的顺序是先于卡片 "),
                      vue.createElementVNode("view", {
                        class: "delete-button",
                        onClick: vue.withModifiers(($event) => $options.removeItem(item.id), ["stop"])
                      }, "删除", 8, ["onClick"]),
                      vue.createElementVNode(
                        "view",
                        {
                          class: "cart-item-container",
                          style: vue.normalizeStyle({ transform: `translateX(${item.offset || 0}px)` })
                        },
                        [
                          vue.createElementVNode("view", { class: "cart-item" }, [
                            vue.createCommentVNode(" 选择框 "),
                            vue.createElementVNode("view", {
                              class: "checkbox",
                              onClick: vue.withModifiers(($event) => $options.toggleItemSelect(item.id, !item.selected), ["stop"])
                            }, [
                              vue.createElementVNode(
                                "text",
                                {
                                  class: vue.normalizeClass(["checkbox-icon", item.selected ? "checked" : ""])
                                },
                                null,
                                2
                                /* CLASS */
                              )
                            ], 8, ["onClick"]),
                            vue.createCommentVNode(" 商品信息 "),
                            vue.createElementVNode("view", { class: "item-content" }, [
                              vue.createElementVNode("image", {
                                src: item.productImage || "/static/default-product.png",
                                class: "item-image",
                                mode: "aspectFill"
                              }, null, 8, ["src"]),
                              vue.createElementVNode("view", { class: "item-details" }, [
                                vue.createElementVNode(
                                  "view",
                                  { class: "item-name" },
                                  vue.toDisplayString(item.productName),
                                  1
                                  /* TEXT */
                                ),
                                vue.createElementVNode("view", { class: "item-specs-container" }, [
                                  item.temperature || item.sweetness ? (vue.openBlock(), vue.createElementBlock("view", {
                                    key: 0,
                                    class: "specs-row"
                                  }, [
                                    vue.createElementVNode("text", { class: "specs-label" }, "规格："),
                                    vue.createElementVNode(
                                      "text",
                                      { class: "specs-value" },
                                      vue.toDisplayString(item.temperature || ""),
                                      1
                                      /* TEXT */
                                    ),
                                    item.temperature && item.sweetness ? (vue.openBlock(), vue.createElementBlock("text", {
                                      key: 0,
                                      class: "specs-value"
                                    }, "，")) : vue.createCommentVNode("v-if", true),
                                    vue.createElementVNode(
                                      "text",
                                      { class: "specs-value" },
                                      vue.toDisplayString(item.sweetness || ""),
                                      1
                                      /* TEXT */
                                    )
                                  ])) : vue.createCommentVNode("v-if", true),
                                  item.ingredients && item.ingredients.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                                    key: 1,
                                    class: "specs-row"
                                  }, [
                                    vue.createElementVNode("text", { class: "specs-label" }, "配料："),
                                    vue.createElementVNode("text", { class: "specs-value" }, [
                                      (vue.openBlock(true), vue.createElementBlock(
                                        vue.Fragment,
                                        null,
                                        vue.renderList(item.ingredients, (ing, i) => {
                                          return vue.openBlock(), vue.createElementBlock(
                                            "text",
                                            { key: i },
                                            vue.toDisplayString(ing.name) + vue.toDisplayString(i < item.ingredients.length - 1 ? "、" : ""),
                                            1
                                            /* TEXT */
                                          );
                                        }),
                                        128
                                        /* KEYED_FRAGMENT */
                                      ))
                                    ])
                                  ])) : vue.createCommentVNode("v-if", true)
                                ]),
                                vue.createElementVNode("view", { class: "price-quantity" }, [
                                  vue.createElementVNode(
                                    "text",
                                    { class: "item-price" },
                                    "¥" + vue.toDisplayString($options.calculateItemTotalPrice(item).toFixed(2)),
                                    1
                                    /* TEXT */
                                  ),
                                  vue.createElementVNode("view", { class: "quantity-control" }, [
                                    vue.createElementVNode("text", {
                                      class: "quantity-btn minus",
                                      onClick: vue.withModifiers(($event) => $options.adjustQuantity(item.id, item.quantity - 1), ["stop"])
                                    }, "-", 8, ["onClick"]),
                                    vue.createElementVNode("input", {
                                      type: "number",
                                      class: "quantity-input",
                                      value: item.quantity,
                                      disabled: ""
                                    }, null, 8, ["value"]),
                                    vue.createElementVNode("text", {
                                      class: "quantity-btn plus",
                                      onClick: vue.withModifiers(($event) => $options.adjustQuantity(item.id, item.quantity + 1), ["stop"])
                                    }, "+", 8, ["onClick"])
                                  ])
                                ])
                              ])
                            ]),
                            vue.createCommentVNode(" 编辑模式下的删除按钮 "),
                            $data.isEditMode ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 0,
                              class: "delete-btn",
                              onClick: vue.withModifiers(($event) => $options.removeItem(item.id), ["stop"])
                            }, [
                              vue.createElementVNode("text", { class: "delete-icon" }, "×")
                            ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                          ])
                        ],
                        4
                        /* STYLE */
                      )
                    ], 40, ["onTouchstart", "onTouchmove", "onTouchend"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              32
              /* NEED_HYDRATION */
            ),
            vue.createCommentVNode(" 底部结算栏 "),
            vue.createElementVNode("view", { class: "cart-footer" }, [
              vue.createElementVNode("view", {
                class: "select-all",
                onClick: _cache[2] || (_cache[2] = ($event) => $options.toggleSelectAll(!$options.allSelected))
              }, [
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["checkbox-icon", $options.allSelected ? "checked" : ""])
                  },
                  null,
                  2
                  /* CLASS */
                ),
                vue.createElementVNode("text", { class: "select-all-text" }, "全选")
              ]),
              !$data.isEditMode ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "footer-right"
              }, [
                vue.createElementVNode("view", { class: "price-info" }, [
                  vue.createElementVNode("view", { class: "total-price" }, [
                    vue.createTextVNode(" 合计: "),
                    vue.createElementVNode(
                      "text",
                      { class: "price-value" },
                      "¥" + vue.toDisplayString($data.cartInfo.selectedTotalPrice.toFixed(2)),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["checkout-btn", { "disabled": $data.cartInfo.selectedTotalQuantity === 0 }]),
                    onClick: _cache[3] || (_cache[3] = (...args) => $options.checkout && $options.checkout(...args))
                  },
                  [
                    vue.createElementVNode(
                      "text",
                      null,
                      "结算(" + vue.toDisplayString($data.cartInfo.selectedTotalQuantity) + ")",
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                )
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "footer-right"
              }, [
                vue.createElementVNode("view", {
                  class: "batch-delete-btn",
                  onClick: _cache[4] || (_cache[4] = (...args) => $options.removeSelectedItems && $options.removeSelectedItems(...args))
                }, [
                  vue.createElementVNode("text", null, "删除所选")
                ])
              ]))
            ])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const PagesCartCart = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/cart/cart.vue"]]);
  const _imports_0$3 = "/static/tabbar/order.png";
  const _sfc_main$e = {
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
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showModal({
            title: "未登录提示",
            content: "您尚未登录，是否前往登录页面？",
            confirmText: "去登录",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              } else {
                uni.switchTab({
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
        formatAppLog("log", "at pages/order/order.vue:246", "请求订单列表，状态:", status, "类型:", typeof status);
        api$1.getOrders(status, this.page, this.size).then((res) => {
          formatAppLog("log", "at pages/order/order.vue:250", "获取订单列表响应:", res.data);
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
            uni.showToast({
              title: res.data.message || "获取订单失败",
              icon: "none"
            });
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/order/order.vue:274", "网络请求失败:", err);
          uni.showToast({
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
          api$1.getOrders(3, this.page, this.size),
          // 退款中
          api$1.getOrders(4, this.page, this.size),
          // 已退款
          api$1.getOrders(6, this.page, this.size)
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
          formatAppLog("error", "at pages/order/order.vue:322", "获取退款订单失败:", err);
          uni.showToast({
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
        uni.showModal({
          title: "提示",
          content: "确定要取消该订单吗？",
          success: (res) => {
            if (res.confirm) {
              uni.showLoading({
                title: "取消中..."
              });
              api$1.cancelOrder(order.orderNo).then((res2) => {
                uni.hideLoading();
                formatAppLog("log", "at pages/order/order.vue:379", "取消订单响应:", res2.data);
                if (res2.data.code === 200) {
                  uni.showToast({
                    title: "订单已取消",
                    icon: "success"
                  });
                  setTimeout(() => {
                    this.refreshOrders();
                  }, 1e3);
                } else {
                  uni.showToast({
                    title: res2.data.message || "取消订单失败",
                    icon: "none"
                  });
                }
              }).catch((err) => {
                uni.hideLoading();
                formatAppLog("error", "at pages/order/order.vue:399", "网络请求失败:", err);
                uni.showToast({
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
        uni.navigateTo({
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
        uni.showModal({
          title: "提示",
          content: "确定要删除该订单吗？",
          success: (res) => {
            if (res.confirm) {
              uni.showLoading({
                title: "删除中..."
              });
              api$1.deleteOrder(orderNo).then((res2) => {
                formatAppLog("log", "at pages/order/order.vue:560", "删除订单响应:", res2.data);
                if (res2.data.code === 200) {
                  uni.showToast({
                    title: "删除成功",
                    icon: "success"
                  });
                  setTimeout(() => {
                    this.refreshOrders();
                  }, 1e3);
                } else {
                  uni.showToast({
                    title: res2.data.message || "删除订单失败",
                    icon: "none"
                  });
                }
              }).catch((err) => {
                formatAppLog("error", "at pages/order/order.vue:579", "网络请求失败:", err);
                uni.showToast({
                  title: "网络请求失败",
                  icon: "none"
                });
              }).finally(() => {
                uni.hideLoading();
              });
            }
          }
        });
      },
      // 申请退款
      applyRefund(order) {
        uni.showModal({
          title: "申请退款",
          content: "确定要申请退款吗？",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: `/pages/order/refund?orderNo=${order.orderNo}&amount=${order.paymentAmount}`
              });
            }
          }
        });
      }
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "order-container" }, [
      vue.createCommentVNode(" 标签切换栏 "),
      vue.createElementVNode("view", { class: "tabs" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.tabs, (tab, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["tab-item", $data.activeTab === index ? "active" : ""]),
              onClick: ($event) => $options.switchTab(index)
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(tab),
                1
                /* TEXT */
              )
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 订单列表 "),
      vue.createElementVNode("scroll-view", {
        class: "order-list",
        "scroll-y": "true",
        onScrolltolower: _cache[1] || (_cache[1] = (...args) => $options.loadMore && $options.loadMore(...args)),
        "refresher-enabled": "",
        "refresher-triggered": $data.refreshing,
        onRefresherrefresh: _cache[2] || (_cache[2] = (...args) => $options.onRefresh && $options.onRefresh(...args)),
        onClick: _cache[3] || (_cache[3] = (...args) => $options.closeAllSwipe && $options.closeAllSwipe(...args))
      }, [
        vue.createCommentVNode(" 加载中提示 "),
        $data.loading && !$data.refreshing && $data.orders.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-box"
        }, [
          vue.createElementVNode("view", { class: "loading-spinner" }),
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 空状态显示 "),
        $data.orders.length === 0 && !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-state"
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$3,
            class: "empty-icon"
          }),
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            vue.toDisplayString($data.emptyText),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 订单项目 "),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.orders, (order, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "order-item-wrapper",
              key: index,
              onTouchstart: ($event) => $options.touchStart($event, index),
              onTouchmove: ($event) => $options.touchMove($event, index),
              onTouchend: ($event) => $options.touchEnd($event, index)
            }, [
              vue.createCommentVNode(" 删除按钮和退款按钮放在容器内，但在卡片前面声明 "),
              vue.createElementVNode("view", { class: "action-buttons" }, [
                order.status === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "refund-button",
                  onClick: vue.withModifiers(($event) => $options.applyRefund(order), ["stop"])
                }, "申请退款", 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("view", {
                  class: "delete-button",
                  onClick: vue.withModifiers(($event) => $options.deleteOrder(order.orderNo), ["stop"])
                }, "删除", 8, ["onClick"])
              ]),
              vue.createElementVNode("view", {
                class: "order-item-container",
                style: vue.normalizeStyle({ transform: `translateX(${order.offset || 0}px)` }),
                onClick: ($event) => $options.goToOrderDetail(order.orderNo)
              }, [
                vue.createElementVNode("view", { class: "order-item" }, [
                  vue.createElementVNode("view", { class: "order-header" }, [
                    vue.createElementVNode(
                      "view",
                      { class: "order-number" },
                      "订单号: " + vue.toDisplayString(order.orderNo),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "order-status" },
                      vue.toDisplayString(order.statusText),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "order-products" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(order.orderDetails, (product, pIndex) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: "product-item",
                          key: pIndex
                        }, [
                          vue.createElementVNode("image", {
                            class: "product-image",
                            src: product.productImage,
                            mode: "aspectFill"
                          }, null, 8, ["src"]),
                          vue.createElementVNode("view", { class: "product-info" }, [
                            vue.createElementVNode(
                              "view",
                              { class: "product-name" },
                              vue.toDisplayString(product.productName),
                              1
                              /* TEXT */
                            ),
                            product.temperature || product.sweetness ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 0,
                              class: "product-spec"
                            }, [
                              product.temperature ? (vue.openBlock(), vue.createElementBlock(
                                "text",
                                { key: 0 },
                                vue.toDisplayString(product.temperature),
                                1
                                /* TEXT */
                              )) : vue.createCommentVNode("v-if", true),
                              product.temperature && product.sweetness ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, " / ")) : vue.createCommentVNode("v-if", true),
                              product.sweetness ? (vue.openBlock(), vue.createElementBlock(
                                "text",
                                { key: 2 },
                                vue.toDisplayString(product.sweetness),
                                1
                                /* TEXT */
                              )) : vue.createCommentVNode("v-if", true)
                            ])) : vue.createCommentVNode("v-if", true),
                            product.ingredients && product.ingredients.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 1,
                              class: "product-ingredients"
                            }, [
                              vue.createTextVNode(" 配料: "),
                              (vue.openBlock(true), vue.createElementBlock(
                                vue.Fragment,
                                null,
                                vue.renderList(product.ingredients, (ing, iIndex) => {
                                  return vue.openBlock(), vue.createElementBlock(
                                    "text",
                                    { key: iIndex },
                                    vue.toDisplayString(ing.name) + vue.toDisplayString(iIndex < product.ingredients.length - 1 ? "、" : ""),
                                    1
                                    /* TEXT */
                                  );
                                }),
                                128
                                /* KEYED_FRAGMENT */
                              ))
                            ])) : vue.createCommentVNode("v-if", true)
                          ]),
                          vue.createElementVNode("view", { class: "product-price-qty" }, [
                            vue.createElementVNode(
                              "view",
                              { class: "product-price" },
                              "¥" + vue.toDisplayString(product.price.toFixed(2)),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "view",
                              { class: "product-qty" },
                              "x" + vue.toDisplayString(product.quantity),
                              1
                              /* TEXT */
                            )
                          ])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]),
                  vue.createElementVNode("view", { class: "order-footer" }, [
                    vue.createElementVNode("view", { class: "order-total" }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        "共" + vue.toDisplayString($options.getTotalQuantity(order)) + "件商品",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "order-amount" },
                        "实付: ¥" + vue.toDisplayString(order.paymentAmount.toFixed(2)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "view",
                      { class: "order-time" },
                      vue.toDisplayString($options.formatDate(order.createdAt)),
                      1
                      /* TEXT */
                    ),
                    vue.createCommentVNode(" 订单操作按钮 "),
                    vue.createElementVNode("view", {
                      class: "order-actions",
                      onClick: _cache[0] || (_cache[0] = vue.withModifiers(() => {
                      }, ["stop"]))
                    }, [
                      order.status === 0 ? (vue.openBlock(), vue.createElementBlock("button", {
                        key: 0,
                        class: "action-btn cancel-btn",
                        onClick: vue.withModifiers(($event) => $options.cancelOrder(order), ["stop"])
                      }, "取消订单", 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                      order.status === 0 ? (vue.openBlock(), vue.createElementBlock("button", {
                        key: 1,
                        class: "action-btn pay-btn",
                        onClick: vue.withModifiers(($event) => $options.goToOrderDetail(order.orderNo), ["stop"])
                      }, "去支付", 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                      vue.createElementVNode("button", {
                        class: "action-btn detail-btn",
                        onClick: vue.withModifiers(($event) => $options.goToOrderDetail(order.orderNo), ["stop"])
                      }, "订单详情", 8, ["onClick"])
                    ])
                  ])
                ])
              ], 12, ["onClick"])
            ], 40, ["onTouchstart", "onTouchmove", "onTouchend"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        vue.createCommentVNode(" 底部加载更多提示 "),
        $data.orders.length > 0 && $data.hasMore && !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "load-more"
        }, [
          vue.createElementVNode("text", null, "上拉加载更多")
        ])) : $data.orders.length > 0 && !$data.hasMore ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "load-more"
        }, [
          vue.createElementVNode("text", null, "已加载全部")
        ])) : vue.createCommentVNode("v-if", true),
        $data.loading && $data.orders.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 4,
          class: "loading-box"
        }, [
          vue.createElementVNode("view", { class: "loading-spinner" }),
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])) : vue.createCommentVNode("v-if", true)
      ], 40, ["refresher-triggered"])
    ]);
  }
  const PagesOrderOrder = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/order/order.vue"]]);
  const _imports_0$2 = "/static/tabbar/user.png";
  const _imports_1$2 = "/static/icons/common/order.svg";
  const _imports_2$2 = "/static/icons/common/right.svg";
  const _imports_3$1 = "/static/icons/common/settings.svg";
  const _imports_4 = "/static/icons/common/service.svg";
  const _imports_5 = "/static/icons/common/about.svg";
  const _sfc_main$d = {
    data() {
      return {
        isLoggedIn: false,
        userInfo: {},
        memberInfo: {
          currentLevel: 0,
          levelName: "普通会员",
          currentPoints: 0,
          nextLevelPoints: 1e3,
          pointsToNextLevel: 1e3,
          discount: 1,
          benefits: "无折扣"
        }
      };
    },
    onShow() {
      this.checkLoginStatus();
      if (this.isLoggedIn) {
        this.loadUserInfo();
        this.loadMemberInfo();
      }
    },
    methods: {
      // 检查登录状态
      checkLoginStatus() {
        const token = uni.getStorageSync("token");
        this.isLoggedIn = !!token;
      },
      // 加载用户信息
      loadUserInfo() {
        if (!this.isLoggedIn) {
          formatAppLog("log", "at pages/mine/mine.vue:106", "未登录，跳过加载用户信息");
          return;
        }
        api$1.request({
          url: "/user/profile",
          method: "GET"
        }).then((res) => {
          formatAppLog("log", "at pages/mine/mine.vue:115", "用户信息响应:", res.data);
          if (res.data.code === 200) {
            this.userInfo = res.data.data;
          } else if (res.data.code === 401 || res.data.code === 403) {
            formatAppLog("log", "at pages/mine/mine.vue:120", "Token无效或权限不足，清除登录状态");
            this.handleLogout();
          } else {
            this.showToast(res.data.message || "获取用户信息失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/mine/mine.vue:127", "请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 加载会员信息
      loadMemberInfo() {
        if (!this.isLoggedIn) {
          formatAppLog("log", "at pages/mine/mine.vue:135", "未登录，跳过加载会员信息");
          return;
        }
        api$1.request({
          url: "/user/member-level",
          method: "GET"
        }).then((res) => {
          formatAppLog("log", "at pages/mine/mine.vue:144", "会员信息响应:", res.data);
          if (res.data.code === 200) {
            this.memberInfo = res.data.data;
          } else if (res.data.code === 401 || res.data.code === 403) {
            formatAppLog("log", "at pages/mine/mine.vue:149", "Token无效或权限不足，使用默认会员信息");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/mine/mine.vue:153", "获取会员信息失败:", err);
        });
      },
      // 计算进度条百分比
      calcProgressPercent() {
        if (!this.memberInfo || !this.memberInfo.nextLevelPoints || this.memberInfo.nextLevelPoints === 0) {
          return 0;
        }
        const earned = this.memberInfo.nextLevelPoints - this.memberInfo.pointsToNextLevel;
        return Math.min(100, Math.floor(earned / this.memberInfo.nextLevelPoints * 100));
      },
      // 预览头像
      previewAvatar() {
        const avatarUrl = this.userInfo.avatar || "/static/tabbar/user.png";
        uni.navigateTo({
          url: `/pages/user/avatar-view?url=${encodeURIComponent(avatarUrl)}`
        });
      },
      // 查看会员详情
      viewMemberDetail() {
        if (!this.isLoggedIn) {
          this.promptLogin();
          return;
        }
        uni.navigateTo({
          url: "/pages/user/member-center"
        });
      },
      // 前往订单历史页面
      goToOrderHistory() {
        if (!this.isLoggedIn) {
          this.promptLogin();
          return;
        }
        uni.switchTab({
          url: "/pages/order/order"
        });
      },
      // 前往设置页面
      goToSettings() {
        uni.navigateTo({
          url: "/pages/user/settings"
        });
      },
      // 联系客服
      contactUs() {
        this.showToast("联系客服页面开发中");
      },
      // 关于我们
      aboutUs() {
        this.showToast("关于我们页面开发中");
      },
      // 前往登录页
      goToLogin() {
        uni.navigateTo({
          url: "/pages/login/login"
        });
      },
      // 退出登录
      logout() {
        uni.showModal({
          title: "提示",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              this.handleLogout();
            }
          }
        });
      },
      // 处理退出登录逻辑
      handleLogout() {
        uni.removeStorageSync("token");
        uni.removeStorageSync("userInfo");
        this.isLoggedIn = false;
        this.userInfo = {};
        this.showToast("已退出登录", "success");
      },
      // 提示登录
      promptLogin() {
        uni.showModal({
          title: "提示",
          content: "请先登录",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              this.goToLogin();
            }
          }
        });
      },
      // 显示提示信息
      showToast(title, icon = "none") {
        uni.showToast({
          title,
          icon
        });
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "mine-container" }, [
      vue.createCommentVNode(" 用户信息卡片 "),
      vue.createElementVNode("view", { class: "user-card" }, [
        $data.isLoggedIn ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "user-info"
        }, [
          vue.createElementVNode("image", {
            class: "avatar",
            src: $data.userInfo.avatar || "/static/tabbar/user.png",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.previewAvatar && $options.previewAvatar(...args))
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "user-detail" }, [
            vue.createElementVNode(
              "view",
              { class: "username" },
              vue.toDisplayString($data.userInfo.username),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "member-info" }, [
              vue.createElementVNode(
                "text",
                { class: "member-level" },
                vue.toDisplayString($data.memberInfo.levelName),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "member-points" },
                "积分: " + vue.toDisplayString($data.userInfo.totalPoints || 0),
                1
                /* TEXT */
              )
            ])
          ])
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "not-login"
        }, [
          vue.createElementVNode("image", {
            class: "default-avatar",
            src: _imports_0$2
          }),
          vue.createElementVNode("view", { class: "login-btn" }, [
            vue.createElementVNode("button", {
              type: "primary",
              size: "mini",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.goToLogin && $options.goToLogin(...args))
            }, "立即登录")
          ])
        ]))
      ]),
      vue.createCommentVNode(" 会员卡片 "),
      $data.isLoggedIn ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "member-card",
        onClick: _cache[2] || (_cache[2] = (...args) => $options.viewMemberDetail && $options.viewMemberDetail(...args))
      }, [
        vue.createElementVNode("view", { class: "member-card-header" }, [
          vue.createElementVNode("text", { class: "card-title" }, "会员卡"),
          vue.createElementVNode("text", { class: "card-subtitle" }, "查看详情")
        ]),
        vue.createElementVNode("view", { class: "member-progress" }, [
          vue.createElementVNode("view", { class: "progress-text" }, [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($data.memberInfo.levelName),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              null,
              "下一级: 还需" + vue.toDisplayString($data.memberInfo.pointsToNextLevel) + "积分",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("progress", {
            percent: $options.calcProgressPercent(),
            "stroke-width": "4",
            activeColor: "#7b68ee",
            backgroundColor: "#333"
          }, null, 8, ["percent"])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 功能菜单 "),
      vue.createElementVNode("view", { class: "menu-list" }, [
        vue.createElementVNode("view", { class: "menu-section" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.goToOrderHistory && $options.goToOrderHistory(...args))
          }, [
            vue.createElementVNode("image", {
              src: _imports_1$2,
              class: "menu-icon-img"
            }),
            vue.createElementVNode("text", { class: "menu-text" }, "我的订单"),
            vue.createElementVNode("image", {
              src: _imports_2$2,
              class: "arrow-img"
            })
          ])
        ]),
        vue.createElementVNode("view", { class: "menu-section" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.goToSettings && $options.goToSettings(...args))
          }, [
            vue.createElementVNode("image", {
              src: _imports_3$1,
              class: "menu-icon-img"
            }),
            vue.createElementVNode("text", { class: "menu-text" }, "设置"),
            vue.createElementVNode("image", {
              src: _imports_2$2,
              class: "arrow-img"
            })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.contactUs && $options.contactUs(...args))
          }, [
            vue.createElementVNode("image", {
              src: _imports_4,
              class: "menu-icon-img"
            }),
            vue.createElementVNode("text", { class: "menu-text" }, "联系客服"),
            vue.createElementVNode("image", {
              src: _imports_2$2,
              class: "arrow-img"
            })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.aboutUs && $options.aboutUs(...args))
          }, [
            vue.createElementVNode("image", {
              src: _imports_5,
              class: "menu-icon-img"
            }),
            vue.createElementVNode("text", { class: "menu-text" }, "关于我们"),
            vue.createElementVNode("image", {
              src: _imports_2$2,
              class: "arrow-img"
            })
          ])
        ])
      ])
    ]);
  }
  const PagesMineMine = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/mine/mine.vue"]]);
  const _sfc_main$c = {
    data() {
      return {
        username: "",
        password: "",
        shopLogo: "",
        agreedToTerms: false
      };
    },
    onLoad() {
      this.getShopInfo();
    },
    methods: {
      // 切换协议同意状态
      toggleAgreement() {
        this.agreedToTerms = !this.agreedToTerms;
      },
      // 获取店铺信息
      getShopInfo() {
        api$1.getShopInfo().then((res) => {
          if (res.data.code === 200 && res.data.data) {
            this.shopLogo = res.data.data.logo;
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/login/login.vue:114", "获取店铺信息失败", err);
        });
      },
      handleLogin() {
        if (!this.agreedToTerms) {
          uni.showToast({
            title: "请先阅读并同意协议",
            icon: "none"
          });
          return;
        }
        if (!this.username) {
          uni.showToast({
            title: "请输入用户名或手机号",
            icon: "none"
          });
          return;
        }
        if (!this.password) {
          uni.showToast({
            title: "请输入密码",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "登录中..."
        });
        api$1.login(this.username, this.password).then((res) => {
          uni.hideLoading();
          if (res.data.code === 200) {
            const token = res.data.data.token;
            const user = res.data.data.user;
            uni.setStorageSync("token", token);
            uni.setStorageSync("userInfo", user);
            uni.showToast({
              title: "登录成功",
              icon: "success",
              duration: 1500,
              success: () => {
                uni.switchTab({
                  url: "/pages/index/index"
                });
              }
            });
          } else {
            uni.showToast({
              title: res.data.message || "登录失败，请检查账号密码",
              icon: "none"
            });
          }
        }).catch((err) => {
          uni.hideLoading();
          uni.showToast({
            title: "网络异常，请稍后重试",
            icon: "none"
          });
          formatAppLog("error", "at pages/login/login.vue:184", "登录请求失败", err);
        });
      },
      forgotPassword() {
        uni.showToast({
          title: "功能开发中",
          icon: "none"
        });
      },
      goToRegister() {
        uni.navigateTo({
          url: "/pages/register/register"
        });
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createCommentVNode(" 动态背景气泡 "),
      vue.createElementVNode("view", { class: "floating-bubbles" }, [
        (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList(8, (i) => {
            return vue.createElementVNode(
              "view",
              {
                class: "bubble",
                key: i,
                style: vue.normalizeStyle("--size:" + (30 + Math.random() * 60) + "rpx; --delay:" + Math.random() * 5 + "s; --duration:" + (10 + Math.random() * 20) + "s")
              },
              null,
              4
              /* STYLE */
            );
          }),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 奶茶杯装饰 "),
      vue.createElementVNode("view", { class: "decoration-cup left-cup" }),
      vue.createElementVNode("view", { class: "decoration-cup right-cup" }),
      vue.createElementVNode("view", { class: "login-content" }, [
        vue.createElementVNode("view", { class: "login-header" }, [
          vue.createElementVNode("view", { class: "logo-container" }, [
            vue.createElementVNode("image", {
              class: "logo",
              src: $data.shopLogo || "/static/logo.png",
              mode: "aspectFill"
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "logo-backdrop" }),
            vue.createElementVNode("view", { class: "logo-ring" })
          ]),
          vue.createElementVNode("view", { class: "title-group" }, [
            vue.createElementVNode("text", { class: "title" }, "奶茶物语"),
            vue.createElementVNode("text", { class: "subtitle" }, "Milk Tea Story")
          ])
        ]),
        vue.createElementVNode("view", { class: "login-form glass-card" }, [
          vue.createElementVNode("view", { class: "form-heading" }, [
            vue.createElementVNode("text", { class: "heading-text" }, "欢迎回来"),
            vue.createElementVNode("view", { class: "heading-line" })
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "账号"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("view", { class: "user-icon" })
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input-box",
                  type: "text",
                  placeholder: "用户名或手机号",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.username = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.username]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "密码"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("view", { class: "lock-icon" })
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input-box",
                  type: "password",
                  placeholder: "请输入密码",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.password = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.password]
              ])
            ])
          ]),
          vue.createCommentVNode(" 添加阅读协议 "),
          vue.createElementVNode("view", { class: "agreement-row" }, [
            vue.createElementVNode("view", {
              class: "checkbox-container",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.toggleAgreement && $options.toggleAgreement(...args))
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["checkbox", { "checked": $data.agreedToTerms }])
                },
                [
                  $data.agreedToTerms ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "checkbox-inner"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "agreement-text" }, [
              vue.createElementVNode("text", null, "我已阅读并同意"),
              vue.createElementVNode("text", { class: "agreement-link" }, "《用户协议》"),
              vue.createElementVNode("text", null, "和"),
              vue.createElementVNode("text", { class: "agreement-link" }, "《隐私政策》")
            ])
          ]),
          vue.createElementVNode("button", {
            class: vue.normalizeClass(["login-btn", { "login-btn-disabled": !$data.agreedToTerms }]),
            disabled: !$data.agreedToTerms,
            onClick: _cache[3] || (_cache[3] = (...args) => $options.handleLogin && $options.handleLogin(...args))
          }, [
            vue.createElementVNode("text", { class: "btn-text" }, "登录"),
            vue.createElementVNode("view", { class: "btn-arrow" }, "→")
          ], 10, ["disabled"]),
          vue.createElementVNode("view", { class: "action-links" }, [
            vue.createElementVNode("text", {
              class: "forgot-pwd",
              onClick: _cache[4] || (_cache[4] = (...args) => $options.forgotPassword && $options.forgotPassword(...args))
            }, "忘记密码?"),
            vue.createElementVNode("text", {
              class: "register",
              onClick: _cache[5] || (_cache[5] = (...args) => $options.goToRegister && $options.goToRegister(...args))
            }, "立即注册")
          ])
        ]),
        vue.createElementVNode("view", { class: "slogan" }, "用心调制，每一杯都是独特体验")
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/login/login.vue"]]);
  const _sfc_main$b = {
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
        api$1.getShopInfo().then((res) => {
          if (res.data.code === 200 && res.data.data) {
            this.shopLogo = res.data.data.logo;
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/register/register.vue:121", "获取店铺信息失败", err);
        });
      },
      handleRegister() {
        if (!this.formData.username) {
          uni.showToast({
            title: "请输入用户名",
            icon: "none"
          });
          return;
        }
        if (!this.formData.phone) {
          uni.showToast({
            title: "请输入手机号",
            icon: "none"
          });
          return;
        }
        if (!/^1\d{10}$/.test(this.formData.phone)) {
          uni.showToast({
            title: "手机号格式不正确",
            icon: "none"
          });
          return;
        }
        if (!this.formData.password) {
          uni.showToast({
            title: "请设置密码",
            icon: "none"
          });
          return;
        }
        if (this.formData.password.length < 6 || this.formData.password.length > 20) {
          uni.showToast({
            title: "密码长度应为6-20位",
            icon: "none"
          });
          return;
        }
        if (this.formData.password !== this.formData.confirmPassword) {
          uni.showToast({
            title: "两次密码输入不一致",
            icon: "none"
          });
          return;
        }
        if (!this.formData.agreed) {
          uni.showToast({
            title: "请阅读并同意用户协议与隐私政策",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "注册中..."
        });
        uni.request({
          url: `${this.baseUrl}/user/register`,
          method: "POST",
          data: {
            username: this.formData.username,
            password: this.formData.password,
            phone: this.formData.phone
          },
          success: (res) => {
            uni.hideLoading();
            if (res.data.code === 200) {
              uni.showToast({
                title: "注册成功",
                icon: "success",
                duration: 1500,
                success: () => {
                  setTimeout(() => {
                    uni.navigateTo({
                      url: "/pages/login/login"
                    });
                  }, 1500);
                }
              });
            } else {
              uni.showToast({
                title: res.data.message || "注册失败，请稍后重试",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            uni.hideLoading();
            uni.showToast({
              title: "网络异常，请稍后重试",
              icon: "none"
            });
            formatAppLog("error", "at pages/register/register.vue:221", "注册请求失败", err);
          }
        });
      },
      goToLogin() {
        uni.navigateTo({
          url: "/pages/login/login"
        });
      }
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createCommentVNode(" 动态背景气泡 "),
      vue.createElementVNode("view", { class: "floating-bubbles" }, [
        (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList(8, (i) => {
            return vue.createElementVNode(
              "view",
              {
                class: "bubble",
                key: i,
                style: vue.normalizeStyle("--size:" + (30 + Math.random() * 60) + "rpx; --delay:" + Math.random() * 5 + "s; --duration:" + (10 + Math.random() * 20) + "s")
              },
              null,
              4
              /* STYLE */
            );
          }),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 奶茶杯装饰 "),
      vue.createElementVNode("view", { class: "decoration-cup left-cup" }),
      vue.createElementVNode("view", { class: "decoration-cup right-cup" }),
      vue.createElementVNode("view", { class: "register-content" }, [
        vue.createElementVNode("view", { class: "register-header" }, [
          vue.createElementVNode("view", { class: "logo-container" }, [
            vue.createElementVNode("image", {
              class: "logo",
              src: $data.shopLogo || "/static/logo.png",
              mode: "aspectFill"
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "logo-backdrop" }),
            vue.createElementVNode("view", { class: "logo-ring" })
          ]),
          vue.createElementVNode("view", { class: "title-group" }, [
            vue.createElementVNode("text", { class: "title" }, "注册会员"),
            vue.createElementVNode("text", { class: "subtitle" }, "加入奶茶物语")
          ])
        ]),
        vue.createElementVNode("view", { class: "register-form glass-card" }, [
          vue.createElementVNode("view", { class: "form-heading" }, [
            vue.createElementVNode("text", { class: "heading-text" }, "创建账号"),
            vue.createElementVNode("view", { class: "heading-line" })
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "用户名"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("view", { class: "user-icon" })
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input-box",
                  type: "text",
                  placeholder: "请输入用户名",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.formData.username = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.formData.username]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "手机号"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("view", { class: "phone-icon" })
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input-box",
                  type: "number",
                  placeholder: "请输入手机号",
                  maxlength: "11",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.formData.phone = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.formData.phone]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "设置密码"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("view", { class: "lock-icon" })
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input-box",
                  type: "password",
                  placeholder: "请设置6-20位密码",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.formData.password = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.formData.password]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "确认密码"),
            vue.createElementVNode("view", { class: "input-wrapper" }, [
              vue.createElementVNode("view", { class: "input-icon" }, [
                vue.createElementVNode("view", { class: "lock-icon" })
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input-box",
                  type: "password",
                  placeholder: "请再次输入密码",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.formData.confirmPassword = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.formData.confirmPassword]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "agreement" }, [
            vue.createElementVNode("view", {
              class: "custom-checkbox",
              onClick: _cache[4] || (_cache[4] = ($event) => $data.formData.agreed = !$data.formData.agreed)
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["checkbox-inner", { "checked": $data.formData.agreed }])
                },
                null,
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("text", { class: "agreement-text" }, [
              vue.createTextVNode("我已阅读并同意"),
              vue.createElementVNode("text", { class: "link" }, "《用户协议》"),
              vue.createTextVNode("和"),
              vue.createElementVNode("text", { class: "link" }, "《隐私政策》")
            ])
          ]),
          vue.createElementVNode("button", {
            class: "register-btn",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.handleRegister && $options.handleRegister(...args)),
            disabled: !$data.formData.agreed
          }, [
            vue.createElementVNode("text", { class: "btn-text" }, "注册"),
            vue.createElementVNode("view", { class: "btn-arrow" }, "→")
          ], 8, ["disabled"]),
          vue.createElementVNode("view", { class: "action-links" }, [
            vue.createElementVNode("text", {
              class: "login-link",
              onClick: _cache[6] || (_cache[6] = (...args) => $options.goToLogin && $options.goToLogin(...args))
            }, "已有账号，去登录")
          ])
        ])
      ])
    ]);
  }
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/register/register.vue"]]);
  const _imports_0$1 = "/static/icons/common/back.svg";
  const _sfc_main$a = {
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
        uni.navigateBack();
      },
      // 加载用户头像
      loadUserAvatar() {
        const token = uni.getStorageSync("token");
        if (!token) {
          this.showToast("请先登录");
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
          return;
        }
        api$1.request({
          url: "/user/profile",
          method: "GET",
          success: (res) => {
            formatAppLog("log", "at pages/user/avatar-view.vue:70", "获取用户信息响应:", res.data);
            if (res.data.code === 200) {
              this.avatarUrl = api$1.processImageUrl(res.data.data.avatar || "");
            } else if (res.data.code === 401) {
              this.handleTokenExpired();
            } else {
              this.showToast(res.data.message || "获取用户信息失败");
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/user/avatar-view.vue:82", "网络请求失败:", err);
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
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            const tempFilePaths = res.tempFilePaths;
            const token = uni.getStorageSync("token");
            uni.showLoading({
              title: "上传中..."
            });
            const baseUrl2 = api$1.getBaseUrl();
            uni.uploadFile({
              url: `${baseUrl2}/files/avatar`,
              filePath: tempFilePaths[0],
              name: "file",
              header: {
                "Authorization": "Bearer " + token
              },
              success: (uploadRes) => {
                formatAppLog("log", "at pages/user/avatar-view.vue:121", "头像上传响应:", uploadRes);
                try {
                  const result = JSON.parse(uploadRes.data);
                  if (result.code === 200) {
                    this.avatarUrl = api$1.processImageUrl(result.data.url);
                    this.showToast("头像上传成功", "success");
                    const userInfo = uni.getStorageSync("userInfo") || {};
                    userInfo.avatar = result.data.url;
                    uni.setStorageSync("userInfo", userInfo);
                  } else {
                    this.showToast(result.message || "上传失败");
                  }
                } catch (e) {
                  formatAppLog("error", "at pages/user/avatar-view.vue:137", "解析响应失败:", e);
                  this.showToast("响应解析失败");
                }
              },
              fail: (err) => {
                formatAppLog("error", "at pages/user/avatar-view.vue:142", "上传失败:", err);
                this.showToast("上传失败，请检查网络");
              },
              complete: () => {
                uni.hideLoading();
              }
            });
          }
        });
      },
      // 处理Token过期
      handleTokenExpired() {
        uni.showToast({
          title: "登录已过期，请重新登录",
          icon: "none"
        });
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/login/login"
          });
        }, 1500);
      },
      // 显示提示信息
      showToast(title, icon = "none") {
        uni.showToast({
          title,
          icon
        });
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "avatar-view-container" }, [
      vue.createCommentVNode(" 自定义导航栏 "),
      vue.createElementVNode("view", { class: "custom-navbar" }, [
        vue.createElementVNode("view", {
          class: "navbar-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$1,
            class: "back-icon"
          })
        ]),
        vue.createElementVNode("view", { class: "navbar-title" }, "头像"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 头像展示区域 "),
      vue.createElementVNode("view", { class: "avatar-display" }, [
        vue.createElementVNode("image", {
          src: $data.avatarUrl || "/static/default-avatar.png",
          mode: "aspectFill",
          class: "avatar-image",
          onError: _cache[1] || (_cache[1] = (...args) => $options.handleImageError && $options.handleImageError(...args))
        }, null, 40, ["src"])
      ]),
      vue.createCommentVNode(" 操作按钮区域 "),
      vue.createElementVNode("view", { class: "action-buttons" }, [
        vue.createElementVNode("button", {
          class: "action-btn upload-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.uploadAvatar && $options.uploadAvatar(...args))
        }, "更换头像")
      ])
    ]);
  }
  const PagesUserAvatarView = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/user/avatar-view.vue"]]);
  const _imports_1$1 = "/static/icons/payment/wechat.svg";
  const _imports_2$1 = "/static/icons/payment/alipay.svg";
  const _sfc_main$9 = {
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
        uni.showToast({
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
          formatAppLog("log", "at pages/order/detail.vue:273", "订单状态:", this.orderDetail.status, "跳转到订单列表页");
          uni.switchTab({
            url: "/pages/order/order"
          });
        } else {
          formatAppLog("log", "at pages/order/detail.vue:279", "订单状态:", this.orderDetail.status, "返回上一页");
          uni.navigateBack();
        }
      },
      // 加载订单详情
      loadOrderDetail() {
        this.loading = true;
        api$1.getOrderDetail(this.orderNo).then((res) => {
          formatAppLog("log", "at pages/order/detail.vue:290", "订单详情响应:", res.data);
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
            formatAppLog("log", "at pages/order/detail.vue:305", "处理后的订单数据:", this.orderDetail);
          } else {
            uni.showToast({
              title: res.data.message || "获取订单详情失败",
              icon: "none"
            });
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/order/detail.vue:314", "网络请求失败:", err);
          uni.showToast({
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
        uni.showModal({
          title: "提示",
          content: "确定要取消该订单吗？",
          success: (res) => {
            if (res.confirm) {
              uni.showLoading({
                title: "取消中..."
              });
              api$1.cancelOrder(this.orderNo).then((res2) => {
                formatAppLog("log", "at pages/order/detail.vue:366", "取消订单响应:", res2.data);
                if (res2.data.code === 200) {
                  uni.showToast({
                    title: "订单已取消",
                    icon: "success"
                  });
                  setTimeout(() => {
                    if (this.orderDetail) {
                      this.orderDetail.status = 5;
                    }
                    uni.switchTab({
                      url: "/pages/order/order"
                    });
                  }, 1500);
                } else {
                  uni.showToast({
                    title: res2.data.message || "取消订单失败",
                    icon: "none"
                  });
                }
              }).catch((err) => {
                formatAppLog("error", "at pages/order/detail.vue:391", "网络请求失败:", err);
                uni.showToast({
                  title: "网络请求失败",
                  icon: "none"
                });
              }).finally(() => {
                uni.hideLoading();
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
        uni.showLoading({
          title: "支付中..."
        });
        const currentPaymentMethod = this.paymentMethod;
        formatAppLog("log", "at pages/order/detail.vue:425", "[确认支付] 准备支付订单:", this.orderNo);
        formatAppLog("log", "at pages/order/detail.vue:426", "[确认支付] 选择的支付方式:", currentPaymentMethod);
        api$1.payOrder(this.orderNo, currentPaymentMethod).then((res) => {
          formatAppLog("log", "at pages/order/detail.vue:431", "[API调用] 支付订单响应:", res.data);
          if (res.data.code === 200) {
            uni.showToast({
              title: "支付成功",
              icon: "success"
            });
            this.closePopup();
            this.checkAndUpdateCart();
            this.refreshCouponsAfterPayment();
            setTimeout(() => {
              uni.switchTab({
                url: "/pages/order/order"
              });
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || "支付失败",
              icon: "none"
            });
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/order/detail.vue:461", "[API调用] 网络请求失败:", err);
          uni.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }).finally(() => {
          uni.hideLoading();
        });
      },
      // 刷新优惠券状态
      refreshCouponsAfterPayment() {
        api$1.refreshCoupons().then((res) => {
          formatAppLog("log", "at pages/order/detail.vue:477", "支付后刷新优惠券状态:", res.data);
        }).catch((err) => {
          formatAppLog("error", "at pages/order/detail.vue:481", "刷新优惠券状态失败:", err);
        });
      },
      // 检查并更新购物车状态
      checkAndUpdateCart() {
        api$1.getCart().then((res) => {
          formatAppLog("log", "at pages/order/detail.vue:490", "获取购物车信息:", res.data);
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
          formatAppLog("error", "at pages/order/detail.vue:510", "获取购物车信息失败:", err);
        });
      },
      // 清空已选中的购物车商品
      clearSelectedCartItems() {
        api$1.clearSelectedCartItems().then((res) => {
          formatAppLog("log", "at pages/order/detail.vue:518", "移除已选择的购物车商品成功:", res.data);
        }).catch((err) => {
          formatAppLog("error", "at pages/order/detail.vue:521", "移除购物车商品失败:", err);
        });
      },
      // 选择支付方式
      selectPaymentMethod(method) {
        this.paymentMethod = method;
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "detail-container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "navbar" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("image", {
            src: _imports_0$1,
            class: "back-icon"
          })
        ]),
        vue.createElementVNode("view", { class: "title" }, "订单详情"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 加载中提示 "),
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-box"
      }, [
        vue.createElementVNode("view", { class: "loading-spinner" }),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 使用scroll-view作为主滚动容器 "),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            "scroll-top": $data.scrollTop,
            class: "detail-scroll-view",
            "enable-back-to-top": "",
            enhanced: true,
            bounces: true,
            "show-scrollbar": true,
            onScroll: _cache[3] || (_cache[3] = (...args) => $options.onScroll && $options.onScroll(...args))
          }, [
            vue.createCommentVNode(" 订单状态卡片 "),
            vue.createElementVNode("view", { class: "status-card" }, [
              vue.createElementVNode("view", { class: "status-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "status-text" },
                  vue.toDisplayString($options.orderStatusText),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "order-id" },
                  "订单号: " + vue.toDisplayString($data.orderDetail.orderNo),
                  1
                  /* TEXT */
                )
              ]),
              $data.orderDetail.status !== 5 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "status-timeline"
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["timeline-item", { "completed": $data.orderDetail.status >= 0 }])
                  },
                  [
                    vue.createElementVNode("view", { class: "timeline-dot" }),
                    vue.createElementVNode("view", { class: "timeline-info" }, [
                      vue.createElementVNode("text", { class: "timeline-title" }, "订单已提交"),
                      $data.orderDetail.createdAt ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "timeline-time"
                        },
                        vue.toDisplayString($options.formatDate($data.orderDetail.createdAt)),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true)
                    ])
                  ],
                  2
                  /* CLASS */
                ),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["timeline-line", { "completed": $data.orderDetail.status >= 1 }])
                  },
                  null,
                  2
                  /* CLASS */
                ),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["timeline-item", { "completed": $data.orderDetail.status >= 1 }])
                  },
                  [
                    vue.createElementVNode("view", { class: "timeline-dot" }),
                    vue.createElementVNode("view", { class: "timeline-info" }, [
                      vue.createElementVNode("text", { class: "timeline-title" }, "支付成功"),
                      $data.orderDetail.paymentTime ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "timeline-time"
                        },
                        vue.toDisplayString($options.formatDate($data.orderDetail.paymentTime)),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true),
                      $data.orderDetail.takeNo ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 1,
                          class: "timeline-time"
                        },
                        "取餐号: " + vue.toDisplayString($data.orderDetail.takeNo),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true)
                    ])
                  ],
                  2
                  /* CLASS */
                )
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "status-canceled"
              }, [
                vue.createElementVNode("text", { class: "canceled-text" }, "订单已取消"),
                $data.orderDetail.cancelTime ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "canceled-time"
                  },
                  vue.toDisplayString($options.formatDate($data.orderDetail.cancelTime)),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode(" 退款信息 "),
                $data.orderDetail.refundInfo ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "refund-info"
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "refund-reason" },
                    "退款原因: " + vue.toDisplayString($data.orderDetail.refundInfo.reason || "无"),
                    1
                    /* TEXT */
                  ),
                  $data.orderDetail.refundInfo.refundTime ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "refund-time"
                    },
                    "退款时间: " + vue.toDisplayString($options.formatDate($data.orderDetail.refundInfo.refundTime)),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true)
                ])) : vue.createCommentVNode("v-if", true)
              ]))
            ]),
            vue.createCommentVNode(" 取餐信息 "),
            $data.orderDetail.status === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "detail-section"
            }, [
              vue.createElementVNode("view", { class: "section-title" }, "取餐信息"),
              vue.createElementVNode("view", { class: "pickup-info" }, [
                vue.createElementVNode("view", { class: "pickup-item" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "pickup-value" },
                    vue.toDisplayString($data.orderDetail.takeNo),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "pickup-note" }, [
                  vue.createElementVNode("text", null, "请凭取餐号到门店取餐")
                ])
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 商品信息 "),
            vue.createElementVNode("view", { class: "detail-section" }, [
              vue.createElementVNode("view", { class: "section-title" }, "商品信息"),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.orderDetail.orderDetails, (product, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "product-item",
                    key: index
                  }, [
                    vue.createElementVNode("image", {
                      class: "product-image",
                      src: product.productImage,
                      mode: "aspectFill"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", { class: "product-info" }, [
                      vue.createElementVNode(
                        "view",
                        { class: "product-name" },
                        vue.toDisplayString(product.productName),
                        1
                        /* TEXT */
                      ),
                      product.temperature || product.sweetness ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "product-spec"
                      }, [
                        product.temperature ? (vue.openBlock(), vue.createElementBlock(
                          "text",
                          { key: 0 },
                          vue.toDisplayString(product.temperature),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true),
                        product.temperature && product.sweetness ? (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, " / ")) : vue.createCommentVNode("v-if", true),
                        product.sweetness ? (vue.openBlock(), vue.createElementBlock(
                          "text",
                          { key: 2 },
                          vue.toDisplayString(product.sweetness),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ])) : vue.createCommentVNode("v-if", true),
                      product.ingredients && product.ingredients.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 1,
                        class: "product-ingredients"
                      }, [
                        vue.createTextVNode(" 配料: "),
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList(product.ingredients, (ing, iIndex) => {
                            return vue.openBlock(), vue.createElementBlock(
                              "text",
                              { key: iIndex },
                              vue.toDisplayString(ing.name) + vue.toDisplayString(iIndex < product.ingredients.length - 1 ? "、" : ""),
                              1
                              /* TEXT */
                            );
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])) : vue.createCommentVNode("v-if", true)
                    ]),
                    vue.createElementVNode("view", { class: "product-price-qty" }, [
                      vue.createElementVNode(
                        "view",
                        { class: "product-price" },
                        "¥" + vue.toDisplayString(product.price.toFixed(2)),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "view",
                        { class: "product-qty" },
                        "x" + vue.toDisplayString(product.quantity),
                        1
                        /* TEXT */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createCommentVNode(" 订单金额 "),
            vue.createElementVNode("view", { class: "detail-section" }, [
              vue.createElementVNode("view", { class: "section-title" }, "订单金额"),
              vue.createElementVNode("view", { class: "price-list" }, [
                vue.createCommentVNode(" 商品总价 "),
                vue.createElementVNode("view", { class: "price-item" }, [
                  vue.createElementVNode("text", { class: "price-label" }, "商品总价"),
                  vue.createElementVNode(
                    "text",
                    { class: "price-value" },
                    "¥" + vue.toDisplayString($data.orderDetail.totalAmount.toFixed(2)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createCommentVNode(" 优惠金额 "),
                $data.orderDetail.couponAmount > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "price-item"
                }, [
                  vue.createElementVNode("text", { class: "price-label" }, "优惠金额"),
                  vue.createElementVNode(
                    "text",
                    { class: "price-value discount" },
                    "-¥" + vue.toDisplayString($data.orderDetail.couponAmount.toFixed(2)),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode(" 实付金额 "),
                vue.createElementVNode("view", { class: "price-item total" }, [
                  vue.createElementVNode("text", { class: "price-label" }, "实付金额"),
                  vue.createElementVNode(
                    "text",
                    { class: "price-value" },
                    "¥" + vue.toDisplayString(($data.orderDetail.displayAmount || $data.orderDetail.paymentAmount).toFixed(2)),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            vue.createCommentVNode(" 支付信息 "),
            $data.orderDetail.status > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "detail-section"
            }, [
              vue.createElementVNode("view", { class: "section-title" }, "支付信息"),
              vue.createElementVNode("view", { class: "payment-info" }, [
                vue.createElementVNode("view", { class: "payment-item" }, [
                  vue.createElementVNode("text", { class: "payment-label" }, "支付方式"),
                  vue.createElementVNode(
                    "text",
                    { class: "payment-value" },
                    vue.toDisplayString($options.getPaymentMethodText($data.orderDetail.paymentMethod)),
                    1
                    /* TEXT */
                  )
                ]),
                $data.orderDetail.paymentTime ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "payment-item"
                }, [
                  vue.createElementVNode("text", { class: "payment-label" }, "支付时间"),
                  vue.createElementVNode(
                    "text",
                    { class: "payment-value" },
                    vue.toDisplayString($options.formatDate($data.orderDetail.paymentTime)),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true),
                $data.orderDetail.transactionId ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "payment-item"
                }, [
                  vue.createElementVNode("text", { class: "payment-label" }, "交易单号"),
                  vue.createElementVNode(
                    "text",
                    { class: "payment-value" },
                    vue.toDisplayString($data.orderDetail.transactionId),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 订单操作按钮 "),
            $data.orderDetail.status === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "detail-actions"
            }, [
              vue.createElementVNode("button", {
                class: "action-btn cancel-btn",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.cancelOrder && $options.cancelOrder(...args))
              }, "取消订单"),
              vue.createElementVNode("button", {
                class: "action-btn pay-btn",
                onClick: _cache[2] || (_cache[2] = (...args) => $options.payOrder && $options.payOrder(...args))
              }, "去支付")
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 底部安全区域，确保内容不被遮挡 "),
            vue.createElementVNode("view", { class: "safe-area-inset-bottom" })
          ], 40, ["scroll-top"])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )),
      vue.createCommentVNode(" 支付确认弹窗 "),
      $data.showPaymentPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "payment-popup"
      }, [
        vue.createElementVNode("view", {
          class: "popup-mask",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.closePopup && $options.closePopup(...args))
        }),
        vue.createElementVNode("view", { class: "popup-content" }, [
          vue.createElementVNode("view", { class: "popup-header" }, [
            vue.createElementVNode("text", { class: "popup-title" }, "订单支付"),
            vue.createElementVNode("text", {
              class: "popup-close",
              onClick: _cache[5] || (_cache[5] = (...args) => $options.closePopup && $options.closePopup(...args))
            }, "×")
          ]),
          vue.createElementVNode("view", { class: "popup-body" }, [
            vue.createElementVNode("view", { class: "payment-amount-info" }, [
              vue.createElementVNode(
                "view",
                { class: "payment-amount" },
                "¥" + vue.toDisplayString($data.orderDetail.paymentAmount.toFixed(2)),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                { class: "payment-order-no" },
                "订单号: " + vue.toDisplayString($data.orderDetail.orderNo || ""),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "payment-methods" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["payment-method-item", { "active": $data.paymentMethod === "wechat" }]),
                  onClick: _cache[6] || (_cache[6] = ($event) => $options.selectPaymentMethod("wechat"))
                },
                [
                  vue.createElementVNode("view", { class: "payment-method-content" }, [
                    vue.createElementVNode("view", { class: "payment-icon payment-icon-wechat" }, [
                      vue.createElementVNode("image", {
                        src: _imports_1$1,
                        mode: "aspectFit",
                        class: "payment-icon-img"
                      })
                    ]),
                    vue.createElementVNode("text", { class: "payment-name" }, "微信支付")
                  ]),
                  $data.paymentMethod === "wechat" ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "payment-select"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["payment-method-item", { "active": $data.paymentMethod === "alipay" }]),
                  onClick: _cache[7] || (_cache[7] = ($event) => $options.selectPaymentMethod("alipay"))
                },
                [
                  vue.createElementVNode("view", { class: "payment-method-content" }, [
                    vue.createElementVNode("view", { class: "payment-icon payment-icon-alipay" }, [
                      vue.createElementVNode("image", {
                        src: _imports_2$1,
                        mode: "aspectFit",
                        class: "payment-icon-img"
                      })
                    ]),
                    vue.createElementVNode("text", { class: "payment-name" }, "支付宝")
                  ]),
                  $data.paymentMethod === "alipay" ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "payment-select"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "popup-footer" }, [
            vue.createElementVNode("button", {
              class: "confirm-payment-btn",
              onClick: _cache[8] || (_cache[8] = (...args) => $options.confirmPayment && $options.confirmPayment(...args))
            }, "确认支付")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesOrderDetail = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/order/detail.vue"]]);
  const _sfc_main$8 = {
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
          formatAppLog("error", "at pages/order/confirm.vue:215", "解析传入商品数据失败:", e);
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
        api$1.request({
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
                uni.showModal({
                  title: "提示",
                  content: "请先选择商品后再结算",
                  showCancel: false,
                  success: () => {
                    uni.navigateBack();
                  }
                });
              }
            } else if (res.statusCode === 401 || res.data && res.data.code === 401) {
              uni.removeStorageSync("token");
              uni.showToast({
                title: "登录已过期，请重新登录",
                icon: "none"
              });
              setTimeout(() => {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              }, 1500);
            } else {
              uni.showToast({
                title: res.data.message || "获取购物车失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            this.loading = false;
            formatAppLog("error", "at pages/order/confirm.vue:287", "获取购物车失败", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      },
      // 加载用户优惠券
      loadUserCoupons() {
        const token = uni.getStorageSync("token");
        if (!token) {
          formatAppLog("log", "at pages/order/confirm.vue:300", "未找到token，无法获取优惠券");
          return;
        }
        const totalPrice = this.calculateTotalPrice();
        api$1.getCoupons(0).then((res) => {
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
          formatAppLog("error", "at pages/order/confirm.vue:400", "获取优惠券请求失败，错误详情:", err);
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
        formatAppLog("log", "at pages/order/confirm.vue:445", "计算商品价格:", item);
        if (!item) {
          formatAppLog("error", "at pages/order/confirm.vue:449", "商品数据为空");
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
          uni.showToast({
            title: "请先选择商品",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
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
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.hideLoading();
          uni.navigateTo({
            url: "/pages/login/login"
          });
          return;
        }
        api$1.createOrder(orderData).then((res) => {
          uni.hideLoading();
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
              uni.showToast({
                title: "订单提交成功",
                icon: "success",
                duration: 2e3
              });
              if (this.cartItems.length > 0) {
                this.clearSelectedCartItems();
              }
              setTimeout(() => {
                uni.navigateTo({
                  url: `/pages/order/detail?orderNo=${orderNo || orderId}`
                });
              }, 1500);
            } else {
              uni.showToast({
                title: "订单数据异常",
                icon: "none"
              });
              formatAppLog("error", "at pages/order/confirm.vue:663", "订单创建成功但返回数据异常", res.data);
            }
          } else {
            let errorMsg = "创建订单失败";
            if (res.data && res.data.message) {
              errorMsg = res.data.message;
            }
            uni.showToast({
              title: errorMsg,
              icon: "none",
              duration: 2e3
            });
            formatAppLog("error", "at pages/order/confirm.vue:676", "创建订单失败:", res);
          }
        }).catch((err) => {
          uni.hideLoading();
          formatAppLog("error", "at pages/order/confirm.vue:681", "提交订单失败:", err);
          uni.showToast({
            title: "网络请求失败，请稍后再试",
            icon: "none",
            duration: 2e3
          });
        });
      },
      // 清空已选中的购物车商品
      clearSelectedCartItems() {
        const token = uni.getStorageSync("token");
        if (!token)
          return;
        api$1.request({
          url: "/cart/selected",
          method: "DELETE",
          success: (res) => {
            formatAppLog("log", "at pages/order/confirm.vue:700", "移除已选择的购物车商品成功:", res.data);
          },
          fail: (err) => {
            formatAppLog("error", "at pages/order/confirm.vue:703", "移除购物车商品失败:", err);
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
        uni.showToast({
          title: `还差¥${diff.toFixed(2)}才能使用此${coupon.type === 2 ? "折扣" : ""}优惠券`,
          icon: "none",
          duration: 2e3
        });
      },
      // 获取会员等级信息
      getMemberInfo() {
        const token = uni.getStorageSync("token");
        if (!token)
          return;
        api$1.getMemberInfo().then((res) => {
          formatAppLog("log", "at pages/order/confirm.vue:760", "获取会员信息响应状态码:", res.statusCode);
          formatAppLog("log", "at pages/order/confirm.vue:761", "获取会员信息完整响应:", JSON.stringify(res.data));
          if (res.statusCode === 200 && res.data && res.data.code === 200) {
            this.memberInfo = res.data.data;
            if (this.memberInfo && this.memberInfo.discount) {
              this.memberDiscount = parseFloat(this.memberInfo.discount);
            }
          } else {
            formatAppLog("error", "at pages/order/confirm.vue:771", "获取会员信息失败:", res.data);
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/order/confirm.vue:775", "获取会员信息请求失败:", err);
        });
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "confirm-container" }, [
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading"
      }, [
        vue.createElementVNode("text", null, "加载中...")
      ])) : (vue.openBlock(), vue.createElementBlock("scroll-view", {
        key: 1,
        "scroll-y": "",
        class: "confirm-content"
      }, [
        vue.createCommentVNode(" 商品列表 "),
        vue.createElementVNode("view", { class: "product-section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "已选商品"),
          vue.createElementVNode("view", { class: "product-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.cartItems, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: item.id,
                  class: "product-item"
                }, [
                  vue.createElementVNode("image", {
                    src: $options.getProductImage(item),
                    mode: "aspectFill",
                    class: "product-image"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", { class: "product-info" }, [
                    vue.createElementVNode("view", { class: "product-top" }, [
                      vue.createElementVNode(
                        "view",
                        { class: "product-name" },
                        vue.toDisplayString($options.getProductName(item)),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "view",
                        { class: "product-quantity" },
                        "x" + vue.toDisplayString(item.quantity || 1),
                        1
                        /* TEXT */
                      )
                    ]),
                    item.temperature || item.sweetness || $options.hasIngredients(item) ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "product-options"
                    }, [
                      item.temperature ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        { key: 0 },
                        vue.toDisplayString(item.temperature),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true),
                      item.sweetness ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        { key: 1 },
                        vue.toDisplayString(item.sweetness),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true),
                      $options.hasIngredients(item) ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        { key: 2 },
                        vue.toDisplayString($options.formatIngredients(item)),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true)
                    ])) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode(
                      "view",
                      { class: "product-price" },
                      "¥" + vue.toDisplayString($options.calculateItemPrice(item).toFixed(2)),
                      1
                      /* TEXT */
                    )
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createCommentVNode(" 优惠券选择 "),
        vue.createElementVNode("view", {
          class: "coupon-section",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.openCouponModal && $options.openCouponModal(...args))
        }, [
          vue.createElementVNode("view", { class: "section-title" }, "优惠券"),
          vue.createElementVNode("view", { class: "coupon-right" }, [
            $data.selectedCoupon ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "coupon-value"
              },
              " 已选择：" + vue.toDisplayString($data.selectedCoupon.name) + " -¥" + vue.toDisplayString($data.selectedCoupon.amount.toFixed(2)),
              1
              /* TEXT */
            )) : (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "no-coupon"
            }, "未使用优惠券")),
            vue.createElementVNode("text", { class: "arrow" }, ">")
          ])
        ]),
        vue.createCommentVNode(" 备注 "),
        vue.createElementVNode("view", { class: "note-section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "备注"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.note = $event),
              placeholder: "有什么特殊要求可以告诉我们哦~",
              class: "note-input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.note]
          ])
        ]),
        vue.createCommentVNode(" 金额明细 "),
        vue.createElementVNode("view", { class: "price-detail" }, [
          vue.createElementVNode("view", { class: "price-row" }, [
            vue.createElementVNode("text", { class: "price-label" }, "商品金额"),
            vue.createElementVNode(
              "text",
              { class: "price-value" },
              "¥" + vue.toDisplayString($options.calculateTotalPrice().toFixed(2)),
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 优惠券折扣 "),
          $data.selectedCoupon ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "price-row"
          }, [
            vue.createElementVNode(
              "text",
              { class: "price-label" },
              "优惠券" + vue.toDisplayString($data.selectedCoupon.type === 2 ? "(" + ($data.selectedCoupon.amount * 10).toFixed(1) + "折)" : ""),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "price-value discount" },
              "-¥" + vue.toDisplayString($options.getCouponDiscountAmount().toFixed(2)),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 优惠券后的金额 "),
          $data.selectedCoupon ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "price-row"
          }, [
            vue.createElementVNode("text", { class: "price-label" }, "优惠后金额"),
            vue.createElementVNode(
              "text",
              { class: "price-value" },
              "¥" + vue.toDisplayString($options.getPriceAfterCoupon().toFixed(2)),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 会员折扣 "),
          $data.memberDiscount < 1 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "price-row"
          }, [
            vue.createElementVNode(
              "text",
              { class: "price-label" },
              "会员折扣 (" + vue.toDisplayString(($data.memberDiscount * 10).toFixed(1)) + "折)",
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "price-value discount" },
              "-¥" + vue.toDisplayString($options.getMemberDiscountAmount().toFixed(2)),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 实付金额 "),
          vue.createElementVNode("view", { class: "price-row" }, [
            vue.createElementVNode("text", { class: "price-label" }, "实付金额"),
            vue.createElementVNode(
              "text",
              { class: "price-value" },
              "¥" + vue.toDisplayString($options.calculateFinalPrice().toFixed(2)),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createCommentVNode(" 底部占位 "),
        vue.createElementVNode("view", { class: "bottom-placeholder" })
      ])),
      vue.createCommentVNode(" 结算栏 "),
      vue.createElementVNode("view", { class: "checkout-bar" }, [
        vue.createElementVNode("view", { class: "total-section" }, [
          vue.createElementVNode("text", { class: "total-text" }, "总价："),
          vue.createElementVNode(
            "text",
            { class: "total-price" },
            "¥" + vue.toDisplayString($options.calculateFinalPrice().toFixed(2)),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.submitOrder && $options.submitOrder(...args))
        }, "提交订单")
      ]),
      vue.createCommentVNode(" 优惠券选择弹窗 "),
      $data.showCouponModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "coupon-modal"
      }, [
        vue.createElementVNode("view", {
          class: "coupon-modal-mask",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.closeCouponModal && $options.closeCouponModal(...args))
        }),
        vue.createElementVNode("view", { class: "coupon-modal-container" }, [
          vue.createElementVNode("view", { class: "coupon-modal-header" }, [
            vue.createElementVNode("text", { class: "coupon-modal-title" }, "选择优惠券"),
            vue.createElementVNode("text", {
              class: "coupon-modal-close",
              onClick: _cache[4] || (_cache[4] = (...args) => $options.closeCouponModal && $options.closeCouponModal(...args))
            }, "×")
          ]),
          vue.createElementVNode("view", { class: "coupon-modal-content" }, [
            $data.availableCoupons.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "coupon-list"
            }, [
              vue.createCommentVNode(" 不使用优惠券选项 "),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["coupon-card", { "selected": $data.selectedCoupon === null }]),
                  onClick: _cache[5] || (_cache[5] = (...args) => $options.selectNoCoupon && $options.selectNoCoupon(...args))
                },
                [
                  vue.createElementVNode("view", { class: "coupon-left" }, [
                    vue.createElementVNode("text", { class: "coupon-amount" }, "不使用")
                  ]),
                  vue.createElementVNode("view", { class: "coupon-right" }, [
                    vue.createElementVNode("text", { class: "coupon-name" }, "不使用优惠券"),
                    vue.createElementVNode("text", { class: "coupon-desc" }, "无需使用优惠券")
                  ]),
                  $data.selectedCoupon === null ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "coupon-select-icon"
                  }, [
                    vue.createElementVNode("text", { class: "check-icon" }, "✓")
                  ])) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              ),
              vue.createCommentVNode(" 可用优惠券列表 "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.availableCoupons, (coupon, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: index,
                    class: vue.normalizeClass(["coupon-card", {
                      "selected": $data.selectedCoupon && $data.selectedCoupon.id === coupon.id,
                      "disabled": !coupon.canUse
                    }]),
                    onClick: ($event) => coupon.canUse ? $options.selectCoupon(coupon) : $options.showMinAmountTips(coupon)
                  }, [
                    vue.createElementVNode("view", { class: "coupon-left" }, [
                      coupon.type === 1 ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "coupon-amount"
                        },
                        "¥" + vue.toDisplayString(coupon.amount.toFixed(2)),
                        1
                        /* TEXT */
                      )) : (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 1,
                          class: "coupon-amount"
                        },
                        vue.toDisplayString((coupon.amount * 10).toFixed(1)) + "折",
                        1
                        /* TEXT */
                      )),
                      coupon.minConsumption > 0 ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 2,
                          class: vue.normalizeClass(["coupon-condition", { "condition-not-met": !coupon.canUse }])
                        },
                        "满" + vue.toDisplayString(coupon.minConsumption.toFixed(2)) + "可用",
                        3
                        /* TEXT, CLASS */
                      )) : vue.createCommentVNode("v-if", true)
                    ]),
                    vue.createElementVNode("view", { class: "coupon-right" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "coupon-name" },
                        vue.toDisplayString(coupon.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "coupon-desc" },
                        vue.toDisplayString(coupon.description || coupon.typeText),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "coupon-date" },
                        "有效期至" + vue.toDisplayString(coupon.expireDate),
                        1
                        /* TEXT */
                      )
                    ]),
                    $data.selectedCoupon && $data.selectedCoupon.id === coupon.id ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "coupon-select-icon"
                    }, [
                      vue.createElementVNode("text", { class: "check-icon" }, "✓")
                    ])) : vue.createCommentVNode("v-if", true),
                    !coupon.canUse ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "coupon-disabled-mask"
                    })) : vue.createCommentVNode("v-if", true)
                  ], 10, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "no-coupons"
            }, [
              vue.createElementVNode("text", null, "暂无可用优惠券")
            ]))
          ]),
          vue.createElementVNode("view", { class: "coupon-modal-footer" }, [
            vue.createElementVNode("button", {
              class: "cancel-btn",
              onClick: _cache[6] || (_cache[6] = (...args) => $options.closeCouponModal && $options.closeCouponModal(...args))
            }, "取消"),
            vue.createElementVNode("button", {
              class: "confirm-btn",
              onClick: _cache[7] || (_cache[7] = (...args) => $options.confirmCouponSelection && $options.confirmCouponSelection(...args))
            }, "确定")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesOrderConfirm = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/order/confirm.vue"]]);
  const _imports_3 = "/static/tabbar/menu.png";
  const _sfc_main$7 = {
    data() {
      return {
        keyword: "",
        searchHistory: [],
        searching: false,
        loading: false,
        loadingMore: false,
        searchResults: [],
        page: 0,
        size: 10,
        hasMore: true,
        searchTimer: null,
        // 用于防抖处理的计时器
        hasSearched: false,
        // 添加标记表示是否已进行过搜索
        // 商品详情
        showDetail: false,
        currentProduct: {},
        quantity: 1,
        popupStyle: {
          transform: "translateY(100%)",
          transition: "none"
        },
        maskStyle: {
          opacity: 0,
          transition: "none"
        },
        contentStyle: {
          opacity: 0,
          transition: "none"
        },
        // 规格选择
        temperatures: ["常温", "热", "冰", "少冰"],
        sweetness: ["标准糖", "少糖", "半糖", "微糖", "无糖"],
        ingredients: [],
        selectedTemp: "常温",
        selectedSweet: "标准糖",
        selectedIngredients: []
      };
    },
    onLoad() {
      this.loadSearchHistory();
      this.loadIngredients();
    },
    methods: {
      // 加载配料列表
      loadIngredients() {
        api$1.getIngredients().then((res) => {
          formatAppLog("log", "at pages/menu/search.vue:262", "获取配料列表响应:", res.data);
          if (res.data.code === 200) {
            this.ingredients = res.data.data;
          } else {
            this.showToast(res.data.message || "获取配料列表失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/menu/search.vue:270", "网络请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 处理关键词输入（添加防抖）
      onKeywordInput() {
        this.searching = true;
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }
        if (!this.keyword.trim()) {
          this.searchResults = [];
          this.searching = this.keyword ? true : false;
          return;
        }
        this.searchTimer = setTimeout(() => {
          this.searchProducts();
        }, 300);
      },
      // 搜索产品（修复API调用）
      searchProducts() {
        this.hasSearched = true;
        if (this.keyword.trim()) {
          this.saveKeywordToHistory(this.keyword);
        }
        this.page = 0;
        this.hasMore = true;
        this.loading = true;
        api$1.request({
          url: "/product/search",
          method: "GET",
          data: {
            keyword: this.keyword,
            page: this.page,
            size: this.size
          }
        }).then((res) => {
          formatAppLog("log", "at pages/menu/search.vue:326", "搜索产品响应:", res.data);
          if (res.data.code === 200) {
            this.searchResults = res.data.data.content || [];
            this.hasMore = this.searchResults.length >= this.size;
          } else {
            this.searchResults = [];
            this.showToast(res.data.message || "搜索失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/menu/search.vue:337", "网络请求失败:", err);
          this.showToast("网络请求失败");
          this.searchResults = [];
        }).finally(() => {
          this.loading = false;
        });
      },
      // 保存关键词到历史（新方法，从saveSearchHistory中抽取部分逻辑）
      saveKeywordToHistory(keyword) {
        const index = this.searchHistory.indexOf(keyword);
        if (index > -1) {
          this.searchHistory.splice(index, 1);
        }
        this.searchHistory.unshift(keyword);
        if (this.searchHistory.length > 10) {
          this.searchHistory.pop();
        }
        this.saveSearchHistory();
      },
      // 加载更多搜索结果（修复API调用）
      loadMoreResults() {
        if (!this.hasMore || this.loadingMore || this.loading)
          return;
        this.loadingMore = true;
        this.page++;
        api$1.request({
          url: "/product/search",
          method: "GET",
          data: {
            keyword: this.keyword,
            page: this.page,
            size: this.size
          }
        }).then((res) => {
          formatAppLog("log", "at pages/menu/search.vue:383", "加载更多搜索结果:", res.data);
          if (res.data.code === 200) {
            const newResults = res.data.data.content || [];
            this.searchResults = [...this.searchResults, ...newResults];
            this.hasMore = newResults.length >= this.size;
          } else {
            this.showToast(res.data.message || "加载更多失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/menu/search.vue:395", "网络请求失败:", err);
          this.showToast("网络请求失败");
        }).finally(() => {
          this.loadingMore = false;
        });
      },
      // 清空搜索关键词
      clearKeyword() {
        this.keyword = "";
        this.searchResults = [];
        this.searching = false;
        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }
      },
      // 使用历史搜索词
      useHistoryKeyword(keyword) {
        this.keyword = keyword;
        this.searchProducts();
      },
      // 加载搜索历史
      loadSearchHistory() {
        const history = uni.getStorageSync("searchHistory");
        if (history) {
          this.searchHistory = JSON.parse(history);
        }
      },
      // 保存搜索历史
      saveSearchHistory() {
        uni.setStorageSync("searchHistory", JSON.stringify(this.searchHistory));
      },
      // 清空搜索历史
      clearHistory() {
        uni.showModal({
          title: "提示",
          content: "确定要清空搜索历史吗？",
          success: (res) => {
            if (res.confirm) {
              this.searchHistory = [];
              uni.removeStorageSync("searchHistory");
            }
          }
        });
      },
      // 打开商品详情（修复API调用）
      showProductDetail(product) {
        this.resetProductOptions();
        this.showDetail = true;
        this.popupStyle = {
          transform: "translateY(100%)",
          transition: "none"
        };
        this.maskStyle = {
          opacity: 0,
          transition: "none"
        };
        this.contentStyle = {
          opacity: 0,
          transition: "none"
        };
        this.$nextTick(() => {
          setTimeout(() => {
            api$1.request({
              url: `/product/detail/${product.id}`,
              method: "GET"
            }).then((res) => {
              formatAppLog("log", "at pages/menu/search.vue:477", "获取商品详情响应:", res.data);
              if (res.data.code === 200) {
                this.currentProduct = res.data.data;
                this.openDetailPopup();
              } else {
                this.showToast(res.data.message || "获取商品详情失败");
                this.showDetail = false;
              }
            }).catch((err) => {
              formatAppLog("error", "at pages/menu/search.vue:487", "网络请求失败:", err);
              this.showToast("网络请求失败");
              this.showDetail = false;
            });
          }, 50);
        });
      },
      // 打开详情弹窗（动画部分）
      openDetailPopup() {
        this.maskStyle = {
          opacity: 1,
          transition: "opacity 0.2s ease-out"
        };
        setTimeout(() => {
          this.popupStyle = {
            transform: "translateY(0)",
            transition: "transform 0.3s ease-out"
          };
          setTimeout(() => {
            this.contentStyle = {
              opacity: 1,
              transition: "opacity 0.2s ease-out"
            };
          }, 150);
        }, 100);
      },
      // 重置商品选项
      resetProductOptions() {
        this.quantity = 1;
        this.selectedTemp = "常温";
        this.selectedSweet = "标准糖";
        this.selectedIngredients = [];
      },
      // 关闭商品详情
      hideProductDetail() {
        this.contentStyle = {
          opacity: 0,
          transition: "opacity 0.2s ease-in"
        };
        setTimeout(() => {
          this.popupStyle = {
            transform: "translateY(100%)",
            transition: "transform 0.3s ease-in"
          };
          setTimeout(() => {
            this.maskStyle = {
              opacity: 0,
              transition: "opacity 0.2s ease-in"
            };
            setTimeout(() => {
              this.showDetail = false;
            }, 200);
          }, 150);
        }, 100);
      },
      // 调整数量
      adjustQuantity(delta) {
        const newQuantity = this.quantity + delta;
        if (newQuantity >= 1 && newQuantity <= 99) {
          this.quantity = newQuantity;
        }
      },
      // 切换配料选择
      toggleIngredient(ingredient) {
        const index = this.selectedIngredients.findIndex((item) => item.id === ingredient.id);
        if (index > -1) {
          this.selectedIngredients.splice(index, 1);
        } else {
          const ingredientObj = {
            id: ingredient.id,
            name: ingredient.name,
            price: ingredient.price
          };
          formatAppLog("log", "at pages/menu/search.vue:578", "添加配料:", ingredientObj);
          this.selectedIngredients.push(ingredientObj);
        }
      },
      // 计算总价
      getTotalPrice() {
        if (!this.currentProduct.price)
          return 0;
        let total = this.currentProduct.price * this.quantity;
        this.selectedIngredients.forEach((ing) => {
          total += ing.price * this.quantity;
        });
        return total;
      },
      // 添加到购物车（修复API调用）
      addToCart() {
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showModal({
            title: "未登录提示",
            content: "您尚未登录，是否前往登录页面？",
            confirmText: "去登录",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                this.redirectToLogin();
              }
            }
          });
          return;
        }
        let ingredientsData = [];
        if (this.selectedIngredients && this.selectedIngredients.length > 0) {
          ingredientsData = this.selectedIngredients.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price
          }));
        }
        const cartData = {
          productId: this.currentProduct.id,
          quantity: this.quantity,
          temperature: this.selectedTemp,
          sweetness: this.selectedSweet,
          ingredients: ingredientsData,
          forceNewItem: true,
          // 添加标志，表示这是新项目
          selected: true
        };
        api$1.request({
          url: "/cart",
          method: "POST",
          data: cartData
        }).then((res) => {
          formatAppLog("log", "at pages/menu/search.vue:645", "添加到购物车响应:", res.data);
          if (res.data.code === 200) {
            this.showToast("已添加到购物车", "success");
            this.hideProductDetail();
          } else if (res.data.code === 401) {
            this.handleTokenExpired();
          } else {
            this.showToast(res.data.message || "添加到购物车失败");
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/menu/search.vue:656", "网络请求失败:", err);
          this.showToast("网络请求失败");
        });
      },
      // 返回上一页
      goBack() {
        uni.navigateBack();
      },
      // 重定向到登录页
      redirectToLogin() {
        uni.navigateTo({
          url: "/pages/login/login"
        });
      },
      // 处理Token过期
      handleTokenExpired() {
        uni.removeStorageSync("token");
        uni.showToast({
          title: "登录已过期，请重新登录",
          icon: "none"
        });
        setTimeout(() => {
          this.redirectToLogin();
        }, 1500);
      },
      // 显示提示信息
      showToast(title, icon = "none") {
        uni.showToast({
          title,
          icon
        });
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "search-container" }, [
      vue.createCommentVNode(" 顶部标题栏 "),
      vue.createElementVNode("view", { class: "navbar" }, [
        vue.createElementVNode("text", { class: "page-title" }, "搜索")
      ]),
      vue.createCommentVNode(" 搜索栏 "),
      vue.createElementVNode("view", { class: "search-header" }, [
        vue.createElementVNode("view", { class: "search-box" }, [
          vue.createElementVNode("image", {
            src: _imports_0$5,
            class: "search-icon"
          }),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              class: "search-input",
              placeholder: "搜索奶茶、果茶、小吃",
              "placeholder-style": "color: #888888;",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.keyword = $event),
              onInput: _cache[1] || (_cache[1] = (...args) => $options.onKeywordInput && $options.onKeywordInput(...args)),
              focus: ""
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.keyword]
          ]),
          $data.keyword ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "clear-icon",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.clearKeyword && $options.clearKeyword(...args))
          }, [
            vue.createElementVNode("image", {
              src: _imports_1$3,
              class: "close-icon-small"
            })
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("text", {
          class: "cancel-btn",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.goBack && $options.goBack(...args))
        }, "取消")
      ]),
      vue.createCommentVNode(" 搜索历史 "),
      !$data.keyword && $data.searchHistory.length > 0 && !$data.searching ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "search-history"
      }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "搜索历史"),
          vue.createElementVNode("text", {
            class: "clear-btn",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.clearHistory && $options.clearHistory(...args))
          }, "清空")
        ]),
        vue.createElementVNode("view", { class: "history-tags" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.searchHistory, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "history-tag",
                key: index,
                onClick: ($event) => $options.useHistoryKeyword(item)
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(item),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 搜索中 "),
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loading-box"
      }, [
        vue.createElementVNode("view", { class: "loading-spinner" }),
        vue.createElementVNode("text", { class: "loading-text" }, "搜索中...")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 搜索结果 "),
      !$data.loading && $data.searchResults.length > 0 ? (vue.openBlock(), vue.createElementBlock(
        "scroll-view",
        {
          key: 2,
          "scroll-y": "",
          class: "search-results",
          onScrolltolower: _cache[5] || (_cache[5] = (...args) => $options.loadMoreResults && $options.loadMoreResults(...args))
        },
        [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.searchResults, (product) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "product-item",
                key: product.id,
                onClick: ($event) => $options.showProductDetail(product)
              }, [
                vue.createElementVNode("image", {
                  src: product.image || "/static/default-product.png",
                  class: "product-image",
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "product-info" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "product-name" },
                    vue.toDisplayString(product.name),
                    1
                    /* TEXT */
                  ),
                  product.description ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: "product-description"
                    },
                    vue.toDisplayString(product.description),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode("view", { class: "product-bottom" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "product-price" },
                      "¥" + vue.toDisplayString(product.price.toFixed(2)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", {
                      class: "add-to-cart-btn",
                      onClick: vue.withModifiers(($event) => $options.showProductDetail(product), ["stop"])
                    }, [
                      vue.createElementVNode("image", {
                        src: _imports_2$3,
                        class: "add-icon"
                      })
                    ], 8, ["onClick"])
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 加载状态 "),
          $data.hasMore && !$data.loadingMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "load-more"
          }, [
            vue.createElementVNode("text", null, "上拉加载更多")
          ])) : !$data.hasMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "load-more"
          }, [
            vue.createElementVNode("text", null, "已加载全部")
          ])) : vue.createCommentVNode("v-if", true),
          $data.loadingMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "loading-more"
          }, [
            vue.createElementVNode("view", { class: "loading-spinner" }),
            vue.createElementVNode("text", null, "加载中...")
          ])) : vue.createCommentVNode("v-if", true)
        ],
        32
        /* NEED_HYDRATION */
      )) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 搜索无结果 "),
      $data.hasSearched && $data.searchResults.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "no-results"
      }, [
        vue.createElementVNode("image", {
          src: _imports_3,
          class: "empty-icon"
        }),
        vue.createElementVNode("text", { class: "no-results-text" }, "没有找到相关商品")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 商品详情弹窗 "),
      vue.withDirectives(vue.createElementVNode(
        "view",
        { class: "product-detail-popup" },
        [
          vue.createElementVNode(
            "view",
            {
              class: "popup-mask",
              onClick: _cache[6] || (_cache[6] = (...args) => $options.hideProductDetail && $options.hideProductDetail(...args)),
              style: vue.normalizeStyle($data.maskStyle)
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "popup-content",
              style: vue.normalizeStyle($data.popupStyle)
            },
            [
              vue.createCommentVNode(" 添加内容淡入效果 "),
              vue.createElementVNode(
                "view",
                {
                  class: "popup-inner",
                  style: vue.normalizeStyle($data.contentStyle)
                },
                [
                  vue.createCommentVNode(" 关闭按钮 "),
                  vue.createElementVNode("view", {
                    class: "close-btn",
                    onClick: _cache[7] || (_cache[7] = (...args) => $options.hideProductDetail && $options.hideProductDetail(...args))
                  }, [
                    vue.createElementVNode("image", {
                      src: _imports_1$3,
                      class: "close-icon"
                    })
                  ]),
                  vue.createCommentVNode(" 商品基本信息 "),
                  vue.createElementVNode("view", { class: "detail-header" }, [
                    vue.createElementVNode("image", {
                      src: $data.currentProduct.image || "/static/images/default-product.svg",
                      class: "detail-image",
                      mode: "aspectFill"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", { class: "detail-basic-info" }, [
                      vue.createElementVNode("view", { class: "name-price-row" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "detail-name" },
                          vue.toDisplayString($data.currentProduct.name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "detail-price" },
                          "¥" + vue.toDisplayString($data.currentProduct.price ? $data.currentProduct.price.toFixed(2) : "0.00"),
                          1
                          /* TEXT */
                        )
                      ]),
                      $data.currentProduct.sales ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "detail-sales"
                        },
                        "销量: " + vue.toDisplayString($data.currentProduct.sales),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true)
                    ])
                  ]),
                  vue.createCommentVNode(" 规格选择 "),
                  vue.createElementVNode("view", { class: "specifications" }, [
                    vue.createCommentVNode(" 温度选择 "),
                    vue.createElementVNode("view", { class: "spec-section" }, [
                      vue.createElementVNode("view", { class: "spec-title-row" }, [
                        vue.createElementVNode("image", {
                          src: _imports_4$1,
                          class: "spec-icon"
                        }),
                        vue.createElementVNode("text", { class: "spec-title" }, "温度")
                      ]),
                      vue.createElementVNode("view", { class: "spec-options" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList($data.temperatures, (temp, index) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: index,
                              class: vue.normalizeClass(["spec-option", $data.selectedTemp === temp ? "selected" : ""]),
                              onClick: ($event) => $data.selectedTemp = temp
                            }, [
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(temp),
                                1
                                /* TEXT */
                              )
                            ], 10, ["onClick"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ]),
                    vue.createCommentVNode(" 甜度选择 "),
                    vue.createElementVNode("view", { class: "spec-section" }, [
                      vue.createElementVNode("view", { class: "spec-title-row" }, [
                        vue.createElementVNode("image", {
                          src: _imports_5$1,
                          class: "spec-icon"
                        }),
                        vue.createElementVNode("text", { class: "spec-title" }, "甜度")
                      ]),
                      vue.createElementVNode("view", { class: "spec-options" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList($data.sweetness, (sweet, index) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: index,
                              class: vue.normalizeClass(["spec-option", $data.selectedSweet === sweet ? "selected" : ""]),
                              onClick: ($event) => $data.selectedSweet = sweet
                            }, [
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(sweet),
                                1
                                /* TEXT */
                              )
                            ], 10, ["onClick"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ]),
                    vue.createCommentVNode(" 配料选择 "),
                    $data.ingredients.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "spec-section"
                    }, [
                      vue.createElementVNode("view", { class: "spec-title-row" }, [
                        vue.createElementVNode("image", {
                          src: _imports_6,
                          class: "spec-icon"
                        }),
                        vue.createElementVNode("text", { class: "spec-title" }, "加料")
                      ]),
                      vue.createElementVNode("view", { class: "ingredient-options" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList($data.ingredients, (ing) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: ing.id,
                              class: vue.normalizeClass(["ingredient-item", $data.selectedIngredients.findIndex((i) => i.id === ing.id) > -1 ? "selected" : ""]),
                              onClick: ($event) => $options.toggleIngredient(ing)
                            }, [
                              vue.createElementVNode(
                                "text",
                                { class: "ingredient-name" },
                                vue.toDisplayString(ing.name),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "ingredient-price" },
                                "¥" + vue.toDisplayString(ing.price.toFixed(2)),
                                1
                                /* TEXT */
                              )
                            ], 10, ["onClick"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])) : vue.createCommentVNode("v-if", true)
                  ]),
                  vue.createCommentVNode(" 数量调整 "),
                  vue.createElementVNode("view", { class: "quantity-section" }, [
                    vue.createElementVNode("view", { class: "spec-title-row" }, [
                      vue.createElementVNode("image", {
                        src: _imports_7,
                        class: "spec-icon"
                      }),
                      vue.createElementVNode("text", { class: "quantity-label" }, "数量")
                    ]),
                    vue.createElementVNode("view", { class: "quantity-control" }, [
                      vue.createElementVNode("text", {
                        class: "quantity-btn minus",
                        onClick: _cache[8] || (_cache[8] = ($event) => $options.adjustQuantity(-1))
                      }, "-"),
                      vue.withDirectives(vue.createElementVNode(
                        "input",
                        {
                          type: "number",
                          class: "quantity-input",
                          "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $data.quantity = $event),
                          disabled: ""
                        },
                        null,
                        512
                        /* NEED_PATCH */
                      ), [
                        [vue.vModelText, $data.quantity]
                      ]),
                      vue.createElementVNode("text", {
                        class: "quantity-btn plus",
                        onClick: _cache[10] || (_cache[10] = ($event) => $options.adjustQuantity(1))
                      }, "+")
                    ])
                  ]),
                  vue.createCommentVNode(" 底部按钮 "),
                  vue.createElementVNode("view", { class: "detail-footer" }, [
                    vue.createElementVNode("view", { class: "total-price" }, [
                      vue.createElementVNode("text", null, "总计："),
                      vue.createElementVNode(
                        "text",
                        { class: "price-value" },
                        "¥" + vue.toDisplayString($options.getTotalPrice().toFixed(2)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", {
                      class: "add-to-cart",
                      onClick: _cache[11] || (_cache[11] = (...args) => $options.addToCart && $options.addToCart(...args))
                    }, [
                      vue.createElementVNode("text", null, "加入购物车")
                    ])
                  ])
                ],
                4
                /* STYLE */
              )
            ],
            4
            /* STYLE */
          )
        ],
        512
        /* NEED_PATCH */
      ), [
        [vue.vShow, $data.showDetail]
      ])
    ]);
  }
  const PagesMenuSearch = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-6a63d33a"], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/menu/search.vue"]]);
  const _imports_0 = "/static/icons/settings/password.svg";
  const _imports_1 = "/static/icons/settings/phone.svg";
  const _imports_2 = "/static/icons/settings/user.svg";
  const _sfc_main$6 = {
    data() {
      return {
        token: uni.getStorageSync("token") || ""
      };
    },
    onLoad() {
      this.checkLoginStatus();
    },
    methods: {
      // 检查登录状态
      checkLoginStatus() {
        const token = uni.getStorageSync("token");
        if (!token) {
          this.promptLogin();
        }
      },
      // 修改密码
      changePassword() {
        uni.navigateTo({
          url: "/pages/user/change-password"
        });
      },
      // 更换手机号
      changePhone() {
        uni.navigateTo({
          url: "/pages/user/change-phone"
        });
      },
      // 修改个人信息
      updateUserInfo() {
        uni.navigateTo({
          url: "/pages/user/user-info"
        });
      },
      // 退出登录
      logout() {
        uni.showModal({
          title: "提示",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              this.handleLogout();
            }
          }
        });
      },
      // 处理退出登录
      handleLogout() {
        uni.removeStorageSync("token");
        uni.removeStorageSync("userInfo");
        uni.reLaunch({
          url: "/pages/login/login"
        });
        this.showToast("已退出登录", "success");
      },
      // 提示登录
      promptLogin() {
        uni.showModal({
          title: "提示",
          content: "请先登录",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: "/pages/login/login"
              });
            } else {
              uni.navigateBack();
            }
          }
        });
      },
      // 显示提示信息
      showToast(title, icon = "none") {
        uni.showToast({
          title,
          icon
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "settings-container" }, [
      vue.createElementVNode("view", { class: "settings-header" }, [
        vue.createElementVNode("view", { class: "header-title" }, "设置")
      ]),
      vue.createElementVNode("view", { class: "settings-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "账户设置"),
        vue.createElementVNode("view", { class: "settings-list" }, [
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.changePassword && $options.changePassword(...args))
          }, [
            vue.createElementVNode("image", {
              src: _imports_0,
              class: "settings-icon-img"
            }),
            vue.createElementVNode("text", { class: "settings-text" }, "修改密码"),
            vue.createElementVNode("text", { class: "arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.changePhone && $options.changePhone(...args))
          }, [
            vue.createElementVNode("image", {
              src: _imports_1,
              class: "settings-icon-img"
            }),
            vue.createElementVNode("text", { class: "settings-text" }, "更换手机号"),
            vue.createElementVNode("text", { class: "arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.updateUserInfo && $options.updateUserInfo(...args))
          }, [
            vue.createElementVNode("image", {
              src: _imports_2,
              class: "settings-icon-img"
            }),
            vue.createElementVNode("text", { class: "settings-text" }, "修改个人信息"),
            vue.createElementVNode("text", { class: "arrow" }, ">")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "settings-section" }, [
        vue.createElementVNode("view", { class: "logout-btn" }, [
          vue.createElementVNode("button", {
            type: "default",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.logout && $options.logout(...args))
          }, "退出登录")
        ])
      ])
    ]);
  }
  const PagesUserSettings = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/user/settings.vue"]]);
  const _sfc_main$5 = {
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
        const token = uni.getStorageSync("token");
        if (!token) {
          this.promptLogin();
        }
      },
      // 提示登录
      promptLogin() {
        uni.showModal({
          title: "提示",
          content: "请先登录",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: "/pages/login/login"
              });
            } else {
              uni.navigateBack();
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
        api$1.request({
          url: "/user/change-password",
          method: "PUT",
          data: {
            oldPassword: this.oldPassword,
            newPassword: this.newPassword
          },
          success: (res) => {
            if (res.data.code === 200) {
              this.showToast("密码修改成功，请重新登录", "success");
              uni.removeStorageSync("token");
              uni.removeStorageSync("userInfo");
              setTimeout(() => {
                uni.reLaunch({
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
        uni.showToast({
          title,
          icon
        });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "change-password-container" }, [
      vue.createElementVNode("view", { class: "password-header" }, [
        vue.createElementVNode("view", { class: "header-title" }, "修改密码")
      ]),
      vue.createElementVNode("view", { class: "password-form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "原密码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "password",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.oldPassword = $event),
              placeholder: "请输入原密码",
              class: "form-input",
              "placeholder-style": "color: #666666;"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.oldPassword]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "新密码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "password",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.newPassword = $event),
              placeholder: "请输入新密码",
              class: "form-input",
              "placeholder-style": "color: #666666;"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.newPassword]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "确认新密码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "password",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.confirmPassword = $event),
              placeholder: "请再次输入新密码",
              class: "form-input",
              "placeholder-style": "color: #666666;"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.confirmPassword]
          ])
        ]),
        vue.createElementVNode("view", { class: "password-rules" }, [
          vue.createElementVNode("text", { class: "rules-title" }, "密码要求："),
          vue.createElementVNode("text", { class: "rules-item" }, "• 不少于8个字符"),
          vue.createElementVNode("text", { class: "rules-item" }, "• 包含大小写字母和数字"),
          vue.createElementVNode("text", { class: "rules-item" }, "• 不能与旧密码相同")
        ]),
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.submitPassword && $options.submitPassword(...args))
        }, "确认修改")
      ])
    ]);
  }
  const PagesUserChangePassword = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/user/change-password.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        currentPhone: "",
        newPhone: "",
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
        const token = uni.getStorageSync("token");
        if (!token) {
          this.promptLogin();
        }
      },
      // 获取用户信息
      getUserInfo() {
        const userInfo = uni.getStorageSync("userInfo");
        if (userInfo && userInfo.phone) {
          this.currentPhone = userInfo.phone;
        } else {
          const token = uni.getStorageSync("token");
          if (!token) {
            this.promptLogin();
            return;
          }
          api$1.getUserInfo().then((res) => {
            if (res.data.code === 200 && res.data.data) {
              this.currentPhone = res.data.data.phone || "";
              uni.setStorageSync("userInfo", res.data.data);
            } else if (res.data.code === 403) {
              this.showToast("登录已过期，请重新登录");
              setTimeout(() => {
                uni.removeStorageSync("token");
                uni.removeStorageSync("userInfo");
                uni.reLaunch({
                  url: "/pages/login/login"
                });
              }, 1500);
            }
          }).catch((err) => {
            formatAppLog("error", "at pages/user/change-phone.vue:82", "获取用户信息失败:", err);
            if (err.statusCode === 403) {
              this.showToast("登录已过期，请重新登录");
              setTimeout(() => {
                uni.reLaunch({
                  url: "/pages/login/login"
                });
              }, 1500);
            }
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
      // 验证手机号
      validatePhone() {
        if (!this.newPhone) {
          this.showToast("请输入新手机号");
          return false;
        }
        if (!/^1[3-9]\d{9}$/.test(this.newPhone)) {
          this.showToast("请输入正确的手机号格式");
          return false;
        }
        if (this.newPhone === this.currentPhone) {
          this.showToast("新手机号不能与当前手机号相同");
          return false;
        }
        return true;
      },
      // 提交更换手机号
      submitChange() {
        if (!this.validatePhone()) {
          return;
        }
        this.loading = true;
        const token = uni.getStorageSync("token");
        if (!token) {
          this.showToast("请先登录");
          this.promptLogin();
          return;
        }
        api$1.updateUserInfo({
          phone: this.newPhone
        }).then((res) => {
          if (res.data.code === 200) {
            this.showToast("手机号更换成功", "success");
            const userInfo = uni.getStorageSync("userInfo") || {};
            userInfo.phone = this.newPhone;
            uni.setStorageSync("userInfo", userInfo);
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            if (res.data.code === 403) {
              this.showToast("没有权限，请重新登录");
              setTimeout(() => {
                uni.removeStorageSync("token");
                uni.removeStorageSync("userInfo");
                uni.reLaunch({
                  url: "/pages/login/login"
                });
              }, 1500);
            } else {
              this.showToast(res.data.message || "手机号更换失败");
            }
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/user/change-phone.vue:176", "请求失败:", err);
          if (err.statusCode === 403) {
            this.showToast("登录已过期，请重新登录");
            setTimeout(() => {
              uni.removeStorageSync("token");
              uni.removeStorageSync("userInfo");
              uni.reLaunch({
                url: "/pages/login/login"
              });
            }, 1500);
          } else {
            this.showToast("网络错误，请稍后再试");
          }
        }).finally(() => {
          this.loading = false;
        });
      },
      // 提示登录
      promptLogin() {
        uni.showModal({
          title: "提示",
          content: "请先登录",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: "/pages/login/login"
              });
            } else {
              uni.navigateBack();
            }
          }
        });
      },
      // 显示提示信息
      showToast(title, icon = "none") {
        uni.showToast({
          title,
          icon
        });
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "change-phone-container" }, [
      vue.createElementVNode("view", { class: "phone-header" }, [
        vue.createElementVNode("view", { class: "header-title" }, "更换手机号")
      ]),
      vue.createElementVNode("view", { class: "phone-form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "当前手机号"),
          vue.createElementVNode(
            "view",
            { class: "current-phone" },
            vue.toDisplayString($options.maskPhone($data.currentPhone)),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "新手机号"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "number",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.newPhone = $event),
              placeholder: "请输入新手机号",
              class: "form-input",
              maxlength: "11",
              "placeholder-style": "color: #666666;"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.newPhone]
          ])
        ]),
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.submitChange && $options.submitChange(...args))
        }, "确认更换")
      ])
    ]);
  }
  const PagesUserChangePhone = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/user/change-phone.vue"]]);
  const _sfc_main$3 = {
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
        const token = uni.getStorageSync("token");
        if (!token) {
          this.promptLogin();
        }
      },
      // 获取用户信息
      getUserInfo() {
        const userInfo = uni.getStorageSync("userInfo");
        if (userInfo) {
          this.userInfo = userInfo;
          if (userInfo.gender) {
            this.genderIndex = userInfo.gender;
          }
          if (userInfo.birthday) {
            this.birthday = userInfo.birthday;
          }
        } else {
          api$1.request({
            url: "/user/profile",
            method: "GET"
          }).then((res) => {
            if (res.data.code === 200 && res.data.data) {
              this.userInfo = res.data.data;
              uni.setStorageSync("userInfo", res.data.data);
              if (this.userInfo.gender) {
                this.genderIndex = this.userInfo.gender;
              }
              if (this.userInfo.birthday) {
                this.birthday = this.userInfo.birthday;
              }
            }
          }).catch((err) => {
            formatAppLog("error", "at pages/user/user-info.vue:106", "获取用户信息失败:", err);
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
        api$1.request({
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
            const userInfo = uni.getStorageSync("userInfo") || {};
            userInfo.gender = parseInt(this.genderIndex);
            userInfo.birthday = this.birthday;
            uni.setStorageSync("userInfo", userInfo);
            setTimeout(() => {
              uni.navigateBack();
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
        uni.showModal({
          title: "提示",
          content: "请先登录",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: "/pages/login/login"
              });
            } else {
              uni.navigateBack();
            }
          }
        });
      },
      // 显示提示信息
      showToast(title, icon = "none") {
        uni.showToast({
          title,
          icon
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "user-info-container" }, [
      vue.createElementVNode("view", { class: "info-header" }, [
        vue.createElementVNode("view", { class: "header-title" }, "个人信息")
      ]),
      vue.createElementVNode("view", { class: "info-form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "用户名"),
          vue.createElementVNode(
            "view",
            { class: "current-info" },
            vue.toDisplayString($data.userInfo.username || ""),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "手机号"),
          vue.createElementVNode(
            "view",
            { class: "current-info" },
            vue.toDisplayString($options.maskPhone($data.userInfo.phone) || ""),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "性别"),
          vue.createElementVNode("picker", {
            onChange: _cache[0] || (_cache[0] = (...args) => $options.bindGenderChange && $options.bindGenderChange(...args)),
            value: $data.genderIndex,
            range: $data.genderOptions
          }, [
            vue.createElementVNode("view", { class: "picker-content" }, [
              vue.createElementVNode(
                "text",
                { class: "picker-text" },
                vue.toDisplayString($data.genderOptions[$data.genderIndex]),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "arrow" }, ">")
            ])
          ], 40, ["value", "range"])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "生日"),
          vue.createElementVNode("picker", {
            mode: "date",
            value: $data.birthday,
            onChange: _cache[1] || (_cache[1] = (...args) => $options.bindDateChange && $options.bindDateChange(...args)),
            start: "1950-01-01",
            end: "2010-12-31"
          }, [
            vue.createElementVNode("view", { class: "picker-content" }, [
              vue.createElementVNode(
                "text",
                { class: "picker-text" },
                vue.toDisplayString($data.birthday || "请选择生日"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "arrow" }, ">")
            ])
          ], 40, ["value"])
        ]),
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.submitUpdate && $options.submitUpdate(...args))
        }, "保存修改")
      ])
    ]);
  }
  const PagesUserUserInfo = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/user/user-info.vue"]]);
  const _sfc_main$2 = {
    data() {
      const now = /* @__PURE__ */ new Date();
      return {
        userInfo: {},
        memberInfo: {
          currentLevel: 0,
          levelName: "普通会员",
          currentPoints: 0,
          nextLevelPoints: 1e3,
          pointsToNextLevel: 1e3,
          discount: 1,
          benefits: "无折扣"
        },
        // 会员等级列表
        memberLevelList: [],
        showMemberLevelModal: false,
        // 积分记录
        pointRecords: [],
        pointPage: 0,
        pointSize: 10,
        hasMorePointRecords: true,
        loadingPoints: false,
        // 优惠券
        coupons: [],
        couponPage: 0,
        couponSize: 10,
        hasMoreCoupons: true,
        loadingCoupons: false,
        // 可领取的优惠券
        receivableCoupons: [],
        // 签到相关
        checkinInfo: {
          days: [],
          continuesDays: 0,
          currentMonthDays: 30
        },
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth() + 1,
        todayChecked: false,
        calendarDays: [],
        // 选项卡
        activeTab: 0,
        // 调试模式
        debugMode: false,
        // 积分规则相关
        pointRules: [],
        showPointRules: false,
        // 页面高度
        scrollHeight: 0
      };
    },
    onLoad() {
      this.getUserInfo();
      this.getMemberLevel();
      this.getPointRecords();
      this.getCoupons();
      this.getReceivableCoupons();
      this.getCheckinRecords();
      this.generateCalendar();
      this.getPointRules();
      this.getMemberLevelList();
      this.setScrollHeight();
    },
    onPullDownRefresh() {
      this.getUserInfo();
      this.getMemberLevel();
      this.getPointRecords();
      this.getCoupons();
      this.getReceivableCoupons();
      this.getCheckinRecords();
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1e3);
    },
    onReady() {
      this.setScrollHeight();
    },
    onShow() {
      this.setScrollHeight();
    },
    // 监听窗口尺寸变化
    onResize() {
      this.setScrollHeight();
    },
    computed: {
      isToday() {
        const today = /* @__PURE__ */ new Date();
        const currentDay = today.getDate();
        return (day) => day === currentDay && this.currentMonth === today.getMonth() + 1 && this.currentYear === today.getFullYear();
      }
    },
    methods: {
      // 设置滚动区域高度
      setScrollHeight() {
        const that = this;
        uni.getSystemInfo({
          success: function(res) {
            that.scrollHeight = res.windowHeight;
            formatAppLog("log", "at pages/user/member-center.vue:376", "设置滚动区域高度:", that.scrollHeight);
          }
        });
      },
      // 获取用户信息
      async getUserInfo() {
        try {
          const res = await api$1.getUserInfo();
          if (res.data && res.data.code === 200) {
            this.userInfo = res.data.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/member-center.vue:388", "获取用户信息失败", error);
          uni.showToast({
            title: "获取用户信息失败",
            icon: "none"
          });
        }
      },
      // 获取会员等级信息
      async getMemberLevel() {
        try {
          const res = await api$1.request({
            url: "/user/member-level",
            method: "GET"
          });
          if (res.data && res.data.code === 200) {
            this.memberInfo = res.data.data;
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/member-center.vue:410", "获取会员等级信息失败", error);
        }
      },
      // 处理积分记录滚动到底部
      handlePointsScrollToLower() {
        formatAppLog("log", "at pages/user/member-center.vue:416", "积分记录滚动到底部");
        if (this.hasMorePointRecords && !this.loadingPoints) {
          this.loadMorePointRecords();
        }
      },
      // 获取积分记录
      async getPointRecords(loadMore = false) {
        if (this.loadingPoints)
          return;
        try {
          this.loadingPoints = true;
          if (loadMore) {
            this.pointPage++;
          } else {
            this.pointPage = 0;
            this.pointRecords = [];
          }
          const res = await api$1.request({
            url: "/user/point-records",
            method: "GET",
            data: {
              page: this.pointPage,
              size: this.pointSize
            }
          });
          if (res.data && res.data.code === 200) {
            const data = res.data.data;
            if (loadMore) {
              this.pointRecords = [...this.pointRecords, ...data.content];
            } else {
              this.pointRecords = data.content;
            }
            this.hasMorePointRecords = this.pointRecords.length < data.totalElements;
            formatAppLog("log", "at pages/user/member-center.vue:455", "积分记录加载完成，是否还有更多:", this.hasMorePointRecords);
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/member-center.vue:458", "获取积分记录失败", error);
          uni.showToast({
            title: "获取积分记录失败",
            icon: "none"
          });
        } finally {
          this.loadingPoints = false;
        }
      },
      // 加载更多积分记录
      loadMorePointRecords() {
        if (this.hasMorePointRecords && !this.loadingPoints) {
          formatAppLog("log", "at pages/user/member-center.vue:471", "加载更多积分记录，当前页:", this.pointPage);
          this.getPointRecords(true);
        }
      },
      // 获取优惠券
      async getCoupons(loadMore = false) {
        if (this.loadingCoupons)
          return;
        try {
          this.loadingCoupons = true;
          if (loadMore) {
            this.couponPage++;
          } else {
            this.couponPage = 0;
            this.coupons = [];
          }
          const res = await api$1.request({
            url: "/user/coupons",
            method: "GET",
            data: {
              page: this.couponPage,
              size: this.couponSize
            }
          });
          if (res.data && res.data.code === 200) {
            const data = res.data.data;
            if (data && data.content) {
              if (loadMore) {
                this.coupons = [...this.coupons, ...data.content];
              } else {
                this.coupons = data.content;
              }
              this.hasMoreCoupons = this.coupons.length < data.totalElements;
            } else {
              const couponsArray = Array.isArray(data) ? data : [];
              if (loadMore) {
                this.coupons = [...this.coupons, ...couponsArray];
              } else {
                this.coupons = couponsArray;
              }
              this.hasMoreCoupons = false;
            }
            this.coupons.sort((a, b) => {
              if (a.status !== b.status) {
                return a.status - b.status;
              }
              if (a.status === 0) {
                const aEndTime = a.coupon ? new Date(a.coupon.endTime).getTime() : 0;
                const bEndTime = b.coupon ? new Date(b.coupon.endTime).getTime() : 0;
                return aEndTime - bEndTime;
              }
              const aTime = new Date(a.createdAt).getTime();
              const bTime = new Date(b.createdAt).getTime();
              return bTime - aTime;
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/member-center.vue:545", "获取优惠券失败", error);
          uni.showToast({
            title: "获取优惠券失败",
            icon: "none"
          });
        } finally {
          this.loadingCoupons = false;
        }
      },
      // 加载更多优惠券
      loadMoreCoupons() {
        if (this.hasMoreCoupons && !this.loadingCoupons) {
          this.getCoupons(true);
        }
      },
      // 获取可领取的优惠券
      async getReceivableCoupons() {
        try {
          const res = await api$1.request({
            url: "/user/receivable-coupons",
            method: "GET"
          });
          if (res.data && res.data.code === 200) {
            this.receivableCoupons = Array.isArray(res.data.data) ? res.data.data : [];
            this.receivableCoupons.sort((a, b) => {
              const aEndTime = a.endTime ? new Date(a.endTime).getTime() : 0;
              const bEndTime = b.endTime ? new Date(b.endTime).getTime() : 0;
              return aEndTime - bEndTime;
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/member-center.vue:581", "获取可领取优惠券失败", error);
          uni.showToast({
            title: "获取可领取优惠券失败",
            icon: "none"
          });
        }
      },
      // 领取优惠券
      async receiveCoupon(couponId) {
        try {
          const res = await api$1.request({
            url: `/user/receive-coupon/${couponId}`,
            method: "POST"
          });
          if (res.data && res.data.code === 200) {
            uni.showToast({
              title: "领取成功",
              icon: "success"
            });
            this.getReceivableCoupons();
            this.getCoupons();
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/member-center.vue:608", "领取优惠券失败", error);
          uni.showToast({
            title: "领取失败，请稍后再试",
            icon: "none"
          });
        }
      },
      // 获取签到记录
      async getCheckinRecords() {
        try {
          const res = await api$1.request({
            url: "/member/checkin/records",
            method: "GET",
            data: {
              year: this.currentYear,
              month: this.currentMonth
            }
          });
          if (res.data && res.data.code === 200) {
            this.checkinInfo = res.data.data;
            const today = (/* @__PURE__ */ new Date()).getDate();
            this.todayChecked = this.checkinInfo.days && this.checkinInfo.days.includes(today);
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/member-center.vue:635", "获取签到记录失败", error);
        }
      },
      // 生成日历数据
      generateCalendar() {
        const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
        this.calendarDays = Array(firstDay).fill(null);
        for (let i = 1; i <= daysInMonth; i++) {
          this.calendarDays.push(i);
        }
        const paddingDays = 42 - this.calendarDays.length;
        if (paddingDays > 0) {
          this.calendarDays = [...this.calendarDays, ...Array(paddingDays).fill(null)];
        }
      },
      // 用户签到
      async handleCheckin() {
        if (this.todayChecked)
          return;
        try {
          const res = await api$1.request({
            url: "/member/checkin",
            method: "POST"
          });
          if (res.data && res.data.code === 200) {
            const data = res.data.data;
            uni.showToast({
              title: `签到成功，获得${data.points}积分`,
              icon: "success"
            });
            this.todayChecked = true;
            if (this.checkinInfo.continuesDays) {
              this.checkinInfo.continuesDays += 1;
            }
            const today = (/* @__PURE__ */ new Date()).getDate();
            if (this.checkinInfo.days && !this.checkinInfo.days.includes(today)) {
              this.checkinInfo.days.push(today);
            }
            this.getUserInfo();
            this.getPointRecords();
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/member-center.vue:694", "签到失败", error);
          uni.showToast({
            title: "签到失败，请稍后再试",
            icon: "none"
          });
        }
      },
      // 格式化日期
      formatDate(dateString) {
        if (!dateString)
          return "";
        if (dateString.includes(":")) {
          return dateString.split(" ")[0];
        }
        return dateString;
      },
      // 格式化优惠券金额展示
      formatAmount(coupon) {
        if (!coupon)
          return "0";
        try {
          if (coupon.type === 1) {
            const amount = Number(coupon.amount);
            return !isNaN(amount) ? amount.toFixed(0) : "0";
          } else if (coupon.type === 2) {
            const amount = Number(coupon.amount);
            if (!isNaN(amount)) {
              if (amount < 1) {
                return (amount * 10).toFixed(1);
              } else {
                return amount.toFixed(1);
              }
            }
            return "0.0";
          } else {
            const amount = Number(coupon.amount);
            return !isNaN(amount) ? amount.toFixed(1) : "0";
          }
        } catch (e) {
          formatAppLog("error", "at pages/user/member-center.vue:743", "格式化金额出错", e, coupon);
          return "0";
        }
      },
      // 获取优惠券状态文本
      getCouponStatusText(status) {
        switch (status) {
          case 0:
            return "可使用";
          case 1:
            return "已使用";
          case 2:
            return "已过期";
          default:
            return "未知状态";
        }
      },
      // 切换调试模式
      toggleDebug() {
        this.debugMode = !this.debugMode;
        if (this.debugMode) {
          uni.showToast({
            title: "已开启调试模式",
            icon: "none"
          });
        }
      },
      // 获取未使用的优惠券数量
      getUnusedCouponCount() {
        if (!this.coupons || !this.coupons.length) {
          return 0;
        }
        return this.coupons.filter((coupon) => coupon.status === 0).length;
      },
      // 获取积分规则
      async getPointRules() {
        try {
          const res = await api$1.request({
            url: "/member/point-rules",
            method: "GET"
          });
          if (res.data && res.data.code === 200) {
            this.pointRules = res.data.data || [];
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/member-center.vue:795", "获取积分规则失败", error);
        }
      },
      // 显示积分规则弹窗
      togglePointRules() {
        this.showPointRules = !this.showPointRules;
      },
      // 获取会员等级列表
      async getMemberLevelList() {
        try {
          const res = await api$1.request({
            url: "/member/levels",
            method: "GET"
          });
          if (res.data && res.data.code === 200) {
            this.memberLevelList = res.data.data || [];
            formatAppLog("log", "at pages/user/member-center.vue:814", "会员等级列表:", this.memberLevelList);
          }
        } catch (error) {
          formatAppLog("error", "at pages/user/member-center.vue:817", "获取会员等级列表失败", error);
        }
      },
      // 显示会员等级弹窗
      toggleMemberLevelModal() {
        this.showMemberLevelModal = !this.showMemberLevelModal;
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page-wrapper" }, [
      vue.createElementVNode(
        "scroll-view",
        {
          "scroll-y": "",
          class: "member-center",
          style: vue.normalizeStyle({ height: $data.scrollHeight + "px" })
        },
        [
          vue.createCommentVNode(" 会员信息头部 "),
          vue.createElementVNode("view", { class: "member-header" }, [
            vue.createElementVNode("view", { class: "header-bg" }),
            vue.createElementVNode("view", { class: "member-info" }, [
              vue.createElementVNode("image", {
                src: $data.userInfo.avatar || "/static/tabbar/user.png",
                class: "avatar",
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "info-content" }, [
                vue.createElementVNode(
                  "view",
                  { class: "username" },
                  vue.toDisplayString($data.userInfo.username),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "member-level" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "level-name" },
                    vue.toDisplayString($data.memberInfo.levelName || "普通会员"),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "level-desc" },
                    vue.toDisplayString($data.memberInfo.benefits || ""),
                    1
                    /* TEXT */
                  ),
                  $data.memberInfo.discount && $data.memberInfo.discount < 1 ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "discount-badge"
                    },
                    vue.toDisplayString(($data.memberInfo.discount * 10).toFixed(1)) + "折",
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true)
                ])
              ])
            ]),
            vue.createCommentVNode(" 会员等级按钮 "),
            vue.createElementVNode("view", {
              class: "point-rules-btn",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.toggleMemberLevelModal && $options.toggleMemberLevelModal(...args))
            }, [
              vue.createElementVNode("text", { class: "point-rules-text" }, "会员等级"),
              vue.createElementVNode("text", { class: "point-rules-icon" }, "?")
            ])
          ]),
          vue.createCommentVNode(" 会员数据卡片 "),
          vue.createElementVNode("view", { class: "data-card" }, [
            vue.createElementVNode("view", { class: "data-item" }, [
              vue.createElementVNode(
                "text",
                { class: "data-value" },
                vue.toDisplayString($data.userInfo.totalPoints || $data.memberInfo.currentPoints || 0),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "data-label" }, "我的积分")
            ]),
            vue.createElementVNode("view", { class: "divider" }),
            vue.createElementVNode("view", { class: "data-item" }, [
              vue.createElementVNode(
                "text",
                { class: "data-value" },
                vue.toDisplayString($options.getUnusedCouponCount()),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "data-label" }, "可用优惠券")
            ]),
            vue.createElementVNode("view", { class: "divider" }),
            vue.createElementVNode("view", { class: "data-item" }, [
              vue.createElementVNode(
                "text",
                { class: "data-value" },
                vue.toDisplayString($data.memberInfo.pointsToNextLevel || 0),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "data-label" }, "升级还需")
            ])
          ]),
          vue.createCommentVNode(" 签到模块 "),
          vue.createElementVNode("view", { class: "section checkin-section" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode("text", { class: "section-title" }, "每日签到"),
              vue.createElementVNode(
                "text",
                { class: "section-subtitle" },
                "已连续签到 " + vue.toDisplayString($data.checkinInfo.continuesDays || 0) + " 天",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "checkin-calendar" }, [
              vue.createElementVNode("view", { class: "calendar-header" }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($data.currentYear) + "年" + vue.toDisplayString($data.currentMonth) + "月",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "calendar-days" }, [
                vue.createElementVNode("view", { class: "weekday-row" }, [
                  (vue.openBlock(), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(["日", "一", "二", "三", "四", "五", "六"], (day, index) => {
                      return vue.createElementVNode(
                        "text",
                        {
                          key: index,
                          class: "weekday"
                        },
                        vue.toDisplayString(day),
                        1
                        /* TEXT */
                      );
                    }),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ]),
                vue.createElementVNode("view", { class: "days-grid" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.calendarDays, (day, index) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          key: index,
                          class: vue.normalizeClass(["calendar-day", {
                            "empty": !day,
                            "checked": $data.checkinInfo.days && $data.checkinInfo.days.includes(day),
                            "today": $options.isToday(day)
                          }])
                        },
                        [
                          day ? (vue.openBlock(), vue.createElementBlock(
                            "text",
                            { key: 0 },
                            vue.toDisplayString(day),
                            1
                            /* TEXT */
                          )) : vue.createCommentVNode("v-if", true)
                        ],
                        2
                        /* CLASS */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ]),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["checkin-btn", { "checked": $data.todayChecked }]),
              disabled: $data.todayChecked,
              onClick: _cache[1] || (_cache[1] = (...args) => $options.handleCheckin && $options.handleCheckin(...args))
            }, vue.toDisplayString($data.todayChecked ? "今日已签到" : "立即签到"), 11, ["disabled"])
          ]),
          vue.createCommentVNode(" 积分和优惠券标签栏 "),
          vue.createElementVNode("view", { class: "tab-container" }, [
            vue.createElementVNode("view", { class: "tab-header" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["tab-item", { "active": $data.activeTab === 0 }]),
                  onClick: _cache[3] || (_cache[3] = ($event) => $data.activeTab = 0)
                },
                [
                  vue.createTextVNode(" 积分记录 "),
                  vue.createElementVNode("text", {
                    class: "point-rules-icon",
                    onClick: _cache[2] || (_cache[2] = vue.withModifiers((...args) => $options.togglePointRules && $options.togglePointRules(...args), ["stop"]))
                  }, "?")
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["tab-item", { "active": $data.activeTab === 1 }]),
                  onClick: _cache[4] || (_cache[4] = ($event) => $data.activeTab = 1)
                },
                "我的优惠券 ",
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["tab-item", { "active": $data.activeTab === 2 }]),
                  onClick: _cache[5] || (_cache[5] = ($event) => $data.activeTab = 2)
                },
                "可领优惠券",
                2
                /* CLASS */
              )
            ]),
            vue.createCommentVNode(" 积分记录 "),
            $data.activeTab === 0 ? (vue.openBlock(), vue.createElementBlock(
              "scroll-view",
              {
                key: 0,
                "scroll-y": "",
                class: "tab-content points-record",
                onScrolltolower: _cache[6] || (_cache[6] = (...args) => $options.handlePointsScrollToLower && $options.handlePointsScrollToLower(...args))
              },
              [
                $data.pointRecords.length === 0 && !$data.loadingPoints ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "empty-tip"
                }, [
                  vue.createElementVNode("text", null, "暂无积分记录")
                ])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "record-list"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.pointRecords, (record) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: "record-item",
                        key: record.id
                      }, [
                        vue.createElementVNode("view", { class: "record-info" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "record-desc" },
                            vue.toDisplayString(record.description),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "record-time" },
                            vue.toDisplayString(record.createdAt),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode(
                          "text",
                          {
                            class: vue.normalizeClass(["record-points", record.point > 0 ? "positive" : "negative"])
                          },
                          vue.toDisplayString(record.point > 0 ? "+" : "") + vue.toDisplayString(record.point),
                          3
                          /* TEXT, CLASS */
                        )
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  vue.createCommentVNode(" 加载状态显示 "),
                  $data.loadingPoints ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "loading-more"
                  }, [
                    vue.createElementVNode("view", { class: "loading-spinner" }),
                    vue.createElementVNode("text", null, "加载中...")
                  ])) : vue.createCommentVNode("v-if", true),
                  vue.createCommentVNode(" 已加载全部 "),
                  !$data.hasMorePointRecords && $data.pointRecords.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "no-more"
                  }, [
                    vue.createElementVNode("text", null, "— 已加载全部 —")
                  ])) : vue.createCommentVNode("v-if", true)
                ]))
              ],
              32
              /* NEED_HYDRATION */
            )) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 我的优惠券 "),
            $data.activeTab === 1 ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
              key: 1,
              "scroll-y": "",
              class: "tab-content my-coupons"
            }, [
              $data.coupons.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "empty-tip"
              }, [
                $data.loadingCoupons ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "暂无优惠券"))
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "coupon-list"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.coupons, (item) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        class: vue.normalizeClass(["coupon-item", {
                          "used": item.status === 1,
                          "expired": item.status === 2
                        }]),
                        key: item.id
                      },
                      [
                        vue.createElementVNode("view", { class: "coupon-left" }, [
                          vue.createElementVNode("view", { class: "coupon-amount" }, [
                            item.coupon && item.coupon.type === 1 ? (vue.openBlock(), vue.createElementBlock("text", {
                              key: 0,
                              class: "amount-prefix"
                            }, "¥")) : vue.createCommentVNode("v-if", true),
                            vue.createElementVNode(
                              "text",
                              { class: "amount-value" },
                              vue.toDisplayString($options.formatAmount(item.coupon)),
                              1
                              /* TEXT */
                            ),
                            item.coupon && item.coupon.type === 2 ? (vue.openBlock(), vue.createElementBlock("text", {
                              key: 1,
                              class: "amount-postfix"
                            }, "折")) : vue.createCommentVNode("v-if", true)
                          ]),
                          item.coupon && item.coupon.minConsumption > 0 ? (vue.openBlock(), vue.createElementBlock(
                            "text",
                            {
                              key: 0,
                              class: "condition"
                            },
                            "满" + vue.toDisplayString(item.coupon.minConsumption) + "元可用",
                            1
                            /* TEXT */
                          )) : vue.createCommentVNode("v-if", true)
                        ]),
                        vue.createElementVNode("view", { class: "coupon-right" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "coupon-name" },
                            vue.toDisplayString(item.coupon ? item.coupon.name : "优惠券"),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "coupon-time" },
                            vue.toDisplayString($options.formatDate(item.coupon ? item.coupon.startTime : "")) + " - " + vue.toDisplayString($options.formatDate(item.coupon ? item.coupon.endTime : "")),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "coupon-status" },
                            vue.toDisplayString(item.statusText || $options.getCouponStatusText(item.status)),
                            1
                            /* TEXT */
                          )
                        ]),
                        $data.debugMode ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "debug-info"
                        }, [
                          vue.createElementVNode(
                            "text",
                            null,
                            "原始数据: " + vue.toDisplayString(JSON.stringify(item)),
                            1
                            /* TEXT */
                          )
                        ])) : vue.createCommentVNode("v-if", true)
                      ],
                      2
                      /* CLASS */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])),
              $data.hasMoreCoupons && !$data.loadingCoupons ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 2,
                class: "load-more",
                onClick: _cache[7] || (_cache[7] = (...args) => $options.loadMoreCoupons && $options.loadMoreCoupons(...args))
              }, " 加载更多 ")) : vue.createCommentVNode("v-if", true),
              $data.loadingCoupons ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 3,
                class: "loading"
              }, "加载中...")) : vue.createCommentVNode("v-if", true)
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 可领优惠券 "),
            $data.activeTab === 2 ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
              key: 2,
              "scroll-y": "",
              class: "tab-content receivable-coupons"
            }, [
              $data.receivableCoupons.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "empty-tip"
              }, [
                vue.createElementVNode("text", null, "暂无可领取的优惠券")
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "coupon-list"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.receivableCoupons, (coupon) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "coupon-item receivable",
                      key: coupon.id
                    }, [
                      vue.createElementVNode("view", { class: "coupon-left" }, [
                        vue.createElementVNode("view", { class: "coupon-amount" }, [
                          coupon.type === 1 ? (vue.openBlock(), vue.createElementBlock("text", {
                            key: 0,
                            class: "amount-prefix"
                          }, "¥")) : vue.createCommentVNode("v-if", true),
                          vue.createElementVNode(
                            "text",
                            { class: "amount-value" },
                            vue.toDisplayString($options.formatAmount(coupon)),
                            1
                            /* TEXT */
                          ),
                          coupon.type === 2 ? (vue.openBlock(), vue.createElementBlock("text", {
                            key: 1,
                            class: "amount-postfix"
                          }, "折")) : vue.createCommentVNode("v-if", true)
                        ]),
                        coupon.minConsumption > 0 ? (vue.openBlock(), vue.createElementBlock(
                          "text",
                          {
                            key: 0,
                            class: "condition"
                          },
                          "满" + vue.toDisplayString(coupon.minConsumption) + "元可用",
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ]),
                      vue.createElementVNode("view", { class: "coupon-right" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "coupon-name" },
                          vue.toDisplayString(coupon.name || "优惠券"),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "coupon-time" },
                          vue.toDisplayString($options.formatDate(coupon.startTime)) + " - " + vue.toDisplayString($options.formatDate(coupon.endTime)),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("button", {
                          class: "receive-btn",
                          onClick: vue.withModifiers(($event) => $options.receiveCoupon(coupon.id), ["stop"])
                        }, "领取", 8, ["onClick"])
                      ]),
                      $data.debugMode ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "debug-info"
                      }, [
                        vue.createElementVNode(
                          "text",
                          null,
                          "原始数据: " + vue.toDisplayString(JSON.stringify(coupon)),
                          1
                          /* TEXT */
                        )
                      ])) : vue.createCommentVNode("v-if", true)
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]))
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createCommentVNode(" 会员等级说明弹窗 "),
      $data.showMemberLevelModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "member-level-modal"
      }, [
        vue.createElementVNode("view", {
          class: "modal-mask",
          onClick: _cache[8] || (_cache[8] = (...args) => $options.toggleMemberLevelModal && $options.toggleMemberLevelModal(...args))
        }),
        vue.createElementVNode("view", { class: "modal-content" }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "会员等级与权益"),
            vue.createElementVNode("text", {
              class: "modal-close",
              onClick: _cache[9] || (_cache[9] = (...args) => $options.toggleMemberLevelModal && $options.toggleMemberLevelModal(...args))
            }, "×")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.memberLevelList, (level, index) => {
                return vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    class: vue.normalizeClass(["level-item", { "current-level": level.level === $data.memberInfo.currentLevel }]),
                    key: index
                  },
                  [
                    vue.createElementVNode("view", { class: "level-header" }, [
                      vue.createElementVNode("view", { class: "level-name" }, [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(level.name),
                          1
                          /* TEXT */
                        ),
                        level.level === $data.memberInfo.currentLevel ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 0,
                          class: "level-tag"
                        }, "当前等级")) : vue.createCommentVNode("v-if", true)
                      ]),
                      vue.createElementVNode(
                        "view",
                        { class: "level-points" },
                        "所需积分: " + vue.toDisplayString(level.pointThreshold) + "+",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "level-benefits" }, [
                      vue.createElementVNode("view", { class: "level-discount" }, [
                        vue.createElementVNode("text", { class: "benefit-label" }, "折扣权益:"),
                        vue.createElementVNode(
                          "text",
                          { class: "benefit-value" },
                          vue.toDisplayString(level.discount == 1 ? "无折扣" : (level.discount * 10).toFixed(1) + "折"),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "level-other-benefits" }, [
                        vue.createElementVNode("text", { class: "benefit-label" }, "其他权益:"),
                        vue.createElementVNode(
                          "text",
                          { class: "benefit-value" },
                          vue.toDisplayString(level.benefits || "无特殊权益"),
                          1
                          /* TEXT */
                        )
                      ])
                    ])
                  ],
                  2
                  /* CLASS */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            $data.memberLevelList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "empty-tip"
            }, [
              vue.createElementVNode("text", null, "暂无会员等级信息")
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 积分规则弹窗 "),
      $data.showPointRules ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "point-rules-modal"
      }, [
        vue.createElementVNode("view", {
          class: "modal-mask",
          onClick: _cache[10] || (_cache[10] = (...args) => $options.togglePointRules && $options.togglePointRules(...args))
        }),
        vue.createElementVNode("view", { class: "modal-content" }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "积分获取规则"),
            vue.createElementVNode("text", {
              class: "modal-close",
              onClick: _cache[11] || (_cache[11] = (...args) => $options.togglePointRules && $options.togglePointRules(...args))
            }, "×")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.pointRules, (rule, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "rule-item",
                  key: index
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "rule-name" },
                    vue.toDisplayString(rule.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "rule-desc" },
                    vue.toDisplayString(rule.description),
                    1
                    /* TEXT */
                  ),
                  rule.isRatio ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: "rule-value"
                    },
                    " 比例：" + vue.toDisplayString(rule.pointValue * 100) + "% ",
                    1
                    /* TEXT */
                  )) : (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 1,
                      class: "rule-value"
                    },
                    " 固定积分：" + vue.toDisplayString(rule.pointValue) + "分 ",
                    1
                    /* TEXT */
                  ))
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            $data.pointRules.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "empty-tip"
            }, [
              vue.createElementVNode("text", null, "暂无积分规则")
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesUserMemberCenter = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-24edc527"], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/user/member-center.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        orderNo: "",
        orderAmount: 0,
        refundAmount: "",
        reasonOptions: [
          "商品质量问题",
          "商品口味不合适",
          "送达时间过长",
          "商品包装破损",
          "商品错误",
          "重复下单",
          "不想要了",
          "其他原因"
        ],
        reasonIndex: 0,
        methods: [
          { id: 1, name: "原路返回" },
          { id: 2, name: "退到余额" }
        ],
        methodIndex: 0,
        remark: ""
      };
    },
    onLoad(options) {
      if (options.orderNo) {
        this.orderNo = options.orderNo;
      }
      if (options.amount) {
        this.orderAmount = parseFloat(options.amount);
        this.refundAmount = this.orderAmount.toFixed(2);
      }
    },
    methods: {
      // 校验退款金额
      checkAmount() {
        if (this.refundAmount && !/^\d+(\.\d{0,2})?$/.test(this.refundAmount)) {
          const value = this.refundAmount;
          this.refundAmount = value.replace(/[^\d.]/g, "");
        }
        if (parseFloat(this.refundAmount) > this.orderAmount) {
          this.refundAmount = this.orderAmount.toFixed(2);
          uni.showToast({
            title: "退款金额不能超过订单金额",
            icon: "none"
          });
        }
      },
      // 选择退款原因
      onReasonChange(e) {
        this.reasonIndex = e.detail.value;
      },
      // 选择退款方式
      onMethodChange(e) {
        this.methodIndex = e.detail.value;
      },
      // 提交退款申请
      submitRefund() {
        if (!this.refundAmount || parseFloat(this.refundAmount) <= 0) {
          uni.showToast({
            title: "请输入有效的退款金额",
            icon: "none"
          });
          return;
        }
        if (this.reasonIndex === void 0) {
          uni.showToast({
            title: "请选择退款原因",
            icon: "none"
          });
          return;
        }
        uni.showModal({
          title: "确认申请",
          content: "确定要提交退款申请吗？",
          success: (res) => {
            if (res.confirm) {
              uni.showLoading({
                title: "提交中..."
              });
              const refundData = {
                orderNo: this.orderNo,
                // 直接使用退款金额（元）
                refundAmount: parseFloat(this.refundAmount),
                // 直接传递选择的原因字符串
                reason: this.reasonOptions[this.reasonIndex],
                remark: this.remark,
                // 设置退款方式ID（1-原路返回，2-退到余额）
                refundMethod: this.methods[this.methodIndex].id
              };
              formatAppLog("log", "at pages/order/refund.vue:182", "退款请求数据:", refundData);
              formatAppLog("log", "at pages/order/refund.vue:183", "订单支付金额:", this.orderAmount);
              api$1.applyRefund(refundData).then((res2) => {
                formatAppLog("log", "at pages/order/refund.vue:188", "退款申请响应:", res2.data);
                if (res2.data.code === 200) {
                  uni.showToast({
                    title: "申请已提交",
                    icon: "success"
                  });
                  setTimeout(() => {
                    uni.navigateBack();
                  }, 1500);
                } else {
                  uni.showToast({
                    title: res2.data.message || "申请失败",
                    icon: "none"
                  });
                }
              }).catch((err) => {
                formatAppLog("error", "at pages/order/refund.vue:207", "网络请求失败:", err);
                uni.showToast({
                  title: "网络请求失败",
                  icon: "none"
                });
              }).finally(() => {
                uni.hideLoading();
              });
            }
          }
        });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "refund-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "申请退款")
      ]),
      vue.createElementVNode("view", { class: "refund-form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "item-label" }, "订单编号"),
          vue.createElementVNode(
            "text",
            { class: "item-value" },
            vue.toDisplayString($data.orderNo),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "item-label" }, "退款金额"),
          vue.createElementVNode("view", { class: "amount-input" }, [
            vue.createElementVNode("text", { class: "currency" }, "¥"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "digit",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.refundAmount = $event),
                placeholder: "请输入退款金额",
                class: "amount-value",
                maxlength: 10,
                onInput: _cache[1] || (_cache[1] = (...args) => $options.checkAmount && $options.checkAmount(...args))
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $data.refundAmount]
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "item-label" }, "退款原因"),
          vue.createElementVNode("picker", {
            onChange: _cache[2] || (_cache[2] = (...args) => $options.onReasonChange && $options.onReasonChange(...args)),
            value: $data.reasonIndex,
            range: $data.reasonOptions
          }, [
            vue.createElementVNode("view", { class: "picker-value" }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.reasonOptions[$data.reasonIndex] || "请选择退款原因"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "arrow" })
            ])
          ], 40, ["value", "range"])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "item-label" }, "退款方式"),
          vue.createElementVNode("picker", {
            onChange: _cache[3] || (_cache[3] = (...args) => $options.onMethodChange && $options.onMethodChange(...args)),
            value: $data.methodIndex,
            range: $data.methods,
            "range-key": "name"
          }, [
            vue.createElementVNode("view", { class: "picker-value" }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.methods[$data.methodIndex].name || "请选择退款方式"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "arrow" })
            ])
          ], 40, ["value", "range"])
        ]),
        vue.createElementVNode("view", { class: "form-item textarea-item" }, [
          vue.createElementVNode("text", { class: "item-label" }, "备注说明"),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.remark = $event),
              placeholder: "请输入退款说明（选填）",
              class: "remark-textarea",
              maxlength: "200"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.remark]
          ]),
          vue.createElementVNode(
            "text",
            { class: "textarea-count" },
            vue.toDisplayString($data.remark.length) + "/200",
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "refund-tips" }, [
        vue.createElementVNode("view", { class: "tip-item" }, [
          vue.createElementVNode("text", { class: "tip-title" }, "退款说明:"),
          vue.createElementVNode("text", { class: "tip-content" }, "1. 退款金额不能超过订单支付金额"),
          vue.createElementVNode("text", { class: "tip-content" }, "2. 提交后需等待商家审核，请耐心等待"),
          vue.createElementVNode("text", { class: "tip-content" }, "3. 退款将原路返回，预计1-7个工作日到账")
        ])
      ]),
      vue.createElementVNode("view", {
        class: "submit-btn",
        onClick: _cache[5] || (_cache[5] = (...args) => $options.submitRefund && $options.submitRefund(...args))
      }, "提交申请")
    ]);
  }
  const PagesOrderRefund = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/pages/order/refund.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/menu/menu", PagesMenuMenu);
  __definePage("pages/cart/cart", PagesCartCart);
  __definePage("pages/order/order", PagesOrderOrder);
  __definePage("pages/mine/mine", PagesMineMine);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/register/register", PagesRegisterRegister);
  __definePage("pages/user/avatar-view", PagesUserAvatarView);
  __definePage("pages/order/detail", PagesOrderDetail);
  __definePage("pages/order/confirm", PagesOrderConfirm);
  __definePage("pages/menu/search", PagesMenuSearch);
  __definePage("pages/user/settings", PagesUserSettings);
  __definePage("pages/user/change-password", PagesUserChangePassword);
  __definePage("pages/user/change-phone", PagesUserChangePhone);
  __definePage("pages/user/user-info", PagesUserUserInfo);
  __definePage("pages/user/member-center", PagesUserMemberCenter);
  __definePage("pages/order/refund", PagesOrderRefund);
  const _sfc_main = {
    onShow: function() {
      formatAppLog("log", "at App.vue:4", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:7", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/LXD/Desktop/奶茶点单系统/milktea-uniapp/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
