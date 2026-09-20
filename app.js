// app.js
App({
  onLaunch() {
    // 开发阶段使用本机后端；真机调试时请改为已备案的 HTTPS 域名。
    this.globalData.apiBaseUrl = 'http://localhost:8080'
  },
  globalData: {
    userInfo: null,
    apiBaseUrl: ''
  }
})
