"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Inbox } from "lucide-react";
import { toast } from "sonner";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/actions/notification.actions";
import PageState from "@/components/shared/PageState";
import UnderlineTabs from "@/components/UnderlineTabs";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { NotificationItem, NotificationsResponse } from "@/types";

const PAGE_SIZE = 10;

type FilterTab = "all" | "unread";

const TABS = [
  { id: "all" as FilterTab, label: "All" },
  { id: "unread" as FilterTab, label: "Unread" },
];

interface Props {
  initialData: NotificationsResponse | null;
}

export function NotificationsList({ initialData }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [items, setItems] = useState<NotificationItem[]>(initialData?.items ?? []);
  const [page, setPage] = useState(initialData?.page ?? 1);
  const [total, setTotal] = useState(initialData?.total ?? 0);
  const [unreadCount, setUnreadCount] = useState(initialData?.unreadCount ?? 0);
  const [isLoadingFilter, startFilterTransition] = useTransition();
  const [isLoadingMore, startLoadMoreTransition] = useTransition();
  const [isMutating, startMutationTransition] = useTransition();

  const handleTabChange = (tab: FilterTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    startFilterTransition(async () => {
      const data = await getNotifications({
        page: 1,
        limit: PAGE_SIZE,
        unreadOnly: tab === "unread",
      });
      if (!data) {
        toast.error("Could not load notifications. Please try again.");
        return;
      }
      setItems(data.items);
      setPage(1);
      setTotal(data.total);
      setUnreadCount(data.unreadCount);
    });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    startLoadMoreTransition(async () => {
      const data = await getNotifications({
        page: nextPage,
        limit: PAGE_SIZE,
        unreadOnly: activeTab === "unread",
      });
      if (!data) {
        toast.error("Could not load notifications. Please try again.");
        return;
      }
      setItems((prev) => [...prev, ...data.items]);
      setPage(nextPage);
      setTotal(data.total);
      setUnreadCount(data.unreadCount);
    });
  };

  const handleOpenNotification = (notification: NotificationItem) => {
    startMutationTransition(async () => {
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

      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    });
  };

  const handleMarkAllRead = () => {
    startMutationTransition(async () => {
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

  const hasMore = items.length < total;
  const isEmpty = items.length === 0;

  if (initialData === null) {
    return (
      <PageState
        tone="neutral"
        icon={<BellOff className="size-5" />}
        title="Notifications are unavailable"
        description="We couldn't load your inbox. Please try again in a moment."
        action={
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-200 px-5 py-3 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
          >
            Try again
          </button>
        }
      />
    );
  }

  return (
    <section
      className="rounded-[32px] border border-white/[0.08] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-7"
      style={{ background: "#101318" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
            <Bell className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-100">
              Inbox
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              All Notifications
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-light-100/75">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
                : "You're all caught up."}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMutating}
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="mt-6">
        <UnderlineTabs tabs={TABS} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      <div className="mt-5">
        {isLoadingFilter ? (
          <div className="flex items-center justify-center px-4 py-12 text-sm text-[var(--text-muted)]">
            Loading notifications...
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-[var(--surface-border)] bg-white/[0.03]">
              <Inbox className="size-5 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm font-bold text-[var(--text-heading)]">
              {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--text-muted)]">
              {activeTab === "unread"
                ? "You've read everything in your inbox."
                : "Interview and feedback updates will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {items.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleOpenNotification(notification)}
                  disabled={isMutating}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
