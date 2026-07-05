"use client";

import React from "react";

interface ShareReplyButtonsProps {
  authorName: string;
  contentToQuote: string;
}

export default function ShareReplyButtons({ authorName, contentToQuote }: ShareReplyButtonsProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Đã copy đường dẫn bài viết!");
  };

  const handleReply = () => {
    const quoteText = `[quote=${authorName}]\n${contentToQuote}\n[/quote]\n`;
    const editor = document.querySelector('textarea');
    if (editor) {
      editor.value = quoteText + editor.value;
      editor.focus();
      editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      <button 
        onClick={handleShare}
        className="hover:bg-gray-100 dark:hover:bg-muted/50 px-2 py-1 rounded transition-colors flex items-center gap-1 text-gray-500 dark:text-gray-400"
      >
        <span className="text-sm">🔗</span> <span className="text-xs font-bold">Share</span>
      </button>
      <button 
        onClick={handleReply}
        className="hover:bg-gray-100 dark:hover:bg-muted/50 px-2 py-1 rounded transition-colors flex items-center gap-1 text-gray-500 dark:text-gray-400"
      >
        <span className="text-sm">💬</span> <span className="text-xs font-bold">Reply</span>
      </button>
    </>
  );
}
