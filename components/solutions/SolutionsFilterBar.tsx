"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { X } from "lucide-react";

import FilterBar from "@/components/filters/FilterBar";
import SelectFilter from "@/components/filters/SelectFilter";
import SortBy from "@/components/filters/SortBy";

interface SolutionsFilterBarProps {
  availableLanguages: string[];
  className?: string;
  totalCount?: number;
}

const SOLUTION_SORT_OPTIONS = [
  { value: "top-votes", label: "Top Vote" },
  { value: "top-views", label: "Top View" },
  { value: "newest", label: "Newest" },
];

const FILTER_PARAM_KEYS = ["language", "sort"] as const;

const SolutionsFilterBar = ({
  availableLanguages,
  className,
  totalCount,
}: SolutionsFilterBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLanguage = searchParams.get("language") || "all";
  const currentSort = searchParams.get("sort") || "top-votes";

  const languageOptions = useMemo(
    () => [
      { value: "all", label: "All languages" },
      ...availableLanguages.map((lang) => ({ value: lang, label: lang })),
    ],
    [availableLanguages],
  );

  const hasActiveFilters = FILTER_PARAM_KEYS.some((key) =>
    searchParams.get(key),
  );

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (!value.trim() || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_PARAM_KEYS.forEach((key) => params.delete(key));
    params.delete("page");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className={className}>
      <FilterBar>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <SelectFilter
            label="Language"
            value={currentLanguage}
            options={languageOptions}
            onChange={(value) => updateParam("language", value)}
            className="min-w-[170px]"
          />
          <SortBy
            value={currentSort}
            options={SOLUTION_SORT_OPTIONS}
            onChange={(value) => updateParam("sort", value)}
            className="min-w-[170px]"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--surface-border)] px-4 py-2.5 text-sm font-semibold transition-colors hover:border-[var(--surface-border-hover)]"
              style={{
                background: "var(--surface-overlay)",
                color: "var(--text-body)",
              }}
            >
              <X className="size-4" />
              Clear
            </button>
          )}
        </div>

        {typeof totalCount === "number" && (
          <span className="w-fit rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1.5 text-sm font-bold text-primary-100">
            {totalCount} showing
          </span>
        )}
      </FilterBar>
    </div>
  );
};

export default SolutionsFilterBar;
