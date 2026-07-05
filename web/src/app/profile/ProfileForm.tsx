"use client";

import { useState } from "react";
import { updateProfile } from "./actions";

export default function ProfileForm({ dbUser }: { dbUser: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateProfile(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Tắt thông báo sau 3 giây
    }
    setLoading(false);
  };

  return (
    <form action={handleSubmit} className="space-y-4 max-w-lg">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded border border-red-200 text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 rounded border border-green-200 text-sm flex items-center gap-2">✅ Cập nhật hồ sơ thành công!</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email (Không thể đổi)
        </label>
        <input type="email" readOnly value={dbUser.email} className="w-full px-3 py-2 bg-gray-100 dark:bg-muted border border-border rounded text-gray-500 cursor-not-allowed" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Họ tên thật
        </label>
        <input type="text" name="fullName" defaultValue={dbUser.fullName} className="w-full px-3 py-2 border border-border rounded dark:bg-muted dark:text-white focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Năm sinh
        </label>
        <input type="number" name="birthYear" defaultValue={dbUser.birthYear || ""} className="w-full px-3 py-2 border border-border rounded dark:bg-muted dark:text-white focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Số điện thoại
        </label>
        <input type="tel" name="phone" defaultValue={dbUser.phone || ""} className="w-full px-3 py-2 border border-border rounded dark:bg-muted dark:text-white focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Chữ ký cá nhân
        </label>
        <textarea 
          name="signature" 
          defaultValue={dbUser.signature || ""} 
          rows={3}
          placeholder="Ví dụ: -- TTVNOL Classic Member --"
          className="w-full px-3 py-2 border border-border rounded dark:bg-muted dark:text-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">Chữ ký sẽ tự động hiển thị bên dưới mỗi bài viết và bình luận của bạn.</p>
      </div>
      <button type="submit" disabled={loading} className="px-6 py-2 bg-accent text-accent-foreground font-bold rounded hover:opacity-90 disabled:opacity-50 transition-opacity">
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
