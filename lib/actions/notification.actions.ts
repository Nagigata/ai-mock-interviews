"use server";

import { apiGet, apiPatch } from "@/lib/api";
import { NotificationsResponse, NotificationItem } from "@/types";

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsResponse | null> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) {
      searchParams.set("page", params.page.toString());
    }

    if (params?.limit) {
      searchParams.set("limit", params.limit.toString());
    }

    if (params?.unreadOnly) {
      searchParams.set("unreadOnly", "true");
    }

    const query = searchParams.toString();
    return await apiGet<NotificationsResponse>(
      query ? `/notifications?${query}` : "/notifications",
    );
  } catch (error) {
    console.error("Error loading notifications:", error);
    return null;
  }
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<NotificationItem | null> {
  try {
    return await apiPatch<NotificationItem>(
      `/notifications/${notificationId}/read`,
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
}

export async function markAllNotificationsAsRead(): Promise<{
  count: number;
} | null> {
  try {
    return await apiPatch<{ count: number }>("/notifications/read-all");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return null;
  }
}
