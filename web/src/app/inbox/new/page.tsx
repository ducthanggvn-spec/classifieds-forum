"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { authFetch as fetch } from '@/utils/authFetch';

export default function NewConversationPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to");
    if (to) setRecipient(to);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !content) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
      const res = await fetch(`${API_URL}/messages/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientNickname: recipient,
          subject,
          content
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo hội thoại");
      }

      router.push(`/inbox/${data.conversationId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="text-xs text-gray-500">
        <Link href="/" className="hover:underline">Trang chủ</Link> &gt; 
        <Link href="/inbox" className="hover:underline ml-1">Hộp thư</Link> &gt; 
        <span className="ml-1">Trò chuyện mới</span>
      </div>

      <h1 className="text-2xl font-bold text-primary dark:text-white">Bắt đầu Trò chuyện Mới</h1>

      <div className="bg-white dark:bg-primary border border-border shadow-sm rounded-sm">
        <div className="bg-secondary text-white text-sm font-bold p-3 border-b border-border">
          Soạn tin nhắn
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 md:text-right">Người nhận:</label>
            <div className="md:col-span-3">
              <input 
                type="text" 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Nhập tên người nhận (nickname)..." 
                className="w-full p-2 border border-border rounded focus:outline-none focus:border-blue-500 dark:bg-muted"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 md:text-right">Tiêu đề:</label>
            <div className="md:col-span-3">
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Tiêu đề cuộc trò chuyện..." 
                className="w-full p-2 border border-border rounded focus:outline-none focus:border-blue-500 dark:bg-muted"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 md:text-right pt-2">Nội dung:</label>
            <div className="md:col-span-3 border border-border rounded-sm overflow-hidden">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Nhập nội dung tin nhắn..."
                className="w-full p-3 focus:outline-none dark:bg-primary min-h-[150px]"
                required
              />
              <div className="bg-gray-50 dark:bg-muted/30 p-2 border-t border-border flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-accent hover:opacity-90 text-white px-6 py-1.5 rounded-sm font-bold shadow-sm disabled:opacity-50"
                >
                  {loading ? "Đang gửi..." : "Bắt đầu trò chuyện"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
