import request from '../utils/request'

/**
 * 获取所有会员等级
 * @returns {Promise}
 */
export function getMemberLevelList() {
  return request({
    url: '/admin/member-levels',
    method: 'get'
  })
}

/**
 * 获取会员等级详情
 * @param {number|string} id 会员等级ID
 * @returns {Promise}
 */
export function getMemberLevelDetail(id) {
  return request({
    url: `/admin/member-levels/${id}`,
    method: 'get'
  })
}

/**
 * 创建会员等级
 * @param {Object} data 会员等级数据
 * @returns {Promise}
 */
export function createMemberLevel(data) {
  return request({
    url: '/admin/member-levels',
    method: 'post',
    data
  })
}

/**
 * 更新会员等级
 * @param {number|string} id 会员等级ID
 * @param {Object} data 会员等级数据
 * @returns {Promise}
 */
export function updateMemberLevel(id, data) {
  return request({
    url: `/admin/member-levels/${id}`,
    method: 'put',
    data: {
      ...data,
      id: Number(id)
    }
  })
}

/**
 * 删除会员等级
 * @param {number|string} id 会员等级ID
 * @returns {Promise}
 */
export function deleteMemberLevel(id) {
  return request({
    url: `/admin/member-levels/${id}`,
    method: 'delete'
  })
} 