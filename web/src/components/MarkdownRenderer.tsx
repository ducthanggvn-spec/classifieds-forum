"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Hàm parse Markdown siêu nhẹ, hỗ trợ:
  // **bold**
  // *italic*
  // [text](url)
  // và giữ nguyên \n
  
  const parseMarkdown = (text: string) => {
    // 1. Chống XSS cơ bản bằng cách escape HTML tags
    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // 2. Tách theo dòng (\n)
    const lines = safeText.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Parse Bold, Italic, Link
      // Tách bằng regex token để không dính HTML
      const tokens = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
      
      const parsedLine = tokens.map((token, tokenIndex) => {
        if (token.startsWith('**') && token.endsWith('**')) {
          return <strong key={tokenIndex}>{token.slice(2, -2)}</strong>;
        }
        if (token.startsWith('*') && token.endsWith('*')) {
          return <em key={tokenIndex}>{token.slice(1, -1)}</em>;
        }
        
        const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          const text = linkMatch[1];
          let url = linkMatch[2];
          // Đảm bảo url hợp lệ, chống javascript:
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
          }
          if (url.toLowerCase().startsWith('javascript:')) {
            url = '#';
          }
          return <a key={tokenIndex} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{text}</a>;
        }
        
        // Trả về dạng html cho img/iframe nếu có (bỏ qua, ở đây chỉ render text thuần)
        return <span key={tokenIndex}>{token}</span>;
      });
      
      return (
        <React.Fragment key={lineIndex}>
          {parsedLine}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
      {parseMarkdown(content)}
    </div>
  );
}
