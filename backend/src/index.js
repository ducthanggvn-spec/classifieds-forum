const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const rateLimit = require('express-rate-limit');
const PORT = process.env.PORT || 5000;

// Chống Spam: Giới hạn mỗi IP tối đa 300 request mỗi 15 phút
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  message: { error: 'Bạn thao tác quá nhanh, vui lòng chờ một lát.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter); // Áp dụng cho tất cả API

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logger

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/reactions', require('./routes/reactions'));
app.use('/api/bookmarks', require('./routes/bookmarks'));

// Xử lý lỗi chung Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Classifieds Forum API' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
