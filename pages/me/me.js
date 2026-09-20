const api = require('../../utils/api')
Page({
  data: { loggedIn: false, loading: false, saving: false, user: null, nickname: '', error: '' },
  onShow() { this.loadProfile() },
  async loadProfile() {
    if (!getApp().globalData.appToken) { this.setData({ loggedIn: false, user: null }); return }
    try { const user = await api.get('/app/voyaai/me', {}, { auth: true }); this.setData({ loggedIn: true, user, nickname: user.nickname || '', error: '' }) }
    catch { api.saveToken(''); this.setData({ loggedIn: false, user: null, error: '登录已失效，请重新登录' }) }
  },
  login() {
    this.setData({ loading: true, error: '' })
    wx.login({ success: async ({ code }) => {
      try { const result = await api.post('/app/voyaai/auth/login', { code }); api.saveToken(result.token); this.setData({ loggedIn: true, user: result.user, nickname: result.user.nickname || '' }); wx.showToast({ title: '登录成功', icon: 'success' }) }
      catch (e) { this.setData({ error: e.message || '登录失败，请稍后重试' }) }
      finally { this.setData({ loading: false }) }
    }, fail: () => this.setData({ loading: false, error: '无法获取微信登录凭证，请重试' }) })
  },
  onNicknameInput(e) { this.setData({ nickname: e.detail.value }) },
  async chooseAvatar(e) {
    const filePath = e.detail.avatarUrl
    if (!filePath) return
    wx.showLoading({ title: '上传中' })
    try {
      const result = await api.upload('/app/voyaai/me/avatar', filePath)
      this.setData({ 'user.avatarUrl': result.avatarUrl })
      wx.showToast({ title: '头像已更新', icon: 'success' })
    } catch (error) { this.setData({ error: error.message || '头像上传失败' }) }
    finally { wx.hideLoading() }
  },
  async saveProfile() {
    const nickname = this.data.nickname.trim()
    if (!nickname) { this.setData({ error: '请输入昵称' }); return }
    this.setData({ saving: true, error: '' })
    try { const user = await api.put('/app/voyaai/me', { nickname, avatarUrl: this.data.user.avatarUrl || null }, { auth: true }); this.setData({ user, nickname: user.nickname }); wx.showToast({ title: '保存成功', icon: 'success' }) }
    catch (e) { this.setData({ error: e.message || '保存失败' }) }
    finally { this.setData({ saving: false }) }
  },
  logout() { api.saveToken(''); this.setData({ loggedIn: false, user: null, nickname: '', error: '' }); wx.showToast({ title: '已退出登录', icon: 'none' }) },
  imageUrl(path) { return api.imageUrl(path) }
})
