"use client";

import { useEffect, useState, useTransition } from "react";
import { SolutionCard } from "./SolutionCard";
import { getSolutions } from "@/lib/actions/solutions.actions";
import { Button } from "@/components/ui/button";

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
  challengeId: string;
  onSelectSolution: (solutionId: string) => void;
  limit?: number;
}

export function SolutionsList({ challengeId, onSelectSolution, limit = 20 }: Props) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let ignore = false;
    setIsInitialLoading(true);
    getSolutions(challengeId, 1, limit)
      .then((raw) => {
        if (ignore) return;
        const data = raw as { solutions: Solution[]; total: number };
        setSolutions(data.solutions);
        setTotal(data.total);
        setPage(1);
      })
      .catch(() => {
        if (!ignore) setSolutions([]);
      })
      .finally(() => {
        if (!ignore) setIsInitialLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [challengeId, limit]);

  const loadMore = () => {
    const nextPage = page + 1;
    startTransition(async () => {
      const data = (await getSolutions(challengeId, nextPage, limit)) as {
        solutions: Solution[];
      };
      setSolutions((prev) => [...prev, ...data.solutions]);
      setPage(nextPage);
    });
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-[var(--surface-border)] p-5"
            style={{ background: `linear-gradient(180deg, var(--surface-card-gradient-from), var(--surface-card-gradient-to))` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="h-4 w-2/3 animate-pulse rounded-md bg-white/[0.06]" />
              <div className="h-6 w-16 animate-pulse rounded-lg bg-white/[0.06]" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <div className="size-6 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-12 animate-pulse rounded-lg bg-white/[0.06]" />
                <div className="h-6 w-8 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-6 w-8 animate-pulse rounded bg-white/[0.06]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div
          className="flex size-12 items-center justify-center rounded-2xl border border-[var(--surface-border)]"
          style={{ background: "var(--surface-overlay)" }}
        >
          <svg className="size-6" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--text-heading)" }}>No solutions yet</p>
        <p className="max-w-xs text-xs" style={{ color: "var(--text-muted)" }}>
          Be the first to share your accepted submission and help others learn!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {solutions.map((s) => (
        <SolutionCard key={s.id} solution={s} onSelect={onSelectSolution} />
      ))}
      {solutions.length < total && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={isPending}>
            {isPending ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
