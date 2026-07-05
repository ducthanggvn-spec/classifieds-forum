"use client";

import { useEffect } from "react";

interface ImageLightboxProps {
  src: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  // Đóng lightbox khi bấm phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    // Vô hiệu hóa cuộn trang khi mở lightbox
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-2 sm:p-6 cursor-zoom-out animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white bg-black/50 hover:bg-black p-2 rounded-full transition-colors"
          title="Đóng (Esc)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <img 
        src={src} 
        alt="Ảnh phóng to" 
        className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Tránh đóng khi click vào chính ảnh
      />
    </div>
  );
}
