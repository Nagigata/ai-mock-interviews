"use client";

import { useState } from "react";
import { SolutionCommentEditor } from "./SolutionCommentEditor";
import { SolutionCommentItem, Comment } from "./SolutionCommentItem";
import { createComment } from "@/lib/actions/solutions.actions";
import { toast } from "sonner";

interface Props {
  solutionId: string;
  initialComments: Comment[];
  currentUserId?: string;
}

export function SolutionCommentsSection({ solutionId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);

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
      <h2 className="font-semibold text-base">
        {comments.length} Comment{comments.length !== 1 ? "s" : ""}
      </h2>

      {currentUserId ? (
        <SolutionCommentEditor onSubmit={handleNewComment} />
      ) : (
        <p className="text-sm text-muted-foreground">Log in to leave a comment.</p>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <SolutionCommentItem
            key={comment.id}
            comment={comment}
            solutionId={solutionId}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
