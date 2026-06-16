"use client";

import { Check } from "lucide-react";

import { UserDashboardStats } from "@/types";
import { cn } from "@/lib/utils";

interface AcceptanceOverviewProps {
  stats: UserDashboardStats;
  className?: string;
}

const difficultyConfig = [
  {
    key: "easy",
    label: "Easy",
    trackColor: "rgba(52, 211, 153, 0.18)",
    fillColor: "#34d399",
    accentClass: "text-emerald-700 dark:text-emerald-400",
  },
  {
    key: "medium",
    label: "Med.",
    trackColor: "rgba(251, 191, 36, 0.18)",
    fillColor: "#fbbf24",
    accentClass: "text-amber-700 dark:text-amber-400",
  },
  {
    key: "hard",
    label: "Hard",
    trackColor: "rgba(248, 113, 113, 0.18)",
    fillColor: "#f87171",
    accentClass: "text-red-700 dark:text-red-400",
  },
] as const;

const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  const roundCoordinate = (value: number) => Number(value.toFixed(4));
  return {
    x: roundCoordinate(cx + radius * Math.cos(angleInRadians)),
    y: roundCoordinate(cy + radius * Math.sin(angleInRadians)),
  };
};

const describeArc = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
};

const AcceptanceOverview = ({ stats, className }: AcceptanceOverviewProps) => {
  const totalChallenges =
    stats.difficultyProgress.easy.total +
    stats.difficultyProgress.medium.total +
    stats.difficultyProgress.hard.total;

  const segments = [
    { start: 210, end: 300, ...difficultyConfig[0] },
    { start: 310, end: 410, ...difficultyConfig[1] },
    { start: 60, end: 150, ...difficultyConfig[2] },
  ] as const;

  return (
    <div className={cn("flex h-full", className)}>
      <div className="grid w-full items-center gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative flex min-h-[300px] items-center justify-center rounded-[24px] px-4 py-5">
          <svg
            viewBox="0 0 260 260"
            className="h-[260px] w-[260px]"
            aria-label="Acceptance overview"
          >
            {segments.map((segment) => {
              const progress =
                stats.difficultyProgress[
                  segment.key as keyof typeof stats.difficultyProgress
                ];
              const ratio = progress.total > 0 ? progress.solved / progress.total : 0;
              const fillEnd = segment.start + (segment.end - segment.start) * ratio;

              return (
                <g key={segment.key}>
                  <path
                    d={describeArc(130, 130, 92, segment.start, segment.end)}
                    fill="none"
                    stroke={segment.trackColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {ratio > 0 ? (
                    <path
                      d={describeArc(130, 130, 92, segment.start, fillEnd)}
                      fill="none"
                      stroke={segment.fillColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 text-center">
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-bold text-white">
                {stats.totalSolvedChallenges}
              </p>
              <p className="text-lg font-semibold text-muted-foreground">
                /{totalChallenges}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2 text-foreground">
              <Check className="size-4 text-emerald-700 dark:text-emerald-400" />
              <span className="text-lg">Solved</span>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              {stats.attemptingChallenges} Attempting
            </p>
          </div>
        </div>

        <div className="grid content-center gap-3">
          {difficultyConfig.map((item) => {
            const value =
              stats.difficultyProgress[
                item.key as keyof typeof stats.difficultyProgress
              ];

            return (
              <div
                key={item.key}
                className="rounded-2xl border border-foreground/8 bg-muted px-5 py-4"
              >
                <p className={`text-xl font-semibold ${item.accentClass}`}>
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {value.solved}/{value.total}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AcceptanceOverview;
