"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

import { getActiveInterviewGenerationJob } from "@/lib/actions/general.action";
import { InterviewGenerationJob } from "@/types";

const ACTIVE_TOAST_ID = "interview-generation-active";
const POLL_INTERVAL_MS = 6000;
const SOCKET_EVENT = "interview-generation:updated";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const getStorageKey = (job: InterviewGenerationJob) =>
  `interview-generation:${job.id}:${job.status.toLowerCase()}`;

const isRunning = (job: InterviewGenerationJob) =>
  job.status === "PENDING" || job.status === "PROCESSING";

const getJobTitle = (job: InterviewGenerationJob) =>
  `${job.role} ${job.type}`.trim();

const getTechstackLabel = (job: InterviewGenerationJob) =>
  job.techstack?.length ? job.techstack.slice(0, 3).join(", ") : job.level;

const InterviewGenerationWatcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isPollingRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let stopped = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let fallbackPolling = false;

    const hasSeen = (job: InterviewGenerationJob) => {
      if (typeof window === "undefined") return false;
      return window.localStorage.getItem(getStorageKey(job)) === "1";
    };

    const markSeen = (job: InterviewGenerationJob) => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(getStorageKey(job), "1");
    };

    const clearFallbackPoll = () => {
      fallbackPolling = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const scheduleNextPoll = () => {
      if (stopped || !fallbackPolling) return;
      timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    };

    const showRunningToast = (job: InterviewGenerationJob) => {
      toast.loading("Preparing your interview", {
        id: ACTIVE_TOAST_ID,
        description: `${getJobTitle(job)} · ${getTechstackLabel(job)}. You can keep using PrepWise while we build it.`,
        icon: <Loader2 className="size-4 animate-spin text-primary-200" />,
        duration: Infinity,
      });
    };

    const showCompletedToast = (job: InterviewGenerationJob) => {
      toast.dismiss(ACTIVE_TOAST_ID);
      if (hasSeen(job)) return;

      markSeen(job);
      router.refresh();

      toast.success("Interview ready", {
        id: `interview-generation-ready-${job.id}`,
        description: `${getJobTitle(job)} is ready with ${job.amount} questions.`,
        action: job.interviewId
          ? {
              label: "Start",
              onClick: () => router.push(`/interview/${job.interviewId}`),
            }
          : undefined,
        cancel: {
          label: "Later",
          onClick: () => router.push("/interview"),
        },
        icon: <CheckCircle2 className="size-4 text-success-100" />,
        duration: 15000,
      });
    };

    const showFailedToast = (job: InterviewGenerationJob) => {
      toast.dismiss(ACTIVE_TOAST_ID);
      if (hasSeen(job)) return;

      markSeen(job);
      toast.error("Interview generation failed", {
        id: `interview-generation-failed-${job.id}`,
        description:
          job.errorMessage ||
          "The model could not generate this interview. Please try again.",
        action: {
          label: "Try again",
          onClick: () => router.push("/interview/setup"),
        },
        icon: <AlertCircle className="size-4 text-destructive-100" />,
        duration: 15000,
      });
    };

    const handleJob = (job: InterviewGenerationJob | null) => {
      if (!job) {
        toast.dismiss(ACTIVE_TOAST_ID);
        return;
      }

      if (isRunning(job)) {
        showRunningToast(job);
        return;
      }

      if (job.status === "COMPLETED") {
        showCompletedToast(job);
        return;
      }

      if (job.status === "FAILED") {
        showFailedToast(job);
      }
    };

    async function poll() {
      if (isPollingRef.current || stopped) return;

      isPollingRef.current = true;
      try {
        const job = await getActiveInterviewGenerationJob();
        if (!stopped) {
          handleJob(job);
        }
      } finally {
        isPollingRef.current = false;
        scheduleNextPoll();
      }
    }

    const startFallbackPolling = () => {
      if (fallbackPolling || stopped) return;
      fallbackPolling = true;
      void poll();
    };

    const checkActiveJobOnce = async () => {
      try {
        const job = await getActiveInterviewGenerationJob();
        if (!stopped) {
          handleJob(job);
        }
      } catch {
        if (!stopped) {
          startFallbackPolling();
        }
      }
    };

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on(SOCKET_EVENT, (job: InterviewGenerationJob) => {
      handleJob(job);
    });

    socket.on("connect", () => {
      clearFallbackPoll();
    });

    socket.on("connect_error", () => {
      startFallbackPolling();
    });

    socket.on("disconnect", () => {
      startFallbackPolling();
    });

    void checkActiveJobOnce();

    return () => {
      stopped = true;
      clearFallbackPoll();
      socket.off(SOCKET_EVENT);
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.disconnect();
      socketRef.current = null;
      toast.dismiss(ACTIVE_TOAST_ID);
    };
  }, [pathname, router]);

  return null;
};

export default InterviewGenerationWatcher;
