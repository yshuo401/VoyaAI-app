const app = getApp()
function request(path, options = {}) {
  const { method = 'GET', data = {}, auth = false } = options
  return new Promise((resolve, reject) => wx.request({
    url: `${app.globalData.apiBaseUrl}${path}`, data, method, timeout: 10000,
    header: auth && app.globalData.appToken ? { Authorization: `Bearer ${app.globalData.appToken}` } : {},
    success(res) {
      const body = res.data || {}
      if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 200) resolve(body.data)
      else { const error = new Error(body.msg || `请求失败（${res.statusCode}）`); error.statusCode = res.statusCode; error.code = body.code; if (res.statusCode === 401 || body.code === 401) app.globalData.appToken = ''; reject(error) }
    },
    fail(error) { reject(new Error(error.errMsg || '网络连接失败')) }
  }))
}
function get(path, data, options = {}) { return request(path, { ...options, data, method: 'GET' }) }
function post(path, data, options = {}) { return request(path, { ...options, data, method: 'POST' }) }
function put(path, data, options = {}) { return request(path, { ...options, data, method: 'PUT' }) }
function imageUrl(path) { if (!path || /^https?:\/\//.test(path)) return path; return `${app.globalData.apiBaseUrl}${path}` }
function saveToken(token) { app.globalData.appToken = token || ''; if (token) wx.setStorageSync('voyaai_app_token', token); else wx.removeStorageSync('voyaai_app_token') }
function upload(path, filePath) {
  return new Promise((resolve, reject) => wx.uploadFile({
    url: `${app.globalData.apiBaseUrl}${path}`, filePath, name: 'file',
    header: app.globalData.appToken ? { Authorization: `Bearer ${app.globalData.appToken}` } : {},
    success(res) { try { const body = JSON.parse(res.data || '{}'); if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 200) resolve(body.data); else reject(new Error(body.msg || '图片上传失败')) } catch { reject(new Error('图片上传响应格式不正确')) } },
    fail(error) { reject(new Error(error.errMsg || '图片上传失败')) }
  }))
}
module.exports = { get, post, put, upload, imageUrl, saveToken }
