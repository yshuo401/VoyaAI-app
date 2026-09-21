const api = require('../../utils/api')

const itemTypes = [
  { value: '1', label: '景点' }, { value: '2', label: '餐饮' }, { value: '3', label: '酒店' },
  { value: '4', label: '交通' }, { value: '5', label: '购物' }, { value: '6', label: '其他' }
]

Page({
  data: {
    detail: null, loading: false, error: '', share: null,
    dayEditor: null, itemEditor: null, itemTypes, itemTypeIndex: 0
  },
  onLoad(options) { this.id = options.id; this.load() },
  async load() {
    this.setData({ loading: true, error: '' })
    try { this.setData({ detail: await api.get(`/app/voyaai/trips/${this.id}`, {}, { auth: true }) }) }
    catch (e) { this.setData({ error: e.message || '行程加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  editTrip() { wx.navigateTo({ url: `/pages/trip-form/trip-form?id=${this.id}` }) },
  async deleteTrip() {
    const res = await new Promise(r => wx.showModal({ title: '删除行程', content: '删除后无法恢复，确认删除？', success: r }))
    if (!res.confirm) return
    try { await api.del(`/app/voyaai/trips/${this.id}`, { auth: true }); wx.showToast({ title: '已删除', icon: 'success' }); setTimeout(() => wx.navigateBack(), 500) }
    catch (e) { wx.showToast({ title: e.message || '删除失败', icon: 'none' }) }
  },
  openAddDay() {
    const days = this.data.detail.days || []
    this.setData({ dayEditor: { dayNumber: days.length + 1, date: '', title: '', description: '' } })
  },
  openEditDay(e) { const d = e.currentTarget.dataset.day; this.setData({ dayEditor: { id: d.id, dayNumber: d.dayNumber, date: d.date || '', title: d.title || '', description: d.description || '' } }) },
  closeDayEditor() { this.setData({ dayEditor: null }) },
  onDay(e) { const k = e.currentTarget.dataset.key; this.setData({ [`dayEditor.${k}`]: e.detail.value }) },
  async saveDay() {
    const f = this.data.dayEditor
    if (!f.dayNumber || f.dayNumber < 1) return wx.showToast({ title: '天数从 1 开始', icon: 'none' })
    try {
      if (f.id) await api.put(`/app/voyaai/trips/${this.id}/days/${f.id}`, { dayNumber: Number(f.dayNumber), date: f.date || null, title: f.title || null, description: f.description || null }, { auth: true })
      else await api.post(`/app/voyaai/trips/${this.id}/days`, { dayNumber: Number(f.dayNumber), date: f.date || null, title: f.title || null, description: f.description || null }, { auth: true })
      this.setData({ dayEditor: null }); this.load()
    } catch (e) { wx.showToast({ title: e.message || '保存失败', icon: 'none' }) }
  },
  async deleteDay(e) {
    const d = e.currentTarget.dataset.day
    const res = await new Promise(r => wx.showModal({ title: '删除该天', content: '该天下的行程项也会被删除，确认？', success: r }))
    if (!res.confirm) return
    try { await api.del(`/app/voyaai/trips/${this.id}/days/${d.id}`, { auth: true }); this.load() }
    catch (err) { wx.showToast({ title: err.message || '删除失败', icon: 'none' }) }
  },
  openAddItem(e) { const dayId = e.currentTarget.dataset.dayId; this.setData({ itemEditor: { dayId, itemType: '1', title: '', startTime: '', endTime: '', address: '', description: '', estimatedCost: '', sort: 0 }, itemTypeIndex: 0 }) },
  openEditItem(e) {
    const it = e.currentTarget.dataset.item
    this.setData({
      itemEditor: { id: it.id, dayId: it.dayId, itemType: it.itemType, title: it.title, startTime: it.startTime || '', endTime: it.endTime || '', address: it.address || '', description: it.description || '', estimatedCost: it.estimatedCost != null ? String(it.estimatedCost) : '', sort: it.sort || 0 },
      itemTypeIndex: Math.max(0, itemTypes.findIndex(t => t.value === it.itemType))
    })
  },
  closeItemEditor() { this.setData({ itemEditor: null }) },
  onItem(e) { const k = e.currentTarget.dataset.key; this.setData({ [`itemEditor.${k}`]: e.detail.value }) },
  onItemType(e) { const idx = Number(e.detail.value); this.setData({ itemTypeIndex: idx, 'itemEditor.itemType': itemTypes[idx].value }) },
  async saveItem() {
    const f = this.data.itemEditor
    if (!f.title.trim()) return wx.showToast({ title: '请输入项目名称', icon: 'none' })
    const payload = { attractionId: null, itemType: f.itemType, title: f.title.trim(), startTime: f.startTime || null, endTime: f.endTime || null, address: f.address || null, description: f.description || null, estimatedCost: f.estimatedCost === '' ? 0 : Number(f.estimatedCost), sort: Number(f.sort) || 0 }
    try {
      if (f.id) await api.put(`/app/voyaai/trips/${this.id}/days/${f.dayId}/items/${f.id}`, payload, { auth: true })
      else await api.post(`/app/voyaai/trips/${this.id}/days/${f.dayId}/items`, payload, { auth: true })
      this.setData({ itemEditor: null }); this.load()
    } catch (e) { wx.showToast({ title: e.message || '保存失败', icon: 'none' }) }
  },
  async deleteItem(e) {
    const it = e.currentTarget.dataset.item
    const res = await new Promise(r => wx.showModal({ title: '删除行程项', content: '确认删除？', success: r }))
    if (!res.confirm) return
    try { await api.del(`/app/voyaai/trips/${this.id}/days/${it.dayId}/items/${it.id}`, { auth: true }); this.load() }
    catch (err) { wx.showToast({ title: err.message || '删除失败', icon: 'none' }) }
  },
  async share() {
    try { const r = await api.post(`/app/voyaai/trips/${this.id}/share`, {}, { auth: true }); this.setData({ share: r }); wx.setClipboardData({ data: r.url, success: () => wx.showToast({ title: '分享链接已复制', icon: 'success' }) }) }
    catch (e) { wx.showToast({ title: e.message || '分享失败', icon: 'none' }) }
  },
  itemTypeLabel(v) { const t = itemTypes.find(x => x.value === v); return t ? t.label : v },
  back() { wx.navigateBack() }
})
