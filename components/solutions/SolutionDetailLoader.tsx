"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getSolutionById } from "@/lib/actions/solutions.actions";
import { SolutionDetail } from "./SolutionDetail";
import { Comment } from "./SolutionCommentItem";

interface Solution {
  id: string;
  challengeId: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  upvoteCount: number;
  isUpvoted: boolean;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string };
  comments: Comment[];
}

interface Props {
  solutionId: string;
  currentUserId?: string;
  onBack: () => void;
}

export function SolutionDetailLoader({ solutionId, currentUserId, onBack }: Props) {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setSolution(null);
    setError(null);
    getSolutionById(solutionId)
      .then((raw) => {
        if (!ignore) setSolution(raw as Solution);
      })
      .catch((e: unknown) => {
        if (!ignore) {
          const msg = e instanceof Error ? e.message : "Failed to load solution";
          setError(msg);
        }
      });
    return () => {
      ignore = true;
    };
  }, [solutionId]);

  if (error) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary-100"
        >
          <ArrowLeft className="size-3.5" />
          Back to solutions
        </button>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Loading solution...
      </div>
    );
  }

  return (
    <SolutionDetail
      solution={solution}
      currentUserId={currentUserId}
      onBack={onBack}
    />
  );
}
