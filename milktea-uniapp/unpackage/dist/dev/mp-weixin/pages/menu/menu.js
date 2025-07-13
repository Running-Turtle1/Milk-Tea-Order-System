"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
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
    this.popupAnimation = common_vendor.index.createAnimation({
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
      utils_api.api.getCategories().then((res) => {
        common_vendor.index.__f__("log", "at pages/menu/menu.vue:275", "获取商品分类响应:", res.data);
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
        common_vendor.index.__f__("error", "at pages/menu/menu.vue:299", "网络请求失败:", err);
        this.showToast("网络请求失败");
      });
    },
    // 加载推荐商品
    loadRecommendProducts() {
      utils_api.api.getRecommendProducts().then((res) => {
        common_vendor.index.__f__("log", "at pages/menu/menu.vue:308", "获取推荐商品响应:", res.data);
        if (res.data.code === 200) {
          this.recommendProducts = res.data.data;
        } else {
          this.showToast(res.data.message || "获取推荐商品失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/menu/menu.vue:316", "网络请求失败:", err);
        this.showToast("网络请求失败");
      });
    },
    // 加载配料列表
    loadIngredients() {
      utils_api.api.getIngredients().then((res) => {
        common_vendor.index.__f__("log", "at pages/menu/menu.vue:325", "获取配料列表响应:", res.data);
        if (res.data.code === 200) {
          this.ingredients = res.data.data;
        } else {
          this.showToast(res.data.message || "获取配料列表失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/menu/menu.vue:333", "网络请求失败:", err);
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
      utils_api.api.getCategoryProducts(categoryId, page, size).then((res) => {
        common_vendor.index.__f__("log", "at pages/menu/menu.vue:351", `获取分类${categoryId}商品响应:`, res.data);
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
        common_vendor.index.__f__("error", "at pages/menu/menu.vue:377", "网络请求失败:", err);
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
      utils_api.api.getProductDetail(productId).then((res) => {
        if (res.data.code === 200) {
          this.currentProduct = res.data.data;
          this.resetProductOptions();
          this.openDetailPopup();
        } else {
          this.showToast(res.data.message || "获取商品详情失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/menu/menu.vue:418", "网络请求失败:", err);
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
          utils_api.api.getProductDetail(product.id).then((res) => {
            common_vendor.index.__f__("log", "at pages/menu/menu.vue:450", "获取商品详情响应:", res.data);
            if (res.data.code === 200) {
              this.currentProduct = res.data.data;
              this.openDetailPopup();
            } else {
              this.showToast(res.data.message || "获取商品详情失败");
              this.showDetail = false;
            }
          }).catch((err) => {
            common_vendor.index.__f__("error", "at pages/menu/menu.vue:463", "网络请求失败:", err);
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
        common_vendor.index.__f__("log", "at pages/menu/menu.vue:554", "添加配料:", ingredientObj);
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
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showModal({
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
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:605", "商品是否允许温度选择:", this.currentProduct.allowTemperature);
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:606", "商品是否允许甜度选择:", this.currentProduct.allowSweetness);
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:607", "商品可能的其他控制字段:", Object.keys(this.currentProduct).filter((key) => key.startsWith("allow")));
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:610", "用户选择的温度:", this.selectedTemp);
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:611", "用户选择的甜度:", this.selectedSweet);
      const specKey = `${this.selectedTemp}-${this.selectedSweet}-${ingredientsData.map((i) => i.id).join(",")}`;
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:615", "规格组合标识:", specKey);
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
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:628", "当前选择的配料原始数据:", this.selectedIngredients);
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:629", "处理后的配料数据:", ingredientsData);
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:630", "发送到购物车的数据:", cartData);
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:631", "当前商品是否允许配料:", this.currentProduct.allowIngredients);
      common_vendor.index.__f__("log", "at pages/menu/menu.vue:632", "当前商品完整信息:", this.currentProduct);
      utils_api.api.request({
        url: "/cart",
        method: "POST",
        data: cartData
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/menu/menu.vue:639", "添加到购物车响应:", res.data);
        if (res.data.code === 200) {
          this.showToast("已添加到购物车", "success");
          this.hideProductDetail();
        } else if (res.data.code === 401) {
          this.handleTokenExpired();
        } else {
          this.showToast(res.data.message || "添加到购物车失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/menu/menu.vue:649", "网络请求失败:", err);
        this.showToast("网络请求失败");
      });
    },
    // 跳转到搜索页
    goToSearch() {
      common_vendor.index.navigateTo({
        url: "/pages/menu/search"
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goToSearch && $options.goToSearch(...args)),
    c: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category.name),
        b: category.id,
        c: common_vendor.n($data.currentCategoryIndex === index ? "active" : ""),
        d: common_vendor.o(($event) => $options.switchCategory(index), category.id)
      };
    }),
    d: $data.currentCategoryIndex === 0
  }, $data.currentCategoryIndex === 0 ? {
    e: common_vendor.f($data.recommendProducts, (product, k0, i0) => {
      return {
        a: product.image || "/static/images/default-product.svg",
        b: common_vendor.t(product.name),
        c: common_vendor.t(product.price.toFixed(2)),
        d: common_vendor.o(($event) => $options.showProductDetail(product), product.id),
        e: product.id,
        f: common_vendor.o(($event) => $options.showProductDetail(product), product.id)
      };
    }),
    f: common_assets._imports_2$1
  } : {}, {
    g: common_vendor.f($data.categories, (category, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(category.name),
        b: common_vendor.f($data.categoryProducts[category.id] || [], (product, k1, i1) => {
          return {
            a: product.image || "/static/images/default-product.svg",
            b: common_vendor.t(product.name),
            c: common_vendor.t(product.price.toFixed(2)),
            d: common_vendor.o(($event) => $options.showProductDetail(product), product.id),
            e: product.id,
            f: common_vendor.o(($event) => $options.showProductDetail(product), product.id)
          };
        }),
        c: $data.categoryLoadingStatus[category.id] === "loading"
      }, $data.categoryLoadingStatus[category.id] === "loading" ? {} : $data.categoryLoadingStatus[category.id] === "noMore" ? {} : {}, {
        d: $data.categoryLoadingStatus[category.id] === "noMore",
        e: category.id,
        f: "category-section-" + category.id,
        g: $data.currentCategoryIndex === 0 || $data.currentCategoryIndex === index
      });
    }),
    h: common_assets._imports_2$1,
    i: common_vendor.o((...args) => $options.loadMoreProducts && $options.loadMoreProducts(...args)),
    j: $data.scrollToId,
    k: common_vendor.o((...args) => $options.hideProductDetail && $options.hideProductDetail(...args)),
    l: common_vendor.s($data.maskStyle),
    m: common_assets._imports_1$1,
    n: common_vendor.o((...args) => $options.hideProductDetail && $options.hideProductDetail(...args)),
    o: $data.currentProduct.image || "/static/images/default-product.svg",
    p: common_vendor.t($data.currentProduct.name),
    q: common_vendor.t($data.currentProduct.price ? $data.currentProduct.price.toFixed(2) : "0.00"),
    r: $data.currentProduct.sales
  }, $data.currentProduct.sales ? {
    s: common_vendor.t($data.currentProduct.sales)
  } : {}, {
    t: common_assets._imports_4$1,
    v: common_vendor.f($data.temperatures, (temp, index, i0) => {
      return {
        a: common_vendor.t(temp),
        b: index,
        c: common_vendor.n($data.selectedTemp === temp ? "selected" : ""),
        d: common_vendor.o(($event) => $data.selectedTemp = temp, index)
      };
    }),
    w: common_assets._imports_5$1,
    x: common_vendor.f($data.sweetness, (sweet, index, i0) => {
      return {
        a: common_vendor.t(sweet),
        b: index,
        c: common_vendor.n($data.selectedSweet === sweet ? "selected" : ""),
        d: common_vendor.o(($event) => $data.selectedSweet = sweet, index)
      };
    }),
    y: $data.ingredients.length > 0
  }, $data.ingredients.length > 0 ? {
    z: common_assets._imports_6,
    A: common_vendor.f($data.ingredients, (ing, k0, i0) => {
      return {
        a: common_vendor.t(ing.name),
        b: common_vendor.t(ing.price.toFixed(2)),
        c: ing.id,
        d: common_vendor.n($data.selectedIngredients.findIndex((i) => i.id === ing.id) > -1 ? "selected" : ""),
        e: common_vendor.o(($event) => $options.toggleIngredient(ing), ing.id)
      };
    })
  } : {}, {
    B: common_assets._imports_7,
    C: common_vendor.o(($event) => $options.adjustQuantity(-1)),
    D: $data.quantity,
    E: common_vendor.o(($event) => $data.quantity = $event.detail.value),
    F: common_vendor.o(($event) => $options.adjustQuantity(1)),
    G: common_vendor.t($options.getTotalPrice().toFixed(2)),
    H: common_vendor.o((...args) => $options.addToCart && $options.addToCart(...args)),
    I: common_vendor.s($data.contentStyle),
    J: common_vendor.s($data.popupStyle),
    K: $data.showDetail
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-388b40d3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/menu/menu.js.map
