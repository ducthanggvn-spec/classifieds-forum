export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border mb-6 pb-2">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2"></div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-border shadow-sm">
        <div className="grid grid-cols-12 gap-2 p-2 bg-primary text-white font-bold text-xs uppercase">
          <div className="col-span-8 md:col-span-8 pl-2">Đang tải dữ liệu...</div>
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-12 gap-2 p-3 border-b border-border items-center">
            <div className="col-span-8 md:col-span-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse shrink-0"></div>
              <div className="space-y-2 w-full">
                <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
