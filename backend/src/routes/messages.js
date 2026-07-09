const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

// Lấy danh sách hội thoại của một user
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    const participants = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: user.id } },
              include: { user: { select: { id: true, nickname: true, avatarUrl: true } } }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { sender: { select: { id: true, nickname: true } } }
            }
          }
        }
      },
      orderBy: { conversation: { updatedAt: 'desc' } }
    });

    res.json({ success: true, data: participants });
  } catch (error) {
    console.error("Lỗi lấy danh sách hội thoại:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Lấy chi tiết một hội thoại
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    if (id === 'new') return res.status(400).json({ error: 'Invalid ID' });

    // Kiểm tra quyền truy cập (user phải là participant)
    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: parseInt(id), userId: user.id } }
    });
    if (!isParticipant) return res.status(403).json({ error: 'Không có quyền truy cập' });

    const conversation = await prisma.conversation.findUnique({
      where: { id: parseInt(id) },
      include: {
        participants: {
          include: { user: { select: { id: true, nickname: true, avatarUrl: true } } }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, nickname: true, avatarUrl: true } } }
        }
      }
    });

    // Cập nhật lastReadAt
    await prisma.conversationParticipant.update({
      where: { id: isParticipant.id },
      data: { lastReadAt: new Date() }
    });

    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error("Lỗi lấy chi tiết hội thoại:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Tạo hội thoại mới
router.post('/new', requireAuth, async (req, res) => {
  try {
    const { recipientNickname, subject, content } = req.body;
    const sender = req.user;

    const recipient = await prisma.user.findFirst({ where: { nickname: recipientNickname } });
    if (!recipient) return res.status(404).json({ error: 'Không tìm thấy người nhận' });

    if (sender.id === recipient.id) {
      return res.status(400).json({ error: 'Không thể tự gửi tin nhắn cho bản thân' });
    }

    // Tạo conversation -> gắn participants -> tạo tin nhắn đầu tiên
    const conversation = await prisma.conversation.create({
      data: {
        subject: subject || 'Không có tiêu đề',
        participants: {
          create: [
            { userId: sender.id, lastReadAt: new Date() },
            { userId: recipient.id }
          ]
        },
        messages: {
          create: {
            senderId: sender.id,
            content: content
          }
        }
      }
    });

    // Bắn thông báo
    try {
      await prisma.notification.create({
        data: {
          recipientId: recipient.id,
          actorId: sender.id,
          type: 'INBOX',
          targetId: conversation.id,
          content: 'đã gửi cho bạn một tin nhắn mới.'
        }
      });
    } catch (e) {
      console.log('Không thể tạo thông báo:', e.message);
    }

    res.json({ success: true, conversationId: conversation.id });
  } catch (error) {
    console.error("Lỗi tạo hội thoại:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Gửi tin nhắn vào hội thoại
router.post('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const sender = req.user;

    // Kiểm tra quyền
    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: parseInt(id), userId: sender.id } }
    });
    if (!isParticipant) return res.status(403).json({ error: 'Không có quyền gửi tin' });

    const message = await prisma.message.create({
      data: {
        conversationId: parseInt(id),
        senderId: sender.id,
        content: content
      }
    });

    // Cập nhật updatedAt của Conversation
    await prisma.conversation.update({
      where: { id: parseInt(id) },
      data: { updatedAt: new Date() }
    });

    // Cập nhật lastReadAt cho sender
    await prisma.conversationParticipant.update({
      where: { id: isParticipant.id },
      data: { lastReadAt: new Date() }
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
