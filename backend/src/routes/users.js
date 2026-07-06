const express = require('express');
const router = express.Router();
const prisma = require('../db');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// Cấu hình Multer để lưu file tạm vào bộ nhớ
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // Tối đa 5MB

// Khởi tạo Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

// Đồng bộ User từ Supabase sang Prisma
router.post('/sync', async (req, res) => {
  try {
    const { supabaseUid, email, nickname, fullName, birthYear } = req.body;
    
    let user = await prisma.user.findUnique({ where: { supabaseUid } });
    
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            supabaseUid,
            email,
            nickname: nickname || email.split('@')[0],
            fullName: fullName || email.split('@')[0],
            birthYear: birthYear ? parseInt(birthYear) : null,
          }
        });
      } catch (err) {
        // Trùng nickname thì thêm 4 số ngẫu nhiên
        if (err.code === 'P2002') {
          user = await prisma.user.create({
            data: {
              supabaseUid,
              email,
              nickname: (nickname || email.split('@')[0]) + Math.floor(Math.random() * 10000),
              fullName: fullName || email.split('@')[0],
              birthYear: birthYear ? parseInt(birthYear) : null,
            }
          });
        } else {
          throw err;
        }
      }
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Lỗi đồng bộ user:", error);
    res.status(500).json({ error: "Lỗi server khi đồng bộ user" });
  }
});

// Lấy thông tin user theo ID (dành cho owner /profile)
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseUid: req.params.id }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Cập nhật thông tin user (dành cho owner /profile)
router.put('/:id', async (req, res) => {
  try {
    const { fullName, birthYear, phone, signature } = req.body;
    const updatedUser = await prisma.user.update({
      where: { supabaseUid: req.params.id },
      data: { 
        fullName, 
        birthYear: birthYear ? parseInt(birthYear) : null, 
        phone,
        signature
      }
    });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi server khi cập nhật hồ sơ" });
  }
});

// Lấy thông tin user công khai theo Nickname (dành cho /user/[nickname])
router.get('/public/:nickname', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { nickname: req.params.nickname },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        birthYear: true,
        phone: true,
        postCount: true,
        role: true,
        createdAt: true,
        posts: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            city: { select: { name: true, slug: true } },
            listingType: true,
            createdAt: true,
          }
        }
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Upload Ảnh Đại Diện
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.body; // Yêu cầu gửi kèm userId (supabaseUid)
    const file = req.file;

    if (!file || !userId) {
      return res.status(400).json({ error: "Missing file or userId" });
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload lên Supabase Storage (bucket tên là 'avatars')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      return res.status(500).json({ error: "Không thể upload ảnh lên hệ thống" });
    }

    // Lấy link công khai
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    // Lưu link ảnh vào Database
    const updatedUser = await prisma.user.update({
      where: { supabaseUid: userId },
      data: { avatarUrl: publicUrl }
    });

    res.json({ message: "Upload thành công", avatarUrl: publicUrl });

  } catch (error) {
    console.error("Avatar Upload API Error:", error);
    res.status(500).json({ error: "Lỗi server khi upload ảnh" });
  }
});

module.exports = router;
