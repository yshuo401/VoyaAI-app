const api = require('../../utils/api')
const cityImages = { 北京: '/assets/city-beijing.jpg', 成都: '/assets/city-chengdu.jpg', 重庆: '/assets/city-chongqing.jpg', 杭州: '/assets/city-hangzhou.jpg', 西安: '/assets/city-xian.jpg' }
Page({
  data: {
    currentCity: '成都', weather: '22℃', cities: [], guides: [], loading: false, error: '',
    quickItems: [
      { key: 'ai', icon: '✦', title: 'AI智能助手', color: 'blue' }, { key: 'cities', icon: '⌖', title: '热门城市', color: 'orange' },
      { key: 'guides', icon: '▣', title: '旅游攻略', color: 'green' }, { key: 'attractions', icon: '⌂', title: '景点推荐', color: 'red' },
      { key: 'trips', icon: '▤', title: '行程规划', color: 'sky' }, { key: 'hotel', icon: '▥', title: '酒店预订', color: 'purple' },
      { key: 'food', icon: '♨', title: '美食推荐', color: 'orange' }, { key: 'more', icon: '•••', title: '更多', color: 'cyan' }
    ]
  },
  onShow() { this.loadCities() },
  async loadCities() {
    this.setData({ loading: true, error: '' })
    try {
      const cities = await api.get('/app/voyaai/cities', {})
      const mapped = cities.map(item => ({ ...item, coverUrl: item.coverImage ? api.imageUrl(item.coverImage) : (cityImages[item.name] || '/assets/city-chengdu.jpg') }))
      const guides = mapped.slice(0, 3).map((item, index) => ({ cityId: item.id, city: item.name, image: item.coverUrl, title: `${item.name} ${index + 3}天${index ? '深度' : '自由行'}攻略`, desc: '美食 · 景点 · 住宿 · 交通', views: `${(12.6 - index * 2.1).toFixed(1)}k`, likes: 856 - index * 173 }))
      this.setData({ cities: mapped, guides })
    } catch (e) { this.setData({ error: e.message || '目的地加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  openSearch() { wx.navigateTo({ url: '/pages/search/search' }) },
  openCities() { wx.navigateTo({ url: '/pages/cities/cities' }) },
  openGuides() { wx.switchTab({ url: '/pages/guides/guides' }) },
  openTrips() { wx.switchTab({ url: '/pages/trips/trips' }) },
  openMe() { wx.switchTab({ url: '/pages/me/me' }) },
  openCity(e) { const city = e.currentTarget.dataset.city; wx.navigateTo({ url: `/pages/attractions/attractions?cityId=${city.id}&cityName=${encodeURIComponent(city.name)}` }) },
  openGuide(e) { const item = this.data.guides.find(x => x.cityId === e.currentTarget.dataset.city); wx.navigateTo({ url: `/pages/guide-detail/guide-detail?title=${encodeURIComponent(item ? item.title : '旅行攻略')}&image=${encodeURIComponent(item ? item.image : '')}` }) },
  onQuick(e) {
    const key = e.currentTarget.dataset.key
    if (key === 'cities') return this.openCities(); if (key === 'guides') return this.openGuides(); if (key === 'trips') return this.openTrips(); if (key === 'attractions') return this.openCities(); if (key === 'ai') return wx.navigateTo({ url: '/pages/ai/ai' }); if (key === 'hotel') return wx.navigateTo({ url: '/pages/hotels/hotels' }); if (key === 'food') return wx.navigateTo({ url: '/pages/food/food' }); if (key === 'more') return wx.navigateTo({ url: '/pages/more/more' })
  }
})
