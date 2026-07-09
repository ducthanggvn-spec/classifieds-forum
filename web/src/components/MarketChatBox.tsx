"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { MessageCircle, X, Send, ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";

type User = {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  role: string;
};

type ChatMessage = {
  id?: number;
  cityId?: number;
  userId: number;
  content?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  user?: User;
};

export default function MarketChatBox({ citySlug, currentUser }: { citySlug: string; currentUser: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");

  // Load message history when open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetch(`${API_URL}/markets/${citySlug}/chat`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMessages(data);
            setUnreadCount(0); // reset unread count when opened
          }
        })
        .catch(console.error);
    } else if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen, citySlug]);

  // Subscribe to real-time broadcast
  useEffect(() => {
    if (!isOpen) return; // Chỉ kết nối khi khung chat mở

    const channel = supabase.channel(`market_chat_${citySlug}`);
    
    channel
      .on("broadcast", { event: "new_message" }, (payload) => {
        setMessages((prev) => [...prev, payload.payload as ChatMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [citySlug, supabase, isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent, attachedImageUrl?: string) => {
    if (e) e.preventDefault();
    if ((!inputValue.trim() && !attachedImageUrl) || !currentUser) return;

    const newMsg: ChatMessage = {
      userId: currentUser.id,
      content: inputValue.trim() || null,
      imageUrl: attachedImageUrl || null,
      createdAt: new Date().toISOString(),
      user: {
        id: currentUser.id,
        nickname: currentUser.nickname,
        avatarUrl: currentUser.avatarUrl,
        role: currentUser.role
      }
    };

    if (!attachedImageUrl) {
      setInputValue("");
    }
    
    // Optimistic update
    setMessages((prev) => [...prev, newMsg]);

    // Broadcast to others
    const channel = supabase.channel(`market_chat_${citySlug}`);
    channel.send({
      type: "broadcast",
      event: "new_message",
      payload: newMsg
    });

    // Save to DB
    await fetch(`${API_URL}/markets/${citySlug}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, content: newMsg.content, imageUrl: newMsg.imageUrl }),
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Reset input để có thể chọn lại file đó
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Kiểm tra dung lượng file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/upload?type=post`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        // Gửi tin nhắn ngay khi upload xong, lấy nội dung text nếu có
        await handleSendMessage(null as any, data.url);
      } else {
        alert("Lỗi upload: " + (data.error || "Không xác định"));
      }
    } catch (error) {
      console.error("Lỗi upload ảnh chat:", error);
      alert("Đã xảy ra lỗi khi upload ảnh.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-transform ${isOpen ? 'scale-0' : 'scale-100'} z-50`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[340px] sm:w-[400px] bg-white dark:bg-card border border-border rounded-lg shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: '80vh' }}>
        {/* Header */}
        <div className="bg-primary text-white p-3 flex justify-between items-center rounded-t-lg">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle size={18} />
            Chat chung khu vực
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500 mt-4">Chưa có tin nhắn nào. Hãy là người đầu tiên!</p>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.userId === currentUser?.id;
              return (
                <div key={msg.id || idx} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.user?.avatarUrl ? (
                    <Image src={msg.user.avatarUrl} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-700 dark:text-gray-300">
                      {msg.user?.nickname?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <span className="text-[10px] text-gray-500 mb-0.5">{msg.user?.nickname}</span>
                    <div className={`px-3 py-2 rounded-2xl text-sm flex flex-col gap-1 ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white dark:bg-secondary border border-border text-foreground rounded-tl-sm shadow-sm'}`}>
                      {msg.imageUrl && (
                        <div className="relative rounded overflow-hidden mt-1 cursor-pointer" onClick={() => window.open(msg.imageUrl!, '_blank')}>
                          <img src={msg.imageUrl} alt="Attached" className="max-w-[200px] max-h-[150px] object-cover" loading="lazy" />
                        </div>
                      )}
                      {msg.content && <span>{msg.content}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border bg-card rounded-b-lg">
          {!currentUser ? (
            <div className="text-center text-sm text-gray-500 p-2">
              Vui lòng đăng nhập để chat.
            </div>
          ) : (
            <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2 items-center">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2 text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
                title="Đính kèm ảnh"
              >
                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 min-w-0 bg-muted/50 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() && !isUploading}
                className="p-2 rounded-full bg-primary text-white disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
