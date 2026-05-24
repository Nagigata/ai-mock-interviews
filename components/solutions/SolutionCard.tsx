"use client";

import { ArrowBigUp, Eye, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toggleSolutionUpvote } from "@/lib/actions/solutions.actions";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import UserHoverCard from "@/components/UserHoverCard";
import UserAvatar from "@/components/UserAvatar";

interface Solution {
  id: string;
  title: string;
  language: string;
  upvoteCount: number;
  commentCount: number;
  viewCount: number;
  isUpvoted: boolean;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string };
}

interface Props {
  solution: Solution;
  onSelect: (solutionId: string) => void;
}

export function SolutionCard({ solution, onSelect }: Props) {
  const [upvoteCount, setUpvoteCount] = useState(solution.upvoteCount);
  const [isUpvoted, setIsUpvoted] = useState(solution.isUpvoted);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleUpvote = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (isUpvoting) return;
    setIsUpvoting(true);
    try {
      const result = (await toggleSolutionUpvote(solution.id)) as {
        isUpvoted: boolean;
      };
      setIsUpvoted(result.isUpvoted);
      setUpvoteCount((c) => c + (result.isUpvoted ? 1 : -1));
    } catch {
      toast.error("Failed to upvote");
    } finally {
      setIsUpvoting(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(solution.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(solution.id);
        }
      }}
      className="group relative flex w-full cursor-pointer flex-col gap-3 rounded-2xl border border-[var(--surface-border)] p-5 transition-all duration-300 hover:border-[var(--surface-border-hover)] focus:outline-none focus:ring-2 focus:ring-primary-200/40"
      style={{
        background: `linear-gradient(180deg, var(--surface-card-gradient-from), var(--surface-card-gradient-to))`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-base font-bold leading-tight transition-colors group-hover:text-primary-100"
          style={{ color: "var(--text-heading)" }}
        >
          {solution.title}
        </h3>
        <span
          className="inline-flex shrink-0 items-center rounded-lg border border-[var(--surface-border)] px-2.5 py-1 text-[11px] font-semibold capitalize"
          style={{ background: "var(--surface-overlay)", color: "var(--text-muted)" }}
        >
          {solution.language}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div
          className="flex min-w-0 items-center gap-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <UserHoverCard
            userId={solution.user.id}
            defaultName={solution.user.name}
            defaultAvatarUrl={solution.user.avatarUrl}
          >
            <span className="inline-flex items-center gap-2">
              <UserAvatar
                size="sm"
                name={solution.user.name}
                avatarUrl={solution.user.avatarUrl}
              />
              <span className="truncate font-medium">{solution.user.name}</span>
            </span>
          </UserHoverCard>
          <span>·</span>
          <span className="shrink-0">
            {formatDistanceToNow(new Date(solution.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-xs">
          <button
            type="button"
            onClick={handleUpvote}
            disabled={isUpvoting}
            aria-label={isUpvoted ? "Remove upvote" : "Upvote"}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-2 py-1 font-semibold transition-colors",
              isUpvoted
                ? "border-primary-200/40 bg-primary-200/10 text-primary-100"
                : "border-[var(--surface-border)] text-[var(--text-muted)] hover:border-primary-200/30 hover:text-primary-100",
            )}
          >
            <ArrowBigUp
              className="size-4"
              fill={isUpvoted ? "currentColor" : "none"}
              strokeWidth={2}
            />
            {upvoteCount}
          </button>
          <span
            className="inline-flex items-center gap-1"
            style={{ color: "var(--text-muted)" }}
          >
            <MessageSquare className="size-3.5" />
            {solution.commentCount}
          </span>
          <span
            className="inline-flex items-center gap-1"
            style={{ color: "var(--text-muted)" }}
          >
            <Eye className="size-3.5" />
            {solution.viewCount}
          </span>
        </div>
      </div>
    </div>
  );
}
