"use client";

import { useEffect, useId } from "react";
import Link from "next/link";
import {
  CornerDownRight,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  X,
} from "lucide-react";
import type { AdminCommentDetail } from "@/types";
import UserAvatar from "@/components/UserAvatar";

interface AdminCommentPreviewModalProps {
  comment: AdminCommentDetail;
  onClose: () => void;
}

export default function AdminCommentPreviewModal({
  comment,
  onClose,
}: AdminCommentPreviewModalProps) {
  const skillSlug = comment.solution.challenge.skill?.slug;
  const sourceUrl = skillSlug
    ? `/preparation/${skillSlug}/${comment.solution.challengeId}?tab=solutions&solutionId=${comment.solutionId}`
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
        className="relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1c1f26] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div className="min-w-0">
            <h3 id={titleId} className="text-xs uppercase tracking-[0.28em] text-light-500">
              Comment preview
            </h3>
            <p className="mt-1 text-sm text-light-400">
              {new Date(comment.createdAt).toLocaleString()}
              {comment.isEdited && (
                <span className="ml-2 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] uppercase text-light-500">
                  edited
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-light-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close preview"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-light-500">
              Author
            </p>
            <div className="flex items-center gap-3">
              <UserAvatar
                name={comment.author.name || "User"}
                avatarUrl={comment.author.avatarUrl}
                size="sm"
                className="shrink-0 shadow-none"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {comment.author.name}
                </p>
                {comment.author.email && (
                  <p className="truncate text-xs text-light-400">
                    {comment.author.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {comment.parent && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="mb-2 text-[11px] uppercase tracking-wider text-light-500">
                Replying to
              </p>
              <p className="text-xs text-light-400">
                {comment.parent.user.name}
                {comment.parent.user.email && (
                  <span className="ml-1 text-light-500">
                    ({comment.parent.user.email})
                  </span>
                )}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-light-100">
                {comment.parent.content}
              </p>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-wider text-light-500">
              Content
            </p>
            <p className="whitespace-pre-wrap rounded-xl bg-white/5 p-4 text-sm text-light-100">
              {comment.content}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <ThumbsUp className="mx-auto mb-1 size-4 text-light-400" />
              <p className="text-base font-semibold text-white">
                {comment.upvoteCount}
              </p>
              <p className="text-[11px] text-light-500">Upvotes</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <MessageSquare className="mx-auto mb-1 size-4 text-light-400" />
              <p className="text-base font-semibold text-white">
                {comment.replyCount}
              </p>
              <p className="text-[11px] text-light-500">Replies</p>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-light-500">
              On solution
            </p>
            <p className="text-sm font-medium text-white">
              {comment.solution.title}
            </p>
            <p className="text-xs text-light-400">
              Challenge: {comment.solution.challenge.title}
              {comment.solution.challenge.skill?.name && (
                <span className="ml-1 text-light-500">
                  ({comment.solution.challenge.skill.name})
                </span>
              )}
            </p>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wider text-light-500">
                Replies ({comment.replies.length})
              </p>
              <ul className="space-y-2">
                {comment.replies.map((reply) => (
                  <li
                    key={reply.id}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] text-light-500">
                      <CornerDownRight className="size-3.5" />
                      <span className="text-light-400">{reply.user.name}</span>
                      <span>•</span>
                      <span>{new Date(reply.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-light-100">
                      {reply.content}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {sourceUrl && (
          <div className="border-t border-white/10 px-5 py-3">
            <Link
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary-200 transition-colors hover:text-white"
            >
              <ExternalLink className="size-3.5" />
              View in public solution thread
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
