"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto my-16 bg-white dark:bg-primary shadow-sm border border-border rounded overflow-hidden">
      <div className="bg-red-600 text-white font-bold p-3 text-lg border-b-4 border-red-800 flex items-center gap-2">
        <span className="text-xl">🔥</span> TTVNOL - Server Nóng Quá!
      </div>
      
      <div className="p-8 text-center space-y-6">
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">ĐÃ XẢY RA LỖI HỆ THỐNG</h2>
        
        <div className="text-gray-600 dark:text-gray-400 text-[15px] space-y-2">
          <p>Có vẻ như diễn đàn đang quá tải hoặc chúng tôi vừa lỡ tay làm đứt dây cáp mạng.</p>
          <p>Vui lòng thử lại sau vài phút nhé!</p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded text-xs text-red-600 dark:text-red-400 font-mono text-left overflow-auto border border-red-200 dark:border-red-800 mt-6 inline-block w-full">
          {error.message || "Unknown Error"}
        </div>

        <div className="pt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="inline-block bg-accent hover:bg-orange-600 text-white font-bold py-2 px-6 rounded shadow transition-colors"
          >
            🔄 Thử Lại Lần Nữa
          </button>
          <Link 
            href="/" 
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded shadow transition-colors"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
