"use client";

import React, { useState } from "react";

interface ReactionButtonProps {
  targetType: "post" | "comment";
  targetId: number;
  initialReactions?: any[];
  currentUserSupabaseUid?: string;
  currentUserNickname?: string;
}

export default function ReactionButton({ targetType, targetId, initialReactions = [], currentUserSupabaseUid, currentUserNickname = "Bạn" }: ReactionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [reactions, setReactions] = useState(initialReactions);
  const [isLoading, setIsLoading] = useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  const EMOJIS = [
    { type: "like", icon: "👍", label: "Thích", color: "text-blue-600" },
    { type: "love", icon: "❤️", label: "Yêu", color: "text-red-500" },
    { type: "haha", icon: "😂", label: "Haha", color: "text-yellow-500" },
    { type: "sad", icon: "😢", label: "Buồn", color: "text-yellow-600" },
    { type: "angry", icon: "😡", label: "Phẫn nộ", color: "text-orange-600" },
  ];

  const handleReact = async (type: string) => {
    if (!currentUserSupabaseUid) {
      alert("Bạn cần đăng nhập để thả cảm xúc!");
      return;
    }
    
    setIsHovered(false);
    setIsLoading(true);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");
      const endpoint = targetType === 'post' ? '/reactions/post' : '/reactions/comment';
      const body = targetType === 'post' 
        ? { postId: targetId, type, supabaseUid: currentUserSupabaseUid }
        : { commentId: targetId, type, supabaseUid: currentUserSupabaseUid };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (data.success) {
        // Tạm thời mock state để giao diện cập nhật mượt mà
        if (data.action === 'removed') {
          setReactions(reactions.filter(r => r.userId !== 999));
        } else if (data.action === 'updated') {
          setReactions([{ type, userId: 999, user: { nickname: currentUserNickname } }, ...reactions.filter(r => r.userId !== 999)]);
        } else {
          setReactions([{ type, userId: 999, user: { nickname: currentUserNickname } }, ...reactions]);
        }
      }
    } catch (err) {
      console.error("Lỗi thả cảm xúc", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPrimaryReaction = () => {
    if (reactions.length === 0) return null;
    return EMOJIS.find(e => e.type === reactions[0].type) || EMOJIS[0];
  };

  const getTooltipText = () => {
    if (reactions.length === 0) return null;
    
    // Lấy danh sách tên người dùng (lọc bỏ null/undefined)
    const nicknames = reactions
      .map(r => r.user?.nickname)
      .filter(Boolean);

    if (nicknames.length === 0) return `${reactions.length} người đã thích`;
    if (nicknames.length === 1) return `${nicknames[0]} đã thích`;
    if (nicknames.length === 2) return `${nicknames[0]} và ${nicknames[1]} đã thích`;
    
    return `${nicknames[0]}, ${nicknames[1]} và ${reactions.length - 2} người khác đã thích`;
  };

  const currentReaction = getPrimaryReaction();
  const tooltipText = getTooltipText();

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        onClick={() => handleReact("like")}
        disabled={isLoading}
        className={`hover:bg-gray-100 dark:hover:bg-muted/50 px-2 py-1 rounded transition-colors flex items-center gap-1 ${currentReaction ? currentReaction.color : 'text-gray-500 dark:text-gray-400'}`}
      >
        <span className="text-sm">{currentReaction ? currentReaction.icon : "👍"}</span> 
        <span className="text-xs font-bold">{currentReaction ? currentReaction.label : "Thích"}</span>
        {reactions.length > 0 && (
          <span className="ml-1 text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 rounded-full text-gray-700 dark:text-gray-300 relative group">
            {reactions.length}
            
            {/* Tooltip hiển thị tên người thích */}
            {tooltipText && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-max max-w-[200px] bg-black/80 text-white text-[10px] py-1 px-2 rounded shadow-lg z-50 break-words whitespace-normal text-center pointer-events-none">
                {tooltipText}
              </span>
            )}
          </span>
        )}
      </button>

      {/* Popup chọn cảm xúc */}
      {isHovered && (
        <div className="absolute bottom-full left-0 pb-2 z-50">
          <div className="bg-white dark:bg-primary border border-border rounded-full shadow-lg p-1 flex gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji.type}
              onClick={(e) => {
                e.stopPropagation();
                handleReact(emoji.type);
              }}
              className="w-8 h-8 flex items-center justify-center text-xl hover:scale-125 transition-transform origin-bottom"
              title={emoji.label}
            >
              {emoji.icon}
            </button>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
