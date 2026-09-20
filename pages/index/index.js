// index.js
const api = require('../../utils/api')

Page({
  data: { cities: [], keyword: '', loading: false, error: '' },
  onShow() { this.loadCities() },
  async loadCities() {
    this.setData({ loading: true, error: '' })
    try { const cities = await api.get('/app/voyaai/cities', { keyword: this.data.keyword.trim() }); this.setData({ cities: cities.map(item => ({ ...item, coverUrl: api.imageUrl(item.coverImage) })) }) }
    catch (error) { this.setData({ error: error.message || '城市加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  onKeywordInput(e) { this.setData({ keyword: e.detail.value }) },
  search() { this.loadCities() },
  clearKeyword() { this.setData({ keyword: '' }); this.loadCities() },
  openCity(e) { const city = e.currentTarget.dataset.city; wx.navigateTo({ url: `/pages/attractions/attractions?cityId=${city.id}&cityName=${encodeURIComponent(city.name)}` }) },
})
