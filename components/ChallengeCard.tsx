"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Star } from "lucide-react";

import type { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Challenge, Difficulty } from "@/types";
import { toggleChallengeStar } from "@/lib/actions/challenges.action";

interface ChallengeCardProps {
  challenge: Challenge;
  skillSlug: string;
  dictionary: ReturnType<typeof getDictionary>;
}

const difficultyStyles: Record<Difficulty, string> = {
  EASY: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  MEDIUM: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
  HARD: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/20",
};

const ChallengeCard = ({ challenge, skillSlug }: ChallengeCardProps) => {
  const router = useRouter();
  const [isStarred, setIsStarred] = useState(challenge.isStarred);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStar = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setIsLoading(true);
    const result = await toggleChallengeStar(challenge.id);
    if (result) {
      setIsStarred(result.starred);
    }
    setIsLoading(false);
  };

  const formatDifficulty = (difficulty: string) =>
    difficulty.charAt(0) + difficulty.slice(1).toLowerCase();

  const topics = challenge.topics ? challenge.topics.split(", ") : [];

  return (
    <div
      onClick={() => router.push(`/preparation/${skillSlug}/${challenge.id}`)}
      className="group w-full cursor-pointer"
    >
      <div
        className="relative flex flex-col gap-5 rounded-2xl border border-[var(--surface-border)] p-5 transition-all duration-300 hover:border-[var(--surface-border-hover)] sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        style={{
          background: `linear-gradient(180deg, var(--surface-card-gradient-from), var(--surface-card-gradient-to))`,
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <h3 className="text-lg font-bold leading-tight transition-colors group-hover:text-primary-100" style={{ color: "var(--text-heading)" }}>
            {challenge.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold",
                difficultyStyles[challenge.difficulty] ||
                  "border-[var(--surface-border)] text-[var(--text-muted)]",
              )}
            >
              {formatDifficulty(challenge.difficulty)}
            </span>
            {topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center rounded-lg border border-[var(--surface-border)] px-2.5 py-1 text-[11px]"
                style={{ background: "var(--surface-overlay)", color: "var(--text-muted)" }}
              >
                {topic}
              </span>
            ))}
            {topics.length > 3 && (
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                +{topics.length - 3} more
              </span>
            )}
          </div>

        </div>

        <div className="flex shrink-0 items-center gap-4">
          <button
            onClick={handleToggleStar}
            disabled={isLoading}
            className={cn(
              "rounded-full p-1 transition-all duration-200",
              isStarred
                ? "text-yellow-700 dark:text-yellow-400"
                : "text-[var(--text-muted)] hover:text-[var(--text-body)]",
            )}
            title={isStarred ? "Unmark" : "Mark Star"}
            aria-label={isStarred ? "Unmark challenge" : "Mark challenge"}
          >
            <Star
              size={18}
              fill={isStarred ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </button>

          {challenge.isSolved ? (
            <div className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Solved
              <Check size={14} strokeWidth={3} />
            </div>
          ) : (
            <div className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-primary-200 px-5 py-2.5 text-xs font-bold text-dark-100 transition-colors group-hover:bg-primary-200/80">
              Solve Challenge
              <ChevronRight size={14} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
