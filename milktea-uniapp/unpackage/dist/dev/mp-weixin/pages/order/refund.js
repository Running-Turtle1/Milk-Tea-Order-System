"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
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
        common_vendor.index.showToast({
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
        common_vendor.index.showToast({
          title: "请输入有效的退款金额",
          icon: "none"
        });
        return;
      }
      if (this.reasonIndex === void 0) {
        common_vendor.index.showToast({
          title: "请选择退款原因",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认申请",
        content: "确定要提交退款申请吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
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
            common_vendor.index.__f__("log", "at pages/order/refund.vue:182", "退款请求数据:", refundData);
            common_vendor.index.__f__("log", "at pages/order/refund.vue:183", "订单支付金额:", this.orderAmount);
            utils_api.api.applyRefund(refundData).then((res2) => {
              common_vendor.index.__f__("log", "at pages/order/refund.vue:188", "退款申请响应:", res2.data);
              if (res2.data.code === 200) {
                common_vendor.index.showToast({
                  title: "申请已提交",
                  icon: "success"
                });
                setTimeout(() => {
                  common_vendor.index.navigateBack();
                }, 1500);
              } else {
                common_vendor.index.showToast({
                  title: res2.data.message || "申请失败",
                  icon: "none"
                });
              }
            }).catch((err) => {
              common_vendor.index.__f__("error", "at pages/order/refund.vue:207", "网络请求失败:", err);
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.orderNo),
    b: common_vendor.o([($event) => $data.refundAmount = $event.detail.value, (...args) => $options.checkAmount && $options.checkAmount(...args)]),
    c: $data.refundAmount,
    d: common_vendor.t($data.reasonOptions[$data.reasonIndex] || "请选择退款原因"),
    e: common_vendor.o((...args) => $options.onReasonChange && $options.onReasonChange(...args)),
    f: $data.reasonIndex,
    g: $data.reasonOptions,
    h: common_vendor.t($data.methods[$data.methodIndex].name || "请选择退款方式"),
    i: common_vendor.o((...args) => $options.onMethodChange && $options.onMethodChange(...args)),
    j: $data.methodIndex,
    k: $data.methods,
    l: $data.remark,
    m: common_vendor.o(($event) => $data.remark = $event.detail.value),
    n: common_vendor.t($data.remark.length),
    o: common_vendor.o((...args) => $options.submitRefund && $options.submitRefund(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/refund.js.map
