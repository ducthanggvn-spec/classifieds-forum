"use client";

import { useState } from "react";
import { parseBBCode } from "@/utils/bbcode";
import ImageLightbox from "./ImageLightbox";

export default function BBCodeRenderer({ content }: { content: string }) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG" && target.classList.contains("bbcode-image")) {
      setLightboxImg((target as HTMLImageElement).src);
    }
  };

  return (
    <>
      <div 
        className="bbcode-content prose dark:prose-invert max-w-none break-words"
        dangerouslySetInnerHTML={{ __html: parseBBCode(content) }} 
        onClick={handleClick}
      />
      
      {/* Lightbox Modal */}
      {lightboxImg && (
        <ImageLightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />
      )}
    </>
  );
}
