import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AdminTableContainerProps {
  children: ReactNode;
  className?: string;
  scrollClassName?: string;
}

export default function AdminTableContainer({
  children,
  className,
  scrollClassName,
}: AdminTableContainerProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-foreground/5 bg-card/50 shadow-[0_18px_60px_rgba(0,0,0,0.18)]",
        className,
      )}
    >
      <div
        className={cn(
          "overflow-x-auto [scrollbar-color:rgba(202,197,254,0.45)_rgba(255,255,255,0.08)] [scrollbar-width:thin]",
          scrollClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
