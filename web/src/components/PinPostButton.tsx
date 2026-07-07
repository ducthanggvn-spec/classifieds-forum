"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PinPostButtonProps {
  postId: number;
  isPinned: boolean;
  currentUser: any;
  citySlug: string;
  iconOnly?: boolean;
}

export default function PinPostButton({ postId, isPinned, currentUser, citySlug, iconOnly }: PinPostButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Chỉ Admin mới thấy nút này
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleTogglePin = async () => {
    if (!confirm(isPinned ? "Bạn có chắc muốn bỏ ghim bài viết này?" : "Bạn có chắc muốn ghim bài viết này lên đầu trang?")) return;

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");
      const res = await fetch(`${API_URL}/admin/posts/${postId}/pin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-supabase-uid": currentUser.supabaseUid,
        },
        body: JSON.stringify({ isPinned: !isPinned }),
      });

      const data = await res.json();
      if (data.success) {
        alert(isPinned ? "Đã bỏ ghim bài viết!" : "Đã ghim bài viết thành công!");
        window.location.reload(); // Force reload để cập nhật danh sách
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (err) {
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleTogglePin}
      disabled={loading}
      className={`flex items-center gap-1 transition-colors ${
        isPinned 
          ? "text-amber-600 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400 font-medium" 
          : "text-gray-500 hover:text-amber-600 dark:hover:text-amber-500"
      }`}
      title={isPinned ? "Bỏ ghim" : "Ghim bài"}
    >
      <span className="text-lg">{loading ? "..." : "📌"}</span>
      {!iconOnly && <span className="hover:underline">{isPinned ? "Bỏ ghim" : "Ghim bài"}</span>}
    </button>
  );
}
