const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Lấy danh sách thông báo của một user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await prisma.notification.findMany({
      where: { recipientId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      take: 20, // Chỉ lấy 20 thông báo gần nhất
      include: {
        actor: { select: { nickname: true, avatarUrl: true } }
      }
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Lỗi lấy notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Đánh dấu 1 thông báo đã đọc
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
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
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    await prisma.notification.updateMany({
      where: { recipientId: parseInt(userId), isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Lỗi cập nhật tất cả notification:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
