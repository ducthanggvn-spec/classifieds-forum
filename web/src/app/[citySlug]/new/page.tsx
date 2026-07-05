"use client";

import Link from "next/link";
import { useState, use, useRef } from "react";
import { createPost } from "./actions";

import { useRouter, useSearchParams } from "next/navigation";

const validCities = ["ha-noi", "hai-phong", "ho-chi-minh"];
const cityNames: Record<string, string> = {
  "ha-noi": "Thị trường Hà Nội",
  "hai-phong": "Thị trường Hải Phòng",
  "ho-chi-minh": "Thị trường Hồ Chí Minh",
};

const EMOJIS = ["😀","😂","😍","😡","😎","😭","🤔","👍","👎","❤️","🔥","🎉","✨","👀","🙏", "🤬", "🤮", "🤡", "👽", "💩"];

export default function CreatePostPage({ params }: { params: Promise<{ citySlug: string }> }) {
  const { citySlug } = use(params);
  const cityName = cityNames[citySlug] || "Thị trường không xác định";
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertBBCode = (tag: string) => {
    setContent((prev) => `${prev}[${tag}][/${tag}]`);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    formData.append("citySlug", citySlug);
    formData.append("content", content); // TextArea doesn't automatically submit its value properly if overridden sometimes, but better safe.
    if (category === 'food') formData.append("categoryId", "2");
    
    const result = await createPost(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      let timeLeft = 3;
      setSuccessCountdown(timeLeft);
      const timer = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          clearInterval(timer);
          router.push(`/${citySlug}/post/${result.postId}`);
        } else {
          setSuccessCountdown(timeLeft);
        }
      }, 1000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!file.type.startsWith('image/')) {
      alert("Vui lòng chọn file hình ảnh hợp lệ.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setContent((prev) => prev + `\n[img]${data.url}[/img]\n`);
      } else {
        alert("Upload lỗi: " + (data.error || "Không thể tải lên máy chủ"));
      }
    } catch (err) {
      alert("Lỗi kết nối khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      {successCountdown !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-primary p-8 rounded-lg shadow-xl text-center max-w-md w-full animate-bounce">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">Đăng bài thành công!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Bài viết của bạn đã được hệ thống ghi nhận.
            </p>
            <div className="mt-6 text-sm font-bold text-accent">
              Sẽ chuyển hướng sau {successCountdown} giây...
            </div>
          </div>
        </div>
      )}
      <div className="border-b border-border mb-6 pb-4">
        <h1 className="text-2xl font-bold text-primary dark:text-white">Đăng tin mới</h1>
        <p className="text-gray-500 mt-1">
          Khu vực đăng: <span className="font-bold text-accent">{cityName}</span>
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 p-4 rounded text-sm text-yellow-800 dark:text-yellow-200">
        <b>Lưu ý:</b> Bài viết này sẽ <u>chỉ xuất hiện</u> trong <b>{cityName}</b>. Vui lòng đăng đúng khu vực để tránh bị xóa bài.
      </div>

      <form action={handleSubmit} className="space-y-6 bg-white dark:bg-muted p-6 border border-border shadow-sm rounded">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-bold text-primary dark:text-white mb-2">
            Loại tin
          </label>
          <div className="flex items-center gap-6">
            {category === 'food' ? (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="postType" value="eat" defaultChecked className="text-orange-600 focus:ring-orange-600" />
                  <span className="text-sm font-bold text-orange-600">Quán Ăn</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="postType" value="drink" className="text-purple-600 focus:ring-purple-600" />
                  <span className="text-sm font-bold text-purple-600">Quán Uống</span>
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="postType" value="sell" defaultChecked className="text-accent focus:ring-accent" />
                  <span className="text-sm dark:text-gray-300">Cần Bán</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="postType" value="buy" className="text-accent focus:ring-accent" />
                  <span className="text-sm dark:text-gray-300">Cần Mua</span>
                </label>
              </>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="postType" value="general" className="text-gray-500" />
              <span className="font-medium">Thảo luận chung</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-primary dark:text-white mb-2">
            Tiêu đề bài viết
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Ví dụ: Cần bán iPhone 13 Pro Max cũ..."
            className="w-full px-4 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-primary dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-primary dark:text-white mb-2">
            Nội dung chi tiết (Hỗ trợ BBCode)
          </label>
          
          {/* BBCode Toolbar Nâng Cấp */}
          <div className="flex flex-col gap-2 bg-gray-50 dark:bg-primary/50 p-3 border border-b-0 border-border rounded-t">
            {/* Hàng 1: Font, Size, Color */}
            <div className="flex flex-wrap items-center gap-2">
              <select onChange={(e) => {if(e.target.value) insertBBCode(`size=${e.target.value}`); e.target.value='';}} className="bg-white dark:bg-muted border border-border rounded px-2 py-1 text-sm focus:outline-none cursor-pointer">
                <option value="">Cỡ chữ</option>
                <option value="1">Rất nhỏ (1)</option>
                <option value="2">Nhỏ (2)</option>
                <option value="3">Vừa (3)</option>
                <option value="4">Lớn (4)</option>
                <option value="5">Rất lớn (5)</option>
                <option value="6">Khổng lồ (6)</option>
              </select>
              <select onChange={(e) => {if(e.target.value) insertBBCode(`color=${e.target.value}`); e.target.value='';}} className="bg-white dark:bg-muted border border-border rounded px-2 py-1 text-sm focus:outline-none cursor-pointer">
                <option value="">Màu chữ</option>
                <option value="red" className="text-red-600">Đỏ</option>
                <option value="blue" className="text-blue-600">Xanh dương</option>
                <option value="green" className="text-green-600">Xanh lá</option>
                <option value="orange" className="text-orange-500">Cam</option>
                <option value="purple" className="text-purple-600">Tím</option>
              </select>
              <span className="w-px h-5 bg-border mx-1"></span>
              <button type="button" onClick={() => insertBBCode('align=left')} className="px-2 py-1 bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm" title="Căn trái">Trái</button>
              <button type="button" onClick={() => insertBBCode('align=center')} className="px-2 py-1 bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm" title="Căn giữa">Giữa</button>
              <button type="button" onClick={() => insertBBCode('align=right')} className="px-2 py-1 bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm" title="Căn phải">Phải</button>
            </div>
            
            {/* Hàng 2: Format & Media */}
            <div className="flex flex-wrap items-center gap-1">
              <button type="button" onClick={() => insertBBCode('b')} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 font-bold text-sm">B</button>
              <button type="button" onClick={() => insertBBCode('i')} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 italic font-serif text-sm">I</button>
              <button type="button" onClick={() => insertBBCode('u')} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 underline text-sm">U</button>
              <button type="button" onClick={() => insertBBCode('s')} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 line-through text-sm">S</button>
              <span className="w-px h-5 bg-border mx-1"></span>
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageUpload} 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                className="px-3 h-8 bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm font-medium text-blue-600 flex items-center gap-1 disabled:opacity-50"
              >
                📷 {isUploading ? "Đang tải..." : "Ảnh"}
              </button>
              <button type="button" onClick={() => insertBBCode('youtube')} className="px-3 h-8 bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm font-medium text-red-600 flex items-center gap-1">▶ Video</button>
              <button type="button" onClick={() => insertBBCode('url')} className="px-3 h-8 bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm font-medium text-blue-600 flex items-center gap-1">🔗 Link</button>
              <span className="w-px h-5 bg-border mx-1"></span>
              <button type="button" onClick={() => insertBBCode('quote')} className="px-3 h-8 bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm font-medium text-green-600">"" Trích dẫn</button>
              <button type="button" onClick={() => insertBBCode('code')} className="px-3 h-8 bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm font-mono text-purple-600">&lt;/&gt; Code</button>
              <span className="w-px h-5 bg-border mx-1"></span>
              
              {/* Emoji Picker Dropdown */}
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  className="px-3 h-8 flex items-center justify-center bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm gap-1" 
                  title="Biểu tượng cảm xúc"
                >
                  😀 Emoji
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute top-10 right-0 z-10 w-48 bg-white dark:bg-muted border border-border shadow-lg rounded p-2 grid grid-cols-5 gap-1">
                    {EMOJIS.map(emoji => (
                      <button 
                        key={emoji} 
                        type="button" 
                        onClick={() => { setContent(prev => prev + emoji); setShowEmojiPicker(false); }} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-primary rounded text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <textarea
            name="content"
            required
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="[b]Mô tả sản phẩm:[/b] Máy đẹp 99%..."
            className="w-full px-4 py-3 border border-border rounded-b focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-primary dark:text-white font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-yellow-700 text-white font-bold py-2 px-8 rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Đang đăng..." : "Đăng Bài"}
          </button>
          <Link href={`/${citySlug}`} className="text-gray-500 hover:text-primary transition-colors font-medium">
            Hủy bỏ
          </Link>
        </div>
      </form>
    </div>
  );
}
