"use client";

import { useMemo, useState } from "react";
import { SolutionCommentEditor } from "./SolutionCommentEditor";
import { SolutionCommentItem, Comment } from "./SolutionCommentItem";
import SortBy from "@/components/filters/SortBy";
import { createComment } from "@/lib/actions/solutions.actions";
import { toast } from "sonner";

interface Props {
  solutionId: string;
  initialComments: Comment[];
  currentUserId?: string;
}

type CommentSortKey = "oldest" | "newest" | "top-votes";

const COMMENT_SORT_OPTIONS = [
  { value: "oldest", label: "Oldest" },
  { value: "newest", label: "Newest" },
  { value: "top-votes", label: "Top Vote" },
];

const countLiveComments = (comments: Comment[]): number => {
  let count = 0;
  for (const c of comments) {
    if (!c.deletedAt) count++;
    if (c.replies?.length) count += countLiveComments(c.replies);
  }
  return count;
};

const sortTopLevelComments = (
  comments: Comment[],
  sortBy: CommentSortKey,
): Comment[] => {
  const copy = [...comments];
  copy.sort((a, b) => {
    if (sortBy === "oldest") return a.createdAt.localeCompare(b.createdAt);
    if (sortBy === "newest") return b.createdAt.localeCompare(a.createdAt);
    if (b.upvoteCount !== a.upvoteCount) return b.upvoteCount - a.upvoteCount;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return copy;
};

export function SolutionCommentsSection({ solutionId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [sortBy, setSortBy] = useState<CommentSortKey>("top-votes");

  const sortedComments = useMemo(
    () => sortTopLevelComments(comments, sortBy),
    [comments, sortBy],
  );
  const totalLiveCount = useMemo(() => countLiveComments(comments), [comments]);

  const handleNewComment = async (content: string) => {
    try {
      const newComment = await createComment(solutionId, { content }) as Comment;
      setComments((prev) => [...prev, newComment]);
    } catch {
      toast.error("Failed to post comment");
    }
  };

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-base">
          {totalLiveCount} Comment{totalLiveCount !== 1 ? "s" : ""}
        </h2>
        {comments.length > 1 && (
          <SortBy
            value={sortBy}
            options={COMMENT_SORT_OPTIONS}
            onChange={(value) => setSortBy(value as CommentSortKey)}
            hideLabel
            className="min-w-[150px]"
          />
        )}
      </div>

      {currentUserId ? (
        <SolutionCommentEditor onSubmit={handleNewComment} />
      ) : (
        <p className="text-sm text-muted-foreground">Log in to leave a comment.</p>
      )}

      <div className="space-y-6">
        {sortedComments.map((comment) => (
          <SolutionCommentItem
            key={comment.id}
            comment={comment}
            solutionId={solutionId}
            currentUserId={currentUserId}
            onChange={(updated) =>
              setComments((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c)),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
