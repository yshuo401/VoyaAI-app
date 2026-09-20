const api = require('../../utils/api')
Page({
  data: { detail: null, gallery: [], loading: false, error: '' },
  onLoad(options) { this.id = options.id; this.loadDetail() },
  async loadDetail() { this.setData({ loading: true, error: '' }); try { const detail = await api.get(`/app/voyaai/attractions/${this.id}`); const gallery = [detail.coverImage, ...(detail.images || [])].filter(Boolean).map(item => api.imageUrl(item)); this.setData({ detail, gallery: gallery.length ? gallery : [''] }) } catch (e) { this.setData({ error: e.message || '景点详情加载失败' }) } finally { this.setData({ loading: false }) } },
  imageUrl(path) { return api.imageUrl(path) },
  favorite() { wx.showToast({ title: '登录后即可收藏', icon: 'none' }) },
  navigate() { const { latitude, longitude, name, address } = this.data.detail || {}; if (latitude == null || longitude == null) return wx.showToast({ title: '暂无坐标信息', icon: 'none' }); wx.openLocation({ latitude: Number(latitude), longitude: Number(longitude), name, address: address || name, scale: 16 }) },
  goBack() { wx.navigateBack() }
})
