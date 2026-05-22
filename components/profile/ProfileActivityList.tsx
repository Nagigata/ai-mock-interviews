import Link from "next/link";
import { ProfileActivityItem } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Props {
  items: ProfileActivityItem[];
}

const statusColors: Record<string, string> = {
  ACCEPTED: "text-emerald-400",
  COMPLETED: "text-emerald-400",
  WRONG_ANSWER: "text-red-400",
  TIME_LIMIT_EXCEEDED: "text-amber-400",
  RUNTIME_ERROR: "text-red-400",
  COMPILE_ERROR: "text-red-400",
  REJECTED: "text-red-400",
  TOO_SHORT: "text-amber-400",
  FAILED: "text-red-400",
  IN_PROGRESS: "text-light-400",
  PENDING: "text-light-400",
};

const formatStatus = (status: string) => status.replace(/_/g, " ");

export function ProfileActivityList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--text-heading)" }}>
          No activity yet
        </p>
        <p className="max-w-xs text-xs" style={{ color: "var(--text-muted)" }}>
          Submissions and interview attempts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isChallenge = item.activityType === "CHALLENGE_SUBMISSION";
        const href = isChallenge
          ? `/preparation/${item.skillSlug}/${item.challengeId}`
          : `/interview/${item.interviewId}/attempts/${item.id}`;

        const title = isChallenge
          ? item.challengeTitle
          : `${item.interviewRole} Interview`;

        const meta = isChallenge
          ? `${item.language} · ${item.difficulty}`
          : `${item.interviewLevel} · ${item.interviewType}`;

        const color = statusColors[item.status] ?? "text-[var(--text-muted)]";
        const label = formatStatus(item.status);

        return (
          <Link
            key={item.id}
            href={href}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-border)] px-4 py-3 transition-colors hover:border-primary-200/30 hover:bg-primary-200/5"
            style={{ background: "var(--surface-card-gradient-from)" }}
          >
            <div className="min-w-0">
              <p
                className="truncate text-sm font-semibold transition-colors group-hover:text-primary-100"
                style={{ color: "var(--text-heading)" }}
              >
                {title}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                {meta}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className={`text-xs font-semibold ${color}`}>{label}</span>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {dayjs(item.createdAt).fromNow()}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
