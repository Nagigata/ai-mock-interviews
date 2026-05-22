import type { Metadata } from "next";

import { getNotifications } from "@/lib/actions/notification.actions";
import { NotificationsList } from "@/components/notifications/NotificationsList";

export const metadata: Metadata = {
  title: "Notifications",
};

const NotificationsPage = async () => {
  const initialData = await getNotifications({ page: 1, limit: 10 });

  return (
    <div className="flex flex-col gap-6">
      <NotificationsList initialData={initialData} />
    </div>
  );
};

export default NotificationsPage;
