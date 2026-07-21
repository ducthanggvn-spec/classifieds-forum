"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { timeAgo } from "@/utils/time";
import { authFetch as fetch } from '@/utils/authFetch';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/notifications`);
      if (res.ok) {
        const result = await res.json();
        setNotifications(result.data || []);
        setUnreadCount(result.data?.filter((n: any) => !n.isRead).length || 0);
      }
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Tự động kiểm tra thông báo mới mỗi 30 giây
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    // Đóng dropdown khi click ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Đánh dấu tất cả là đã đọc khi mở dropdown
      markAllAsRead();
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT'
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const getTargetUrl = (notification: any) => {
    // Ưu tiên targetUrl được trả về sẵn từ Backend mới cập nhật
    if (notification.targetUrl) {
      return notification.targetUrl;
    }
    
    // Logic fallback cũ nếu chưa có
    switch (notification.type) {
      case 'LIKE_POST':
      case 'COMMENT':
      case 'REPLY':
      case 'LIKE_COMMENT':
        return `/`; 
      case 'INBOX':
        return `/inbox/${notification.targetId}`;
      default:
        return `#`;
    }
  };



  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-white hover:bg-primary-dark rounded transition-colors"
        title="Thông báo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-primary rounded shadow-xl border border-border z-50 overflow-hidden">
          <div className="bg-gray-100 dark:bg-muted p-3 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Thông báo</h3>
            <button 
              onClick={(e) => { e.stopPropagation(); fetchNotifications(); }}
              className="text-xs text-blue-600 hover:underline"
            >
              Làm mới
            </button>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Bạn không có thông báo nào.</div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notif) => (
                  <Link 
                    href={getTargetUrl(notif)} 
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={`block p-3 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-sm">
                        {notif.actor?.avatarUrl ? (
                          <img src={notif.actor.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          (notif.actor?.nickname || '?').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          <span className="font-bold">{notif.actor?.nickname}</span> {notif.content}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          {timeAgo(notif.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
