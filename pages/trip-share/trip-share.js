const api = require('../../utils/api')

Page({
  data: { detail: null, loading: false, error: '' },
  onLoad(options) { this.code = options.code; this.load() },
  async load() {
    this.setData({ loading: true, error: '' })
    try { this.setData({ detail: await api.get(`/app/voyaai/trip-shares/${this.code}`) }) }
    catch (e) { this.setData({ error: e.statusCode === 404 || e.code === 404 ? '分享不存在、已失效或已过期' : e.message || '加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  itemTypeLabel(v) { const m = { '1': '景点', '2': '餐饮', '3': '酒店', '4': '交通', '5': '购物', '6': '其他' }; return m[v] || v }
})
