import Link from "next/link";
import dayjs from "dayjs";
import { ArrowRight, ListChecks } from "lucide-react";

import { RecentActivityItem } from "@/types";

interface RecentActivityTableProps {
  items: RecentActivityItem[];
  title?: string;
  compact?: boolean;
  actionHref?: string;
  actionLabel?: string;
  totalItems?: number;
}

const statusClasses: Record<string, string> = {
  ACCEPTED: "text-emerald-700 dark:text-emerald-400",
  COMPLETED: "text-emerald-700 dark:text-emerald-400",
  REJECTED: "text-red-700 dark:text-red-400",
  WRONG_ANSWER: "text-red-700 dark:text-red-400",
  PENDING: "text-muted-foreground",
};

const getActivityHref = (item: RecentActivityItem) => {
  if (item.activityType === "INTERVIEW_ATTEMPT" && item.interviewId) {
    return `/interview/${item.interviewId}/attempts/${item.id}`;
  }

  return `/preparation/${item.skillSlug || "algorithms"}/${item.challengeId}`;
};

const getActivityTitle = (item: RecentActivityItem) => {
  if (item.activityType === "INTERVIEW_ATTEMPT") {
    return `${item.interviewRole || "Mock"} Interview`;
  }

  return item.challengeTitle || "Untitled Challenge";
};

const getActivityContext = (item: RecentActivityItem) => {
  if (item.activityType === "INTERVIEW_ATTEMPT") {
    return typeof item.score === "number"
      ? `${item.score}/100`
      : item.interviewType || "Interview";
  }

  return item.language || "-";
};

const RecentActivityTable = ({
  items,
  title = "Recent Activity",
  compact = false,
  actionHref,
  actionLabel,
  totalItems,
}: RecentActivityTableProps) => {
  const displayTotal = totalItems ?? items.length;

  return (
    <section className="rounded-[32px] border border-foreground/[0.08] bg-card p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
            <ListChecks className="size-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {title}
            </h3>
            {!compact && (
              <p className="mt-1 text-sm text-muted-foreground">
                {displayTotal} item{displayTotal !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {actionHref && actionLabel ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-4 py-2.5 text-sm font-bold text-primary-100 transition hover:border-primary-200/25 hover:bg-primary-200/10"
            >
              {actionLabel}
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[24px] border border-foreground/[0.08] bg-foreground/[0.025]">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="bg-foreground/[0.04] text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-bold">Activity</th>
              <th className="px-4 py-3 font-bold">Context</th>
              <th className="px-4 py-3 font-bold">Result</th>
              <th className="px-4 py-3 font-bold">Date</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="relative cursor-pointer border-t border-foreground/[0.07] transition hover:bg-foreground/[0.035]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={getActivityHref(item)}
                      className="font-medium text-white hover:text-primary-100 before:absolute before:inset-0 before:content-['']"
                    >
                      {getActivityTitle(item)}
                    </Link>
                    {item.activityType === "INTERVIEW_ATTEMPT" ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.interviewLevel || "Practice"} session
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {getActivityContext(item)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border border-current/15 bg-current/10 px-2.5 py-1 text-xs font-bold ${statusClasses[item.status] || "text-foreground"}`}
                    >
                      {item.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {dayjs(item.submittedAt).format(compact ? "MMM D" : "MMM D, YYYY HH:mm")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No recent activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RecentActivityTable;
