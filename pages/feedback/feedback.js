const api = require('../../utils/api')
const app = getApp()

Page({
  data: { content: '', contact: '', submitting: false },
  onContent(e) { this.setData({ content: e.detail.value }) },
  onContact(e) { this.setData({ contact: e.detail.value }) },
  async submit() {
    const content = this.data.content.trim()
    if (!content) return wx.showToast({ title: '请输入反馈内容', icon: 'none' })
    this.setData({ submitting: true })
    const options = app.globalData.appToken ? { auth: true } : {}
    try {
      await api.post('/app/voyaai/feedback', { content, contact: this.data.contact.trim() || null, images: null }, options)
      wx.showToast({ title: '感谢你的反馈', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (e) { wx.showToast({ title: e.message || '提交失败', icon: 'none' }) }
    finally { this.setData({ submitting: false }) }
  }
})
