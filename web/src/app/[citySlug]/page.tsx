import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import TopicListItem from "./TopicListItem";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";

// Dữ liệu mô phỏng cho 3 thị trường
const validCities = ["ha-noi", "hai-phong", "ho-chi-minh"];
const cityNames: Record<string, string> = {
  "ha-noi": "Thị trường Hà Nội",
  "hai-phong": "Thị trường Hải Phòng",
  "ho-chi-minh": "Thị trường Hồ Chí Minh",
};

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }) {
  const { citySlug } = await params;
  
  const cityName = cityNames[citySlug] || "Thị trường";
  
  return {
    title: `${cityName} | Mua bán, rao vặt TTVNOL`,
    description: `Chợ Mua Bán, Đồ Ăn, Thức Uống khu vực ${cityName}. Mua may bán đắt, cập nhật liên tục tại TTVNOL.`,
    openGraph: {
      title: `${cityName} | TTVNOL`,
      description: `Chợ mua bán, rao vặt ${cityName}`,
    }
  };
}

export default async function CityMarketPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ citySlug: string }>;
  searchParams: Promise<{ type?: string, q?: string, page?: string, category?: string }>;
}) {
  const { citySlug } = await params;
  const { type, q, page, category } = await searchParams;

  if (!validCities.includes(citySlug)) {
    notFound();
  }

  const cityName = cityNames[citySlug];
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  
  const queryParams = new URLSearchParams({ citySlug });
  if (type) queryParams.append('type', type);
  if (q) queryParams.append('q', q);
  if (page) queryParams.append('page', page);
  if (category === 'food') queryParams.append('categoryId', '2');

  const res = await fetch(`${API_URL}/posts?${queryParams.toString()}`, { cache: 'no-store' });
  const result = res.ok ? await res.json() : { success: false, data: [], pagination: { totalPages: 1, currentPage: 1 } };
  const posts = result.success ? result.data : [];
  const pinnedPosts = posts.filter((p: any) => p.isPinned);
  const normalPosts = posts.filter((p: any) => !p.isPinned);
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h1 className={`text-2xl sm:text-3xl font-bold ${category === 'food' ? 'text-orange-600' : 'text-primary'}`}>
            {category === 'food' ? `${cityName.replace('Thị trường', 'Ăn uống')}` : cityName}
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <SearchBar />
            <Link 
              href={`/${citySlug}/new${category === 'food' ? '?category=food' : ''}`}
              className="w-full sm:w-auto text-center bg-accent hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded shadow transition-colors whitespace-nowrap"
            >
              + Đăng Tin Mới
            </Link>
          </div>
        </div>
        
        {/* BỘ LỌC NẰM BÊN TRONG TỪNG THỊ TRƯỜNG */}
        <div className="flex flex-wrap gap-1">
          <Link 
            href={`/${citySlug}${category === 'food' ? '?category=food' : ''}`}
            className={`flex-1 sm:flex-none whitespace-nowrap px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium rounded-t transition-colors ${!type ? (category === 'food' ? 'text-orange-600 border-b-2 border-orange-600 bg-muted/50' : 'text-primary border-b-2 border-primary bg-muted/50') : `text-gray-500 hover:${category === 'food' ? 'text-orange-600' : 'text-primary'} hover:bg-muted/50`}`}
          >
            Chung
          </Link>
          <Link 
            href={`/${citySlug}?type=${category === 'food' ? 'eat&category=food' : 'buy'}`}
            className={`flex-1 sm:flex-none whitespace-nowrap px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium rounded-t transition-colors ${type === (category === 'food' ? 'eat' : 'buy') ? (category === 'food' ? 'text-orange-600 border-b-2 border-orange-600 bg-muted/50' : 'text-primary border-b-2 border-primary bg-muted/50') : `text-gray-500 hover:${category === 'food' ? 'text-orange-600' : 'text-primary'} hover:bg-muted/50`}`}
          >
            {category === 'food' ? 'Quán Ăn' : 'Cần mua'}
          </Link>
          <Link 
            href={`/${citySlug}?type=${category === 'food' ? 'drink&category=food' : 'sell'}`}
            className={`flex-1 sm:flex-none whitespace-nowrap px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium rounded-t transition-colors ${type === (category === 'food' ? 'drink' : 'sell') ? (category === 'food' ? 'text-orange-600 border-b-2 border-orange-600 bg-muted/50' : 'text-primary border-b-2 border-primary bg-muted/50') : `text-gray-500 hover:${category === 'food' ? 'text-orange-600' : 'text-primary'} hover:bg-muted/50`}`}
          >
            {category === 'food' ? 'Quán Uống' : 'Cần bán'}
          </Link>
        </div>
      </div>

      {pinnedPosts.length > 0 && (
        <div className="bg-white dark:bg-primary border border-amber-300 dark:border-amber-700/50 shadow-sm rounded-sm overflow-hidden mt-4 mb-6">
          <div className="grid grid-cols-12 gap-2 p-2 bg-amber-600 dark:bg-amber-700 text-white font-bold text-sm uppercase border-b border-amber-500">
            <div className="col-span-8 md:col-span-7 pl-10">Nội quy & Chú ý</div>
            <div className="hidden md:block md:col-span-2 text-center">Thống kê</div>
            <div className="col-span-4 md:col-span-3 text-right pr-2">Bài mới nhất</div>
          </div>
          <div className="divide-y divide-amber-200 dark:divide-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
            {pinnedPosts.map((post: any) => (
              <TopicListItem 
                key={post.id} 
                post={{
                  ...post,
                  createdAt: new Date(post.createdAt).toISOString(),
                  lastBumpedAt: post.lastBumpedAt ? new Date(post.lastBumpedAt).toISOString() : null
                }} 
                citySlug={citySlug} 
                currentUser={currentUser}
              />
            ))}
          </div>
        </div>
      )}

      {/* Block bọc danh sách - Style Voz */}
      <div className="bg-white dark:bg-primary border border-border shadow-sm rounded-sm overflow-hidden mt-4">
        {/* Table Header - Voz Node Header */}
        <div className={`hidden sm:grid grid-cols-12 gap-2 p-2 text-white font-bold text-sm uppercase border-b border-border ${category === 'food' ? 'bg-orange-600' : 'bg-secondary'}`}>
          <div className="col-span-8 md:col-span-7 pl-10">Chủ đề mới cập nhật</div>
          <div className="hidden md:block md:col-span-2 text-center">Thống kê</div>
          <div className="col-span-4 md:col-span-3 text-right pr-2">Bài mới nhất</div>
        </div>

        <div className="divide-y divide-border bg-white dark:bg-primary">
          {normalPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {q ? `Không tìm thấy bài viết nào cho từ khóa "${q}".` : 'Chưa có bài viết nào trong khu vực này.'}
            </div>
          ) : (
            normalPosts.map((post: any) => (
              <TopicListItem 
                key={post.id} 
                post={{
                  ...post,
                  createdAt: new Date(post.createdAt).toISOString(),
                  lastBumpedAt: post.lastBumpedAt ? new Date(post.lastBumpedAt).toISOString() : null
                }} 
                citySlug={citySlug} 
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
