import request from '@/utils/request'

/**
 * 获取店铺信息
 * @returns {Promise}
 */
export function getShopInfo() {
  return request({
    url: '/admin/shop/info',
    method: 'get'
  })
}

/**
 * 更新店铺信息
 * @param {Object} data 店铺信息数据
 * @returns {Promise}
 */
export function updateShopInfo(data) {
  return request({
    url: '/admin/shop/info',
    method: 'put',
    data
  })
}

// 上传店铺LOGO
export function uploadShopLogo(formData) {
  return request({
    url: '/admin/shop/upload/logo',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 