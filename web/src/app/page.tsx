import Link from "next/link";
import { getTimeAgo } from "@/utils/time";

export default async function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");
  
  let stats = null;
  try {
    const res = await fetch(`${API_URL}/stats`, { cache: 'no-store' });
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
        <h1 className="text-2xl font-bold text-primary">Diễn đàn TTVNOL</h1>
        <p className="text-gray-500 text-sm mt-1">Chọn khu vực để tham gia mua bán, trao đổi</p>
      </div>

      <div className="bg-white border border-border shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 p-2 bg-primary text-white font-bold text-xs uppercase">
          <div className="col-span-8 md:col-span-8 pl-2">Khu vực / Thị trường</div>
          <div className="hidden md:block md:col-span-2 text-center">Thống kê</div>
          <div className="col-span-4 md:col-span-2 text-right pr-2">Hoạt động mới</div>
        </div>

        {/* Row: Hà Nội */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 border-b border-border hover:bg-muted/50 transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded flex items-center justify-center font-bold text-sm shrink-0">
              HN
            </div>
            <div>
              <Link href="/ha-noi" className="font-bold text-[15px] text-primary group-hover:underline leading-tight">
                Thị trường Hà Nội
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">Khu vực giao thương thủ đô và các tỉnh lân cận phía Bắc.</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600">
            <div><span className="font-semibold">{getStat('ha-noi', 'marketplace').posts}</span> Bài viết</div>
            <div><span className="font-semibold">{getStat('ha-noi', 'marketplace').replies}</span> Trả lời</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 pr-1">
            {getStat('ha-noi', 'marketplace').latestTime ? (
              <>
                <div>{getTimeAgo(getStat('ha-noi', 'marketplace').latestTime)}</div>
                <div className="text-primary truncate">{getStat('ha-noi', 'marketplace').latestTitle}</div>
              </>
            ) : (
              <div>Chưa có</div>
            )}
          </div>
        </div>

        {/* Row: Hải Phòng */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 border-b border-border hover:bg-muted/50 transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded flex items-center justify-center font-bold text-sm shrink-0">
              HP
            </div>
            <div>
              <Link href="/hai-phong" className="font-bold text-[15px] text-primary group-hover:underline leading-tight">
                Thị trường Hải Phòng
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">Khu vực mua bán sôi động thành phố cảng.</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600">
            <div><span className="font-semibold">{getStat('hai-phong', 'marketplace').posts}</span> Bài viết</div>
            <div><span className="font-semibold">{getStat('hai-phong', 'marketplace').replies}</span> Trả lời</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 pr-1">
            {getStat('hai-phong', 'marketplace').latestTime ? (
              <>
                <div>{getTimeAgo(getStat('hai-phong', 'marketplace').latestTime)}</div>
                <div className="text-primary truncate">{getStat('hai-phong', 'marketplace').latestTitle}</div>
              </>
            ) : (
              <div>Chưa có</div>
            )}
          </div>
        </div>

        {/* Row: Hồ Chí Minh */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 hover:bg-muted/50 transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded flex items-center justify-center font-bold text-sm shrink-0">
              HCM
            </div>
            <div>
              <Link href="/ho-chi-minh" className="font-bold text-[15px] text-primary group-hover:underline leading-tight">
                Thị trường Hồ Chí Minh
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">Trung tâm giao dịch thương mại miền Nam.</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600">
            <div><span className="font-semibold">{getStat('ho-chi-minh', 'marketplace').posts}</span> Bài viết</div>
            <div><span className="font-semibold">{getStat('ho-chi-minh', 'marketplace').replies}</span> Trả lời</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 pr-1">
            {getStat('ho-chi-minh', 'marketplace').latestTime ? (
              <>
                <div>{getTimeAgo(getStat('ho-chi-minh', 'marketplace').latestTime)}</div>
                <div className="text-primary truncate">{getStat('ho-chi-minh', 'marketplace').latestTitle}</div>
              </>
            ) : (
              <div>Chưa có</div>
            )}
          </div>
        </div>
      </div>

      {/* CHUYÊN MỤC ĂN UỐNG */}
      <div className="border-b border-border mb-4 pb-2 mt-6">
        <h2 className="text-xl font-bold text-orange-600">Ăn uống / Hàng quán</h2>
        <p className="text-gray-500 text-xs mt-1">Review, tìm kiếm và chia sẻ các địa điểm ăn uống ngon</p>
      </div>

      <div className="bg-white border border-border shadow-sm">
        <div className="grid grid-cols-12 gap-2 p-2 bg-orange-600 text-white font-bold text-xs uppercase">
          <div className="col-span-8 md:col-span-8 pl-2">Khu vực / Tỉnh thành</div>
          <div className="hidden md:block md:col-span-2 text-center">Thống kê</div>
          <div className="col-span-4 md:col-span-2 text-right pr-2">Hoạt động mới</div>
        </div>

        {/* Row: Hà Nội */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 border-b border-border hover:bg-orange-50 transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HN
            </div>
            <div>
              <Link href="/ha-noi?category=food" className="font-bold text-[15px] text-orange-700 group-hover:underline leading-tight">
                Hà Nội (Ăn uống)
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">Trà đá vỉa hè, phở bò, bún chả...</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600">
            <div><span className="font-semibold">{getStat('ha-noi', 'food').posts}</span> Quán</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 pr-1">
            {getStat('ha-noi', 'food').latestTime ? (
              <>
                <div>{getTimeAgo(getStat('ha-noi', 'food').latestTime)}</div>
                <div className="text-orange-600 truncate">{getStat('ha-noi', 'food').latestTitle}</div>
              </>
            ) : (
              <div className="text-orange-600 truncate">Chưa có</div>
            )}
          </div>
        </div>

        {/* Row: Hải Phòng */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 border-b border-border hover:bg-orange-50 transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HP
            </div>
            <div>
              <Link href="/hai-phong?category=food" className="font-bold text-[15px] text-orange-700 group-hover:underline leading-tight">
                Hải Phòng (Ăn uống)
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">Bánh đa cua, dừa dầm, nem cua bể...</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600">
            <div><span className="font-semibold">{getStat('hai-phong', 'food').posts}</span> Quán</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 pr-1">
            {getStat('hai-phong', 'food').latestTime ? (
              <>
                <div>{getTimeAgo(getStat('hai-phong', 'food').latestTime)}</div>
                <div className="text-orange-600 truncate">{getStat('hai-phong', 'food').latestTitle}</div>
              </>
            ) : (
              <div className="text-orange-600 truncate">Chưa có</div>
            )}
          </div>
        </div>

        {/* Row: Hồ Chí Minh */}
        <div className="grid grid-cols-12 gap-2 p-2 sm:p-3 hover:bg-orange-50 transition-colors items-center group">
          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-sm shrink-0">
              HCM
            </div>
            <div>
              <Link href="/ho-chi-minh?category=food" className="font-bold text-[15px] text-orange-700 group-hover:underline leading-tight">
                Hồ Chí Minh (Ăn uống)
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">Cơm tấm, ốc đêm, cà phê bệt...</p>
            </div>
          </div>
          <div className="hidden md:block md:col-span-2 text-center text-[11px] text-gray-600">
            <div><span className="font-semibold">{getStat('ho-chi-minh', 'food').posts}</span> Quán</div>
          </div>
          <div className="col-span-4 md:col-span-2 text-right text-[11px] text-gray-500 pr-1">
            {getStat('ho-chi-minh', 'food').latestTime ? (
              <>
                <div>{getTimeAgo(getStat('ho-chi-minh', 'food').latestTime)}</div>
                <div className="text-orange-600 truncate">{getStat('ho-chi-minh', 'food').latestTitle}</div>
              </>
            ) : (
              <div className="text-orange-600 truncate">Chưa có</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
