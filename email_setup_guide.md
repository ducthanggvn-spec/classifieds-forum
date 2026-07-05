# Hướng Dẫn Cấu Hình Email Supabase (Tiếng Việt)

Để diễn đàn trông chuyên nghiệp hơn khi có người dùng mới đăng ký, bạn cần cấu hình lại mẫu (template) Email của Supabase. Mẫu mặc định của Supabase bằng Tiếng Anh và khá sơ sài.

Dưới đây là các bước thao tác trên Supabase Dashboard:

## Bước 1: Mở Supabase Dashboard
1. Truy cập vào tài khoản Supabase của bạn tại `https://supabase.com/dashboard/projects`
2. Chọn dự án `classifieds-forum` (hoặc tên dự án bạn đã đặt).

## Bước 2: Thiết lập Tên và Địa chỉ gửi (SMTP) - Tuỳ chọn nhưng khuyến nghị
*Lưu ý: Mặc định Supabase cho phép gửi 3-4 email/giờ qua server test của họ. Khi chạy thật (Production), bạn cần kết nối SMTP (ví dụ Resend, Sendgrid, hoặc Gmail).*
1. Ở Menu bên trái, chọn **Authentication** > **Providers** > **Email**.
2. Kéo xuống phần **SMTP Provider**, bật nó lên và điền thông tin SMTP của bạn.

## Bước 3: Thay đổi Mẫu Email Đăng Ký (Confirm signup)
1. Ở Menu bên trái, chọn **Authentication** > **Email Templates**.
2. Chọn tab **Confirm signup**.
3. **Subject**: Điền `Xác nhận đăng ký tài khoản Diễn đàn TTVNOL`
4. **Source (HTML)**: Bật chế độ `Source (HTML)` và **Copy-Paste toàn bộ đoạn code dưới đây** vào:

```html
<!DOCTYPE html>
<html>
<body style="background-color:#f4f4f5;font-family:Arial,sans-serif;padding:20px;">
  <div style="max-w-2xl;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background-color:#245992;padding:20px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">Chào mừng đến với TTVNOL!</h1>
    </div>
    <div style="padding:30px;color:#374151;font-size:16px;line-height:1.6;">
      <p>Chào bạn,</p>
      <p>Cảm ơn bạn đã tham gia cộng đồng Mua Bán, Rao Vặt lớn nhất khu vực! Để bắt đầu bình luận và giao thương, vui lòng xác nhận địa chỉ email của bạn bằng cách nhấn vào nút dưới đây:</p>
      
      <div style="text-align:center;margin:30px 0;">
        <a href="{{ .ConfirmationURL }}" style="background-color:#ea580c;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:bold;display:inline-block;">Xác Nhận Email Ngay</a>
      </div>
      
      <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
      <p style="font-size:13px;color:#6b7280;">Trân trọng,<br>Ban Quản Trị TTVNOL</p>
    </div>
  </div>
</body>
</html>
```

5. Nhấn nút **Save** ở góc dưới.

## Bước 4: Chỉnh sửa Site URL (Cực kỳ quan trọng khi đem lên mạng)
1. Chuyển sang phần **URL Configuration** (Authentication > URL Configuration).
2. **Site URL**: Sửa `http://localhost:3000` thành Tên miền thật của bạn (ví dụ: `https://ttvnol-muaban.com`).
3. Điều này đảm bảo khi user bấm vào nút "Xác nhận", họ sẽ được dẫn về đúng trang web thật thay vì bị lỗi localhost.

---
*Chúc bạn vận hành diễn đàn thành công!*
