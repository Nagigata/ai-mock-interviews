import Link from "next/link";
import { ProfileDiscussItem } from "@/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Props {
  items: ProfileDiscussItem[];
}

export function ProfileDiscussList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--text-heading)" }}>
          No comments yet
        </p>
        <p className="max-w-xs text-xs" style={{ color: "var(--text-muted)" }}>
          Comments you leave on other users&apos; solutions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const href = `/preparation/${item.skillSlug}/${item.challengeId}?tab=solutions&solutionId=${item.solutionId}`;

        return (
          <Link
            key={item.id}
            href={href}
            className="group flex flex-col gap-2 rounded-2xl border border-[var(--surface-border)] px-4 py-3 transition-colors hover:border-primary-200/30 hover:bg-primary-200/5"
            style={{ background: "var(--surface-card-gradient-from)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className="truncate text-xs font-semibold transition-colors group-hover:text-primary-100"
                style={{ color: "var(--text-muted)" }}
              >
                On: {item.solutionTitle}
              </p>
              <span className="shrink-0 text-[11px]" style={{ color: "var(--text-muted)" }}>
                {dayjs(item.createdAt).fromNow()}
              </span>
            </div>
            <p
              className="line-clamp-2 text-sm"
              style={{ color: "var(--text-body)" }}
            >
              {item.content}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
