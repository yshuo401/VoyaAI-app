const api = require('../../utils/api')
const { guideView } = require('../../utils/guide')
const cityImages = { 北京: '/assets/city-beijing.jpg', 成都: '/assets/city-chengdu.jpg', 重庆: '/assets/city-chongqing.jpg', 杭州: '/assets/city-hangzhou.jpg', 西安: '/assets/city-xian.jpg' }
Page({
  data: {
    currentCity: '成都', weather: '22℃', cities: [], guides: [], loading: false, error: '', guideLoading: false, guideError: '',
    quickItems: [
      { key: 'ai', icon: '✦', title: 'AI智能助手', color: 'blue' }, { key: 'cities', icon: '⌖', title: '热门城市', color: 'orange' },
      { key: 'guides', icon: '▣', title: '旅游攻略', color: 'green' }, { key: 'attractions', icon: '⌂', title: '景点推荐', color: 'red' },
      { key: 'trips', icon: '▤', title: '行程规划', color: 'sky' }, { key: 'hotel', icon: '▥', title: '酒店预订', color: 'purple' },
      { key: 'food', icon: '♨', title: '美食推荐', color: 'orange' }, { key: 'more', icon: '•••', title: '更多', color: 'cyan' }
    ]
  },
  onShow() { this.loadCities(); this.loadGuides() },
  async loadCities() {
    this.setData({ loading: true, error: '' })
    try {
      const cities = await api.get('/app/voyaai/cities', {})
      const mapped = cities.map(item => ({ ...item, coverUrl: item.coverImage ? api.imageUrl(item.coverImage) : (cityImages[item.name] || '/assets/city-chengdu.jpg') }))
      this.setData({ cities: mapped.slice(0, 4) })
    } catch (e) { this.setData({ error: e.message || '目的地加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  openSearch() { wx.navigateTo({ url: '/pages/search/search' }) },
  openCities() { wx.navigateTo({ url: '/pages/cities/cities' }) },
  openGuides() { wx.switchTab({ url: '/pages/guides/guides' }) },
  openTrips() { wx.switchTab({ url: '/pages/trips/trips' }) },
  openMe() { wx.switchTab({ url: '/pages/me/me' }) },
  openCity(e) { const city = e.currentTarget.dataset.city; wx.navigateTo({ url: `/pages/attractions/attractions?cityId=${city.id}&cityName=${encodeURIComponent(city.name)}` }) },
  async loadGuides() {
    const version = this.guideVersion = (this.guideVersion || 0) + 1
    this.setData({ guideLoading: true, guideError: '', guides: [] })
    try {
      const result = await api.get('/app/voyaai/guides', { pageNum: 1, pageSize: 3, sort: 'recommend' })
      if (version === this.guideVersion) this.setData({ guides: result.rows.map(guideView) })
    } catch (e) { if (version === this.guideVersion) this.setData({ guideError: e.message || '攻略加载失败' }) }
    finally { if (version === this.guideVersion) this.setData({ guideLoading: false }) }
  },
  openGuide(e) { wx.navigateTo({ url: `/pages/guide-detail/guide-detail?id=${e.currentTarget.dataset.id}` }) },
  onQuick(e) {
    const key = e.currentTarget.dataset.key
    if (key === 'cities') return this.openCities(); if (key === 'guides') return this.openGuides(); if (key === 'trips') return this.openTrips(); if (key === 'attractions') return this.openCities(); if (key === 'ai') return wx.navigateTo({ url: '/pages/ai/ai' }); if (key === 'hotel') return wx.navigateTo({ url: '/pages/hotels/hotels' }); if (key === 'food') return wx.navigateTo({ url: '/pages/food/food' }); if (key === 'more') return wx.navigateTo({ url: '/pages/more/more' })
  }
})
