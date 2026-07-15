import Link from "next/link";
import { timeAgo } from "@/utils/time";
import { serverFetch as fetch } from '@/utils/serverFetch';

export default async function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
  
  let stats = null;
  try {
    const res = await fetch(`${API_URL}/stats`, { next: { revalidate: 60 } });
    if (res.ok) {
      const result = await res.json();
      if (result.success) stats = result.data;
    }
  } catch (error) {
    console.error("Failed to fetch stats:", error);
  }

  const getStat = (citySlug: string, cat: 'marketplace' | 'food') => {
    const defaultStat = { posts: 0, replies: 0, latestTitle: null, latestTime: null };
    if (!stats || !stats[citySlug]) return defaultStat;
    return stats[citySlug][cat] || defaultStat;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border mb-6 pb-2">
        <h1 className="text-2xl font-bold text-primary dark:text-blue-400">Diễn đàn TTVNOL</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Chọn khu vực để tham gia mua bán, trao đổi</p>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-border shadow-sm rounded-md overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 p-2 bg-primary dark:bg-[#1E293B] text-white font-bold text-xs uppercase">
          <div className="col-span-8 md:col-span-8 pl-2">Khu vực / Thị trường</div>
          <div className="hidden md:block md:col-span-2 text-center">Thống kê</div>
          <div className="col-span-4 md:col-span-2 text-right pr-2">Hoạt động mới</div>
        </div>

        {/* Row: Hà Nội */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 border-b border-border hover:bg-muted/50 dark:hover:bg-[#1E293B] transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 dark:bg-blue-900/40 text-primary dark:text-blue-400 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HN
            </div>
            <div>
              <Link href="/ha-noi" className="font-bold text-[15px] text-primary dark:text-blue-400 group-hover:underline leading-tight">
                Thị trường Hà Nội
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Khu vực giao thương thủ đô và các tỉnh lân cận phía Bắc.</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('ha-noi', 'marketplace').posts}</span> Bài viết</div>
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('ha-noi', 'marketplace').replies}</span> Trả lời</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 dark:text-gray-400 pr-1">
            {getStat('ha-noi', 'marketplace').latestTime ? (
              <>
                <div>{timeAgo(getStat('ha-noi', 'marketplace').latestTime)}</div>
                <div className="text-primary dark:text-blue-400 truncate">{getStat('ha-noi', 'marketplace').latestTitle}</div>
              </>
            ) : (
              <div>Chưa có</div>
            )}
          </div>
        </div>

        {/* Row: Hải Phòng */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 border-b border-border hover:bg-muted/50 dark:hover:bg-[#1E293B] transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 dark:bg-blue-900/40 text-primary dark:text-blue-400 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HP
            </div>
            <div>
              <Link href="/hai-phong" className="font-bold text-[15px] text-primary dark:text-blue-400 group-hover:underline leading-tight">
                Thị trường Hải Phòng
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Khu vực mua bán sôi động thành phố cảng.</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('hai-phong', 'marketplace').posts}</span> Bài viết</div>
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('hai-phong', 'marketplace').replies}</span> Trả lời</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 dark:text-gray-400 pr-1">
            {getStat('hai-phong', 'marketplace').latestTime ? (
              <>
                <div>{timeAgo(getStat('hai-phong', 'marketplace').latestTime)}</div>
                <div className="text-primary dark:text-blue-400 truncate">{getStat('hai-phong', 'marketplace').latestTitle}</div>
              </>
            ) : (
              <div>Chưa có</div>
            )}
          </div>
        </div>

        {/* Row: Hồ Chí Minh */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 hover:bg-muted/50 dark:hover:bg-[#1E293B] transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 dark:bg-blue-900/40 text-primary dark:text-blue-400 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HCM
            </div>
            <div>
              <Link href="/ho-chi-minh" className="font-bold text-[15px] text-primary dark:text-blue-400 group-hover:underline leading-tight">
                Thị trường Hồ Chí Minh
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Trung tâm giao dịch thương mại miền Nam.</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('ho-chi-minh', 'marketplace').posts}</span> Bài viết</div>
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('ho-chi-minh', 'marketplace').replies}</span> Trả lời</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 dark:text-gray-400 pr-1">
            {getStat('ho-chi-minh', 'marketplace').latestTime ? (
              <>
                <div>{timeAgo(getStat('ho-chi-minh', 'marketplace').latestTime)}</div>
                <div className="text-primary dark:text-blue-400 truncate">{getStat('ho-chi-minh', 'marketplace').latestTitle}</div>
              </>
            ) : (
              <div>Chưa có</div>
            )}
          </div>
        </div>
      </div>

      {/* CHUYÊN MỤC ĂN UỐNG */}
      <div className="border-b border-border mb-4 pb-2 mt-6">
        <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400">Ăn uống / Hàng quán</h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Review, tìm kiếm và chia sẻ các địa điểm ăn uống ngon</p>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-border shadow-sm rounded-md overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-2 bg-orange-600 dark:bg-orange-800 text-white font-bold text-xs uppercase">
          <div className="col-span-8 md:col-span-8 pl-2">Khu vực / Tỉnh thành</div>
          <div className="hidden md:block md:col-span-2 text-center">Thống kê</div>
          <div className="col-span-4 md:col-span-2 text-right pr-2">Hoạt động mới</div>
        </div>

        {/* Row: Hà Nội */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 border-b border-border hover:bg-orange-50 dark:hover:bg-[#1E293B] transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HN
            </div>
            <div>
              <Link href="/ha-noi?category=food" className="font-bold text-[15px] text-orange-700 dark:text-orange-400 group-hover:underline leading-tight">
                Hà Nội (Ăn uống)
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Trà đá vỉa hè, phở bò, bún chả...</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('ha-noi', 'food').posts}</span> Quán</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 dark:text-gray-400 pr-1">
            {getStat('ha-noi', 'food').latestTime ? (
              <>
                <div>{timeAgo(getStat('ha-noi', 'food').latestTime)}</div>
                <div className="text-orange-600 dark:text-orange-400 truncate">{getStat('ha-noi', 'food').latestTitle}</div>
              </>
            ) : (
              <div className="text-orange-600 dark:text-orange-400 truncate">Chưa có</div>
            )}
          </div>
        </div>

        {/* Row: Hải Phòng */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 border-b border-border hover:bg-orange-50 dark:hover:bg-[#1E293B] transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HP
            </div>
            <div>
              <Link href="/hai-phong?category=food" className="font-bold text-[15px] text-orange-700 dark:text-orange-400 group-hover:underline leading-tight">
                Hải Phòng (Ăn uống)
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Bánh đa cua, dừa dầm, nem cua bể...</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('hai-phong', 'food').posts}</span> Quán</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 dark:text-gray-400 pr-1">
            {getStat('hai-phong', 'food').latestTime ? (
              <>
                <div>{timeAgo(getStat('hai-phong', 'food').latestTime)}</div>
                <div className="text-orange-600 dark:text-orange-400 truncate">{getStat('hai-phong', 'food').latestTitle}</div>
              </>
            ) : (
              <div className="text-orange-600 dark:text-orange-400 truncate">Chưa có</div>
            )}
          </div>
        </div>

        {/* Row: Hồ Chí Minh */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 hover:bg-orange-50 dark:hover:bg-[#1E293B] transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HCM
            </div>
            <div>
              <Link href="/ho-chi-minh?category=food" className="font-bold text-[15px] text-orange-700 dark:text-orange-400 group-hover:underline leading-tight">
                Hồ Chí Minh (Ăn uống)
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Cơm tấm, ốc đêm, cà phê bệt...</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('ho-chi-minh', 'food').posts}</span> Quán</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 dark:text-gray-400 pr-1">
            {getStat('ho-chi-minh', 'food').latestTime ? (
              <>
                <div>{timeAgo(getStat('ho-chi-minh', 'food').latestTime)}</div>
                <div className="text-orange-600 dark:text-orange-400 truncate">{getStat('ho-chi-minh', 'food').latestTitle}</div>
              </>
            ) : (
              <div className="text-orange-600 dark:text-orange-400 truncate">Chưa có</div>
            )}
          </div>
        </div>
      </div>

      {/* CHUYÊN MỤC NHẬN SHIP / TUYỂN SHIP */}
      <div className="border-b border-border mb-4 pb-2 mt-6">
        <h2 className="text-xl font-bold text-teal-600 dark:text-teal-400">Nhận Ship / Tuyển Ship</h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Dịch vụ giao nhận hàng hóa, kết nối shipper và chủ shop</p>
      </div>

      <div className="bg-white dark:bg-[#111827] border border-border shadow-sm rounded-md overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-2 bg-teal-600 dark:bg-teal-800 text-white font-bold text-xs uppercase">
          <div className="col-span-8 md:col-span-8 pl-2">Khu vực / Tỉnh thành</div>
          <div className="hidden md:block md:col-span-2 text-center">Thống kê</div>
          <div className="col-span-4 md:col-span-2 text-right pr-2">Hoạt động mới</div>
        </div>

        {/* Row: Hà Nội */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 border-b border-border hover:bg-teal-50 dark:hover:bg-[#1E293B] transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HN
            </div>
            <div>
              <Link href="/ha-noi?category=ship" className="font-bold text-[15px] text-teal-700 dark:text-teal-400 group-hover:underline leading-tight">
                Hà Nội (Ship)
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tìm ship nội thành, ngoại thành...</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('ha-noi', 'ship').posts}</span> Bài viết</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 dark:text-gray-400 pr-1">
            {getStat('ha-noi', 'ship').latestTime ? (
              <>
                <div>{timeAgo(getStat('ha-noi', 'ship').latestTime)}</div>
                <div className="text-teal-600 dark:text-teal-400 truncate">{getStat('ha-noi', 'ship').latestTitle}</div>
              </>
            ) : (
              <div className="text-teal-600 dark:text-teal-400 truncate">Chưa có</div>
            )}
          </div>
        </div>

        {/* Row: Hải Phòng */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 border-b border-border hover:bg-teal-50 dark:hover:bg-[#1E293B] transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HP
            </div>
            <div>
              <Link href="/hai-phong?category=ship" className="font-bold text-[15px] text-teal-700 dark:text-teal-400 group-hover:underline leading-tight">
                Hải Phòng (Ship)
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ship khu vực nội thành, cảng...</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('hai-phong', 'ship').posts}</span> Bài viết</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 dark:text-gray-400 pr-1">
            {getStat('hai-phong', 'ship').latestTime ? (
              <>
                <div>{timeAgo(getStat('hai-phong', 'ship').latestTime)}</div>
                <div className="text-teal-600 dark:text-teal-400 truncate">{getStat('hai-phong', 'ship').latestTitle}</div>
              </>
            ) : (
              <div className="text-teal-600 dark:text-teal-400 truncate">Chưa có</div>
            )}
          </div>
        </div>

        {/* Row: Hồ Chí Minh */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 hover:bg-teal-50 dark:hover:bg-[#1E293B] transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HCM
            </div>
            <div>
              <Link href="/ho-chi-minh?category=ship" className="font-bold text-[15px] text-teal-700 dark:text-teal-400 group-hover:underline leading-tight">
                Hồ Chí Minh (Ship)
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ship liên quận, xe ôm công nghệ...</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
            <div><span className="font-semibold text-gray-800 dark:text-gray-200">{getStat('ho-chi-minh', 'ship').posts}</span> Bài viết</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 dark:text-gray-400 pr-1">
            {getStat('ho-chi-minh', 'ship').latestTime ? (
              <>
                <div>{timeAgo(getStat('ho-chi-minh', 'ship').latestTime)}</div>
                <div className="text-teal-600 dark:text-teal-400 truncate">{getStat('ho-chi-minh', 'ship').latestTitle}</div>
              </>
            ) : (
              <div className="text-teal-600 dark:text-teal-400 truncate">Chưa có</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
