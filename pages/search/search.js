const api = require('../../utils/api')
const app = getApp()
const images = { 北京: '/assets/city-beijing.jpg', 成都: '/assets/city-chengdu.jpg', 重庆: '/assets/city-chongqing.jpg', 杭州: '/assets/city-hangzhou.jpg', 西安: '/assets/city-xian.jpg' }
Page({
  data: { keyword: '', history: [], hotWords: ['成都周边游攻略', '北京景点推荐', '云南自由行', '上海周边游', '重庆美食'], results: [] },
  onShow() { this.loadHistory() },
  async loadHistory() {
    if (!app.globalData.appToken) { this.setData({ history: [] }); return }
    try { this.setData({ history: await api.get('/app/voyaai/me/search-history', {}, { auth: true }) }) }
    catch (e) { this.setData({ history: [] }) }
  },
  async search() {
    const keyword = this.data.keyword.trim()
    try { const cities = await api.get('/app/voyaai/cities', { keyword }); this.setData({ results: cities.map(x => ({ ...x, coverUrl: x.coverImage ? api.imageUrl(x.coverImage) : images[x.name] || images.成都 })) }) }
    catch (e) { wx.showToast({ title: e.message || '搜索失败', icon: 'none' }) }
    if (keyword && app.globalData.appToken) { try { await api.post('/app/voyaai/me/search-history', { keyword }, { auth: true }); this.loadHistory() } catch (e) {} }
  },
  onInput(e) { this.setData({ keyword: e.detail.value }) },
  useKeyword(e) { this.setData({ keyword: e.currentTarget.dataset.key }); this.search() },
  clear() { this.setData({ keyword: '' }); this.search() },
  async clearHistory() {
    try { await api.del('/app/voyaai/me/search-history', { auth: true }); this.setData({ history: [] }) }
    catch (e) { wx.showToast({ title: e.message || '操作失败', icon: 'none' }) }
  },
  async removeKeyword(e) {
    const id = e.currentTarget.dataset.id
    try { await api.del(`/app/voyaai/me/search-history/${id}`, { auth: true }); this.loadHistory() }
    catch (err) { wx.showToast({ title: err.message || '操作失败', icon: 'none' }) }
  },
  openCity(e) { const x = e.currentTarget.dataset.city; wx.navigateTo({ url: `/pages/attractions/attractions?cityId=${x.id}&cityName=${encodeURIComponent(x.name)}` }) },
  goBack() { wx.navigateBack() }
})
