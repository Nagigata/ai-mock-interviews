"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";


interface FilterGroupProps {
  title: string;
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (value: string) => void;
  scrollable?: boolean;
  searchable?: boolean;
}

const FilterGroup = ({ title, options, selectedValues, onChange, scrollable, searchable }: FilterGroupProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredOptions = searchable 
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="flex flex-col gap-4 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0" style={{ borderBottom: "1px solid var(--surface-border)" }}>
      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{title}</h3>
      
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-400 size-4" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-xl py-2 pl-9 pr-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-primary-200/50"
            style={{ background: "var(--surface-card)", borderColor: "var(--surface-border)", color: "var(--text-body)" }}
          />
        </div>
      )}

      <div className={cn("flex flex-col gap-3", scrollable && "max-h-64 overflow-y-auto px-1 scrollbar scrollbar-w-1 scrollbar-thumb-primary-200/30 hover:scrollbar-thumb-primary-200/60 scrollbar-track-transparent scrollbar-thumb-rounded-full")}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-3 group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer appearance-none size-5 rounded border cursor-pointer checked:bg-primary-200 checked:border-primary-200 transition-all"
                  style={{ borderColor: "var(--surface-border)", background: "var(--surface-card)" }}
                  checked={selectedValues.includes(option.value)}
                  onChange={() => onChange(option.value)}
                />
                <Check
                  className="absolute size-3.5 left-0.5 text-dark-100 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  strokeWidth={4}
                />
              </div>
              <span className="text-sm transition-colors" style={{ color: "var(--text-body)" }}>
                {option.label}
              </span>
            </label>
          ))
        ) : (
          <span className="text-sm italic" style={{ color: "var(--text-muted)" }}>No matches found.</span>
        )}
      </div>
    </div>
  );
};

interface ChallengeFiltersProps {
  topics: string[];
}

const ChallengeFilters = ({ topics }: ChallengeFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = params.getAll(name);

      if (currentValues.includes(value)) {
        const newValues = currentValues.filter((v) => v !== value);
        params.delete(name);
        newValues.forEach((v) => params.append(name, v));
      } else {
        params.append(name, value);
      }

      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    const queryString = createQueryString(name, value);
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  const getSelectedValues = (name: string) => searchParams.getAll(name);

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-28 rounded-3xl border p-6 backdrop-blur-xl" style={{ borderColor: "var(--surface-border)", background: "var(--surface-card)" }}>
        
        <FilterGroup
          title="Status"
          options={[
            { label: "Solved", value: "SOLVED" },
            { label: "Unsolved", value: "UNSOLVED" },
          ]}
          selectedValues={getSelectedValues("status")}
          onChange={(val) => handleFilterChange("status", val)}
        />

        <FilterGroup
          title="Difficulty"
          options={[
            { label: "Easy", value: "EASY" },
            { label: "Medium", value: "MEDIUM" },
            { label: "Hard", value: "HARD" },
          ]}
          selectedValues={getSelectedValues("difficulty")}
          onChange={(val) => handleFilterChange("difficulty", val)}
        />

        {topics.length > 0 && (
          <FilterGroup
            title="Topics"
            options={topics.map((s) => ({ label: s, value: s }))}
            selectedValues={getSelectedValues("topics")}
            onChange={(val) => handleFilterChange("topics", val)}
            scrollable={true}
            searchable={true}
          />
        )}
      </div>
    </aside>
  );
};

export default ChallengeFilters;
