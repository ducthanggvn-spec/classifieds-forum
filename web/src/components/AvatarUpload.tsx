"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AvatarUpload({ userId, currentAvatar, nickname }: { userId: string, currentAvatar?: string | null, nickname: string }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh đại diện không được vượt quá 5MB.");
      return;
    }

    // Hiển thị preview ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Bắt đầu upload
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", userId);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");
      const res = await fetch(`${API_URL}/users/avatar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Lỗi tải ảnh lên");
      }

      // Xóa preview tạm và tải lại trang để thấy ảnh thật
      router.refresh();
    } catch (error) {
      alert("Đã có lỗi xảy ra khi tải ảnh. Vui lòng thử lại!");
      setPreview(currentAvatar); // Khôi phục ảnh cũ nếu lỗi
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gray-100 flex items-center justify-center group">
        {preview ? (
          <img src={preview} alt={nickname} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl text-gray-400 font-bold">{nickname?.charAt(0).toUpperCase()}</span>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold animate-pulse">Đang tải...</span>
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      
      <button 
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        Đổi Ảnh Đại Diện
      </button>
    </div>
  );
}
