"use client";

import { ArrowUpDown } from "lucide-react";

import SelectFilter, { SelectFilterOption } from "./SelectFilter";
import { cn } from "@/lib/utils";

export interface SortByProps {
  value: string;
  options: SelectFilterOption[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  hideLabel?: boolean;
}

const SortBy = ({
  value,
  options,
  onChange,
  label = "Sort by",
  className,
  hideLabel = false,
}: SortByProps) => {
  return (
    <div className={cn("min-w-[170px]", className)}>
      {!hideLabel && (
        <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-light-500">
          <ArrowUpDown className="size-3" />
          {label}
        </span>
      )}
      <SelectFilter
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        hideLabel
        className="w-full min-w-0"
      />
    </div>
  );
};

export default SortBy;
