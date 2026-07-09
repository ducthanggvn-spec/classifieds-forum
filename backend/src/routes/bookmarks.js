const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

// Lấy danh sách bookmark của user
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: {
            user: { select: { nickname: true, avatarUrl: true } },
            city: { select: { slug: true } },
            category: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: bookmarks });
  } catch (error) {
    console.error("Lỗi lấy bookmarks:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Thêm hoặc xóa bookmark
router.post('/', requireAuth, async (req, res) => {
  try {
    const { postId } = req.body;
    const user = req.user;

    if (!postId) return res.status(400).json({ error: 'Thiếu thông tin' });

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: parseInt(postId)
        }
      }
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return res.json({ success: true, action: 'removed' });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          postId: parseInt(postId)
        }
      });
      return res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error("Lỗi toggle bookmark:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Kiểm tra xem post đã bookmark chưa
router.get('/check', requireAuth, async (req, res) => {
  try {
    const { postId } = req.query;
    const user = req.user;
    
    if (!postId) return res.json({ bookmarked: false });

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: parseInt(postId)
        }
      }
    });

    res.json({ success: true, bookmarked: !!existing });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
