"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import FilterBar from "@/components/filters/FilterBar";
import SelectFilter from "@/components/filters/SelectFilter";

interface InterviewFilterBarProps {
  preserveParams?: string[];
  className?: string;
}

const typeOptions = [
  { value: "all", label: "All types" },
  { value: "Technical", label: "Technical" },
  { value: "Behavioral", label: "Behavioral" },
  { value: "Mix", label: "Mix" },
];

const levelOptions = [
  { value: "all", label: "All levels" },
  { value: "Junior", label: "Junior" },
  { value: "Mid-level", label: "Mid-level" },
  { value: "Senior", label: "Senior" },
];

const InterviewFilterBar = ({
  preserveParams = [],
  className,
}: InterviewFilterBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedType = searchParams.get("type") || "all";
  const selectedLevel = searchParams.get("level") || "all";
  const hasActiveFilters = Boolean(
    searchParams.get("type") || searchParams.get("level"),
  );

  const pushParams = (nextParams: URLSearchParams) => {
    const queryString = nextParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const getBaseParams = () => {
    const params = new URLSearchParams();

    preserveParams.forEach((key) => {
      searchParams.getAll(key).forEach((value) => params.append(key, value));
    });

    return params;
  };

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (value === "all" || !value.trim()) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    pushParams(params);
  };

  const clearFilters = () => {
    pushParams(getBaseParams());
  };

  return (
    <div className={className}>
      <FilterBar className="lg:justify-start">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <SelectFilter
            label="Type"
            value={selectedType}
            options={typeOptions}
            onChange={(value) => updateParam("type", value)}
            className="min-w-[170px]"
          />
          <SelectFilter
            label="Level"
            value={selectedLevel}
            options={levelOptions}
            onChange={(value) => updateParam("level", value)}
            className="min-w-[170px]"
          />
        </div>
      </FilterBar>

      <div className="mt-3 flex justify-end">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-light-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <X className="size-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default InterviewFilterBar;
