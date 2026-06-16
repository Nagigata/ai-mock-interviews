"use client";

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Megaphone,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { NotificationItem, NotificationType } from "@/types";

const getNotificationIcon = (type: NotificationType) => {
  if (type === "SYSTEM") {
    return <Megaphone className="size-4 text-amber-700 dark:text-amber-400" />;
  }
  if (type.endsWith("_FAILED")) {
    return <AlertCircle className="size-4 text-destructive-100" />;
  }
  if (type.startsWith("INTERVIEW_GENERATION")) {
    return <Sparkles className="size-4 text-primary-200" />;
  }
  if (type.startsWith("FEEDBACK_GENERATION")) {
    return <CheckCircle2 className="size-4 text-success-100" />;
  }
  if (type.startsWith("CHALLENGE_COMMENT")) {
    return <MessageCircle className="size-4 text-cyan-700 dark:text-cyan-300" />;
  }
  return <Bell className="size-4 text-muted-foreground" />;
};

const formatRelativeTime = (value: string) => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";

  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const [unit, seconds] =
    ranges.find(([, unitSeconds]) => Math.abs(diffSeconds) >= unitSeconds) ||
    ranges[ranges.length - 1];

  return formatter.format(Math.round(diffSeconds / seconds), unit);
};

interface Props {
  notification: NotificationItem;
  onClick: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export function NotificationCard({
  notification,
  onClick,
  disabled,
  compact = false,
}: Props) {
  const unread = !notification.readAt;
  const isSystem = notification.type === "SYSTEM";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex w-full gap-3 rounded-2xl text-left transition",
        compact ? "p-3" : "p-4",
        isSystem
          ? "hover:bg-amber-500/[0.06]"
          : compact
            ? "hover:bg-foreground/[0.04]"
            : "border border-[var(--surface-border)] hover:bg-foreground/[0.04]",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border",
          isSystem
            ? "border-amber-400/40 bg-amber-500/10"
            : "border-[var(--surface-border)] bg-foreground/[0.04]",
        )}
      >
        {getNotificationIcon(notification.type)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {isSystem && (
              <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                System
              </span>
            )}
            <p
              className={cn(
                "line-clamp-1 text-sm font-bold",
                isSystem ? "text-amber-800 dark:text-amber-50" : "text-[var(--text-heading)]",
              )}
            >
              {notification.title}
            </p>
          </div>
          {unread && (
            <span
              className={cn(
                "mt-1 size-2 shrink-0 rounded-full",
                isSystem ? "bg-amber-400" : "bg-primary-200",
              )}
            />
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
          {notification.message}
        </p>
        <p
          className={cn(
            "mt-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
            isSystem ? "text-amber-700 dark:text-amber-300/70" : "text-primary-100/70",
          )}
        >
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}
