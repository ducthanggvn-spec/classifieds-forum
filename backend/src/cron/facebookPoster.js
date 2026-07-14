const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const facebookService = require('../services/facebookService');

const prisma = new PrismaClient();

const formatPostMessage = (post) => {
  const priceDisplay = post.price ? `${new Intl.NumberFormat('vi-VN').format(post.price)} VNĐ` : 'Thương lượng';
  const cityName = post.city?.name ? post.city.name.toUpperCase() : 'TOÀN QUỐC';
  
  // Xóa các thẻ [img]...[/img] ra khỏi nội dung để Facebook nhìn đẹp hơn
  const cleanDescription = post.description.replace(/\[img\].*?\[\/img\]/g, '').trim();
  
  return `📢 [${cityName}] ${post.title}
💰 Giá: ${priceDisplay}
📍 Khu vực: ${post.city?.name || 'Không xác định'}
📂 Danh mục: ${post.category?.name || 'Khác'}

📝 Nội dung:
${cleanDescription}

🔗 Xem chi tiết và liên hệ tại: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/posts/${post.id}`;
};

const startFacebookCronJob = () => {
  // Chạy mỗi 30 phút
  cron.schedule('*/30 * * * *', async () => {
    console.log('🔄 Đang quét các bài viết chưa đăng lên Facebook...');

    if (!process.env.FB_PAGE_ID || !process.env.FB_PAGE_ACCESS_TOKEN) {
      console.log('⚠️ Bỏ qua tự động đăng do chưa cấu hình FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN');
      return;
    }

    try {
      // Tìm tối đa 3 bài viết active nhưng chưa được đăng (isPostedToFb = false)
      const postsToPublish = await prisma.post.findMany({
        where: {
          city: { slug: 'hai-phong' },
          isPostedToFb: false
        },
        include: {
          city: true,
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 4 // Lấy tối đa 4 hình ảnh đầu tiên để tránh lỗi FB nếu gửi quá nhiều
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 1 
      });

      if (postsToPublish.length === 0) {
        console.log('✅ Không có bài viết mới cần đăng.');
        return;
      }

      for (const post of postsToPublish) {
        try {
          const message = formatPostMessage(post);
          
          // Lấy hình ảnh từ bảng images
          let imageUrls = post.images.map(img => img.imageUrl);
          
          // Trích xuất thêm hình ảnh từ thẻ [img] trong nội dung bài viết
          const imgRegex = /\[img\](.*?)\[\/img\]/g;
          let match;
          while ((match = imgRegex.exec(post.description)) !== null) {
            if (!imageUrls.includes(match[1])) {
              imageUrls.push(match[1]);
            }
          }
          
          // Lấy tối đa 4 hình để tránh lỗi FB
          imageUrls = imageUrls.slice(0, 4);
          
          console.log(`📤 Đang đăng bài: ${post.title} (Kèm ${imageUrls.length} ảnh)...`);
          
          // Gọi API đăng Facebook
          const fbPostId = await facebookService.createPost(message, imageUrls);
          
          if (fbPostId) {
            // Cập nhật trạng thái bài viết trong DB
            await prisma.post.update({
              where: { id: post.id },
              data: { 
                isPostedToFb: true,
                fbPostId: fbPostId
              }
            });
            console.log(`✅ Đăng thành công: FB Post ID ${fbPostId}`);
          }
        } catch (error) {
          console.error(`❌ Lỗi khi xử lý bài viết ID ${post.id}:`, error.message);
          
          // [CRITICAL FIX] Dù lỗi cũng phải đánh dấu là đã xử lý để tránh kẹt hàng đợi (Queue Stall)
          await prisma.post.update({
            where: { id: post.id },
            data: { 
              isPostedToFb: true,
              fbPostId: 'ERROR_API_REJECTED'
            }
          });
        }
        
        // Nghỉ 5 giây giữa các lần đăng để tránh bị Facebook đánh dấu là spam
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error('❌ Lỗi tiến trình quét bài đăng FB:', error);
    }
  });

  console.log('🕒 Đã kích hoạt Cronjob tự động đăng bài Facebook (chạy mỗi 10 phút)');
};

module.exports = { startFacebookCronJob };
