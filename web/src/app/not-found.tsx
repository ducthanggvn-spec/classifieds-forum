import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto my-16 bg-white dark:bg-primary shadow-sm border border-border rounded overflow-hidden">
      <div className="bg-[#245992] text-white font-bold p-3 text-lg border-b-4 border-accent flex items-center gap-2">
        <span className="text-xl">⚠️</span> TTVNOL - Lỗi Hệ Thống
      </div>
      
      <div className="p-8 text-center space-y-6">
        <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-2">404 - KHÔNG TÌM THẤY</h2>
        
        <div className="text-gray-600 dark:text-gray-400 text-[15px] space-y-2">
          <p>Rất tiếc, "thớt" hoặc khu vực mà bạn đang tìm kiếm đã bị bế đi hoặc không hề tồn tại trên hệ thống.</p>
          <p>Có thể bài viết đã vi phạm nội quy và bị Mod xóa, hoặc bạn gõ sai đường dẫn.</p>
        </div>

        <div className="bg-gray-100 dark:bg-muted p-4 rounded text-sm text-gray-500 italic border border-gray-200 dark:border-gray-700 mt-6 inline-block">
          "Đừng buồn, ngoài kia còn hàng vạn món đồ ngon bổ rẻ đang chờ bạn săn!"
        </div>

        <div className="pt-6">
          <Link 
            href="/" 
            className="inline-block bg-[#245992] hover:bg-[#1e4471] text-white font-bold py-2 px-6 rounded shadow transition-colors"
          >
            &laquo; Quay Lại Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
