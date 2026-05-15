"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Inbox,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/actions/notification.actions";
import { NotificationItem, NotificationType } from "@/types";
import { NOTIFICATION_CENTER_EVENT } from "@/components/NotificationWatcher";

const PAGE_SIZE = 8;

const getNotificationIcon = (type: NotificationType) => {
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
    return <MessageCircle className="size-4 text-cyan-300" />;
  }

  return <Bell className="size-4 text-light-200" />;
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

const NotificationCenter = () => {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadNotifications = async () => {
    setIsLoading(true);
    const response = await getNotifications({ page: 1, limit: PAGE_SIZE });
    if (response) {
      setItems(response.items);
      setUnreadCount(response.unreadCount);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const notification = (event as CustomEvent<NotificationItem>).detail;
      if (!notification?.id) return;

      setItems((current) => {
        if (current.some((item) => item.id === notification.id)) {
          return current;
        }

        return [notification, ...current].slice(0, PAGE_SIZE);
      });
      setUnreadCount((count) => count + 1);
    };

    window.addEventListener(NOTIFICATION_CENTER_EVENT, handleNotification);
    return () =>
      window.removeEventListener(NOTIFICATION_CENTER_EVENT, handleNotification);
  }, []);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      void loadNotifications();
    }
  };

  const handleOpenNotification = (notification: NotificationItem) => {
    startTransition(async () => {
      if (!notification.readAt) {
        const updated = await markNotificationAsRead(notification.id);
        if (updated) {
          setItems((current) =>
            current.map((item) =>
              item.id === notification.id ? { ...item, readAt: updated.readAt } : item,
            ),
          );
          setUnreadCount((count) => Math.max(0, count - 1));
        }
      }

      setIsOpen(false);
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsAsRead();
      if (!result) {
        toast.error("Could not mark notifications as read");
        return;
      }

      const readAt = new Date().toISOString();
      setItems((current) => current.map((item) => ({ ...item, readAt })));
      setUnreadCount(0);
    });
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex size-11 items-center justify-center rounded-xl border border-[var(--surface-border)] transition-all hover:border-primary-200/50"
        style={{ background: "var(--surface-overlay)" }}
        aria-label="Open notifications"
      >
        <Bell className="size-5 text-[var(--text-body)]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary-200 px-1.5 py-0.5 text-[10px] font-black text-dark-100 shadow-lg shadow-primary-200/20">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-3 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-[var(--surface-border)] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ background: "var(--surface-card)" }}
        >
          <div className="flex items-center justify-between border-b border-[var(--surface-border)] p-4">
            <div>
              <h3 className="text-sm font-black text-[var(--text-heading)]">
                Notifications
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {unreadCount > 0
                  ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                  : "You're all caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="rounded-full border border-[var(--surface-border)] px-3 py-1.5 text-xs font-bold text-[var(--text-body)] transition hover:border-primary-200/50 disabled:opacity-60"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[430px] overflow-y-auto p-2">
            {isLoading && items.length === 0 ? (
              <div className="flex items-center justify-center px-4 py-10 text-sm text-[var(--text-muted)]">
                Loading notifications...
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-[var(--surface-border)] bg-white/[0.03]">
                  <Inbox className="size-5 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm font-bold text-[var(--text-heading)]">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  Interview and feedback updates will appear here.
                </p>
              </div>
            ) : (
              items.map((notification) => {
                const unread = !notification.readAt;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleOpenNotification(notification)}
                    disabled={isPending}
                    className={cn(
                      "group flex w-full gap-3 rounded-2xl p-3 text-left transition",
                      unread
                        ? "bg-primary-200/[0.08] hover:bg-primary-200/[0.12]"
                        : "hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--surface-border)] bg-white/[0.04]">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-1 text-sm font-bold text-[var(--text-heading)]">
                          {notification.title}
                        </p>
                        {unread && (
                          <span className="mt-1 size-2 shrink-0 rounded-full bg-primary-200" />
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-100/70">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
