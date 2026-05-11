"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getActiveInterviewGenerationJob } from "@/lib/actions/general.action";
import { InterviewGenerationJob } from "@/types";

const ACTIVE_TOAST_ID = "interview-generation-active";
const POLL_INTERVAL_MS = 6000;

const getStorageKey = (job: InterviewGenerationJob) =>
  `interview-generation:${job.id}:${job.status.toLowerCase()}`;

const isRunning = (job: InterviewGenerationJob) =>
  job.status === "PENDING" || job.status === "PROCESSING";

const getJobTitle = (job: InterviewGenerationJob) =>
  `${job.role} ${job.type}`.trim();

const InterviewGenerationWatcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isPollingRef = useRef(false);

  useEffect(() => {
    let stopped = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const hasSeen = (job: InterviewGenerationJob) => {
      if (typeof window === "undefined") return false;
      return window.localStorage.getItem(getStorageKey(job)) === "1";
    };

    const markSeen = (job: InterviewGenerationJob) => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(getStorageKey(job), "1");
    };

    const scheduleNextPoll = () => {
      if (stopped) return;
      timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    };

    const showRunningToast = (job: InterviewGenerationJob) => {
      toast.loading("Generating your mock interview...", {
        id: ACTIVE_TOAST_ID,
        description: `${getJobTitle(job)} is being prepared in the background.`,
        icon: <Loader2 className="size-4 animate-spin text-primary-200" />,
      });
    };

    const showCompletedToast = (job: InterviewGenerationJob) => {
      toast.dismiss(ACTIVE_TOAST_ID);
      if (hasSeen(job)) return;

      markSeen(job);
      router.refresh();

      toast.success("Your interview is ready", {
        id: `interview-generation-ready-${job.id}`,
        description: `${getJobTitle(job)} has been generated successfully.`,
        action: job.interviewId
          ? {
              label: "Start interview",
              onClick: () => router.push(`/interview/${job.interviewId}`),
            }
          : undefined,
        icon: <ExternalLink className="size-4 text-primary-200" />,
        duration: 12000,
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
        duration: 12000,
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
      if (isPollingRef.current) return;

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

    poll();

    return () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
      toast.dismiss(ACTIVE_TOAST_ID);
    };
  }, [pathname, router]);

  return null;
};

export default InterviewGenerationWatcher;
