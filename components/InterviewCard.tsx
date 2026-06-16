"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  GraduationCap,
  MessageSquareText,
  Star,
  Trash2,
} from "lucide-react";

import DisplayTechIcons from "./DisplayTechIcons";
import { getDictionary } from "@/lib/i18n";
import { Feedback, InterviewCardProps } from "@/types";
import { toggleInterviewStar } from "@/lib/actions/general.action";

interface InterviewCardProps2 extends InterviewCardProps {
  feedback?: Feedback | null;
  locale?: string;
  showDelete?: boolean;
  attemptCount?: number;
  onDelete?: () => void;
}

const typeStyles: Record<string, string> = {
  Technical: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  Behavioral: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  Mixed: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
};

const getScoreTone = (score?: number) => {
  if (!score) return "border-[var(--surface-border)] text-[var(--text-muted)]";
  if (score >= 80) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (score >= 50) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  return "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300";
};

const InterviewCard = ({
  interviewId,
  role,
  level,
  type,
  techstack,
  createdAt,
  language,
  isStarred: initialIsStarred = false,
  feedback,
  locale = "en",
  showDelete,
  attemptCount = 0,
  onDelete,
}: InterviewCardProps2) => {
  const [isStarred, setIsStarred] = useState(initialIsStarred);
  const [isStarLoading, setIsStarLoading] = useState(false);
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const t = getDictionary(locale);
  const formattedDate =
    feedback?.createdAt || createdAt
      ? dayjs(feedback?.createdAt || createdAt).format("MMM D, YYYY")
      : "Recently";
  const score = feedback?.totalScore;
  const scoreTone = getScoreTone(score);

  const handleToggleStar = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!interviewId) {
      return;
    }

    setIsStarLoading(true);
    const result = await toggleInterviewStar(interviewId);
    if (result) {
      setIsStarred(result.starred);
    }
    setIsStarLoading(false);
  };

  return (
    <article className="group relative flex min-h-[360px] w-full">
      <div
        className="relative flex w-full flex-col overflow-hidden rounded-[28px] border border-[var(--surface-border)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/20"
        style={{
          background: `linear-gradient(180deg, var(--surface-card-gradient-from), var(--surface-card-gradient-to))`,
          boxShadow: `0 12px 34px var(--shadow-color)`,
        }}
      >
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <button
            onClick={handleToggleStar}
            disabled={isStarLoading || !interviewId}
            className={`rounded-xl border border-[var(--surface-border)] p-2 transition-all duration-200 ${
              isStarred
                ? "text-yellow-700 dark:text-yellow-400 hover:border-yellow-400/30 hover:bg-yellow-400/10"
                : "text-[var(--text-muted)] hover:border-[var(--surface-border-hover)] hover:text-[var(--text-body)]"
            }`}
            style={{ background: "var(--surface-overlay)" }}
            title={isStarred ? "Unmark" : "Mark Star"}
            aria-label={isStarred ? "Unmark interview" : "Mark interview"}
          >
            <Star
              className="size-3.5"
              fill={isStarred ? "currentColor" : "none"}
            />
          </button>

          {showDelete && onDelete && (
            <button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete();
              }}
              className="rounded-xl border border-[var(--surface-border)] p-2 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              style={{ background: "var(--surface-overlay)", color: "var(--text-muted)" }}
              title="Delete interview"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>

        <div className="relative mb-5 flex items-center gap-2 pr-20">
          <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${typeStyles[normalizedType] || typeStyles.Mixed}`}
          >
            {normalizedType}
          </span>

          {language && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--surface-border)] px-2.5 py-1" style={{ background: "var(--surface-overlay)" }}>
              <Image
                src={
                  language === "vi"
                    ? "https://flagcdn.com/vn.svg"
                    : "https://flagcdn.com/gb.svg"
                }
                alt={language}
                width={16}
                height={11}
                className="rounded-[2px] object-cover"
              />
              <span className="text-[11px] font-semibold uppercase" style={{ color: "var(--text-body)" }}>
                {language === "vi" ? "VI" : "EN"}
              </span>
            </span>
          )}
          {level && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200/15 bg-primary-200/10 px-2.5 py-1 text-[11px] font-semibold text-primary-100">
              <GraduationCap className="size-3.5" />
              {level}
            </span>
          )}
        </div>

        <h3 className="relative mb-3 text-xl font-bold capitalize leading-tight" style={{ color: "var(--text-heading)" }}>
          {role} {t.interviewCard.mockInterview}
        </h3>

        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--surface-border)] px-2.5 py-1.5" style={{ background: "var(--surface-overlay)" }}>
            <Calendar className="size-3.5 text-primary-100/70" />
            {formattedDate}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-semibold ${scoreTone}`}
          >
            <Star className="size-3.5" />
            {score ? `${score}/100` : "---"}
          </span>

          {attemptCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--surface-border)] px-2.5 py-1.5" style={{ background: "var(--surface-overlay)" }}>
              <Clock className="size-3.5 text-primary-100/70" />
              {attemptCount} attempt{attemptCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <p className="mb-5 line-clamp-3 min-h-[60px] text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {feedback?.finalAssessment || t.interviewCard.notTakenMsg}
        </p>

        <div className="mb-5 flex items-center justify-between rounded-2xl border border-[var(--surface-border)] px-4 py-3" style={{ background: "var(--surface-overlay)" }}>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Tech Stack</span>
          <DisplayTechIcons techStack={techstack} />
        </div>

        <div className="mt-auto">
          {feedback ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/interview/${interviewId}/attempts`}
                className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-primary-200 px-3 py-2.5 text-xs font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
              >
                <MessageSquareText className="size-3.5 shrink-0" />
                <span className="truncate">Attempts</span>
              </Link>
              <Link
                href={`/interview/${interviewId}`}
                className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-primary-200/30 px-3 py-2.5 text-xs font-bold text-primary-200 transition-colors hover:bg-primary-200/10"
              >
                <span className="truncate">Retake</span>
                <ArrowRight className="size-3.5 shrink-0" />
              </Link>
            </div>
          ) : (
            <Link
              href={`/interview/${interviewId}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary-200 px-4 py-3 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
            >
              {t.interviewCard.startInterview}
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default InterviewCard;
