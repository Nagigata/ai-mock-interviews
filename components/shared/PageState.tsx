import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PageStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "neutral" | "danger";
};

export default function PageState({
  icon,
  title,
  description,
  action,
  tone = "neutral",
}: PageStateProps) {
  return (
    <div className="flex w-full items-center justify-center py-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center">
        {icon ? (
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-full bg-muted",
              tone === "danger" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {icon}
          </div>
        ) : null}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        {action ? <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
      </div>
    </div>
  );
}
