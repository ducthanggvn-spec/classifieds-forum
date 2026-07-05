"use client";

import { useState } from "react";

interface ReactionButtonProps {
  targetType: "post" | "comment";
  targetId: number;
  initialReactions?: any[];
  currentUserSupabaseUid?: string;
}

export default function ReactionButton({ targetType, targetId, initialReactions = [], currentUserSupabaseUid }: ReactionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [reactions, setReactions] = useState(initialReactions);
  const [isLoading, setIsLoading] = useState(false);

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
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
          setReactions([{ type, userId: 999 }, ...reactions.filter(r => r.userId !== 999)]);
        } else {
          setReactions([{ type, userId: 999 }, ...reactions]);
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

  const currentReaction = getPrimaryReaction();

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        onClick={() => handleReact("like")}
        disabled={isLoading}
        className={`hover:bg-gray-100 dark:hover:bg-muted/50 px-2 py-1 rounded transition-colors flex items-center gap-1 ${currentReaction ? currentReaction.color : 'text-gray-500 dark:text-gray-400'}`}
      >
        <span className="text-sm">{currentReaction ? currentReaction.icon : "👍"}</span> 
        <span className="text-xs font-bold">{currentReaction ? currentReaction.label : "Thích"}</span>
        {reactions.length > 0 && (
          <span className="ml-1 text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 rounded-full text-gray-700 dark:text-gray-300">
            {reactions.length}
          </span>
        )}
      </button>

      {/* Popup chọn cảm xúc */}
      {isHovered && (
        <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-primary border border-border rounded-full shadow-lg p-1 flex gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
      )}
    </div>
  );
}
