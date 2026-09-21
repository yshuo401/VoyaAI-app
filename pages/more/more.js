Page({
  data: { items: [{ icon: '◔', title: '联系客服', key: 'service' }, { icon: '?', title: '帮助中心', key: 'help' }, { icon: '✎', title: '意见反馈', key: 'feedback' }, { icon: 'ⓘ', title: '关于我们', key: 'about' }] },
  back() { wx.navigateBack() },
  tap(e) {
    const item = e.currentTarget.dataset.item
    if (item && item.key === 'feedback') return wx.navigateTo({ url: '/pages/feedback/feedback' })
    wx.showToast({ title: item ? item.title + '即将上线' : '功能即将上线', icon: 'none' })
  }
})
