const prisma = require('../db');

// Middleware xác thực quyền Admin hoặc Mod
const requireAdminOrMod = async (req, res, next) => {
  try {
    const supabaseUid = req.headers['x-supabase-uid'] || req.body.supabaseUid || req.query.supabaseUid;
    
    if (!supabaseUid) {
      return res.status(401).json({ success: false, error: 'Không tìm thấy xác thực người dùng' });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseUid },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Người dùng không tồn tại' });
    }

    if (user.role !== 'admin' && user.role !== 'mod') {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền truy cập' });
    }

    req.user = user; // Lưu thông tin user vào request
    next();
  } catch (error) {
    console.error('Lỗi xác thực quyền:', error);
    res.status(500).json({ success: false, error: 'Lỗi server khi xác thực quyền' });
  }
};

// Middleware chỉ dành cho Admin
const requireAdmin = async (req, res, next) => {
  try {
    const supabaseUid = req.headers['x-supabase-uid'] || req.body.supabaseUid || req.query.supabaseUid;
    
    if (!supabaseUid) {
      return res.status(401).json({ success: false, error: 'Không tìm thấy xác thực người dùng' });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseUid },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Người dùng không tồn tại' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Yêu cầu quyền Quản trị viên (Admin)' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực Admin:', error);
    res.status(500).json({ success: false, error: 'Lỗi server khi xác thực quyền Admin' });
  }
};

module.exports = { requireAdminOrMod, requireAdmin };
