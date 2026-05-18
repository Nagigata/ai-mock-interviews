"use client";

import { useEffect, useState, useTransition } from "react";
import { SolutionCard } from "./SolutionCard";
import { getSolutions } from "@/lib/actions/solutions.actions";
import { Button } from "@/components/ui/button";

interface Solution {
  id: string;
  title: string;
  description?: string;
  language: string;
  upvoteCount: number;
  commentCount: number;
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
      <div className="text-center py-12 text-muted-foreground text-sm">
        Loading solutions...
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No solutions yet. Be the first to share an Accepted submission!
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
