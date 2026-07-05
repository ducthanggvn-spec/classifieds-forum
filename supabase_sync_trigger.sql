-- Xóa trigger và function cũ nếu có để tránh lỗi khi chạy lại
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Tạo Function (Hàm) xử lý dữ liệu tự động
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert 1 dòng mới vào bảng User của public (Prisma)
  -- Lấy uid từ Supabase auth, lấy tên mặc định từ phần đầu của email, lấy năm sinh, lấy nickname
  INSERT INTO public."User" ("supabaseUid", "email", "fullName", "nickname", "role", "postCount", "birthYear", "createdAt")
  VALUES (
    NEW.id::text, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1) || FLOOR(RANDOM() * 1000)::text), 
    'user', -- Mặc định là user bình thường
    0,      -- Lính mới chưa có bài viết nào
    NULLIF(NEW.raw_user_meta_data->>'birth_year', '')::integer, -- Lấy năm sinh từ meta_data
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo Trigger lắng nghe mỗi khi có user mới đăng ký
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
