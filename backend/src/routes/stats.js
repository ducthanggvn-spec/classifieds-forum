const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Lấy thống kê số lượng bài viết và bình luận theo từng thành phố và danh mục
router.get('/', async (req, res) => {
  try {
    const cities = await prisma.city.findMany();
    const stats = {};

    for (const city of cities) {
      stats[city.slug] = {
        marketplace: { posts: 0, replies: 0 },
        food: { posts: 0, replies: 0 }
      };

      // Thống kê Mua bán (categoryId = 1)
      const marketplacePosts = await prisma.post.findMany({ 
        where: { cityId: city.id, categoryId: 1 },
        select: { id: true, comments: { select: { id: true } } }
      });
      stats[city.slug].marketplace.posts = marketplacePosts.length;
      stats[city.slug].marketplace.replies = marketplacePosts.reduce((acc, post) => acc + post.comments.length, 0);

      // Thống kê Ăn uống (categoryId = 2)
      const foodPosts = await prisma.post.findMany({ 
        where: { cityId: city.id, categoryId: 2 },
        select: { id: true, comments: { select: { id: true } } }
      });
      stats[city.slug].food.posts = foodPosts.length;
      stats[city.slug].food.replies = foodPosts.reduce((acc, post) => acc + post.comments.length, 0);
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server khi tải thống kê' });
  }
});

module.exports = router;
