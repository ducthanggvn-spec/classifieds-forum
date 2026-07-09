"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch as fetch } from '@/utils/authFetch';

interface SendMessageModalProps {
  recipientNickname: string;
  currentUserSupabaseUid?: string;
  onClose: () => void;
}

export default function SendMessageModal({ recipientNickname, currentUserSupabaseUid, onClose }: SendMessageModalProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserSupabaseUid) {
      alert("Bạn cần đăng nhập để gửi tin nhắn.");
      router.push('/login');
      return;
    }
    if (!content.trim() || !subject.trim()) return;

    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
      const res = await fetch(`${API_URL}/messages/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientNickname,
          subject,
          content
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Đã gửi tin nhắn thành công!");
        onClose();
        // Option: router.push(`/inbox/${data.conversationId}`);
      } else {
        alert(data.error || "Có lỗi xảy ra khi gửi tin nhắn.");
      }
    } catch (err) {
      alert("Lỗi kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-primary w-full max-w-lg rounded-sm shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#245992] text-white p-3 font-bold flex justify-between items-center">
          <span>Gửi tin nhắn cho {recipientNickname}</span>
          <button onClick={onClose} className="hover:text-red-300 text-lg">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tiêu đề</label>
            <input 
              type="text" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#245992] dark:bg-muted dark:text-white"
              required
              placeholder="VD: Hỏi mua món đồ của bạn"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nội dung</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#245992] dark:bg-muted dark:text-white resize-y min-h-[120px]"
              required
              placeholder="Nội dung tin nhắn..."
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#245992] text-white rounded text-sm font-bold hover:bg-[#1a4370] transition-colors disabled:opacity-50">
              {isSubmitting ? "Đang gửi..." : "Gửi tin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
