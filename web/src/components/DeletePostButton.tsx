"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch as fetch } from '@/utils/authFetch';

interface DeletePostButtonProps {
  postId: number;
  citySlug: string;
  currentUser: any;
  iconOnly?: boolean;
}

export default function DeletePostButton({ postId, citySlug, currentUser, iconOnly }: DeletePostButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Chỉ Admin và Mod mới thấy nút Xóa
  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "mod")) {
    return null;
  }

  const handleDelete = async () => {
    const reason = prompt("Lý do bạn XÓA VĨNH VIỄN bài viết này là gì?\n(Hành động này sẽ được ghi vào Nhật ký quản trị)");
    
    if (reason === null) {
      return; // Người dùng bấm Cancel
    }
    
    if (reason.trim() === "") {
      alert("Bắt buộc phải nhập lý do xóa bài!");
      return;
    }

    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
    try {
      const res = await fetch(`${API_URL}/admin/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-supabase-uid": currentUser.supabaseUid,
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Xóa bài thành công!");
        window.location.href = `/${citySlug}`; // Force reload để cập nhật danh sách
      } else {
        alert("Lỗi: " + data.error);
        setLoading(false);
      }
    } catch (err) {
      alert("Lỗi kết nối khi xóa bài");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className={`text-red-500 hover:text-red-700 font-bold transition-colors disabled:opacity-50 ${iconOnly ? 'text-lg ml-0' : 'ml-2'}`}
      title="Xóa bài viết (Admin/Mod)"
    >
      {loading ? "..." : (iconOnly ? "🗑️" : "Xóa Bài")}
    </button>
  );
}
