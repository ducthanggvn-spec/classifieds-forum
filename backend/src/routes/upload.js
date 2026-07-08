const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dùng Multer lưu file tạm trên memory (RAM) để nén xong mới upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Giới hạn ảnh 15MB cho điện thoại đời mới
});

// API Upload Ảnh
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Chưa chọn file ảnh' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
      return res.status(500).json({ success: false, error: 'Chưa cấu hình API Cloudinary ở Server' });
    }

    const isPostImage = req.query.type === 'post';
    const cloudinaryOptions = isPostImage 
      ? {
          folder: "classifieds-forum/posts", // Lưu riêng thư mục cho gọn
          format: "webp",
          quality: "auto",
          width: 1200, 
          height: 1200, 
          crop: "limit", // Giữ nguyên tỷ lệ ảnh, chỉ thu nhỏ nếu vượt quá 1200px
        }
      : {
          folder: "classifieds-forum", // Thư mục avatar cũ
          format: "webp",
          quality: "auto",
          width: 800,
          height: 800, 
          crop: "fill", // Cắt vuông 1:1 cho avatar
          gravity: "auto"
        };

    // Upload stream trực tiếp lên Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      cloudinaryOptions,
      (error, result) => {
        if (error) {
          console.error("Lỗi upload Cloudinary:", error);
          return res.status(500).json({ success: false, error: 'Lỗi khi upload ảnh' });
        }
        res.json({ success: true, url: result.secure_url });
      }
    );

    // Gửi buffer từ Multer sang stream của Cloudinary
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

module.exports = router;
