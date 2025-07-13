import request from '../utils/request'

/**
 * 获取所有积分规则
 * @returns {Promise}
 */
export function getPointRuleList() {
  return request({
    url: '/admin/point-rules',
    method: 'get'
  })
}

/**
 * 按类型获取积分规则
 * @param {number|string} type 规则类型 (1:消费获取积分, 2:每日签到积分, 3:首次注册积分)
 * @returns {Promise}
 */
export function getPointRulesByType(type) {
  return request({
    url: '/admin/point-rules/by-type',
    method: 'get',
    params: { type }
  })
}

/**
 * 获取积分规则详情
 * @param {number|string} id 积分规则ID
 * @returns {Promise}
 */
export function getPointRuleDetail(id) {
  return request({
    url: `/admin/point-rules/${id}`,
    method: 'get'
  })
}

/**
 * 创建积分规则
 * @param {Object} data 积分规则数据
 * @returns {Promise}
 */
export function createPointRule(data) {
  return request({
    url: '/admin/point-rules',
    method: 'post',
    data
  })
}

/**
 * 更新积分规则
 * @param {number|string} id 积分规则ID
 * @param {Object} data 积分规则数据
 * @returns {Promise}
 */
export function updatePointRule(id, data) {
  return request({
    url: `/admin/point-rules/${id}`,
    method: 'put',
    data: {
      ...data,
      id: Number(id)
    }
  })
}

/**
 * 更新积分规则状态
 * @param {number|string} id 积分规则ID
 * @param {number} status 状态值(0禁用,1启用)
 * @returns {Promise}
 */
export function updatePointRuleStatus(id, status) {
  return request({
    url: `/admin/point-rules/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 删除积分规则
 * @param {number|string} id 积分规则ID
 * @returns {Promise}
 */
export function deletePointRule(id) {
  return request({
    url: `/admin/point-rules/${id}`,
    method: 'delete'
  })
} 