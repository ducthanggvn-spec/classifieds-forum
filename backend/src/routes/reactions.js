const express = require('express');
const router = express.Router();
const prisma = require('../db');

// Thả cảm xúc cho bài viết
router.post('/post', async (req, res) => {
  try {
    const { postId, type, supabaseUid } = req.body;
    
    const user = await prisma.user.findUnique({ where: { supabaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Kiểm tra xem đã thả cảm xúc chưa
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: parseInt(postId)
        }
      }
    });

    if (existing) {
      if (existing.type === type) {
        // Nếu click lại cảm xúc cũ -> Xóa (Unlike)
        await prisma.reaction.delete({ where: { id: existing.id } });
        return res.json({ success: true, action: 'removed' });
      } else {
        // Nếu chọn cảm xúc khác -> Cập nhật
        await prisma.reaction.update({
          where: { id: existing.id },
          data: { type }
        });
        return res.json({ success: true, action: 'updated' });
      }
    } else {
      // Nếu chưa thả -> Tạo mới
      await prisma.reaction.create({
        data: {
          userId: user.id,
          postId: parseInt(postId),
          type
        }
      });
      
      // Tạo thông báo cho chủ post (nếu không phải tự like)
      const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
      if (post && post.userId !== user.id) {
        await prisma.notification.create({
          data: {
            recipientId: post.userId,
            actorId: user.id,
            type: 'LIKE_POST',
            targetId: post.id,
            content: `đã bày tỏ cảm xúc về bài viết "${post.title.substring(0, 30)}..." của bạn.`
          }
        });
      }
      
      return res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error("Lỗi reaction post:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Thả cảm xúc cho bình luận
router.post('/comment', async (req, res) => {
  try {
    const { commentId, type, supabaseUid } = req.body;
    
    const user = await prisma.user.findUnique({ where: { supabaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existing = await prisma.reaction.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: parseInt(commentId)
        }
      }
    });

    if (existing) {
      if (existing.type === type) {
        await prisma.reaction.delete({ where: { id: existing.id } });
        return res.json({ success: true, action: 'removed' });
      } else {
        await prisma.reaction.update({
          where: { id: existing.id },
          data: { type }
        });
        return res.json({ success: true, action: 'updated' });
      }
    } else {
      await prisma.reaction.create({
        data: {
          userId: user.id,
          commentId: parseInt(commentId),
          type
        }
      });
      
      const comment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
      if (comment && comment.userId !== user.id) {
        await prisma.notification.create({
          data: {
            recipientId: comment.userId,
            actorId: user.id,
            type: 'LIKE_COMMENT',
            targetId: comment.postId,
            content: `đã bày tỏ cảm xúc về bình luận của bạn.`
          }
        });
      }
      
      return res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error("Lỗi reaction comment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Lấy danh sách cảm xúc của một post hoặc comment
router.get('/', async (req, res) => {
  try {
    const { postId, commentId } = req.query;
    let reactions = [];
    
    if (postId) {
      reactions = await prisma.reaction.findMany({
        where: { postId: parseInt(postId) },
        include: { user: { select: { nickname: true, avatarUrl: true } } }
      });
    } else if (commentId) {
      reactions = await prisma.reaction.findMany({
        where: { commentId: parseInt(commentId) },
        include: { user: { select: { nickname: true, avatarUrl: true } } }
      });
    }
    
    res.json({ success: true, data: reactions });
  } catch (error) {
    console.error("Lỗi lấy reactions:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
