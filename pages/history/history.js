const api = require('../../utils/api')
const app = getApp()

const typeLabel = { city: '城市', attraction: '景点', guide: '攻略', trip: '行程' }

Page({
  data: { items: [], loading: false, error: '', loggedIn: false },
  onShow() { this.load() },
  async load() {
    if (!app.globalData.appToken) { this.setData({ loggedIn: false, items: [] }); return }
    this.setData({ loading: true, error: '', loggedIn: true })
    try {
      const list = await api.get('/app/voyaai/me/view-history', {}, { auth: true })
      this.setData({ items: (list || []).map(x => ({ ...x, cover: x.targetCoverImage ? api.imageUrl(x.targetCoverImage) : '', typeName: typeLabel[x.targetType] || x.targetType })) })
    } catch (e) { this.setData({ error: e.message || '加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  async clear() {
    const res = await new Promise(r => wx.showModal({ title: '清空历史', content: '确认清空全部浏览历史？', success: r }))
    if (!res.confirm) return
    try { await api.del('/app/voyaai/me/view-history', { auth: true }); this.setData({ items: [] }); wx.showToast({ title: '已清空', icon: 'success' }) }
    catch (e) { wx.showToast({ title: e.message || '操作失败', icon: 'none' }) }
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
