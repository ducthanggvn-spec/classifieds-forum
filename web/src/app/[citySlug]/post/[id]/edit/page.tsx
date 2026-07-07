"use client";

import Link from "next/link";
import { useState, use, useEffect, useRef } from "react";
import { editPost } from "./actions";
import { useRouter } from "next/navigation";

const EMOJIS = ["😀","😂","😍","😡","😎","😭","🤔","👍","👎","❤️","🔥","🎉","✨","👀","🙏", "🤬", "🤮", "🤡", "👽", "💩"];

export default function EditPostPage({ params }: { params: Promise<{ citySlug: string, id: string }> }) {
  const { citySlug, id: postId } = use(params);
  const router = useRouter();
  
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [postType, setPostType] = useState("sell");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch post data
    const fetchPost = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");
        const res = await fetch(`${API_URL}/posts/${postId}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          setTitle(data.data.title);
          setContent(data.data.description);
          setPostType(data.data.listingType);
        } else {
          setError("Không thể tải thông tin bài viết");
        }
      } catch (err) {
        setError("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const insertBBCode = (tag: string) => {
    setContent((prev) => `${prev}[${tag}][/${tag}]`);
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
    if (file.size > 15 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 15MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");
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

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    setError(null);
    formData.append("citySlug", citySlug);
    formData.append("postId", postId);
    formData.append("content", content); // TextArea value
    
    const result = await editPost(formData);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    } else if (result?.success) {
      let timeLeft = 1;
      setSuccessCountdown(timeLeft);
      const timer = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          clearInterval(timer);
          router.push(`/${citySlug}/post/${postId}`);
        } else {
          setSuccessCountdown(timeLeft);
        }
      }, 1000);
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải dữ liệu bài viết...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      {successCountdown !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/90 dark:bg-primary/90 backdrop-blur-md p-6 rounded-lg shadow-xl text-center max-w-sm w-[90%] animate-bounce border border-white/20">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">Sửa bài thành công!</h2>
            <div className="mt-6 text-sm font-bold text-accent">
              Sẽ chuyển hướng sau {successCountdown} giây...
            </div>
          </div>
        </div>
      )}
      
      <div className="border-b border-border mb-6 pb-4">
        <h1 className="text-2xl font-bold text-primary dark:text-white">Chỉnh sửa bài viết</h1>
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="postType" value="sell" checked={postType === 'sell'} onChange={() => setPostType('sell')} className="text-accent focus:ring-accent" />
              <span className="text-sm dark:text-gray-300">Cần Bán</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="postType" value="buy" checked={postType === 'buy'} onChange={() => setPostType('buy')} className="text-accent focus:ring-accent" />
              <span className="text-sm dark:text-gray-300">Cần Mua</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="postType" value="general" checked={postType === 'general'} onChange={() => setPostType('general')} className="text-gray-500" />
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-primary dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-primary dark:text-white mb-2">
            Nội dung chi tiết (Hỗ trợ BBCode)
          </label>
          
          <div className="flex flex-col gap-2 bg-gray-50 dark:bg-primary/50 p-3 border border-b-0 border-border rounded-t">
            <div className="flex flex-wrap items-center gap-2">
              <select onChange={(e) => {if(e.target.value) insertBBCode(`size=${e.target.value}`); e.target.value='';}} className="bg-white dark:bg-muted border border-border rounded px-2 py-1 text-sm focus:outline-none cursor-pointer">
                <option value="">Cỡ chữ</option>
                <option value="1">Rất nhỏ (1)</option>
                <option value="2">Nhỏ (2)</option>
                <option value="3">Vừa (3)</option>
                <option value="4">Lớn (4)</option>
              </select>
              <select onChange={(e) => {if(e.target.value) insertBBCode(`color=${e.target.value}`); e.target.value='';}} className="bg-white dark:bg-muted border border-border rounded px-2 py-1 text-sm focus:outline-none cursor-pointer">
                <option value="">Màu chữ</option>
                <option value="red" className="text-red-600">Đỏ</option>
                <option value="blue" className="text-blue-600">Xanh</option>
                <option value="green" className="text-green-600">Xanh lá</option>
              </select>
              <span className="w-px h-5 bg-border mx-1"></span>
              <button type="button" onClick={() => insertBBCode('align=center')} className="px-2 py-1 bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm" title="Căn giữa">Giữa</button>
            </div>
            
            <div className="flex flex-wrap items-center gap-1">
              <button type="button" onClick={() => insertBBCode('b')} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 font-bold text-sm">B</button>
              <button type="button" onClick={() => insertBBCode('i')} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 italic font-serif text-sm">I</button>
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
              <span className="w-px h-5 bg-border mx-1"></span>
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  className="px-3 h-8 flex items-center justify-center bg-white dark:bg-muted border border-border rounded hover:bg-gray-100 text-sm gap-1"
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
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-b focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-primary dark:text-white font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent hover:bg-yellow-700 text-white font-bold py-2 px-8 rounded transition-colors disabled:opacity-50"
          >
            {submitting ? "Đang lưu..." : "Lưu Thay Đổi"}
          </button>
          <Link href={`/${citySlug}/post/${postId}`} className="text-gray-500 hover:text-primary transition-colors font-medium">
            Hủy bỏ
          </Link>
        </div>
      </form>
    </div>
  );
}
