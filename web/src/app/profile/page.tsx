"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AvatarUpload from "@/components/AvatarUpload";
import ProfileForm from "./ProfileForm";
import AdminTools from "@/components/AdminTools";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks'>('posts');
  
  const supabase = createClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect("/login");
        return;
      }
      setUser(user);

      try {
        const res = await fetch(`${API_URL}/users/${user.id}`, { cache: "no-store" });
        const userData = await res.json();
        setDbUser(userData);

        const postsRes = await fetch(`${API_URL}/posts/user/${user.id}`);
        if (postsRes.ok) {
          const result = await postsRes.json();
          setPosts(result.data || []);
        }

        const bRes = await fetch(`${API_URL}/bookmarks?supabaseUid=${user.id}`);
        if (bRes.ok) {
          const bResult = await bRes.json();
          setBookmarks(bResult.data || []);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [supabase, API_URL]);

  if (isLoading) return <div className="p-8 text-center">Đang tải...</div>;
  if (!dbUser) return <div className="p-8 text-center text-red-500">Lỗi không thể tải dữ liệu hồ sơ.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white dark:bg-primary shadow rounded-lg p-6 flex flex-col md:flex-row gap-6 items-start">
        <AvatarUpload userId={user.id} currentAvatar={dbUser.avatarUrl} nickname={dbUser.nickname} />

        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {dbUser.nickname}
            <span className={`px-2 py-1 text-[11px] rounded uppercase ${dbUser.role === 'admin' ? 'bg-red-100 text-red-600 border border-red-200' : dbUser.role === 'mod' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200 font-normal'}`}>
              {dbUser.role === 'admin' ? 'ADMIN' : dbUser.role === 'mod' ? 'MOD' : 'MEMBER'}
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ngày gia nhập: {new Date(dbUser.createdAt).toLocaleDateString("vi-VN")}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-gray-50 dark:bg-muted rounded border border-border">
              <p className="text-sm text-gray-500">Chức vụ</p>
              <p className={`text-xl font-bold ${dbUser.role === 'admin' ? 'text-red-600' : dbUser.role === 'mod' ? 'text-green-600' : 'text-gray-700'}`}>
                {dbUser.role === 'admin' ? 'Quản trị viên' : dbUser.role === 'mod' ? 'Điều hành viên' : 'Thành viên'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-muted rounded border border-border">
              <p className="text-sm text-gray-500">Số bài viết</p>
              <p className="text-xl font-bold text-accent">{dbUser.postCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-primary shadow rounded-lg overflow-hidden">
        <div className="flex bg-gray-100 dark:bg-muted font-bold text-sm border-b border-border">
          <button 
            className={`px-6 py-3 border-b-2 ${activeTab === 'posts' ? 'border-[#245992] text-[#245992] dark:text-blue-400 bg-white dark:bg-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('posts')}
          >
            Bài đăng của bạn ({posts.length})
          </button>
          <button 
            className={`px-6 py-3 border-b-2 ${activeTab === 'bookmarks' ? 'border-[#245992] text-[#245992] dark:text-blue-400 bg-white dark:bg-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            Bài viết đã lưu ({bookmarks.length})
          </button>
        </div>

        {activeTab === 'posts' && (
          <div>
            {posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Bạn chưa có bài đăng nào.</div>
            ) : (
              <div className="divide-y divide-border">
                {posts.map((p) => (
                  <Link href={`/${p.city.slug}/post/${p.id}`} key={p.id} className="block p-4 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors">
                    <h3 className="font-bold text-[15px] text-[#1e4471] dark:text-blue-400 hover:underline">{p.title}</h3>
                    <div className="text-[11px] text-gray-500 mt-1">Đăng ngày {new Date(p.createdAt).toLocaleDateString('vi-VN')}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div>
            {bookmarks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Bạn chưa lưu bài viết nào.</div>
            ) : (
              <div className="divide-y divide-border">
                {bookmarks.map((bm) => {
                  const p = bm.post;
                  return (
                    <Link href={`/${p.city.slug}/post/${p.id}`} key={bm.id} className="block p-4 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-[15px] text-[#1e4471] dark:text-blue-400 hover:underline">{p.title}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-muted px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                          Đã lưu: {new Date(bm.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-3">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{p.user?.nickname}</span>
                        <span>•</span>
                        <span>Khu vực: {p.city?.name || p.city?.slug}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-primary shadow rounded-lg p-6">
        <h2 className="text-lg font-bold border-b border-border pb-2 mb-4 dark:text-white">Thông tin cá nhân</h2>
        <ProfileForm dbUser={dbUser} />
      </div>

      <AdminTools currentUser={dbUser} />
    </div>
  );
}
