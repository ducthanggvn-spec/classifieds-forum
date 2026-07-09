const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

// Lấy danh sách thông báo của một user
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const notifications = await prisma.notification.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20, // Chỉ lấy 20 thông báo gần nhất
      include: {
        actor: { select: { nickname: true, avatarUrl: true } }
      }
    });

    // Lấy citySlug cho các thông báo liên quan đến bài viết
    const postIds = notifications
      .filter(n => ['LIKE_POST', 'COMMENT', 'REPLY', 'LIKE_COMMENT'].includes(n.type) && n.targetId)
      .map(n => n.targetId);

    let postMap = {};
    if (postIds.length > 0) {
      const posts = await prisma.post.findMany({
        where: { id: { in: postIds } },
        include: { city: { select: { slug: true } } }
      });
      posts.forEach(p => {
        if (p.city) postMap[p.id] = p.city.slug;
      });
    }

    const enrichedNotifications = notifications.map(n => {
      let targetUrl = '#';
      if (['LIKE_POST', 'COMMENT', 'REPLY', 'LIKE_COMMENT'].includes(n.type) && n.targetId) {
        const citySlug = postMap[n.targetId];
        if (citySlug) {
          targetUrl = `/${citySlug}/post/${n.targetId}`;
        } else {
          targetUrl = `/`;
        }
      } else if (n.type === 'INBOX' && n.targetId) {
        targetUrl = `/inbox/${n.targetId}`;
      }
      return { ...n, targetUrl };
    });

    res.json({ success: true, data: enrichedNotifications });
  } catch (error) {
    console.error("Lỗi lấy notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Đánh dấu 1 thông báo đã đọc
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const notification = await prisma.notification.findUnique({ where: { id: parseInt(id) } });
    if (!notification || notification.recipientId !== user.id) {
      return res.status(404).json({ error: "Không tìm thấy thông báo" });
    }

    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Lỗi cập nhật notification:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Đánh dấu tất cả thông báo của 1 user đã đọc
router.put('/read-all', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    await prisma.notification.updateMany({
      where: { recipientId: user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Lỗi cập nhật tất cả notification:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
