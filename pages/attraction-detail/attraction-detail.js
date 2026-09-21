const api = require('../../utils/api')
const app = getApp()

function requireLogin() {
  if (app.globalData.appToken) return true
  wx.showModal({ title: '需要登录', content: '登录后才能使用收藏、点赞和评论功能', confirmText: '去登录', success(res) { if (res.confirm) wx.switchTab({ url: '/pages/me/me' }) } })
  return false
}

Page({
  data: {
    detail: null, gallery: [], loading: false, error: '',
    favorited: false, liked: false, likeCount: 0,
    comments: [], commentTotal: 0, commentText: '', replyTo: null,
    commentLoading: false, submitting: false, busy: false
  },
  onLoad(options) { this.id = options.id; this.loadDetail(); this.loadComments(); this.recordView() },
  async loadDetail() {
    this.setData({ loading: true, error: '' })
    try {
      const detail = await api.get(`/app/voyaai/attractions/${this.id}`)
      const gallery = [detail.coverImage, ...(detail.images || [])].filter(Boolean).map(item => api.imageUrl(item))
      this.setData({ detail, gallery: gallery.length ? gallery : [''] })
      this.loadSocialState()
    } catch (e) { this.setData({ error: e.message || '景点详情加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  async loadSocialState() {
    if (!app.globalData.appToken) return
    try {
      const [fav, like] = await Promise.all([
        api.get(`/app/voyaai/favorites/attraction/${this.id}`, {}, { auth: true }).catch(() => ({ favorited: false })),
        api.get(`/app/voyaai/likes/attraction/${this.id}`, {}, { auth: true }).catch(() => ({ liked: false, likeCount: 0 }))
      ])
      this.setData({ favorited: !!fav.favorited, liked: !!like.liked, likeCount: like.likeCount || 0 })
    } catch (e) {}
  },
  async recordView() { try { await api.post('/app/voyaai/view-logs', { targetType: 'attraction', targetId: Number(this.id) }) } catch (e) {} },
  async toggleFavorite() {
    if (!requireLogin()) return
    this.setData({ busy: true })
    try {
      if (this.data.favorited) { await api.del(`/app/voyaai/favorites/attraction/${this.id}`, { auth: true }); this.setData({ favorited: false }); wx.showToast({ title: '已取消收藏', icon: 'none' }) }
      else { await api.post('/app/voyaai/favorites', { targetType: 'attraction', targetId: Number(this.id) }, { auth: true }); this.setData({ favorited: true }); wx.showToast({ title: '已收藏', icon: 'success' }) }
    } catch (e) { wx.showToast({ title: e.message || '操作失败', icon: 'none' }) }
    finally { this.setData({ busy: false }) }
  },
  async toggleLike() {
    if (!requireLogin()) return
    this.setData({ busy: true })
    try {
      if (this.data.liked) { const r = await api.del(`/app/voyaai/likes/attraction/${this.id}`, { auth: true }); this.setData({ liked: false, likeCount: r.likeCount || 0 }) }
      else { const r = await api.post('/app/voyaai/likes', { targetType: 'attraction', targetId: Number(this.id) }, { auth: true }); this.setData({ liked: true, likeCount: r.likeCount || 0 }) }
    } catch (e) { wx.showToast({ title: e.message || '操作失败', icon: 'none' }) }
    finally { this.setData({ busy: false }) }
  },
  async loadComments() {
    this.setData({ commentLoading: true })
    try {
      const r = await api.get('/app/voyaai/comments', { targetType: 'attraction', targetId: Number(this.id), pageNum: 1, pageSize: 50 })
      const mapAvatar = c => ({ ...c, avatar: c.avatarUrl ? api.imageUrl(c.avatarUrl) : '', replies: (c.replies || []).map(x => ({ ...x, avatar: x.avatarUrl ? api.imageUrl(x.avatarUrl) : '' })) })
      this.setData({ comments: (r.rows || []).map(mapAvatar), commentTotal: r.total || 0 })
    } catch (e) {}
    finally { this.setData({ commentLoading: false }) }
  },
  onCommentInput(e) { this.setData({ commentText: e.detail.value }) },
  replyTo(e) { if (!requireLogin()) return; const { id, name } = e.currentTarget.dataset; this.setData({ replyTo: { id, name } }) },
  cancelReply() { this.setData({ replyTo: null }) },
  async submitComment() {
    if (!requireLogin()) return
    const content = this.data.commentText.trim()
    if (!content) return wx.showToast({ title: '请输入评论内容', icon: 'none' })
    this.setData({ submitting: true })
    const replyTo = this.data.replyTo
    try {
      await api.post('/app/voyaai/comments', { targetType: 'attraction', targetId: Number(this.id), parentId: replyTo ? Number(replyTo.id) : 0, content }, { auth: true })
      this.setData({ commentText: '', replyTo: null })
      this.loadComments()
    } catch (e) { wx.showToast({ title: e.message || '评论失败', icon: 'none' }) }
    finally { this.setData({ submitting: false }) }
  },
  async deleteComment(e) {
    const id = e.currentTarget.dataset.id
    const res = await new Promise(resolve => wx.showModal({ title: '删除评论', content: '确认删除这条评论？', success: resolve }))
    if (!res.confirm) return
    try { await api.del(`/app/voyaai/comments/${id}`, { auth: true }); this.loadComments() }
    catch (err) { wx.showToast({ title: err.message || '删除失败', icon: 'none' }) }
  },
  async toggleCommentLike(e) {
    if (!requireLogin()) return
    const id = e.currentTarget.dataset.id
    try {
      const r = await api.post(`/app/voyaai/comments/${id}/like`, {}, { auth: true })
      this.setData({ comments: this.data.comments.map(c => c.id === id ? { ...c, liked: r.liked, likeCount: r.likeCount } : c) })
    } catch (err) { wx.showToast({ title: err.message || '操作失败', icon: 'none' }) }
  },
  imageUrl(path) { return api.imageUrl(path) },
  navigate() { const { latitude, longitude, name, address } = this.data.detail || {}; if (latitude == null || longitude == null) return wx.showToast({ title: '暂无坐标信息', icon: 'none' }); wx.openLocation({ latitude: Number(latitude), longitude: Number(longitude), name, address: address || name, scale: 16 }) },
  goBack() { wx.navigateBack() }
})
