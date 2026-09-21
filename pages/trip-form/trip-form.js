const api = require('../../utils/api')
const app = getApp()

Page({
  data: {
    id: null, cities: [], cityIndex: -1,
    title: '', startDate: '', endDate: '', peopleCount: '2', budget: '', travelType: '自由行', description: '',
    saving: false
  },
  onLoad(options) {
    if (!app.globalData.appToken) return wx.switchTab({ url: '/pages/me/me' })
    if (options.id) { this.setData({ id: options.id }); this.loadTrip(options.id) }
    this.loadCities()
  },
  async loadCities() {
    try {
      const cities = await api.get('/app/voyaai/cities', { pageSize: 9999 })
      const patch = { cities }
      if (this.cityId != null) patch.cityIndex = cities.findIndex(c => c.id === this.cityId)
      this.setData(patch)
    }
    catch (e) {}
  },
  async loadTrip(id) {
    try {
      const d = await api.get(`/app/voyaai/trips/${id}`, {}, { auth: true })
      this.cityId = d.cityId
      this.setData({
        title: d.title || '', startDate: d.startDate || '', endDate: d.endDate || '',
        peopleCount: String(d.peopleCount || 1), budget: d.budget != null ? String(d.budget) : '',
        travelType: d.travelType || '', description: d.description || '',
        cityIndex: this.data.cities.findIndex(c => c.id === d.cityId)
      })
    } catch (e) { wx.showToast({ title: e.message || '行程加载失败', icon: 'none' }) }
  },
  onTitle(e) { this.setData({ title: e.detail.value }) },
  onTravelType(e) { this.setData({ travelType: e.detail.value }) },
  onPeople(e) { this.setData({ peopleCount: e.detail.value }) },
  onBudget(e) { this.setData({ budget: e.detail.value }) },
  onDescription(e) { this.setData({ description: e.detail.value }) },
  onCity(e) { this.setData({ cityIndex: Number(e.detail.value) }) },
  onStart(e) { this.setData({ startDate: e.detail.value }) },
  onEnd(e) { this.setData({ endDate: e.detail.value }) },
  async save() {
    const { id, cityIndex, cities, title, startDate, endDate, peopleCount, budget, travelType, description } = this.data
    if (!title.trim()) return wx.showToast({ title: '请输入行程标题', icon: 'none' })
    if (cityIndex < 0) return wx.showToast({ title: '请选择目的地城市', icon: 'none' })
    if (startDate && endDate && endDate < startDate) return wx.showToast({ title: '结束日期不能早于开始日期', icon: 'none' })
    this.setData({ saving: true })
    const payload = {
      cityId: cities[cityIndex].id, title: title.trim(), coverImage: null,
      startDate: startDate || null, endDate: endDate || null,
      peopleCount: Number(peopleCount) || 1, budget: budget === '' ? 0 : Number(budget),
      travelType: travelType.trim() || null, description: description.trim() || null, source: 'USER'
    }
    try {
      if (id) await api.put(`/app/voyaai/trips/${id}`, payload, { auth: true })
      else await api.post('/app/voyaai/trips', payload, { auth: true })
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (e) { wx.showToast({ title: e.message || '保存失败', icon: 'none' }) }
    finally { this.setData({ saving: false }) }
  }
})
