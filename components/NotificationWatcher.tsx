"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Loader2,
  Megaphone,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { NotificationItem, NotificationType } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");
const NOTIFICATION_EVENT = "notification:new";

type NotificationPayload = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: {
    jobId?: string;
    attemptId?: string;
    [key: string]: unknown;
  } | null;
  readAt?: string | null;
  createdAt?: string;
};

export const NOTIFICATION_CENTER_EVENT = "prepwise:notification-new";

const getStorageKey = (notificationId: string) =>
  `notification-toast:${notificationId}`;

const getProcessingToastId = (jobId?: string) =>
  jobId ? `interview-generation-processing-${jobId}` : undefined;

const getFeedbackProcessingToastId = (attemptId?: string) =>
  attemptId ? `feedback-generation-processing-${attemptId}` : undefined;

const getLoadingToastId = (notification: NotificationPayload) => {
  if (notification.type.startsWith("INTERVIEW_GENERATION")) {
    return getProcessingToastId(notification.metadata?.jobId);
  }

  if (notification.type.startsWith("FEEDBACK_GENERATION")) {
    return getFeedbackProcessingToastId(notification.metadata?.attemptId);
  }

  return undefined;
};

const getNotificationIcon = (type: NotificationType) => {
  if (type === "SYSTEM") {
    return <Megaphone className="size-4 text-amber-400" />;
  }

  if (type.endsWith("_PROCESSING")) {
    return <Loader2 className="size-4 animate-spin text-primary-200" />;
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
    return <MessageCircle className="size-4 text-cyan-300" />;
  }

  return <Bell className="size-4 text-light-200" />;
};

const getToastKind = (type: NotificationType) => {
  if (type === "SYSTEM") return "system";
  if (type.endsWith("_PROCESSING")) return "loading";
  if (type.endsWith("_FAILED")) return "error";
  if (type.endsWith("_COMPLETED")) return "success";
  return "message";
};

const SYSTEM_TOAST_CLASSES =
  "!border-amber-400/40 !bg-gradient-to-br !from-amber-500/15 !via-[#1c1f26] !to-[#1c1f26] !text-amber-50 !shadow-lg !shadow-amber-500/10";

const isPersistentNotification = (type: NotificationType) =>
  !type.endsWith("_PROCESSING");

const dispatchNotificationCenterEvent = (notification: NotificationPayload) => {
  if (typeof window === "undefined" || !isPersistentNotification(notification.type)) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<NotificationItem>(NOTIFICATION_CENTER_EVENT, {
      detail: notification as NotificationItem,
    }),
  );
};

interface NotificationWatcherProps {
  soundEnabled?: boolean;
}

const NOTIFICATION_SOUND_URL = "/sounds/notification.mp3";

const NotificationWatcher = ({ soundEnabled = true }: NotificationWatcherProps) => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const hasSeen = (notificationId: string) => {
      if (typeof window === "undefined") return false;
      return window.localStorage.getItem(getStorageKey(notificationId)) === "1";
    };

    const markSeen = (notificationId: string) => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(getStorageKey(notificationId), "1");
    };

    const playSound = () => {
      if (!soundEnabledRef.current || typeof Audio === "undefined") return;
      try {
        const audio = new Audio(NOTIFICATION_SOUND_URL);
        audio.volume = 0.4;
        void audio.play().catch(() => {
          /* Autoplay policy: ignore until user interacts with page */
        });
      } catch {
        /* Audio constructor unavailable, fail silently */
      }
    };

    const handleNotification = (notification: NotificationPayload) => {
      if (!notification?.id || hasSeen(notification.id)) return;

      dispatchNotificationCenterEvent(notification);

      const processingToastId = getLoadingToastId(notification);
      const kind = getToastKind(notification.type);

      if (kind === "loading") {
        toast.loading(notification.title, {
          id: processingToastId || `notification-${notification.id}`,
          description: notification.message,
          icon: getNotificationIcon(notification.type),
          duration: Infinity,
        });
        return;
      }

      markSeen(notification.id);
      if (processingToastId) {
        toast.dismiss(processingToastId);
      }

      playSound();

      const isSystem = kind === "system";
      const toastOptions = {
        id: `notification-${notification.id}`,
        description: notification.message,
        icon: getNotificationIcon(notification.type),
        duration: isSystem ? 20000 : 12000,
        className: isSystem ? SYSTEM_TOAST_CLASSES : undefined,
        action: notification.actionUrl
          ? {
              label: "Open",
              onClick: () => router.push(notification.actionUrl as string),
            }
          : undefined,
      };

      if (kind === "success") {
        toast.success(notification.title, toastOptions);
        return;
      }

      if (kind === "error") {
        toast.error(notification.title, toastOptions);
        return;
      }

      toast(notification.title, toastOptions);
    };

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on(NOTIFICATION_EVENT, handleNotification);

    return () => {
      socket.off(NOTIFICATION_EVENT, handleNotification);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [router]);

  return null;
};

export default NotificationWatcher;
