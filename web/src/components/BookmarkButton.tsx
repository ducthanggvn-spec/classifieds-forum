"use client";

import { useState, useEffect } from "react";

export default function BookmarkButton({ postId, currentUserSupabaseUid }: { postId: number, currentUserSupabaseUid?: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");

  useEffect(() => {
    if (!currentUserSupabaseUid) return;
    
    const checkBookmark = async () => {
      try {
        const res = await fetch(`${API_URL}/bookmarks/check?supabaseUid=${currentUserSupabaseUid}&postId=${postId}`);
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(data.bookmarked);
        }
      } catch (e) {
        console.error("Lỗi kiểm tra bookmark", e);
      }
    };
    checkBookmark();
  }, [postId, currentUserSupabaseUid]);

  const toggleBookmark = async () => {
    if (!currentUserSupabaseUid) {
      alert("Bạn cần đăng nhập để lưu bài viết!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabaseUid: currentUserSupabaseUid, postId })
      });
      const data = await res.json();
      if (data.success) {
        setIsBookmarked(data.action === 'added');
        alert(data.action === 'added' ? "Đã lưu bài viết vào danh sách yêu thích!" : "Đã bỏ lưu bài viết.");
      }
    } catch (e) {
      alert("Lỗi kết nối.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleBookmark}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded shadow-sm transition-colors ${
        isBookmarked 
          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300" 
          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 dark:bg-muted dark:text-gray-200 dark:border-gray-600 dark:hover:bg-muted/80"
      }`}
      title={isBookmarked ? "Bỏ lưu bài viết" : "Lưu bài viết"}
    >
      <span className="text-sm">{isBookmarked ? "★" : "☆"}</span>
      <span className="hidden sm:inline">{isBookmarked ? "Đã lưu" : "Lưu bài"}</span>
    </button>
  );
}
