import Link from "next/link";
import { ArrowBigUp, Eye, MessageSquare } from "lucide-react";
import { ProfileSolutionItem } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Props {
  items: ProfileSolutionItem[];
}

export function ProfileSolutionsList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--text-heading)" }}>
          No solutions shared yet
        </p>
        <p className="max-w-xs text-xs" style={{ color: "var(--text-muted)" }}>
          Share an accepted submission to help others learn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const href = `/preparation/${item.skillSlug}/${item.challengeId}?tab=solutions&solutionId=${item.id}`;

        return (
          <Link
            key={item.id}
            href={href}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-[var(--surface-border)] px-4 py-3 transition-colors hover:border-primary-200/30 hover:bg-primary-200/5"
            style={{ background: "var(--surface-card-gradient-from)" }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className="truncate text-sm font-semibold transition-colors group-hover:text-primary-100"
                  style={{ color: "var(--text-heading)" }}
                >
                  {item.title}
                </p>
                <span
                  className="shrink-0 rounded-lg border border-[var(--surface-border)] px-2 py-0.5 text-[11px] font-semibold capitalize"
                  style={{ background: "var(--surface-overlay)", color: "var(--text-muted)" }}
                >
                  {item.language}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs" style={{ color: "var(--text-muted)" }}>
                {item.challengeTitle}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <div
                className="flex items-center gap-3 text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="inline-flex items-center gap-1">
                  <ArrowBigUp className="size-3.5" />
                  {item.upvoteCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="size-3.5" />
                  {item.commentCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5" />
                  {item.viewCount}
                </span>
              </div>
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
