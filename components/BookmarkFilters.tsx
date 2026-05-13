"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface FilterGroupProps {
  title: string;
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (value: string) => void;
}

const FilterGroup = ({ title, options, selectedValues, onChange }: FilterGroupProps) => {
  return (
    <div className="mb-6 border-b border-dark-300 pb-6 last:mb-0 last:border-0 last:pb-0">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-light-400">{title}</h3>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-3 group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer size-5 cursor-pointer appearance-none rounded border border-dark-300 bg-dark-200 transition-all checked:border-primary-200 checked:bg-primary-200"
                checked={selectedValues.includes(option.value)}
                onChange={() => onChange(option.value)}
              />
              <Check
                className="pointer-events-none absolute left-0.5 size-3.5 text-dark-100 opacity-0 transition-opacity peer-checked:opacity-100"
                strokeWidth={4}
              />
            </div>
            <span className={cn(
              "text-sm text-light-100 transition-colors group-hover:text-white",
              selectedValues.includes(option.value) && "text-white"
            )}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

const BookmarkFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = params.getAll(name);

      if (currentValues.includes(value)) {
        const nextValues = currentValues.filter((entry) => entry !== value);
        params.delete(name);
        nextValues.forEach((entry) => params.append(name, entry));
      } else {
        params.append(name, value);
      }

      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    const queryString = createQueryString(name, value);
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const getSelectedValues = (name: string) => searchParams.getAll(name);

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-28 rounded-3xl border border-white/5 bg-dark-200/50 p-6 backdrop-blur-xl">
        <FilterGroup
          title="Status"
          options={[
            { label: "Solved", value: "SOLVED" },
            { label: "Unsolved", value: "UNSOLVED" },
          ]}
          selectedValues={getSelectedValues("status")}
          onChange={(value) => handleFilterChange("status", value)}
        />

        <FilterGroup
          title="Difficulty"
          options={[
            { label: "Easy", value: "EASY" },
            { label: "Medium", value: "MEDIUM" },
            { label: "Hard", value: "HARD" },
          ]}
          selectedValues={getSelectedValues("difficulty")}
          onChange={(value) => handleFilterChange("difficulty", value)}
        />
      </div>
    </aside>
  );
};

export default BookmarkFilters;
