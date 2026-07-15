import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/login/actions";
import NotificationBell from "@/components/NotificationBell";
import { serverFetch as fetch } from '@/utils/serverFetch';
import Script from "next/script";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ttvnol.vn"),
  title: "Diễn đàn TTVNOL",
  description: "Cộng đồng rao vặt, mua bán nhanh chóng - TTVNOL",
  verification: {
    google: "J_IcTtRETdEoQOfnjWGnmrRrMPKoIAJ2hurmVNIC8lI",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let dbUser = null;
  if (user) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 giây timeout để không treo trang web
      const userRes = await fetch(`${API_URL}/users/${user.id}`, { 
        cache: "no-store",
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      if (userRes.ok) {
        dbUser = await userRes.json();
      }
    } catch (e) {
      console.error("Lỗi fetch user ở layout (có thể do timeout/backend ngủ đông):", e);
    }
  }

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Header phong cách Voz */}
          <header className="bg-primary text-white border-b-4 border-secondary shadow-sm">
            {/* Top Bar: Logo & User/Search */}
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href="/" className="font-bold text-3xl tracking-tighter text-white hover:opacity-90">
                  TTVN<span className="text-accent">OL</span>
                  <span className="text-sm ml-6 font-normal text-blue-200 hidden sm:inline-block tracking-wide">Cộng đồng Mua Bán - Rao Vặt</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <form action="/search" method="GET" className="hidden lg:flex items-center bg-white/10 border border-white/20 rounded px-2 py-1 focus-within:bg-white focus-within:text-black transition-all group">
                  <select name="scope" className="bg-transparent text-xs text-white group-focus-within:text-black focus:outline-none border-r border-white/30 group-focus-within:border-gray-300 pr-2 mr-2 cursor-pointer">
                    <option value="all" className="text-black">Mọi nơi</option>
                    <option value="hanoi" className="text-black">Hà Nội</option>
                    <option value="haiphong" className="text-black">Hải Phòng</option>
                    <option value="hcm" className="text-black">TP.HCM</option>
                  </select>
                  <input 
                    type="text" 
                    name="q"
                    placeholder="Tìm kiếm..." 
                    className="bg-transparent text-sm text-white group-focus-within:text-black placeholder-blue-200 group-focus-within:placeholder-gray-400 focus:outline-none w-40"
                  />
                  <button type="submit" className="text-blue-200 hover:text-white group-focus-within:text-primary px-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </button>
                </form>
                
                {user ? (
                  <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                    {dbUser && <NotificationBell currentUserDbId={dbUser.id} />}
                    <Link href="/inbox" className="p-2 text-white hover:text-accent relative hover:bg-white/10 rounded transition-colors" title="Hộp thư (Inbox)">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 group hover:bg-white/10 px-2 py-1 rounded transition-colors ml-2">
                      <div className="w-8 h-8 rounded bg-white text-primary flex items-center justify-center font-bold text-sm overflow-hidden">
                        {(dbUser?.avatarUrl || user.user_metadata?.avatar_url) ? (
                          <img src={dbUser?.avatarUrl || user.user_metadata?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          (user.user_metadata?.nickname || user.email)?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="hidden lg:inline text-sm font-bold text-white group-hover:text-blue-100">
                        {user.user_metadata?.nickname || user.email?.split("@")[0]}
                      </span>
                    </Link>
                    {(dbUser?.role === 'admin' || dbUser?.role === 'mod') && (
                      <Link href="/admin" className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded ml-2 hover:bg-red-700 transition-colors" title="Trang Quản Trị">
                        ADMIN
                      </Link>
                    )}
                    <form action={logout} className="ml-2">
                      <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-red-500 border border-white/20 hover:border-red-500 rounded shadow-sm transition-all group" title="Đăng xuất">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="hidden xl:inline">Đăng xuất</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 border-l border-white/20 pl-4">
                    <Link href="/login" className="text-sm font-bold hover:underline text-white">Đăng nhập</Link>
                    <span className="text-white/50">|</span>
                    <Link href="/login?tab=register" className="text-sm font-bold hover:underline text-white">Đăng ký</Link>
                  </div>
                )}
                <ThemeToggle />
              </div>
            </div>

            {/* Bottom Nav: Menu Tabs */}
            <div className="bg-secondary border-t border-white/10">
              <div className="max-w-7xl mx-auto px-4 flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
                <nav className="flex font-medium text-sm flex-shrink-0">
                  <Link href="/" className="px-4 py-3 hover:bg-white/10 transition-colors border-r border-white/10 text-white">
                    Trang chủ
                  </Link>
                  <a href="https://www.facebook.com/profile.php?id=61591768534993" target="_blank" rel="noopener noreferrer" className="px-4 py-3 hover:bg-[#1877f2]/80 transition-colors border-r border-white/10 text-white flex items-center gap-2 bg-[#1877f2]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Fanpage
                  </a>
                </nav>
                <div className="flex items-center gap-2 ml-4 text-[13px] font-medium text-blue-100 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex-shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Các bài viết trên forum sẽ được tự động đăng lên Fanpage trong 30 phút!
                </div>
              </div>
            </div>
          </header>

          {/* Nội dung trang */}
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
