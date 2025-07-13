import request from '../utils/request'

/**
 * 获取所有规格列表
 * @returns {Promise}
 */
export function getSpecificationList() {
  return request({
    url: '/admin/specification/list',
    method: 'get'
  })
}

/**
 * 创建规格
 * @param {Object} data 规格数据
 * @returns {Promise}
 */
export function createSpecification(data) {
  return request({
    url: '/admin/specification',
    method: 'post',
    data
  })
}

/**
 * 更新规格
 * @param {number|string} id 规格ID
 * @param {Object} data 规格数据
 * @returns {Promise}
 */
export function updateSpecification(id, data) {
  return request({
    url: `/admin/specification/${id}`,
    method: 'put',
    data: {
      ...data,
      id: Number(id)
    }
  })
}

/**
 * 更新规格状态
 * @param {number|string} id 规格ID
 * @param {number} status 状态值 0-禁用 1-启用
 * @returns {Promise}
 */
export function updateSpecificationStatus(id, status) {
  return request({
    url: `/admin/specification/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 删除规格
 * @param {number|string} id 规格ID
 * @returns {Promise}
 */
export function deleteSpecification(id) {
  return request({
    url: `/admin/specification/${id}`,
    method: 'delete'
  })
} 