// 格式化日期时间
export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'
  
  try {
    // 支持ISO格式（带T的）和空格分隔的格式
    const normalizedDateStr = dateTimeStr.includes('T') 
      ? dateTimeStr 
      : dateTimeStr.replace(' ', 'T')
      
    const date = new Date(normalizedDateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateTimeStr
  }
} 