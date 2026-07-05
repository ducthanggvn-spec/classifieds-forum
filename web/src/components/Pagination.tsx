"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = [];
  // Giới hạn hiển thị số trang nếu nhiều quá (ở đây đơn giản hóa hiển thị tất cả)
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 my-4">
      {currentPage > 1 && (
        <Link 
          href={createPageUrl(currentPage - 1)}
          className="px-3 py-1 border border-border dark:bg-primary dark:text-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-l"
        >
          &laquo;
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={createPageUrl(p)}
          className={`px-3 py-1 border-t border-b border-r text-sm font-medium ${
            p === currentPage
              ? "bg-accent text-white border-accent"
              : "border-border dark:bg-primary dark:text-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 text-gray-700"
          } ${p === 1 && currentPage === 1 ? 'border-l rounded-l' : ''} ${p === totalPages && currentPage === totalPages ? 'rounded-r' : ''}`}
        >
          {p}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-3 py-1 border-t border-b border-r border-border dark:bg-primary dark:text-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-r"
        >
          &raquo;
        </Link>
      )}
    </div>
  );
}
