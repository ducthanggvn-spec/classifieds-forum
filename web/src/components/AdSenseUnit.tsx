"use client";

import { useEffect } from "react";

interface AdSenseUnitProps {
  adSlot: string; // ID của ô quảng cáo (Ví dụ: "1234567890")
  adFormat?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  fullWidthResponsive?: boolean;
  className?: string;
}

export default function AdSenseUnit({ 
  adSlot, 
  adFormat = "auto", 
  fullWidthResponsive = true,
  className = ""
}: AdSenseUnitProps) {
  useEffect(() => {
    // Kích hoạt Google Adsense sau khi component render
    try {
      if (process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense Error:", err);
    }
  }, []);

  // Nếu chưa có Publisher ID trong .env thì ẩn khối này đi để không lỗi giao diện
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
    return null;
  }

  return (
    <div className={`w-full overflow-hidden my-4 flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
