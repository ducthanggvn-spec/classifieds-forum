"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BookmarkedPosts({ userId }: { userId: number }) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tạm thời mock dữ liệu vì Database chưa hoàn tất việc push schema
    setTimeout(() => {
      setBookmarks([
        {
          id: 101,
          post: {
            id: 1,
            title: "Cần bán gấp Laptop Gaming cũ",
            city: { slug: "hai-phong", name: "Hải Phòng" },
            category: { name: "Đồ điện tử" },
            price: 15000000,
            createdAt: new Date().toISOString()
          },
          savedAt: new Date().toISOString()
        },
        {
          id: 102,
          post: {
            id: 2,
            title: "Cho thuê phòng trọ gần đại học Hàng Hải",
            city: { slug: "hai-phong", name: "Hải Phòng" },
            category: { name: "Bất động sản" },
            price: 2000000,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          savedAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
      setIsLoading(false);
    }, 800);
  }, [userId]);

  if (isLoading) {
    return <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>;
  }

  if (bookmarks.length === 0) {
    return <p className="text-gray-500 text-sm">Bạn chưa lưu bài viết nào.</p>;
  }

  const handleRemoveBookmark = (bookmarkId: number) => {
    setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
  };

  return (
    <div className="space-y-4">
      {bookmarks.map((b) => (
        <div key={b.id} className="border border-border rounded p-3 hover:bg-gray-50 dark:hover:bg-muted/50 transition flex justify-between items-start">
          <div>
            <Link href={`/${b.post.city.slug}/post/${b.post.id}`} className="font-medium text-accent hover:underline text-base">
              {b.post.title}
            </Link>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{b.post.category.name}</span>
              <span>• {b.post.city.name}</span>
              {b.post.price && <span className="font-semibold text-red-500">• {b.post.price.toLocaleString("vi-VN")} đ</span>}
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] text-gray-400">Lưu lúc: {new Date(b.savedAt).toLocaleDateString("vi-VN")}</span>
            <button 
              onClick={() => handleRemoveBookmark(b.id)}
              className="text-xs text-red-500 hover:underline mt-2"
            >
              Bỏ lưu
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
