"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { X } from "lucide-react";

import FilterBar from "@/components/filters/FilterBar";
import SearchBar from "@/components/filters/SearchBar";
import SelectFilter from "@/components/filters/SelectFilter";

interface ChallengeFilterBarProps {
  topics?: string[];
  showSearch?: boolean;
  showTopics?: boolean;
  preserveParams?: string[];
  className?: string;
}

const statusOptions = [
  { value: "all", label: "All status" },
  { value: "SOLVED", label: "Solved" },
  { value: "UNSOLVED", label: "Unsolved" },
];

const difficultyOptions = [
  { value: "all", label: "All difficulty" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const UrlSearchBar = ({
  initialValue,
  onSubmit,
}: {
  initialValue: string;
  onSubmit: (value: string) => void;
}) => {
  const [search, setSearch] = useState(initialValue);

  return (
    <SearchBar
      value={search}
      onChange={setSearch}
      onSubmit={() => onSubmit(search.trim())}
      placeholder="Search challenges..."
    />
  );
};

const ChallengeFilterBar = ({
  topics = [],
  showSearch = true,
  showTopics = true,
  preserveParams = [],
  className,
}: ChallengeFilterBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  const topicOptions = useMemo(
    () => [
      { value: "all", label: "All topics" },
      ...topics.map((topic) => ({ value: topic, label: topic })),
    ],
    [topics],
  );

  const selectedStatus = searchParams.get("status") || "all";
  const selectedDifficulty = searchParams.get("difficulty") || "all";
  const selectedTopic = searchParams.get("topics") || "all";

  const hasActiveFilters = Boolean(
    searchParams.get("search") ||
      searchParams.get("status") ||
      searchParams.get("difficulty") ||
      searchParams.get("topics"),
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
      <FilterBar>
        {showSearch ? (
          <UrlSearchBar
            key={currentSearch}
            initialValue={currentSearch}
            onSubmit={(value) => updateParam("search", value)}
          />
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
          <SelectFilter
            label="Status"
            value={selectedStatus}
            options={statusOptions}
            onChange={(value) => updateParam("status", value)}
            className="min-w-[160px]"
          />
          <SelectFilter
            label="Difficulty"
            value={selectedDifficulty}
            options={difficultyOptions}
            onChange={(value) => updateParam("difficulty", value)}
            className="min-w-[170px]"
          />
          {showTopics && topics.length > 0 && (
            <SelectFilter
              label="Topic"
              value={selectedTopic}
              options={topicOptions}
              onChange={(value) => updateParam("topics", value)}
              className="min-w-[190px]"
            />
          )}
        </div>
      </FilterBar>

      <div className="mt-3 flex justify-end">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--surface-border)] px-4 py-2.5 text-sm font-semibold transition-colors hover:border-[var(--surface-border-hover)]"
            style={{ background: "var(--surface-overlay)", color: "var(--text-body)" }}
          >
            <X className="size-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeFilterBar;
