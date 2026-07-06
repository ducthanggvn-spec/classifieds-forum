const express = require('express');
const router = express.Router();
const prisma = require('../db');
const xss = require('xss');

// 1. Tạo bình luận mới
router.get('/:postId', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ success: false, error: 'ID bài viết không hợp lệ' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalComments = await prisma.comment.count({ where: { postId } });
    const totalPages = Math.ceil(totalComments / limit);

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: { 
          select: { 
            nickname: true, 
            avatarUrl: true, 
            role: true, 
            postCount: true, 
            createdAt: true,
            signature: true
          } 
        }
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit
    });

    res.json({ 
      success: true, 
      data: comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalComments,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy bình luận:', error);
    res.status(500).json({ success: false, error: 'Lỗi server khi tải bình luận' });
  }
});

// Thêm bình luận mới
router.post('/', async (req, res) => {
  try {
    const { postId, content, supabaseUid } = req.body;

    if (!postId || !content || !supabaseUid) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc' });
    }

    // Xác thực người dùng
    const user = await prisma.user.findUnique({
      where: { supabaseUid }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    // Chống XSS
    const safeContent = xss(content);

    // Đảm bảo bài viết tồn tại
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
    }

    // Kiểm tra tính năng Gộp bài (Auto Merge Double Post)
    const lastComment = await prisma.comment.findFirst({
      where: { postId: parseInt(postId) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { nickname: true, avatarUrl: true, role: true, postCount: true, createdAt: true, signature: true } }
      }
    });

    const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 tiếng (Khớp với cooldown Đẩy bài)
    const now = new Date();
    let comment;

    if (
      lastComment && 
      lastComment.userId === user.id && 
      (now.getTime() - new Date(lastComment.createdAt).getTime()) < TWO_HOURS
    ) {
      // Gộp bài
      const mergedContent = lastComment.content + "\n\n[i]--- Gộp bài viết ---[/i]\n\n" + safeContent;
      comment = await prisma.comment.update({
        where: { id: lastComment.id },
        data: { content: mergedContent },
        include: {
          user: { select: { nickname: true, avatarUrl: true, role: true, postCount: true, createdAt: true, signature: true } }
        }
      });
    } else {
      // Tạo bài mới
      comment = await prisma.comment.create({
        data: {
          postId: parseInt(postId),
          userId: user.id,
          content: safeContent
        },
        include: {
          user: {
            select: {
              nickname: true,
              avatarUrl: true,
              role: true,
              postCount: true,
              createdAt: true,
              signature: true
            }
          }
        }
      });

      // Cập nhật số bài viết/tương tác của user (chỉ khi tạo bài mới)
      await prisma.user.update({
        where: { id: user.id },
        data: { postCount: { increment: 1 } }
      });

      // Cập nhật lastBumpedAt của bài viết để Đẩy bài (Up Top) tự động khi có bình luận mới
      await prisma.post.update({
        where: { id: parseInt(postId) },
        data: { lastBumpedAt: new Date() }
      });

      // Tạo thông báo cho chủ post (nếu người bình luận không phải chủ post)
      if (post.userId !== user.id) {
        await prisma.notification.create({
          data: {
            recipientId: post.userId,
            actorId: user.id,
            type: 'COMMENT',
            targetId: post.id,
            content: `đã bình luận trong bài viết "${post.title.substring(0, 30)}..." của bạn.`
          }
        });
      }
    }

    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('Lỗi khi tạo bình luận:', error);
    res.status(500).json({ success: false, error: 'Lỗi server khi tạo bình luận' });
  }
});

module.exports = router;
