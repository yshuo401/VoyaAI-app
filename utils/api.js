const app = getApp()
function request(path, data = {}) {
  return new Promise((resolve, reject) => wx.request({
    url: `${app.globalData.apiBaseUrl}${path}`, data, method: 'GET', timeout: 10000,
    success(res) { const body = res.data || {}; if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 200) resolve(body.data); else reject(new Error(body.msg || `请求失败（${res.statusCode}）`)) },
    fail(error) { reject(new Error(error.errMsg || '网络连接失败')) }
  }))
}
function imageUrl(path) { if (!path || /^https?:\/\//.test(path)) return path; return `${app.globalData.apiBaseUrl}${path}` }
module.exports = { get: request, imageUrl }
