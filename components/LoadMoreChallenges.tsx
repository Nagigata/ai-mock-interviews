"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useInView } from "react-intersection-observer";
import ChallengeCard from "./ChallengeCard";
import { Challenge } from "@/types";
import type { getDictionary } from "@/lib/i18n";
import { getAllChallenges } from "@/lib/actions/challenges.action";
import { Loader2 } from "lucide-react";

interface Props {
  initialFilters: Record<string, string | string[]>;
  dictionary: ReturnType<typeof getDictionary>;
}

type ChallengeListItem = Challenge & {
  skillSlug?: string;
};

const getChallengeSkillSlug = (challenge: ChallengeListItem) =>
  challenge.skillSlug || challenge.skill?.slug || "algorithms";

const LoadMoreChallenges = ({ initialFilters, dictionary }: Props) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1 });

  const loadMoreData = useEffectEvent(async () => {
    setIsLoading(true);
    try {
      const filtersWithPage = { ...initialFilters, page, limit: 100 };
      const response = await getAllChallenges(filtersWithPage);
      const nextChallenges = response?.data;

      if (nextChallenges && nextChallenges.length > 0) {
        setChallenges((prev) => {
          // Prevent duplicates incase of react strict mode
          const newItems = nextChallenges.filter(
            (nc) => !prev.some((pc) => pc.id === nc.id)
          );
          return [...prev, ...newItems];
        });
        setPage((prev) => prev + 1);
        if (nextChallenges.length < 100) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreData();
    }
  }, [inView, hasMore, isLoading]);

  return (
    <>
      {challenges.map((challenge) => (
        <ChallengeCard
          key={`more-${challenge.id}`}
          challenge={challenge}
          skillSlug={getChallengeSkillSlug(challenge as ChallengeListItem)}
          dictionary={dictionary}
        />
      ))}
      {hasMore && (
        <div ref={ref} className="flex w-full justify-center py-6">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.035] px-5 py-3 text-sm font-semibold text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary-200" />
            Loading more challenges
          </div>
        </div>
      )}
    </>
  );
};

export default LoadMoreChallenges;
