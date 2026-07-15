const prisma = require('../db');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client to verify JWT tokens
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const getSupabaseUserFromToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  
  // Verify token using Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user.id; // Returns supabaseUid
};

// Middleware xác thực quyền Đăng nhập chung
const requireAuth = async (req, res, next) => {
  try {
    const supabaseUid = await getSupabaseUserFromToken(req);
    
    if (!supabaseUid) {
      return res.status(401).json({ success: false, error: 'Xác thực thất bại. Vui lòng đăng nhập lại.' });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseUid },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Người dùng không tồn tại trong hệ thống' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, error: 'Tài khoản của bạn đã bị khóa' });
    }

    req.user = user; // Lưu thông tin user vào request
    next();
  } catch (error) {
    console.error('Lỗi xác thực Auth:', error);
    res.status(500).json({ success: false, error: 'Lỗi server khi xác thực' });
  }
};

// Middleware xác thực quyền Admin hoặc Mod
const requireAdminOrMod = async (req, res, next) => {
  try {
    const supabaseUid = await getSupabaseUserFromToken(req);
    
    if (!supabaseUid) {
      return res.status(401).json({ success: false, error: 'Xác thực thất bại. Vui lòng đăng nhập lại.' });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseUid },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Người dùng không tồn tại' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, error: 'Tài khoản của bạn đã bị khóa' });
    }

    if (user.role !== 'admin' && user.role !== 'mod') {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền truy cập' });
    }

    req.user = user; // Lưu thông tin user vào request
    next();
  } catch (error) {
    console.error('Lỗi xác thực quyền Admin/Mod:', error);
    res.status(500).json({ success: false, error: 'Lỗi server khi xác thực quyền' });
  }
};

// Middleware chỉ dành cho Admin
const requireAdmin = async (req, res, next) => {
  try {
    const supabaseUid = await getSupabaseUserFromToken(req);
    
    if (!supabaseUid) {
      return res.status(401).json({ success: false, error: 'Xác thực thất bại. Vui lòng đăng nhập lại.' });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseUid },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Người dùng không tồn tại' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, error: 'Tài khoản của bạn đã bị khóa' });
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

// Middleware chỉ xác thực Token (không yêu cầu User phải có sẵn trong DB, dùng cho chức năng Sync/Đăng ký)
const requireToken = async (req, res, next) => {
  try {
    const supabaseUid = await getSupabaseUserFromToken(req);
    if (!supabaseUid) {
      return res.status(401).json({ success: false, error: 'Xác thực thất bại. Vui lòng đăng nhập lại.' });
    }
    req.supabaseUid = supabaseUid;
    next();
  } catch (error) {
    console.error('Lỗi xác thực Token:', error);
    res.status(500).json({ success: false, error: 'Lỗi server khi xác thực' });
  }
};

// Export getSupabaseUserFromToken for optional auth checking
module.exports = { requireAuth, requireToken, requireAdminOrMod, requireAdmin, getSupabaseUserFromToken };
