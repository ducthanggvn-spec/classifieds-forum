"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactionButton from "@/components/ReactionButton";
import BBCodeRenderer from "@/components/BBCodeRenderer";
import SendMessageModal from "@/components/SendMessageModal";

const EMOJIS = ["😀","😂","😍","😡","😎","😭","🤔","👍","👎","❤️","🔥","🎉","✨","👀","🙏", "🤬", "🤮", "🤡", "👽", "💩"];

export default function CommentSection({
  postId,
  citySlug,
  comments,
  postTitle,
  postOwnerId, // ID của chủ bài viết (user.id trong DB)
  postOwnerSupabaseUid,
  currentUser, // Thông tin user hiện tại (Supabase User)
  currentUserDbId, // ID của user hiện tại trong bảng User (nếu có)
  currentUserSupabaseUid,
  postLastBumpedAt, // Thời gian đẩy bài cuối
  isArchived // Bài viết đã bị đóng?
}: {
  postId: number;
  citySlug: string;
  comments: any[];
  postTitle: string;
  postOwnerId: number; // DB ID
  postOwnerSupabaseUid: string;
  currentUser: any;
  currentUserDbId?: number | string;
  currentUserSupabaseUid?: string;
  postLastBumpedAt?: string;
  isArchived?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cooldownText, setCooldownText] = useState<string | null>(null);
  const [successCountdown, setSuccessCountdown] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!postLastBumpedAt) return;
    
    const BUMP_COOLDOWN_MS = 2 * 60 * 60 * 1000;
    
    const calculateCooldown = () => {
      const now = new Date().getTime();
      const lastBump = new Date(postLastBumpedAt).getTime();
      const timePassed = now - lastBump;

      if (timePassed < BUMP_COOLDOWN_MS) {
        const timeRemaining = BUMP_COOLDOWN_MS - timePassed;
        const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
        setCooldownText(`Khóa đẩy bài: Còn ${hours > 0 ? hours + 'h ' : ''}${minutes}m`);
      } else {
        setCooldownText(null);
      }
    };

    calculateCooldown();
    const interval = setInterval(calculateCooldown, 60000); // Cập nhật mỗi phút
    return () => clearInterval(interval);
  }, [postLastBumpedAt]);

  const insertBBCode = (tag: string) => {
    setContent((prev) => `${prev}[${tag}][/${tag}]`);
  };

  const handleQuote = (nickname: string, originalContent: string) => {
    const quoteText = `[quote=${nickname}]\n${originalContent}\n[/quote]\n`;
    setContent((prev) => prev + quoteText);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReport = () => {
    alert("Tính năng báo cáo vi phạm đang được xây dựng.");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input để chọn lại file cùng tên nếu cần
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Kiểm tra định dạng và kích thước cơ bản
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
        // Chèn link ảnh vào form
        const bbcodeImage = `\n[img]${data.url}[/img]\n`;
        setContent((prev) => prev + bbcodeImage);
      } else {
        alert("Upload lỗi: " + (data.error || "Không thể tải lên máy chủ"));
      }
    } catch (err) {
      alert("Lỗi kết nối khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBump = async () => {
    if (!currentUser || cooldownText) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/posts/bump/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabaseUid: currentUserSupabaseUid })
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã đẩy bài (Up Top) thành công!");
        router.refresh();
      } else {
        alert(data.error || "Lỗi khi đẩy bài");
      }
    } catch (err) {
      alert("Lỗi kết nối khi đẩy bài");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content,
          supabaseUid: currentUserSupabaseUid
        })
      });

      const data = await res.json();
      if (data.success) {
        setContent("");
        let timeLeft = 3;
        setSuccessCountdown(timeLeft);
        const timer = setInterval(() => {
          timeLeft -= 1;
          if (timeLeft <= 0) {
            clearInterval(timer);
            setSuccessCountdown(null);
            router.refresh(); // Tải lại trang để hiện bình luận mới
          } else {
            setSuccessCountdown(timeLeft);
          }
        }, 1000);
      } else {
        setError(data.error || "Có lỗi xảy ra khi gửi bình luận.");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {successCountdown !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-primary p-8 rounded-lg shadow-xl text-center max-w-md w-full animate-bounce">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">Phản hồi thành công!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Bình luận của bạn đã được đăng tải.
            </p>
            <div className="mt-6 text-sm font-bold text-accent">
              Tải lại trang sau {successCountdown} giây...
            </div>
          </div>
        </div>
      )}
      {/* Nút chức năng riêng của chủ topic */}
      {currentUserSupabaseUid === postOwnerSupabaseUid && (
        <div className="flex justify-start">
          <button 
            onClick={handleBump}
            disabled={!!cooldownText}
            className={`${cooldownText ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded font-bold shadow transition-colors flex items-center gap-2`}
          >
            {cooldownText ? `⏳ ${cooldownText}` : '⬆️ Đẩy bài lên đầu (Up Top)'}
          </button>
        </div>
      )}

      {/* Danh sách bình luận */}
      {comments.map((comment, index) => (
        <div key={comment.id} className="bg-white dark:bg-primary shadow-sm border border-border overflow-hidden rounded-sm">
          <div className="flex flex-col md:flex-row min-h-[200px]">
            {/* Cột User */}
            <div className="w-full md:w-[150px] shrink-0 bg-[#e8ebf0] dark:bg-muted/10 p-3 border-b md:border-b-0 md:border-r border-[#d8dce6] flex flex-col items-center">
              <Link href={`/user/${comment.user.nickname}`} className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold text-gray-400 mb-2 border border-gray-300 shadow-sm hover:opacity-80 transition-all">
                {comment.user.avatarUrl ? (
                  <img src={comment.user.avatarUrl} alt={comment.user.nickname} className="w-full h-full object-cover" />
                ) : (
                  comment.user.nickname.charAt(0).toUpperCase()
                )}
              </Link>
              <Link href={`/user/${comment.user.nickname}`} className="font-bold text-sm text-[#1e4471] dark:text-blue-400 hover:underline text-center break-words w-full mb-1">
                {comment.user.nickname}
              </Link>
                <div className="flex flex-col gap-1 w-full px-2 mb-3">
                  {comment.user.role === 'admin' ? (
                    <div className="text-[11px] text-red-700 bg-red-100 border border-red-300 rounded-sm py-1 text-center w-full font-bold shadow-sm uppercase">
                      ADMIN
                    </div>
                  ) : comment.user.role === 'mod' ? (
                    <div className="text-[11px] text-green-700 bg-green-100 border border-green-300 rounded-sm py-1 text-center w-full font-bold shadow-sm uppercase">
                      MODERATOR
                    </div>
                  ) : comment.user.postCount > 100 ? (
                    <div className="text-[10px] text-[#c0392b] bg-[#f9e9e8] border border-[#e6b3b0] rounded-sm py-0.5 text-center w-full font-bold">
                      Senior Member
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-600 bg-gray-200 border border-gray-300 rounded-sm py-0.5 text-center w-full font-bold">
                      Lính mới
                    </div>
                  )}
                </div>
            </div>

            {/* Cột Nội dung */}
            <div className="p-4 flex-1 min-w-0 flex flex-col relative bg-white dark:bg-primary">
              {/* Comment Header */}
              <div className="flex justify-between items-center text-[11px] text-gray-500 mb-4 pb-2 border-b border-gray-100">
                <span>{new Date(comment.createdAt).toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <div className="font-bold">#{index + 2}</div>
              </div>
              
              {/* Comment Body */}
              <div className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                <BBCodeRenderer content={comment.content} />
              </div>
              
              {/* Chữ ký user */}
              {comment.user.signature && (
                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-[11px] text-gray-400 italic whitespace-pre-wrap">
                  {comment.user.signature}
                </div>
              )}

              {/* ActionBar cho Comment */}
              <div className="flex justify-between items-center text-[11px] text-[#245992] font-medium mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <button className="hover:underline text-gray-500" onClick={handleReport}>Report</button>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <ReactionButton 
                    targetType="comment" 
                    targetId={comment.id} 
                    currentUserSupabaseUid={currentUserSupabaseUid} 
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.href}#comment-${comment.id}`);
                      alert("Đã copy đường dẫn bình luận!");
                    }}
                    className="hover:bg-gray-100 dark:hover:bg-muted/50 px-2 py-1 rounded transition-colors flex items-center gap-1 text-gray-500 dark:text-gray-400"
                  >
                    <span className="text-sm">🔗</span> <span className="text-xs font-bold">Share</span>
                  </button>
                  {currentUserSupabaseUid !== comment.user.supabaseUid && (
                    <button 
                      onClick={() => setMessageRecipient(comment.user.nickname)}
                      className="hover:bg-gray-100 dark:hover:bg-muted/50 px-2 py-1 rounded transition-colors flex items-center gap-1 text-gray-500 dark:text-gray-400"
                    >
                      <span className="text-sm">✉️</span> <span className="text-xs font-bold">Nhắn tin</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleQuote(comment.user.nickname || 'Unknown', comment.content)}
                    className="hover:bg-gray-100 dark:hover:bg-muted/50 px-2 py-1 rounded transition-colors flex items-center gap-1 text-gray-500 dark:text-gray-400"
                  >
                    <span className="text-sm">💬</span> <span className="text-xs font-bold">Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Form Bình luận (Quick Reply) */}
      {!isArchived && (
        <div className="bg-[#f5f8fa] dark:bg-primary shadow-sm border border-border mt-6 rounded-[3px] overflow-hidden flex flex-col md:flex-row">
          {currentUser ? (
            <>
              {/* Cột User (Avatar) bên trái */}
              <div className="hidden md:flex w-[150px] shrink-0 bg-[#e8ebf0] dark:bg-muted/10 p-4 flex-col items-center border-r border-[#d8dce6] dark:border-border">
                <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-400 border border-gray-300 shadow-sm">
                  {(currentUser.avatarUrl || currentUser.user_metadata?.avatar_url) ? (
                    <img src={currentUser.avatarUrl || currentUser.user_metadata?.avatar_url} alt="User avatar" className="w-full h-full object-cover" />
                  ) : (
                    (currentUser.nickname || currentUser.user_metadata?.nickname || currentUser.email || '?').charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              {/* Cột Khung soạn thảo bên phải */}
              <div className="flex-1 min-w-0 p-3 sm:p-4">
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col h-full">
                  {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded mb-3">{error}</div>}
                  
                  {/* Editor Box */}
                  <div className="bg-white dark:bg-primary border border-[#c0c0c0] dark:border-gray-600 rounded-[3px] overflow-hidden flex flex-col shadow-sm">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 bg-[#f5f5f5] dark:bg-muted/50 p-1.5 border-b border-[#ececec] dark:border-gray-600">
                      <button type="button" onClick={() => insertBBCode('b')} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-muted rounded font-bold text-gray-700 dark:text-gray-300 text-sm">B</button>
                      <button type="button" onClick={() => insertBBCode('i')} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-muted rounded italic font-serif text-gray-700 dark:text-gray-300 text-sm">I</button>
                      <button type="button" onClick={() => insertBBCode('u')} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-muted rounded underline text-gray-700 dark:text-gray-300 text-sm">U</button>
                      
                      <span className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></span>
                      
                      <button type="button" onClick={() => insertBBCode('align=center')} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-muted rounded text-gray-700 dark:text-gray-300 text-sm" title="Căn giữa">≡</button>
                      <button type="button" onClick={() => insertBBCode('quote')} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-muted rounded text-gray-700 dark:text-gray-300 text-[10px]" title="Trích dẫn">""</button>
                      
                      {/* Nút Upload ảnh mới */}
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
                        className="flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-muted rounded px-2 py-1 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors disabled:opacity-50" 
                        title="Tải ảnh lên"
                      >
                        📷 {isUploading ? "..." : "Ảnh"}
                      </button>
                    </div>
                    
                    {/* Textarea */}
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                      className="w-full p-3 focus:outline-none dark:bg-primary dark:text-white font-mono text-[13px] resize-y min-h-[100px]"
                      placeholder="Write your reply..."
                      required
                    />

                    {/* Footer của Editor */}
                    <div className="bg-[#f5f5f5] dark:bg-muted/50 p-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#245992] hover:bg-[#1a4370] text-white px-4 py-1.5 rounded-[3px] font-bold shadow-sm transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {isSubmitting ? "Đang gửi..." : "Post reply"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-gray-500 mb-4">Bạn cần đăng nhập để có thể tham gia thảo luận.</p>
              <Link href="/login" className="bg-accent hover:bg-yellow-600 text-white px-6 py-2 rounded font-bold shadow transition-colors">
                Đăng nhập ngay
              </Link>
            </div>
          )}
        </div>
      )}

      {messageRecipient && (
        <SendMessageModal 
          recipientNickname={messageRecipient} 
          currentUserSupabaseUid={currentUserSupabaseUid} 
          onClose={() => setMessageRecipient(null)} 
        />
      )}
    </div>
  );
}
