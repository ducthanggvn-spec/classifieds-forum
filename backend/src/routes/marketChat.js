const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET /api/markets/:citySlug/chat
// Lấy 50 tin nhắn mới nhất của thị trường
router.get('/:citySlug/chat', async (req, res) => {
  try {
    const { citySlug } = req.params;
    
    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) {
      return res.status(404).json({ error: 'Không tìm thấy thị trường' });
    }

    const messages = await prisma.marketMessage.findMany({
      where: { cityId: city.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            role: true
          }
        }
      }
    });

    res.json(messages.reverse()); // Đảo ngược để tin cũ xếp trên, tin mới xếp dưới (dùng cho chat box)
  } catch (error) {
    console.error('Error fetching market chat:', error);
    res.status(500).json({ error: 'Lỗi server khi tải tin nhắn' });
  }
});

// POST /api/markets/:citySlug/chat
// Gửi tin nhắn vào thị trường
router.post('/:citySlug/chat', async (req, res) => {
  try {
    const { citySlug } = req.params;
    const { userId, content, imageUrl } = req.body;

    if (!userId || (!content && !imageUrl)) {
      return res.status(400).json({ error: 'Thiếu thông tin người dùng hoặc nội dung tin nhắn' });
    }

    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) {
      return res.status(404).json({ error: 'Không tìm thấy thị trường' });
    }

    const newMessage = await prisma.marketMessage.create({
      data: {
        cityId: city.id,
        userId: parseInt(userId),
        content: content ? content.trim() : null,
        imageUrl: imageUrl || null
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            role: true
          }
        }
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error posting market chat:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi tin nhắn' });
  }
});

module.exports = router;
