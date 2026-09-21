const api = require('../../utils/api')
const app = getApp()

function mapTrip(item) {
  const date = item.startDate && item.endDate ? `${item.startDate} ~ ${item.endDate}` : (item.startDate || '未设置日期')
  return { ...item, image: item.coverImage ? api.imageUrl(item.coverImage) : '/assets/city-chengdu.jpg', date }
}

Page({
  data: { trips: [], loading: false, error: '', loggedIn: false, page: 0, total: 0 },
  onShow() { this.load(true) },
  onPullDownRefresh() { this.load(true).finally(() => wx.stopPullDownRefresh()) },
  onReachBottom() { this.load(false) },
  async load(reset) {
    if (!app.globalData.appToken) { this.setData({ loggedIn: false, trips: [], error: '' }); return }
    if (!reset && (this.data.loading || this.data.trips.length >= this.data.total)) return
    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true, error: '', loggedIn: true, ...(reset ? { trips: [], total: 0, page: 0 } : {}) })
    try {
      const r = await api.get('/app/voyaai/trips', { pageNum: page, pageSize: 20 }, { auth: true })
      this.setData({ trips: this.data.trips.concat(r.rows.map(mapTrip)), total: r.total, page })
    } catch (e) {
      if (e.code === 401) { api.saveToken(''); this.setData({ loggedIn: false }) }
      this.setData({ error: e.message || '行程加载失败' })
    } finally { this.setData({ loading: false }) }
  },
  goLogin() { wx.switchTab({ url: '/pages/me/me' }) },
  openDetail(e) { wx.navigateTo({ url: `/pages/trip-detail/trip-detail?id=${e.currentTarget.dataset.id}` }) },
  create() { if (!app.globalData.appToken) return wx.switchTab({ url: '/pages/me/me' }); wx.navigateTo({ url: '/pages/trip-form/trip-form' }) },
  edit(e) { wx.navigateTo({ url: `/pages/trip-form/trip-form?id=${e.currentTarget.dataset.id}` }) },
  startPlan() { wx.showToast({ title: 'AI 规划即将上线', icon: 'none' }) }
})
