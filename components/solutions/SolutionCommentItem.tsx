"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowBigUp, Reply, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/UserAvatar";
import {
  toggleCommentUpvote,
  createComment,
  updateComment,
  deleteComment,
} from "@/lib/actions/solutions.actions";
import { SolutionCommentEditor } from "./SolutionCommentEditor";
import { toast } from "sonner";
import UserHoverCard from "@/components/UserHoverCard";

export interface Comment {
  id: string;
  content: string;
  isEdited: boolean;
  deletedAt: string | null;
  createdAt: string;
  upvoteCount: number;
  isUpvoted: boolean;
  user: { id: string; name: string; avatarUrl?: string };
  replies: Comment[];
}

interface Props {
  comment: Comment;
  solutionId: string;
  currentUserId?: string;
  isReply?: boolean;
}

export function SolutionCommentItem({
  comment,
  solutionId,
  currentUserId,
  isReply = false,
}: Props) {
  const [upvoteCount, setUpvoteCount] = useState(comment.upvoteCount);
  const [isUpvoted, setIsUpvoted] = useState(comment.isUpvoted);
  const [isDeleted, setIsDeleted] = useState(!!comment.deletedAt);
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [replies, setReplies] = useState<Comment[]>(comment.replies);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpvote = async () => {
    try {
      const result = await toggleCommentUpvote(solutionId, comment.id) as { isUpvoted: boolean };
      setIsUpvoted(result.isUpvoted);
      setUpvoteCount((c) => c + (result.isUpvoted ? 1 : -1));
    } catch {
      toast.error("Failed to upvote");
    }
  };

  const handleReply = async (replyContent: string) => {
    try {
      const newReply = await createComment(solutionId, {
        content: replyContent,
        parentId: comment.id,
      }) as Comment;
      setReplies((prev) => [...prev, newReply]);
      setShowReply(false);
    } catch {
      toast.error("Failed to post reply");
    }
  };

  const handleEdit = async (newContent: string) => {
    try {
      await updateComment(solutionId, comment.id, { content: newContent });
      setContent(newContent);
      setIsEditing(false);
    } catch {
      toast.error("Failed to edit comment");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteComment(solutionId, comment.id);
      setIsDeleted(true);
      setConfirmOpen(false);
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <div className={isReply ? "ml-4 border-l border-[var(--surface-border)] pl-4" : ""}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <UserHoverCard
          userId={comment.user.id}
          defaultName={comment.user.name}
          defaultAvatarUrl={comment.user.avatarUrl}
        >
          <span className="inline-flex items-center gap-2">
            <UserAvatar
              size="sm"
              name={comment.user.name}
              avatarUrl={comment.user.avatarUrl}
            />
            <span className="font-medium text-foreground">{comment.user.name}</span>
          </span>
        </UserHoverCard>
        <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
        {comment.isEdited && <span className="italic">(edited)</span>}
      </div>

      {isEditing ? (
        <div className="pl-7">
          <SolutionCommentEditor
            initialValue={content}
            onSubmit={handleEdit}
            onCancel={() => setIsEditing(false)}
            submitLabel="Save"
          />
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none pl-7">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}

      <div className="flex items-center gap-1 pl-7 mt-1">
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 gap-1 text-xs ${isUpvoted ? "text-primary" : ""}`}
          onClick={handleUpvote}
          aria-label={isUpvoted ? "Remove upvote" : "Upvote"}
        >
          <ArrowBigUp
            className="h-3.5 w-3.5"
            fill={isUpvoted ? "currentColor" : "none"}
            strokeWidth={2}
          />
          {upvoteCount}
        </Button>
        {!isReply && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setShowReply((v) => !v)}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}
        {currentUserId === comment.user.id && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-destructive hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete comment"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>

      {confirmOpen && (
        <AdminConfirmDialog
          title="Delete this comment?"
          description="The comment will be marked as deleted and will no longer be visible to other users."
          warning="This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={isDeleting}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {showReply && (
        <div className="ml-8 mt-2">
          <SolutionCommentEditor
            onSubmit={handleReply}
            onCancel={() => setShowReply(false)}
            placeholder="Write a reply... (Markdown supported)"
            submitLabel="Reply"
          />
        </div>
      )}

      <div className="mt-3 space-y-3">
        {replies.map((reply) => (
          <SolutionCommentItem
            key={reply.id}
            comment={reply}
            solutionId={solutionId}
            currentUserId={currentUserId}
            isReply
          />
        ))}
      </div>
    </div>
  );
}
