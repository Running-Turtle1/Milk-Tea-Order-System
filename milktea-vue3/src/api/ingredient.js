import request from '../utils/request'

/**
 * 获取所有配料列表
 * @returns {Promise}
 */
export function getIngredientList() {
  return request({
    url: '/admin/ingredient/list',
    method: 'get'
  })
}

/**
 * 创建配料
 * @param {Object} data 配料数据
 * @returns {Promise}
 */
export function createIngredient(data) {
  return request({
    url: '/admin/ingredient',
    method: 'post',
    data
  })
}

/**
 * 更新配料
 * @param {number|string} id 配料ID
 * @param {Object} data 配料数据
 * @returns {Promise}
 */
export function updateIngredient(id, data) {
  return request({
    url: `/admin/ingredient/${id}`,
    method: 'put',
    data: { 
      ...data,
      id: Number(id) // 确保ID是数字类型
    }
  })
}

/**
 * 更新配料状态
 * @param {number|string} id 配料ID
 * @param {number} status 状态值 0-禁用 1-启用
 * @returns {Promise}
 */
export function updateIngredientStatus(id, status) {
  return request({
    url: `/admin/ingredient/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 删除配料
 * @param {number|string} id 配料ID
 * @returns {Promise}
 */
export function deleteIngredient(id) {
  return request({
    url: `/admin/ingredient/${id}`,
    method: 'delete'
  })
} 