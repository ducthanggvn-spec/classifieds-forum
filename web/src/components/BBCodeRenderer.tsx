"use client";

import { useState, useEffect } from "react";
import { parseBBCode } from "@/utils/bbcode";
import ImageLightbox from "./ImageLightbox";
import DOMPurify from 'dompurify';

export default function BBCodeRenderer({ content }: { content: string }) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');

  useEffect(() => {
    // DOMPurify only works in the browser
    setSanitizedHtml(DOMPurify.sanitize(parseBBCode(content)));
  }, [content]);

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
        dangerouslySetInnerHTML={{ __html: sanitizedHtml || parseBBCode(content) /* Fallback for SSR but safe since hydration will replace it */ }} 
        onClick={handleClick}
      />
      
      {/* Lightbox Modal */}
      {lightboxImg && (
        <ImageLightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />
      )}
    </>
  );
}
