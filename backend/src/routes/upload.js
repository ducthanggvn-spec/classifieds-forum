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
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn ảnh 5MB
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

    // Upload stream trực tiếp lên Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "classifieds-forum", // Lưu trong folder này trên Cloudinary
        format: "webp", // Ép định dạng WebP cực nhẹ
        quality: "auto", // Nén tự động
        width: 800, // Thu nhỏ kích thước
        height: 800, 
        crop: "fill", // Cắt thành ảnh vuông (1:1)
        gravity: "auto" // Canh tự động vào trung tâm ảnh
      },
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
