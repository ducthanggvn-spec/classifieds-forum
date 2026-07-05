import Link from "next/link";
import { notFound } from "next/navigation";
import { timeAgo } from "@/utils/time"; // giả sử có hàm này hoặc ta tự viết inline

export default async function PublicProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
  const { nickname } = await params;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");
  const res = await fetch(`${API_URL}/users/public/${nickname}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    if (res.status === 404) return notFound();
    return <div className="p-8 text-center text-red-500">Lỗi khi tải thông tin người dùng.</div>;
  }

  const user = await res.json();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Thông tin khái quát */}
      <div className="bg-white dark:bg-primary shadow rounded-lg p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gray-100 flex items-center justify-center shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.nickname} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-gray-400 font-bold">{user.nickname.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
            {user.nickname}
            {user.role === 'admin' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-bold">Admin</span>}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Năm sinh: {user.birthYear || "Đang ẩn"} • Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
          </p>
          {user.phone && (
            <p className="text-sm font-bold text-accent bg-yellow-50 dark:bg-yellow-900/20 inline-block px-3 py-1 rounded border border-yellow-200 dark:border-yellow-700/50 mt-2">
              📞 {user.phone}
            </p>
          )}
          <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
            <span className="text-sm font-medium bg-gray-100 dark:bg-muted px-3 py-1 rounded">
              {user.postCount} bài đăng
            </span>
            <span className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded border border-green-200 dark:border-green-800">
              {user.postCount > 100 ? "Thành viên uy tín" : "Lính mới"}
            </span>
            <Link 
              href={`/inbox/new?to=${user.nickname}`} 
              className="text-sm font-medium text-white bg-accent hover:bg-yellow-700 px-4 py-1 rounded shadow-sm flex items-center gap-1 transition-colors ml-2"
            >
              ✉️ Gửi tin nhắn
            </Link>
          </div>
        </div>
      </div>

      {/* Lịch sử đăng bài */}
      <div className="bg-white dark:bg-primary shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50 dark:bg-muted/50">
          <h2 className="font-bold text-lg dark:text-white">Lịch sử đăng bài</h2>
        </div>
        <div className="divide-y divide-border">
          {user.posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Thành viên này chưa đăng bài nào.</div>
          ) : (
            user.posts.map((post: any) => (
              <Link key={post.id} href={`/${post.city?.slug || 'ha-noi'}/post/${post.id}`} className="block p-4 hover:bg-gray-50 dark:hover:bg-muted transition-colors">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded mt-0.5 shrink-0 ${post.listingType === 'sell' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {post.listingType === 'sell' ? 'BÁN' : 'MUA'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary dark:text-blue-400 hover:underline truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span>•</span>
                      <span className="uppercase text-accent font-medium">{post.city?.name || "Khu vực chung"}</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
