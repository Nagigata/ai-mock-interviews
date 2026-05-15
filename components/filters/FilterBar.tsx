import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

const FilterBar = ({ children, className }: FilterBarProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default FilterBar;
