import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TopicListItem from "@/app/[citySlug]/TopicListItem";
import Pagination from "@/components/Pagination";

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string, scope?: string, page?: string }> 
}) {
  const { q, scope, page } = await searchParams;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
  
  const queryParams = new URLSearchParams();
  if (q) queryParams.append('q', q);
  if (page) queryParams.append('page', page);
  
  let cityName = "Mọi nơi";
  if (scope && scope !== 'all') {
    if (scope === 'hanoi') {
      queryParams.append('citySlug', 'ha-noi');
      cityName = "Hà Nội";
    }
    if (scope === 'haiphong') {
      queryParams.append('citySlug', 'hai-phong');
      cityName = "Hải Phòng";
    }
    if (scope === 'hcm') {
      queryParams.append('citySlug', 'ho-chi-minh');
      cityName = "TP. Hồ Chí Minh";
    }
  } else {
    queryParams.append('citySlug', 'all');
  }

  // Fetch posts from all categories (Marketplace & Food)
  const res = await fetch(`${API_URL}/posts?${queryParams.toString()}`, { cache: 'no-store' });
  const result = res.ok ? await res.json() : { success: false, data: [], pagination: { totalPages: 1, currentPage: 1 } };
  const posts = result.success ? result.data : [];
  const pagination = result.pagination || { totalPages: 1, currentPage: 1 };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let currentUser = null;
  if (user) {
    const userRes = await fetch(`${API_URL}/users/${user.id}`, { cache: "no-store" });
    if (userRes.ok) currentUser = await userRes.json();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
          Kết quả tìm kiếm cho: "{q || 'Tất cả'}" {scope !== 'all' && `tại ${cityName}`}
        </h1>
        <p className="text-gray-500 mb-4">
          Hệ thống đã tìm kiếm trên toàn bộ các chuyên mục (Mua bán & Ăn uống).
        </p>
      </div>

      <div className="bg-white dark:bg-primary border border-border shadow-sm rounded-sm overflow-hidden mt-4">
        <div className="hidden sm:grid grid-cols-12 gap-2 p-2 bg-secondary text-white font-bold text-sm uppercase border-b border-border">
          <div className="col-span-8 md:col-span-7 pl-10">Kết quả tìm kiếm ({pagination.totalCount || posts.length} bài)</div>
          <div className="hidden md:block md:col-span-2 text-center">Thống kê</div>
          <div className="col-span-4 md:col-span-3 text-right pr-2">Bài mới nhất</div>
        </div>

        <div className="divide-y divide-border bg-white dark:bg-primary">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Không tìm thấy bài viết nào phù hợp.
            </div>
          ) : (
            posts.map((post: any) => (
              <TopicListItem 
                key={post.id} 
                post={{
                  ...post,
                  createdAt: new Date(post.createdAt).toISOString(),
                  lastBumpedAt: post.lastBumpedAt ? new Date(post.lastBumpedAt).toISOString() : null
                }} 
                citySlug={post.city?.slug || 'ha-noi'} 
                currentUser={currentUser}
              />
            ))
          )}
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </div>
  );
}
