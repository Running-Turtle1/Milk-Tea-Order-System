"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
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
      utils_api.api.getIngredients().then((res) => {
        common_vendor.index.__f__("log", "at pages/menu/search.vue:262", "获取配料列表响应:", res.data);
        if (res.data.code === 200) {
          this.ingredients = res.data.data;
        } else {
          this.showToast(res.data.message || "获取配料列表失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/menu/search.vue:270", "网络请求失败:", err);
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
      utils_api.api.request({
        url: "/product/search",
        method: "GET",
        data: {
          keyword: this.keyword,
          page: this.page,
          size: this.size
        }
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/menu/search.vue:326", "搜索产品响应:", res.data);
        if (res.data.code === 200) {
          this.searchResults = res.data.data.content || [];
          this.hasMore = this.searchResults.length >= this.size;
        } else {
          this.searchResults = [];
          this.showToast(res.data.message || "搜索失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/menu/search.vue:337", "网络请求失败:", err);
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
      utils_api.api.request({
        url: "/product/search",
        method: "GET",
        data: {
          keyword: this.keyword,
          page: this.page,
          size: this.size
        }
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/menu/search.vue:383", "加载更多搜索结果:", res.data);
        if (res.data.code === 200) {
          const newResults = res.data.data.content || [];
          this.searchResults = [...this.searchResults, ...newResults];
          this.hasMore = newResults.length >= this.size;
        } else {
          this.showToast(res.data.message || "加载更多失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/menu/search.vue:395", "网络请求失败:", err);
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
      const history = common_vendor.index.getStorageSync("searchHistory");
      if (history) {
        this.searchHistory = JSON.parse(history);
      }
    },
    // 保存搜索历史
    saveSearchHistory() {
      common_vendor.index.setStorageSync("searchHistory", JSON.stringify(this.searchHistory));
    },
    // 清空搜索历史
    clearHistory() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要清空搜索历史吗？",
        success: (res) => {
          if (res.confirm) {
            this.searchHistory = [];
            common_vendor.index.removeStorageSync("searchHistory");
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
          utils_api.api.request({
            url: `/product/detail/${product.id}`,
            method: "GET"
          }).then((res) => {
            common_vendor.index.__f__("log", "at pages/menu/search.vue:477", "获取商品详情响应:", res.data);
            if (res.data.code === 200) {
              this.currentProduct = res.data.data;
              this.openDetailPopup();
            } else {
              this.showToast(res.data.message || "获取商品详情失败");
              this.showDetail = false;
            }
          }).catch((err) => {
            common_vendor.index.__f__("error", "at pages/menu/search.vue:487", "网络请求失败:", err);
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
        common_vendor.index.__f__("log", "at pages/menu/search.vue:578", "添加配料:", ingredientObj);
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
      utils_api.api.request({
        url: "/cart",
        method: "POST",
        data: cartData
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/menu/search.vue:645", "添加到购物车响应:", res.data);
        if (res.data.code === 200) {
          this.showToast("已添加到购物车", "success");
          this.hideProductDetail();
        } else if (res.data.code === 401) {
          this.handleTokenExpired();
        } else {
          this.showToast(res.data.message || "添加到购物车失败");
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/menu/search.vue:656", "网络请求失败:", err);
        this.showToast("网络请求失败");
      });
    },
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
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
    b: common_vendor.o([($event) => $data.keyword = $event.detail.value, (...args) => $options.onKeywordInput && $options.onKeywordInput(...args)]),
    c: $data.keyword,
    d: $data.keyword
  }, $data.keyword ? {
    e: common_assets._imports_1$1,
    f: common_vendor.o((...args) => $options.clearKeyword && $options.clearKeyword(...args))
  } : {}, {
    g: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    h: !$data.keyword && $data.searchHistory.length > 0 && !$data.searching
  }, !$data.keyword && $data.searchHistory.length > 0 && !$data.searching ? {
    i: common_vendor.o((...args) => $options.clearHistory && $options.clearHistory(...args)),
    j: common_vendor.f($data.searchHistory, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index,
        c: common_vendor.o(($event) => $options.useHistoryKeyword(item), index)
      };
    })
  } : {}, {
    k: $data.loading
  }, $data.loading ? {} : {}, {
    l: !$data.loading && $data.searchResults.length > 0
  }, !$data.loading && $data.searchResults.length > 0 ? common_vendor.e({
    m: common_vendor.f($data.searchResults, (product, k0, i0) => {
      return common_vendor.e({
        a: product.image || "/static/default-product.png",
        b: common_vendor.t(product.name),
        c: product.description
      }, product.description ? {
        d: common_vendor.t(product.description)
      } : {}, {
        e: common_vendor.t(product.price.toFixed(2)),
        f: common_vendor.o(($event) => $options.showProductDetail(product), product.id),
        g: product.id,
        h: common_vendor.o(($event) => $options.showProductDetail(product), product.id)
      });
    }),
    n: common_assets._imports_2$1,
    o: $data.hasMore && !$data.loadingMore
  }, $data.hasMore && !$data.loadingMore ? {} : !$data.hasMore ? {} : {}, {
    p: !$data.hasMore,
    q: $data.loadingMore
  }, $data.loadingMore ? {} : {}, {
    r: common_vendor.o((...args) => $options.loadMoreResults && $options.loadMoreResults(...args))
  }) : {}, {
    s: $data.hasSearched && $data.searchResults.length === 0
  }, $data.hasSearched && $data.searchResults.length === 0 ? {
    t: common_assets._imports_3$2
  } : {}, {
    v: common_vendor.o((...args) => $options.hideProductDetail && $options.hideProductDetail(...args)),
    w: common_vendor.s($data.maskStyle),
    x: common_assets._imports_1$1,
    y: common_vendor.o((...args) => $options.hideProductDetail && $options.hideProductDetail(...args)),
    z: $data.currentProduct.image || "/static/images/default-product.svg",
    A: common_vendor.t($data.currentProduct.name),
    B: common_vendor.t($data.currentProduct.price ? $data.currentProduct.price.toFixed(2) : "0.00"),
    C: $data.currentProduct.sales
  }, $data.currentProduct.sales ? {
    D: common_vendor.t($data.currentProduct.sales)
  } : {}, {
    E: common_assets._imports_4$1,
    F: common_vendor.f($data.temperatures, (temp, index, i0) => {
      return {
        a: common_vendor.t(temp),
        b: index,
        c: common_vendor.n($data.selectedTemp === temp ? "selected" : ""),
        d: common_vendor.o(($event) => $data.selectedTemp = temp, index)
      };
    }),
    G: common_assets._imports_5$1,
    H: common_vendor.f($data.sweetness, (sweet, index, i0) => {
      return {
        a: common_vendor.t(sweet),
        b: index,
        c: common_vendor.n($data.selectedSweet === sweet ? "selected" : ""),
        d: common_vendor.o(($event) => $data.selectedSweet = sweet, index)
      };
    }),
    I: $data.ingredients.length > 0
  }, $data.ingredients.length > 0 ? {
    J: common_assets._imports_6,
    K: common_vendor.f($data.ingredients, (ing, k0, i0) => {
      return {
        a: common_vendor.t(ing.name),
        b: common_vendor.t(ing.price.toFixed(2)),
        c: ing.id,
        d: common_vendor.n($data.selectedIngredients.findIndex((i) => i.id === ing.id) > -1 ? "selected" : ""),
        e: common_vendor.o(($event) => $options.toggleIngredient(ing), ing.id)
      };
    })
  } : {}, {
    L: common_assets._imports_7,
    M: common_vendor.o(($event) => $options.adjustQuantity(-1)),
    N: $data.quantity,
    O: common_vendor.o(($event) => $data.quantity = $event.detail.value),
    P: common_vendor.o(($event) => $options.adjustQuantity(1)),
    Q: common_vendor.t($options.getTotalPrice().toFixed(2)),
    R: common_vendor.o((...args) => $options.addToCart && $options.addToCart(...args)),
    S: common_vendor.s($data.contentStyle),
    T: common_vendor.s($data.popupStyle),
    U: $data.showDetail
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6a63d33a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/menu/search.js.map
