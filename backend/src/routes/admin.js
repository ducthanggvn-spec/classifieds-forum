const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAdmin, requireAdminOrMod } = require('../middleware/auth');

// Lấy danh sách thành viên (Admin và Mod)
router.get('/users', requireAdminOrMod, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        isBanned: true,
        postCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi khi tải danh sách người dùng' });
  }
});

// Cập nhật quyền thành viên (Chỉ Admin)
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!['admin', 'mod', 'user'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Quyền không hợp lệ' });
    }

    // Không cho phép tự hạ quyền của chính mình (chống lỗi khóa tài khoản)
    if (req.user.id === userId && role !== 'admin') {
      return res.status(400).json({ success: false, error: 'Không thể tự hạ quyền Admin của chính mình' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    res.json({ success: true, message: 'Đã cập nhật quyền thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi khi cập nhật quyền' });
  }
});

// Khóa/Mở khóa thành viên (Ban) - Admin & Mod
router.put('/users/:id/ban', requireAdminOrMod, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isBanned, reason } = req.body;

    if (req.user.id === userId) {
      return res.status(400).json({ success: false, error: 'Không thể tự khóa tài khoản của chính mình' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Người dùng không tồn tại' });
    }

    // Mod không được phép Ban Admin hoặc Mod khác
    if (req.user.role === 'mod' && (targetUser.role === 'admin' || targetUser.role === 'mod')) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền khóa tài khoản của Admin hoặc Mod khác' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !!isBanned }
    });

    // Lưu Log
    await prisma.moderationLog.create({
      data: {
        modId: req.user.id,
        action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
        targetId: userId,
        targetInfo: targetUser.nickname,
        reason: reason || (isBanned ? 'Vi phạm nội quy' : 'Mở khóa tài khoản')
      }
    });

    res.json({ success: true, message: isBanned ? 'Đã khóa tài khoản thành công' : 'Đã mở khóa tài khoản thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi khi xử lý thao tác khóa tài khoản' });
  }
});

// Xóa vĩnh viễn thành viên (Delete) - Chỉ Admin
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: 'Bắt buộc phải nhập lý do xóa tài khoản' });
    }

    if (req.user.id === userId) {
      return res.status(400).json({ success: false, error: 'Không thể tự xóa tài khoản của chính mình' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Người dùng không tồn tại' });
    }

    // Xóa từ Supabase Auth (Tùy chọn, hiện tại chỉ xóa từ DB)
    // Nếu muốn xóa sạch từ Supabase auth, cần dùng Supabase Admin API
    // Tuy nhiên, xóa khỏi DB cũng khiến user không thể đăng nhập do requireAuth block.

    await prisma.user.delete({
      where: { id: userId }
    });

    // Lưu Log
    await prisma.moderationLog.create({
      data: {
        modId: req.user.id,
        action: 'DELETE_USER',
        targetId: userId,
        targetInfo: targetUser.nickname,
        reason: reason
      }
    });

    res.json({ success: true, message: 'Đã xóa tài khoản thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi khi xóa tài khoản' });
  }
});

// Chỉnh sửa Nickname, Email của thành viên (Chỉ Admin)
router.put('/users/:id/profile', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { nickname, email } = req.body;

    if (!nickname || !email) {
      return res.status(400).json({ success: false, error: 'Nickname và Email không được để trống' });
    }

    // Kiểm tra xem nickname có bị trùng với người khác không
    const existingUser = await prisma.user.findFirst({
      where: { 
        nickname, 
        id: { not: userId } 
      }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Nickname này đã có người sử dụng. Vui lòng chọn tên khác.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { nickname, email }
    });

    res.json({ success: true, message: 'Đã cập nhật thông tin thành công', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi khi cập nhật thông tin người dùng' });
  }
});

// Xóa/Ẩn bài đăng (Admin/Mod)
router.delete('/posts/:id', requireAdminOrMod, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: 'Bắt buộc phải nhập lý do xóa bài' });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Bài đăng không tồn tại' });
    }

    // Xóa vật lý (Hard-delete)
    await prisma.post.delete({
      where: { id: postId }
    });

    // Lưu Log
    await prisma.moderationLog.create({
      data: {
        modId: req.user.id,
        action: 'DELETE_POST',
        targetId: postId,
        targetInfo: post.title,
        reason: reason
      }
    });

    res.json({ success: true, message: 'Đã xóa bài đăng thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi khi xóa bài đăng' });
  }
});

// Lấy danh sách Moderation Log (Chỉ Admin/Mod)
router.get('/logs', requireAdminOrMod, async (req, res) => {
  try {
    const logs = await prisma.moderationLog.findMany({
      include: {
        mod: { select: { nickname: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Giới hạn lấy 100 log gần nhất cho nhẹ
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi khi tải lịch sử quản trị' });
  }
});

// Ghim/Bỏ ghim bài viết (Chỉ Admin)
router.put('/posts/:id/pin', requireAdmin, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { isPinned } = req.body; // true hoặc false

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Bài đăng không tồn tại' });
    }

    await prisma.post.update({
      where: { id: postId },
      data: { isPinned: !!isPinned }
    });

    // Lưu Log
    await prisma.moderationLog.create({
      data: {
        modId: req.user.id,
        action: isPinned ? 'PIN_POST' : 'UNPIN_POST',
        targetId: postId,
        targetInfo: post.title,
        reason: 'Quản trị viên thao tác ghim bài'
      }
    });

    res.json({ success: true, message: isPinned ? 'Đã ghim bài viết' : 'Đã bỏ ghim bài viết' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi khi thao tác ghim bài' });
  }
});

module.exports = router;
