"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DeletePostButton from "@/components/DeletePostButton";
import PinPostButton from "@/components/PinPostButton";

export default function TopicListItem({ post, citySlug, currentUser }: { post: any, citySlug: string, currentUser?: any }) {
  const [isUnread, setIsUnread] = useState(false);

  useEffect(() => {
    // Kiểm tra trong localStorage xem bài này đã đọc chưa, và đọc lúc nào
    const readThreads = JSON.parse(localStorage.getItem('readThreads') || '{}');
    const lastReadTime = readThreads[post.id];
    
    // Bài viết được coi là chưa đọc nếu:
    // 1. Chưa từng đọc (lastReadTime undefined)
    // 2. Thời gian đẩy bài (lastBumpedAt) HOẶC thời gian tạo (createdAt) mới hơn thời điểm đọc cuối
    const postTime = new Date(post.lastBumpedAt || post.createdAt).getTime();
    
    if (!lastReadTime || postTime > lastReadTime) {
      setIsUnread(true);
    }
  }, [post.id, post.lastBumpedAt, post.createdAt]);

  const handleTopicClick = () => {
    // Đánh dấu đã đọc khi click
    const readThreads = JSON.parse(localStorage.getItem('readThreads') || '{}');
    readThreads[post.id] = new Date().getTime();
    localStorage.setItem('readThreads', JSON.stringify(readThreads));
    setIsUnread(false);
  };

  return (
    <div className={`grid grid-cols-12 gap-2 items-center p-2 border-b border-border transition-colors ${post.isPinned ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-muted/10'}`}>
      <div className="col-span-8 md:col-span-7 flex items-center gap-2">
        <div className="w-6 sm:w-8 flex-shrink-0 text-center text-gray-400">
          {post.isPinned ? (
            <span className="text-base" title="Bài viết được ghim">📌</span>
          ) : isUnread ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-[#1e4471] dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
        <Link 
          href={`/${citySlug}/post/${post.id}`} 
          onClick={handleTopicClick}
          className={`block truncate text-sm leading-tight ${isUnread || post.isPinned ? 'font-bold text-[#1e4471] dark:text-blue-400' : 'font-normal text-[#1e4471] dark:text-blue-300'} hover:underline`}
        >
          {post.status === 'archived' ? (
            <span className="text-gray-500 font-bold mr-1 line-through">[Đã Xong]</span>
          ) : (
            <>
              {post.listingType === 'buy' && <span className="text-[#c0392b] font-bold mr-1">[Cần Mua]</span>}
              {post.listingType === 'sell' && <span className="text-[#27ae60] font-bold mr-1">[Cần Bán]</span>}
              {post.listingType === 'eat' && <span className="text-orange-600 font-bold mr-1">[Quán Ăn]</span>}
              {post.listingType === 'drink' && <span className="text-purple-600 font-bold mr-1">[Quán Uống]</span>}
            </>
          )}
          <span className={post.status === 'archived' ? 'text-gray-500 line-through' : ''}>
            {post.isPinned && <span className="text-amber-600 dark:text-amber-500 font-bold mr-1">[Chú ý]</span>}
            {post.title}
          </span>
        </Link>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
          <span>{post.user?.nickname}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
      </div>
      
      <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-500 dark:text-gray-400">
        <div>{post.viewsCount || 0} xem</div>
        <div>{post.comments?.length || 0} trả lời</div>
      </div>
      
      <div className="col-span-4 md:col-span-3 text-right text-[11px] text-gray-500 dark:text-gray-400 flex flex-col items-end pr-1">
        <div className="truncate text-[#1e4471] dark:text-blue-400 hover:underline w-full">
          {post.comments?.[0]?.user?.nickname || post.user?.nickname}
        </div>
        <div className="flex items-center justify-end w-full mt-0.5 gap-1">
          <span>{new Date(post.lastBumpedAt || post.createdAt).toLocaleDateString('vi-VN')}</span>
          
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'mod') && (
            <div className="flex items-center gap-1 ml-1 border-l pl-1 border-gray-300 dark:border-gray-600 leading-none">
              <PinPostButton postId={post.id} isPinned={post.isPinned || false} currentUser={currentUser} citySlug={citySlug} iconOnly={true} />
              <DeletePostButton postId={post.id} citySlug={citySlug} currentUser={currentUser} iconOnly={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
