const api = require('../../utils/api')
const app = getApp()

const typeLabel = { city: '城市', attraction: '景点', guide: '攻略', trip: '行程' }

Page({
  data: { items: [], total: 0, loading: false, error: '', loggedIn: false, page: 0 },
  onShow() { this.load(true) },
  onReachBottom() { this.load(false) },
  async load(reset) {
    if (!app.globalData.appToken) { this.setData({ loggedIn: false, items: [] }); return }
    if (!reset && (this.data.loading || this.data.items.length >= this.data.total)) return
    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true, error: '', loggedIn: true, ...(reset ? { items: [], total: 0, page: 0 } : {}) })
    try {
      const r = await api.get('/app/voyaai/favorites', { pageNum: page, pageSize: 20 }, { auth: true })
      const items = r.rows.map(x => ({ ...x, cover: x.targetCoverImage ? api.imageUrl(x.targetCoverImage) : '', typeName: typeLabel[x.targetType] || x.targetType }))
      this.setData({ items: this.data.items.concat(items), total: r.total, page })
    } catch (e) { this.setData({ error: e.message || '加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  async remove(e) {
    const { type, id } = e.currentTarget.dataset
    const res = await new Promise(r => wx.showModal({ title: '取消收藏', content: '确认取消收藏？', success: r }))
    if (!res.confirm) return
    try { await api.del(`/app/voyaai/favorites/${type}/${id}`, { auth: true }); this.load(true) }
    catch (err) { wx.showToast({ title: err.message || '操作失败', icon: 'none' }) }
  },
  open(e) {
    const { type, id, name } = e.currentTarget.dataset
    if (type === 'city') return wx.navigateTo({ url: `/pages/attractions/attractions?cityId=${id}&cityName=${encodeURIComponent(name || '')}` })
    if (type === 'attraction') return wx.navigateTo({ url: `/pages/attraction-detail/attraction-detail?id=${id}` })
    if (type === 'guide') return wx.navigateTo({ url: `/pages/guide-detail/guide-detail?id=${id}` })
    if (type === 'trip') return wx.navigateTo({ url: `/pages/trip-detail/trip-detail?id=${id}` })
  },
  goLogin() { wx.switchTab({ url: '/pages/me/me' }) }
})
