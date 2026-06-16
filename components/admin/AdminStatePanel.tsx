import type { ComponentType, ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

interface AdminStatePanelProps {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: "neutral" | "warning" | "danger";
  action?: ReactNode;
  className?: string;
}

const toneStyles = {
  neutral: {
    frame: "border-primary-200/15 bg-primary-200/8 text-primary-100",
    icon: "text-primary-200",
  },
  warning: {
    frame: "border-amber-400/15 bg-amber-500/10 text-amber-800 dark:text-amber-100",
    icon: "text-amber-700 dark:text-amber-300",
  },
  danger: {
    frame: "border-red-400/15 bg-red-500/10 text-red-800 dark:text-red-100",
    icon: "text-red-700 dark:text-red-300",
  },
};

export default function AdminStatePanel({
  title,
  description,
  icon,
  tone = "neutral",
  action,
  className,
}: AdminStatePanelProps) {
  const Icon = icon ?? (tone === "danger" ? AlertTriangle : Inbox);
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        "flex min-h-[220px] items-center justify-center rounded-2xl border border-foreground/5 bg-card/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div
          className={cn(
            "mb-4 flex size-12 items-center justify-center rounded-2xl border",
            styles.frame,
          )}
        >
          <Icon className={cn("size-5", styles.icon)} />
        </div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
