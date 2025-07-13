"use strict";
const common_vendor = require("../common/vendor.js");
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
  const token = common_vendor.index.getStorageSync("token");
  if (token) {
    try {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const expTime = tokenPayload.exp * 1e3;
      const currentTime = (/* @__PURE__ */ new Date()).getTime();
      if (currentTime >= expTime - 3e5) {
        common_vendor.index.__f__("log", "at utils/api.js:72", "Token已过期或即将过期，跳转到登录页面");
        common_vendor.index.removeStorageSync("token");
        common_vendor.index.showToast({
          title: "登录已过期，请重新登录",
          icon: "none",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
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
      common_vendor.index.__f__("error", "at utils/api.js:101", "Token解析错误:", e);
      if (e.message !== "Token expired") {
        common_vendor.index.removeStorageSync("token");
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
    common_vendor.index.request({
      ...mergedOptions,
      success: (res) => {
        if (typeof res.data === "string" && res.data.includes("<!DOCTYPE html>")) {
          common_vendor.index.__f__("error", "at utils/api.js:125", "收到HTML响应而非JSON数据，可能是认证问题");
          common_vendor.index.removeStorageSync("token");
          const authErrorResponse = {
            ...res,
            statusCode: 401,
            data: {
              code: 401,
              message: "请先登录或登录已过期"
            }
          };
          common_vendor.index.showToast({
            title: "请先登录或登录已过期",
            icon: "none",
            duration: 2e3
          });
          setTimeout(() => {
            common_vendor.index.navigateTo({
              url: "/pages/login/login"
            });
          }, 1500);
          resolve(authErrorResponse);
          return;
        }
        if (res.statusCode === 401 || res.data && res.data.code === 401) {
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
        common_vendor.index.__f__("error", "at utils/api.js:184", "请求失败:", err);
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
      const token = common_vendor.index.getStorageSync("token");
      common_vendor.index.uploadFile({
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
    common_vendor.index.__f__("log", "at utils/api.js:361", "API开始调用支付接口，支付方式:", paymentMethod, "订单号:", orderNo);
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
exports.api = api$1;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
