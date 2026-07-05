"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface MarkAsDoneButtonProps {
  postId: number;
  currentUserUid: string;
}

export default function MarkAsDoneButton({ postId, currentUserUid }: MarkAsDoneButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkAsDone = async () => {
    if (!confirm("Bạn có chắc chắn đã giao dịch thành công và muốn ĐÓNG bài viết này? (Không thể mở lại)")) {
      return;
    }

    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/done`, {
        method: "PUT",
        headers: {
          "x-supabase-uid": currentUserUid,
        },
      });

      const data = await res.json();
      if (data.success) {
        alert("Đã đóng bài viết thành công!");
        router.refresh(); // Tải lại trang để cập nhật giao diện
      } else {
        alert("Lỗi: " + data.error);
        setLoading(false);
      }
    } catch (err) {
      alert("Lỗi kết nối");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleMarkAsDone}
      disabled={loading}
      className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 py-1 px-2 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
      title="Đóng bài viết (Đã giao dịch xong)"
    >
      <span>🤝</span> {loading ? "Đang xử lý..." : "Đã giao dịch"}
    </button>
  );
}
