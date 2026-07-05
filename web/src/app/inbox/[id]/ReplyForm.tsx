"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplyForm({ conversationId, currentUserSupabaseUid }: { conversationId: string, currentUserSupabaseUid: string }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");
      const res = await fetch(`${API_URL}/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUid: currentUserSupabaseUid,
          content
        })
      });

      const data = await res.json();
      if (data.success) {
        setContent("");
        router.refresh();
      } else {
        alert(data.error || "Có lỗi xảy ra khi gửi tin nhắn.");
      }
    } catch (err) {
      alert("Lỗi kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertBBCode = (tag: string) => setContent((prev) => `${prev}[${tag}][/${tag}]`);

  return (
    <div className="bg-white dark:bg-primary border border-border rounded-sm overflow-hidden">
      <div className="bg-gray-100 dark:bg-muted p-2 font-bold text-sm border-b border-border text-gray-700 dark:text-gray-300">
        Gửi tin nhắn trả lời
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-1 bg-[#f5f5f5] dark:bg-muted/50 p-1.5 border-b border-[#ececec] dark:border-gray-600">
          <button type="button" onClick={() => insertBBCode('b')} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded font-bold text-sm">B</button>
          <button type="button" onClick={() => insertBBCode('i')} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded italic text-sm">I</button>
          <button type="button" onClick={() => insertBBCode('u')} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded underline text-sm">U</button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full p-3 focus:outline-none dark:bg-primary dark:text-white text-sm resize-y min-h-[80px]"
          placeholder="Nhập nội dung tin nhắn..."
          required
        />
        <div className="bg-gray-50 dark:bg-muted/50 p-2 flex justify-end border-t border-border">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="bg-[#245992] hover:bg-[#1a4370] text-white px-4 py-1.5 rounded-[3px] font-bold text-sm disabled:opacity-50"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi tin"}
          </button>
        </div>
      </form>
    </div>
  );
}
