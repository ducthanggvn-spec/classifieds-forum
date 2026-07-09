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

    // userId có thể là số nguyên (internal ID) hoặc chuỗi UUID (Supabase UID)
    let internalUserId = parseInt(userId);
    if (isNaN(internalUserId) || typeof userId === 'string') {
      const userRecord = await prisma.user.findUnique({ where: { supabaseUid: String(userId) } });
      if (!userRecord) {
        return res.status(401).json({ error: 'Không tìm thấy người dùng trong DB' });
      }
      internalUserId = userRecord.id;
    }

    const newMessage = await prisma.marketMessage.create({
      data: {
        cityId: city.id,
        userId: internalUserId,
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

    // Dọn dẹp tin nhắn cũ hơn 3 ngày (Chạy ngầm)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    prisma.marketMessage.deleteMany({
      where: {
        cityId: city.id,
        createdAt: { lt: threeDaysAgo }
      }
    }).catch(err => console.error('Lỗi dọn dẹp tin nhắn:', err));

  } catch (error) {
    console.error('Error posting market chat:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi tin nhắn' });
  }
});

// POST /api/markets/:citySlug/heartbeat
// Cập nhật trạng thái online của người dùng trong một khu vực (Market)
router.post('/:citySlug/heartbeat', async (req, res) => {
  try {
    const { citySlug } = req.params;
    const { userId, nickname, avatarUrl } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Thiếu userId' });
    }

    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy thị trường' });
    }

    // 1. Cập nhật visitor hiện tại (Dùng bảng MarketVisitor - cần tạo bảng này, hoặc mượn bảng tạm. 
    // Wait, prisma schema doesn't have MarketVisitor! 
    // Thay vào đó, ta tái sử dụng bảng PostVisitor với postId = -city.id (âm) để đại diện cho Market!
    const pseudoPostId = -city.id;

    await prisma.postVisitor.upsert({
      where: {
        postId_userId: {
          postId: pseudoPostId,
          userId: String(userId),
        }
      },
      update: {
        nickname: nickname || "Khách",
        avatarUrl: avatarUrl || null,
        lastSeenAt: new Date(),
      },
      create: {
        postId: pseudoPostId,
        userId: String(userId),
        nickname: nickname || "Khách",
        avatarUrl: avatarUrl || null,
      }
    });

    // 2. Xóa các visitor cũ (không hoạt động quá 3 phút)
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    await prisma.postVisitor.deleteMany({
      where: {
        postId: pseudoPostId,
        lastSeenAt: { lt: threeMinutesAgo }
      }
    });

    // 3. Lấy danh sách online
    const onlineUsers = await prisma.postVisitor.findMany({
      where: { postId: pseudoPostId },
      orderBy: { lastSeenAt: 'desc' },
      take: 100
    });

    res.json({ success: true, data: onlineUsers });
  } catch (error) {
    console.error('Lỗi market heartbeat:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

module.exports = router;
