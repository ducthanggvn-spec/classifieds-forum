"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Users } from "lucide-react";

type PresenceUser = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  lastSeenAt: string;
};

export default function OnlinePresence({ postId, currentUser }: { postId: number; currentUser: any }) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");
  
  // Dùng ref để lưu giữ ID random của guest trong suốt phiên làm việc
  const guestIdRef = useRef(`guest-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    const userId = currentUser?.id || guestIdRef.current;
    const nickname = currentUser?.nickname || "Khách";
    const avatarUrl = currentUser?.avatarUrl || null;

    const sendHeartbeat = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${postId}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, nickname, avatarUrl })
        });
        
        if (res.ok) {
          const result = await res.json();
          if (result.success && Array.isArray(result.data)) {
            // Sort: authenticated users first (userId doesn't start with 'guest-')
            const sortedUsers = [...result.data].sort((a, b) => {
              const aIsAuth = !a.userId.startsWith('guest-');
              const bIsAuth = !b.userId.startsWith('guest-');
              if (aIsAuth && !bIsAuth) return -1;
              if (!aIsAuth && bIsAuth) return 1;
              return 0;
            });
            setOnlineUsers(sortedUsers);
          }
        }
      } catch (e) {
        console.error("Lỗi heartbeat:", e);
      }
    };

    // Gọi lần đầu tiên
    sendHeartbeat();

    // Lặp lại mỗi 1 phút (60000ms)
    const intervalId = setInterval(sendHeartbeat, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [postId, currentUser, API_URL]);

  if (onlineUsers.length === 0) return null;

  const displayUsers = onlineUsers.slice(0, 5);
  const remainingCount = onlineUsers.length - displayUsers.length;

  return (
    <div className="flex flex-wrap items-center gap-3 bg-muted/30 px-4 py-3 rounded-lg border border-border mt-6">
      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
        <Users size={16} className="text-green-500" />
        <span>{onlineUsers.length} người đang xem:</span>
      </div>
      
      <div className="flex -space-x-2">
        {displayUsers.map((user, idx) => (
          <div 
            key={user.userId || idx} 
            className="w-8 h-8 rounded-full border-2 border-white dark:border-card bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden z-10"
            title={user.nickname}
          >
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.nickname} width={32} height={32} className="object-cover" />
            ) : (
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {user.nickname.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-card bg-muted flex items-center justify-center z-10">
            <span className="text-xs font-medium">+{remainingCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
