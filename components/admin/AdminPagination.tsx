"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "..."> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("...");

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  if (end < totalPages - 1) pages.push("...");

  pages.push(totalPages);
  return pages;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Go to previous page"
        className="flex size-9 items-center justify-center rounded-lg border border-foreground/10 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="size-4" />
      </button>

      {getVisiblePages(currentPage, totalPages).map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-9 items-center justify-center text-sm text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
              page === currentPage
                ? "border-primary-200 bg-primary-200 text-dark-100"
                : "border-foreground/10 text-muted-foreground hover:bg-foreground/5 hover:text-white"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Go to next page"
        className="flex size-9 items-center justify-center rounded-lg border border-foreground/10 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
