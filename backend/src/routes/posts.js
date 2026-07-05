const express = require('express');
const router = express.Router();
const prisma = require('../db');
const xss = require('xss');

// Lấy danh sách bài viết (Có hỗ trợ Tìm kiếm, Lọc theo Thị trường và Phân trang)
router.get('/', async (req, res) => {
  try {
    const { citySlug, q, type, page } = req.query;

    const currentPage = parseInt(page) || 1;
    const limit = 20;
    const skip = (currentPage - 1) * limit;

    const whereClause = {};
    
    if (req.query.categoryId) {
      whereClause.categoryId = parseInt(req.query.categoryId);
    }

    if (citySlug && citySlug !== 'all') {
      whereClause.city = { slug: citySlug };
    }

    if (type && (type === 'sell' || type === 'buy' || type === 'eat' || type === 'drink' || type === 'general')) {
      whereClause.listingType = type;
    }

    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          user: { select: { nickname: true, avatarUrl: true, fullName: true, role: true, postCount: true } },
          city: { select: { name: true, slug: true } },
        },
        orderBy: [
          { isPinned: 'desc' }, // Bài ghim luôn lên đầu
          { lastBumpedAt: 'desc' } // Sau đó mới đến bài mới đẩy
        ],
        skip: skip,
        take: limit,
      }),
      prisma.post.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({ 
      success: true, 
      data: posts,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server khi tải bài viết' });
  }
});

// Tạo bài viết mới
router.post('/', async (req, res) => {
  try {
    const { citySlug, categoryId, listingType, title, description, supabaseUid } = req.body;

    // Lấy thông tin user
    const user = await prisma.user.findUnique({
      where: { supabaseUid },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    // Lấy ID của thành phố
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
    });

    if (!city) {
      return res.status(400).json({ success: false, error: 'Thị trường không hợp lệ' });
    }

    // Chống XSS (Loại bỏ các mã <script> độc hại, nhưng vẫn giữ lại format HTML an toàn)
    const safeDescription = xss(description);

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        cityId: city.id,
        categoryId: categoryId || 1, // Tạm fix cứng category nếu chưa có UI chọn
        listingType,
        title,
        description: safeDescription, // Chứa BBCode đã được làm sạch
      },
    });

    // Cập nhật số bài viết của User
    await prisma.user.update({
      where: { id: user.id },
      data: { postCount: { increment: 1 } },
    });

    res.json({ success: true, data: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi khi tạo bài viết mới' });
  }
});

// Lấy chi tiết một post (để dưới cùng)
router.get('/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ success: false, error: 'ID không hợp lệ' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { nickname: true, avatarUrl: true, role: true, postCount: true, createdAt: true, supabaseUid: true } },
        city: { select: { name: true, slug: true } },
        // Thêm comments nếu cần thiết sau này
      },
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bài viết' });
    }

    // Tăng view count (nên tách ra API riêng hoặc làm background để tránh lag, tạm làm ở đây)
    await prisma.post.update({
      where: { id: postId },
      data: { viewsCount: { increment: 1 } }
    });

    res.json({ success: true, data: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server khi tải chi tiết bài' });
  }
});

// Đẩy bài (Up top)
router.post('/bump/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { supabaseUid } = req.body;

    if (isNaN(postId) || !supabaseUid) {
      return res.status(400).json({ success: false, error: 'Dữ liệu không hợp lệ' });
    }

    const user = await prisma.user.findUnique({ where: { supabaseUid } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
    }

    if (post.userId !== user.id) {
      return res.status(403).json({ success: false, error: 'Chỉ chủ bài viết mới được đẩy bài' });
    }

    // Khóa đếm ngược 2 giờ
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const now = new Date();
    if (post.lastBumpedAt && (now.getTime() - new Date(post.lastBumpedAt).getTime() < TWO_HOURS)) {
      const timeRemaining = TWO_HOURS - (now.getTime() - new Date(post.lastBumpedAt).getTime());
      const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
      const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
      return res.status(400).json({ 
        success: false, 
        error: `Thao tác quá nhanh! Bạn cần chờ ${hours > 0 ? hours + ' giờ ' : ''}${minutes} phút nữa để tiếp tục đẩy bài.` 
      });
    }

    await prisma.post.update({
      where: { id: postId },
      data: { lastBumpedAt: now }
    });

    res.json({ success: true, message: 'Đã đẩy bài thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server khi đẩy bài' });
  }
});

// Chủ bài viết tự đóng topic (Đã bán/Đã mua)
router.put('/:id/done', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const supabaseUid = req.headers['x-supabase-uid'] || req.body.supabaseUid;

    if (isNaN(postId) || !supabaseUid) {
      return res.status(400).json({ success: false, error: 'Dữ liệu không hợp lệ' });
    }

    const user = await prisma.user.findUnique({ where: { supabaseUid } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
    }

    if (post.userId !== user.id) {
      return res.status(403).json({ success: false, error: 'Chỉ chủ bài viết mới được thực hiện thao tác này' });
    }

    await prisma.post.update({
      where: { id: postId },
      data: { status: 'archived' }
    });

    res.json({ success: true, message: 'Đã cập nhật trạng thái bài viết thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server khi cập nhật bài viết' });
  }
});

// Chỉnh sửa nội dung bài viết
router.put('/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, description, postType } = req.body;
    const supabaseUid = req.headers['x-supabase-uid'] || req.body.supabaseUid;

    if (isNaN(postId) || !supabaseUid) {
      return res.status(400).json({ success: false, error: 'Dữ liệu không hợp lệ' });
    }

    const user = await prisma.user.findUnique({ where: { supabaseUid } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Không tìm thấy người dùng' });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Bài viết không tồn tại' });
    }

    if (post.userId !== user.id && user.role !== 'admin' && user.role !== 'mod') {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền sửa bài viết này' });
    }

    // Không cho phép sửa nếu đã đóng băng (archived)
    if (post.status === 'archived') {
      return res.status(400).json({ success: false, error: 'Bài viết đã đóng băng không thể sửa đổi' });
    }

    // Cập nhật
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = xss(description); // Chống XSS
    if (postType && (postType === 'sell' || postType === 'buy' || postType === 'general' || postType === 'eat' || postType === 'drink')) {
      updateData.listingType = postType;
    }

    await prisma.post.update({
      where: { id: postId },
      data: updateData
    });

    res.json({ success: true, message: 'Đã cập nhật bài viết thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server khi cập nhật bài viết' });
  }
});

// Đẩy bài (Bump Post)
router.post('/bump/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { supabaseUid } = req.body;
    
    if (!supabaseUid) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { supabaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.userId !== user.id && user.role !== 'admin' && user.role !== 'mod') {
      return res.status(403).json({ error: "Chỉ tác giả mới được đẩy bài" });
    }

    // Kiểm tra cooldown (2 giờ)
    const BUMP_COOLDOWN_MS = 2 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const lastBump = new Date(post.lastBumpedAt).getTime();
    
    if (now - lastBump < BUMP_COOLDOWN_MS) {
      return res.status(400).json({ error: "Chưa hết thời gian chờ để đẩy bài" });
    }

    await prisma.post.update({
      where: { id: parseInt(id) },
      data: { lastBumpedAt: new Date() }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Lỗi đẩy bài:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
