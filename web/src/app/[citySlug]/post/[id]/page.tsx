import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CommentSection from "./CommentSection";
import ReactionButton from "@/components/ReactionButton";
import BookmarkButton from "@/components/BookmarkButton";
import ShareReplyButtons from "@/components/ShareReplyButtons";
import DeletePostButton from "@/components/DeletePostButton";
import MarkAsDoneButton from "@/components/MarkAsDoneButton";
import BBCodeRenderer from "@/components/BBCodeRenderer";
import PinPostButton from "@/components/PinPostButton";
import Pagination from "@/components/Pagination";

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string, id: string }> }) {
  const { id } = await params;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  
  try {
    const res = await fetch(`${API_URL}/posts/${id}`);
    if (res.ok) {
      const result = await res.json();
      const post = result.data;
      
      // Lấy ảnh đầu tiên từ nội dung nếu có
      let imageUrl = "https://ttvnol.com/default-og.jpg"; // Fallback
      const imgMatch = post.description.match(/\[img\](.*?)\[\/img\]/i);
      if (imgMatch && imgMatch[1]) {
        imageUrl = imgMatch[1];
      }

      // Lấy 150 ký tự đầu làm description, bỏ tag BBCode
      let desc = post.description.replace(/\[.*?\]/g, '').trim().substring(0, 150);
      if (desc.length === 150) desc += "...";

      return {
        title: `${post.title} | TTVNOL`,
        description: desc || "Cộng đồng rao vặt, mua bán nhanh chóng - TTVNOL",
        openGraph: {
          title: post.title,
          description: desc,
          images: [imageUrl],
        }
      };
    }
  } catch (e) {
    console.error("Lỗi SEO meta:", e);
  }
  
  return {
    title: "Chi tiết bài viết | TTVNOL",
  };
}

export default async function PostDetailPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ citySlug: string, id: string }>,
  searchParams: Promise<{ page?: string }>
}) {
  const { citySlug, id } = await params;
  const sParams = await searchParams;
  const page = sParams.page || "1";
  const postId = parseInt(id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  let dbUser = null;
  if (user) {
    const userRes = await fetch(`${API_URL}/users/${user.id}`, { cache: "no-store" });
    if (userRes.ok) {
      dbUser = await userRes.json();
    }
  }
  
  // Fetch bài viết
  const res = await fetch(`${API_URL}/posts/${id}`, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return notFound();
    return <div className="p-8 text-center text-red-500">Lỗi không thể tải chi tiết bài viết.</div>;
  }
  const result = await res.json();
  const post = result.data;

  // Nếu bài viết này không thuộc city này thì chuyển hướng (optional)
  if (post.city.slug !== citySlug) {
    return notFound();
  }

  // Fetch bình luận
  const commentsRes = await fetch(`${API_URL}/comments/${id}?page=${page}&limit=20`, { cache: "no-store" });
  const commentsResult = commentsRes.ok ? await commentsRes.json() : { data: [], pagination: { currentPage: 1, totalPages: 1 } };
  const comments = commentsResult.data || [];
  const pagination = commentsResult.pagination || { currentPage: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-6 flex items-center flex-wrap gap-2">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="text-gray-400 text-sm">/</span>
        <Link href={`/${citySlug}`} className="hover:text-primary transition-colors">Thị trường {post.city.name}</Link>
        <span className="text-gray-400 text-sm">/</span>
        <span className="text-gray-900 dark:text-white font-bold border-b-2 border-primary pb-0.5">Chi tiết tin</span>
      </div>

      {/* Tiêu đề bài viết (Giống XenForo Title Bar) */}
      <div className={`p-3 border-b-4 shadow-sm text-white ${post.status === 'archived' ? 'bg-gray-500 border-gray-600' : 'bg-secondary border-accent'}`}>
        <h1 className="text-xl sm:text-2xl font-bold leading-tight flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {post.status === 'archived' ? (
              <span className="text-xs px-2 py-1 rounded uppercase align-middle text-white shadow-sm font-bold bg-gray-600">
                ĐÃ XONG
              </span>
            ) : post.listingType !== 'general' && (
              <span className={`text-xs px-2 py-1 rounded uppercase align-middle text-white shadow-sm font-bold ${post.listingType === 'sell' ? 'bg-accent text-accent-foreground' : post.listingType === 'buy' ? 'bg-blue-500' : post.listingType === 'eat' ? 'bg-orange-600' : 'bg-purple-600'}`}>
                {post.listingType === 'sell' ? 'BÁN' : post.listingType === 'buy' ? 'MUA' : post.listingType === 'eat' ? 'QUÁN ĂN' : 'QUÁN UỐNG'}
              </span>
            )}
            <span className={post.status === 'archived' ? 'line-through text-gray-300 truncate' : 'truncate'}>
              {post.title}
            </span>
          </div>
          <BookmarkButton postId={postId} currentUserSupabaseUid={user?.id} />
        </h1>
      </div>

      <div className="bg-white dark:bg-primary shadow-sm border border-border overflow-hidden rounded-sm">
        {/* Nội dung bài viết */}
        <div className="flex flex-col md:flex-row min-h-[250px]">
          {/* Cột thông tin User bên trái - Nền nổi bật hơn */}
          <div className="w-full md:w-[150px] shrink-0 bg-[#e8ebf0] dark:bg-muted/10 p-3 border-b md:border-b-0 md:border-r border-[#d8dce6] flex flex-col items-center">
            <Link href={`/user/${post.user.nickname}`} className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold text-gray-400 mb-2 border border-gray-300 shadow-sm hover:opacity-80 transition-all">
              {post.user.avatarUrl ? (
                <img src={post.user.avatarUrl} alt={post.user.nickname} className="w-full h-full object-cover" />
              ) : (
                post.user.nickname.charAt(0).toUpperCase()
              )}
            </Link>
            
            <Link href={`/user/${post.user.nickname}`} className="font-bold text-sm text-[#1e4471] dark:text-blue-400 hover:underline text-center break-words w-full mb-1">
              {post.user.nickname}
            </Link>
            
            <div className="flex flex-col gap-1 w-full px-2 mb-3">
              {post.user.role === 'admin' ? (
                <div className="text-[11px] text-red-700 bg-red-100 border border-red-300 rounded-sm py-1 text-center w-full font-bold shadow-sm uppercase">
                  ADMIN
                </div>
              ) : post.user.role === 'mod' ? (
                <div className="text-[11px] text-green-700 bg-green-100 border border-green-300 rounded-sm py-1 text-center w-full font-bold shadow-sm uppercase">
                  MODERATOR
                </div>
              ) : post.user.postCount > 100 ? (
                <div className="text-[10px] text-[#c0392b] bg-[#f9e9e8] border border-[#e6b3b0] rounded-sm py-0.5 text-center w-full font-bold">
                  Senior Member
                </div>
              ) : (
                <div className="text-[10px] text-gray-600 bg-gray-200 border border-gray-300 rounded-sm py-0.5 text-center w-full font-bold">
                  Lính mới
                </div>
              )}
            </div>

            <div className="text-[10px] text-gray-600 dark:text-gray-400 w-full text-left space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Tham gia:</span>
                <span className="font-medium text-gray-700">{new Date(post.user.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Bài viết:</span>
                <span className="font-medium text-gray-700">{post.user.postCount}</span>
              </div>
            </div>
          </div>

          {/* Cột nội dung chính */}
          <div className="p-4 flex-1 min-w-0 flex flex-col relative bg-white dark:bg-primary">
            {/* Content Header (Thời gian & #1) */}
            <div className="flex justify-between items-center text-[11px] text-gray-500 mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span>{new Date(post.createdAt).toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span title="Lượt xem">👁 {post.viewsCount} views</span>
              </div>
              <div className="font-bold">#1</div>
            </div>

            {/* Content Body */}
            <div className="mt-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
              <BBCodeRenderer content={post.description} />
            </div>
            
            {/* Chữ ký user */}
            {post.user.signature && (
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-[11px] text-gray-400 italic whitespace-pre-wrap">
                {post.user.signature}
              </div>
            )}

            {/* Last edited */}
            <div className="text-[10px] text-gray-400 text-right mt-2">
              Last edited: {new Date(post.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(post.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* ActionBar: Report (Left) / Actions (Right) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-[#245992] font-medium mt-3 pt-3 gap-3">
              <div className="flex items-center gap-3">
                <button className="hover:underline text-gray-500">Report</button>
                <PinPostButton postId={postId} isPinned={post.isPinned || false} currentUser={dbUser || user} citySlug={citySlug} />
                <DeletePostButton postId={postId} citySlug={citySlug} currentUser={dbUser || user} />
                
                {/* Nút Sửa bài (Chỉ chủ bài viết) */}
                {dbUser?.id === post.userId && post.status !== 'archived' && (
                  <Link 
                    href={`/${citySlug}/post/${postId}/edit`}
                    className="text-gray-500 hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>✏️</span> Sửa bài
                  </Link>
                )}
                
                {/* Nút Đã Giao Dịch dành riêng cho chủ bài viết */}
                {dbUser?.id === post.userId && post.status !== 'archived' && (
                  <MarkAsDoneButton postId={postId} currentUserUid={dbUser.supabaseUid} />
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <ReactionButton 
                  targetType="post" 
                  targetId={postId} 
                  currentUserSupabaseUid={user?.id} 
                />
                <BookmarkButton 
                  postId={postId} 
                  currentUserSupabaseUid={user?.id} 
                />
                {post.status !== 'archived' && (
                  <ShareReplyButtons 
                    authorName={post.user.nickname || post.user.email?.split("@")[0] || "Unknown"}
                    contentToQuote={post.description}
                  />
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {post.status === 'archived' && (
        <div className="bg-gray-100 border border-gray-300 text-gray-600 p-4 rounded text-center font-medium">
          🔒 Chủ đề này đã được đóng vì giao dịch hoàn tất. Bạn không thể bình luận thêm.
        </div>
      )}

      <CommentSection 
        postId={postId}
        citySlug={citySlug}
        comments={comments}
        postTitle={post.title}
        postOwnerId={post.user.id} // DB ID
        postOwnerSupabaseUid={post.user.supabaseUid} // Supabase UID
        currentUser={dbUser || user}
        currentUserDbId={dbUser?.id || user?.id}
        currentUserSupabaseUid={user?.id}
        postLastBumpedAt={post.lastBumpedAt}
        isArchived={post.status === 'archived'}
      />

      {/* Thanh phân trang bình luận */}
      <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
    </div>
  );
}
