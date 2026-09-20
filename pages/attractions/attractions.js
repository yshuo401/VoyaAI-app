const api = require('../../utils/api')
Page({
  data: { cityId: '', cityName: '', keyword: '', items: [], loading: false, error: '' },
  onLoad(options) { this.setData({ cityId: options.cityId, cityName: decodeURIComponent(options.cityName || '城市') }); this.loadAttractions() },
  async loadAttractions() { this.setData({ loading: true, error: '' }); try { const items = await api.get(`/app/voyaai/cities/${this.data.cityId}/attractions`, { keyword: this.data.keyword.trim() }); this.setData({ items: items.map(item => ({ ...item, coverUrl: api.imageUrl(item.coverImage) })) }) } catch (e) { this.setData({ error: e.message || '景点加载失败' }) } finally { this.setData({ loading: false }) } },
  onKeywordInput(e) { this.setData({ keyword: e.detail.value }) },
  openDetail(e) { wx.navigateTo({ url: `/pages/attraction-detail/attraction-detail?id=${e.currentTarget.dataset.id}` }) },
  goBack() { wx.navigateBack() }
})
