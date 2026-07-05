"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, FormEvent } from "react";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const isFood = searchParams.get("category") === "food";

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    
    // Đặt lại page về 1 khi search mới
    params.delete("page");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full sm:max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={isFood ? "Tìm kiếm địa điểm ăn uống..." : "Tìm kiếm bài viết..."}
        className={`flex-1 px-3 py-1.5 sm:py-2 text-sm border rounded-l focus:outline-none focus:ring-1 dark:bg-primary dark:text-white ${isFood ? 'border-orange-300 focus:ring-orange-600' : 'border-border focus:ring-accent'}`}
      />
      <button 
        type="submit"
        className={`px-4 py-1.5 sm:py-2 text-white text-sm font-medium border rounded-r transition-colors ${isFood ? 'bg-orange-600 hover:bg-orange-700 border-orange-600' : 'bg-secondary hover:bg-opacity-90 border-secondary'}`}
      >
        Tìm
      </button>
    </form>
  );
}
