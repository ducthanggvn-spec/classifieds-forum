"use client";

import { useEffect, useState, useRef } from "react";
import { Users } from "lucide-react";

type OnlineUser = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  lastSeenAt: string;
};

export default function MarketPresence({ citySlug, currentUser }: { citySlug: string; currentUser: any }) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const guestIdRef = useRef<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");

  useEffect(() => {
    if (!guestIdRef.current) {
      const storedGuestId = localStorage.getItem("guest_id");
      if (storedGuestId) {
        guestIdRef.current = storedGuestId;
      } else {
        const newGuestId = "guest_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("guest_id", newGuestId);
        guestIdRef.current = newGuestId;
      }
    }

    const sendHeartbeat = async () => {
      try {
        const userId = currentUser?.id || guestIdRef.current;
        const nickname = currentUser?.nickname || "Khách";
        const avatarUrl = currentUser?.avatarUrl || null;

        const res = await fetch(`${API_URL}/markets/${citySlug}/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, nickname, avatarUrl })
        });
        
        if (res.ok) {
          const result = await res.json();
          if (result.success && Array.isArray(result.data)) {
            // Lọc ra các user hợp lệ (tránh hiển thị Khách quá nhiều hoặc ẩn danh)
            // Ưu tiên hiển thị những người có tài khoản trước
            const sortedUsers = result.data.sort((a: OnlineUser, b: OnlineUser) => {
              if (a.nickname === "Khách" && b.nickname !== "Khách") return 1;
              if (a.nickname !== "Khách" && b.nickname === "Khách") return -1;
              return 0;
            });
            setOnlineUsers(sortedUsers);
          }
        }
      } catch (error) {
        console.error("Lỗi market heartbeat:", error);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000); // 1 phút / lần

    return () => {
      clearInterval(interval);
    };
  }, [citySlug, currentUser, API_URL]);

  if (onlineUsers.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-2 bg-muted/30 px-4 py-3 rounded-lg border border-border mt-6 mb-4 text-sm text-gray-500">
        <Users size={16} className="text-gray-400 shrink-0 animate-pulse" />
        <span className="animate-pulse">Đang tải số người xem...</span>
      </div>
    );
  }

  const displayUsers = onlineUsers.slice(0, 5);
  const remainingCount = onlineUsers.length - displayUsers.length;

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-card px-4 py-3 rounded-lg border border-border mt-4 mb-4 shadow-sm text-sm">
      <Users size={16} className="text-gray-500 shrink-0" />
      <span className="text-gray-600 dark:text-gray-300 mr-2">
        Đang trực tuyến: <strong className="text-primary">{onlineUsers.length}</strong>
      </span>
      
      <div className="flex flex-wrap gap-2 items-center text-xs">
        {displayUsers.map((u, idx) => (
          <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 border border-border">
            <span className="font-medium text-gray-700 dark:text-gray-300">{u.nickname}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <span className="text-gray-500 italic">
            và {remainingCount} người khác...
          </span>
        )}
      </div>
    </div>
  );
}
