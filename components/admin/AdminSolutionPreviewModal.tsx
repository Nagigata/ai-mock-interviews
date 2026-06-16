"use client";

import { useEffect, useId } from "react";
import Link from "next/link";
import { ExternalLink, Eye, MessageSquare, ThumbsUp, X } from "lucide-react";
import type { AdminSolutionDetail } from "@/types";
import UserAvatar from "@/components/UserAvatar";
import { CodeBlock } from "@/components/ui/CodeBlock";

interface AdminSolutionPreviewModalProps {
  solution: AdminSolutionDetail;
  onClose: () => void;
}

export default function AdminSolutionPreviewModal({
  solution,
  onClose,
}: AdminSolutionPreviewModalProps) {
  const skillSlug = solution.challenge.skill?.slug;
  const sourceUrl = skillSlug
    ? `/preparation/${skillSlug}/${solution.challengeId}?tab=solutions&solutionId=${solution.id}`
    : null;
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-[200] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-muted shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-foreground/10 p-5">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Solution preview
            </p>
            <h3 id={titleId} className="mt-1 truncate text-lg font-semibold text-white">
              {solution.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {solution.language} • {new Date(solution.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-foreground/10 p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-white"
            aria-label="Close preview"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-foreground/5 p-4">
              <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                Author
              </p>
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={solution.author.name || "User"}
                  avatarUrl={solution.author.avatarUrl}
                  size="sm"
                  className="shrink-0 shadow-none"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {solution.author.name}
                  </p>
                  {solution.author.email && (
                    <p className="truncate text-xs text-muted-foreground">
                      {solution.author.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-foreground/5 p-4">
              <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                Challenge
              </p>
              <p className="text-sm font-medium text-white">
                {solution.challenge.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {solution.challenge.skill?.name && (
                  <span className="rounded-md bg-foreground/5 px-2 py-0.5">
                    {solution.challenge.skill.name}
                  </span>
                )}
                {solution.challenge.difficulty && (
                  <span className="rounded-md bg-foreground/5 px-2 py-0.5">
                    {solution.challenge.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 text-center">
              <ThumbsUp className="mx-auto mb-1 size-4 text-muted-foreground" />
              <p className="text-base font-semibold text-white">
                {solution.upvoteCount}
              </p>
              <p className="text-[11px] text-muted-foreground">Upvotes</p>
            </div>
            <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 text-center">
              <MessageSquare className="mx-auto mb-1 size-4 text-muted-foreground" />
              <p className="text-base font-semibold text-white">
                {solution.commentCount}
              </p>
              <p className="text-[11px] text-muted-foreground">Comments</p>
            </div>
            <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 text-center">
              <Eye className="mx-auto mb-1 size-4 text-muted-foreground" />
              <p className="text-base font-semibold text-white">
                {solution.viewCount}
              </p>
              <p className="text-[11px] text-muted-foreground">Views</p>
            </div>
          </div>

          {solution.description && (
            <div>
              <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                Description
              </p>
              <p className="whitespace-pre-wrap rounded-xl bg-foreground/5 p-4 text-sm text-foreground">
                {solution.description}
              </p>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              Code ({solution.language})
            </p>
            <CodeBlock code={solution.code} language={solution.language} />
          </div>
        </div>

        {sourceUrl && (
          <div className="border-t border-foreground/10 px-5 py-3">
            <Link
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary-200 transition-colors hover:text-white"
            >
              <ExternalLink className="size-3.5" />
              View in public solutions tab
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
