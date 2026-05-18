"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowBigUp, ArrowLeft, Eye, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import { formatDistanceToNow } from "date-fns";
import { toggleSolutionUpvote, deleteSolution } from "@/lib/actions/solutions.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SolutionCommentsSection } from "./SolutionCommentsSection";
import { Comment } from "./SolutionCommentItem";

interface Solution {
  id: string;
  challengeId: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  upvoteCount: number;
  viewCount: number;
  isUpvoted: boolean;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string };
  comments: Comment[];
}

interface Props {
  solution: Solution;
  currentUserId?: string;
  onBack?: () => void;
}

export function SolutionDetail({ solution, currentUserId, onBack }: Props) {
  const [isUpvoted, setIsUpvoted] = useState(solution.isUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(solution.upvoteCount);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpvote = async () => {
    try {
      const result = (await toggleSolutionUpvote(solution.id)) as {
        isUpvoted: boolean;
      };
      setIsUpvoted(result.isUpvoted);
      setUpvoteCount((c) => c + (result.isUpvoted ? 1 : -1));
    } catch {
      toast.error("Failed to upvote");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSolution(solution.id);
      toast.success("Solution deleted");
      setConfirmOpen(false);
      onBack?.();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const initial = solution.user.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-light-400 transition-colors hover:text-primary-100"
          >
            <ArrowLeft className="size-3.5" />
            Back to solutions
          </button>
        )}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold">{solution.title}</h1>
          <Badge variant="outline" className="capitalize">
            {solution.language}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar size="sm">
            {solution.user.avatarUrl && (
              <AvatarImage
                src={solution.user.avatarUrl}
                alt={solution.user.name}
              />
            )}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <span>{solution.user.name}</span>
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(solution.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1",
              isUpvoted && "border-primary-200/40 bg-primary-200/10 text-primary-100",
            )}
            onClick={handleUpvote}
            aria-label={isUpvoted ? "Remove upvote" : "Upvote"}
          >
            <ArrowBigUp
              className="size-4"
              fill={isUpvoted ? "currentColor" : "none"}
              strokeWidth={2}
            />
            {upvoteCount}
          </Button>
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="size-4" />
            {solution.viewCount}
          </span>
          {currentUserId === solution.user.id && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete solution"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {solution.description && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{solution.description}</ReactMarkdown>
        </div>
      )}

      <div className="rounded-md overflow-hidden text-sm">
        <SyntaxHighlighter
          language={solution.language}
          style={oneDark}
          showLineNumbers
        >
          {solution.code}
        </SyntaxHighlighter>
      </div>

      <SolutionCommentsSection
        solutionId={solution.id}
        initialComments={solution.comments}
        currentUserId={currentUserId}
      />

      {confirmOpen && (
        <AdminConfirmDialog
          title="Delete this solution?"
          description="Your solution and all its comments will be permanently removed."
          itemName={solution.title}
          itemMeta={solution.language}
          warning="This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={isDeleting}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
