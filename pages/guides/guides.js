const api = require('../../utils/api')
const { guideView } = require('../../utils/guide')
Page({
  data: { guides: [], cities: [], cityIndex: 0, keyword: '', guideType: '', sort: 'recommend', tabs: [{ key: 'recommend', name: '推荐' }, { key: 'latest', name: '最新' }, { key: 'hot', name: '最热' }], page: 0, total: 0, loading: false, error: '', cityError: '' },
  onLoad() { this.loadCities() },
  onShow() { this.load(true) },
  onUnload() { this.version = (this.version || 0) + 1 },
  async loadCities() {
    try { const cities = await api.get('/app/voyaai/cities'); this.setData({ cities: [{ id: null, name: '全部城市' }, ...cities], cityError: '' }) }
    catch (e) { this.setData({ cityError: '城市筛选加载失败，点击重试' }) }
  },
  async load(reset) {
    if (!reset && (this.data.loading || this.data.guides.length >= this.data.total)) return
    const version = this.version = (this.version || 0) + 1
    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true, error: '', ...(reset ? { guides: [], total: 0, page: 0 } : {}) })
    const params = { pageNum: page, pageSize: 10, sort: this.data.sort, keyword: this.data.keyword.trim(), guideType: this.data.guideType.trim() }
    const city = this.data.cities[this.data.cityIndex]
    if (city && city.id) params.cityId = city.id
    try {
      const result = await api.get('/app/voyaai/guides', params)
      if (version !== this.version) return
      this.setData({ guides: (reset ? [] : this.data.guides).concat(result.rows.map(guideView)), total: result.total, page })
    } catch (e) { if (version === this.version) this.setData({ error: e.message || '攻略加载失败' }) }
    finally { if (version === this.version) this.setData({ loading: false }) }
  },
  onKeyword(e) { this.setData({ keyword: e.detail.value }) },
  onType(e) { this.setData({ guideType: e.detail.value }) },
  search() { this.load(true) },
  chooseCity(e) { this.setData({ cityIndex: Number(e.detail.value) }); this.load(true) },
  chooseSort(e) { this.setData({ sort: e.currentTarget.dataset.sort }); this.load(true) },
  retry() { this.load(this.data.page === 0) },
  onReachBottom() { this.load(false) },
  async onPullDownRefresh() { try { await this.load(true) } finally { wx.stopPullDownRefresh() } },
  openGuide(e) { wx.navigateTo({ url: `/pages/guide-detail/guide-detail?id=${e.currentTarget.dataset.id}` }) }
})
