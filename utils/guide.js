const api = require('./api')
function guideView(item) {
  return { ...item, image: item.coverImage ? api.imageUrl(item.coverImage) : '/assets/guide.jpg', tags: (item.tagNames || '').split(',').filter(Boolean), viewCount: item.viewCount || 0, likeCount: item.likeCount || 0 }
}
module.exports = { guideView }
