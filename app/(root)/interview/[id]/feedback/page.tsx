import type { Metadata } from "next";
import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  House,
  Minus,
  CheckCircle2,
} from "lucide-react";

import {
  getFeedbackByAttemptId,
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import PageState from "@/components/shared/PageState";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Interview feedback",
};

const Feedback = async ({
  params,
  searchParams,
}: {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const attemptId =
    typeof resolvedSearchParams.attemptId === "string"
      ? resolvedSearchParams.attemptId
      : undefined;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = attemptId
    ? await getFeedbackByAttemptId({ attemptId, userId: user.id })
    : await getFeedbackByInterviewId({ interviewId: id, userId: user.id });

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const t = getDictionary(locale);

  if (!feedback) {
    return (
      <section className="mx-auto max-w-4xl space-y-8 max-sm:px-4">
        <Link
          href={`/interview/${id}/attempts`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-100 hover:text-primary-200 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Attempt History
        </Link>
        <PageState
          tone="neutral"
          title="Feedback not ready yet"
          description="This attempt does not have feedback generated. You can review your attempts or retake the interview."
          action={
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href={`/interview/${id}/attempts`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--surface-border)] px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--surface-overlay-hover)]"
                style={{ color: "var(--text-body)" }}
              >
                View attempts
              </Link>
              <Link
                href={`/interview/${id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-200 px-5 py-3 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
              >
                <RotateCcw size={16} />
                Retake interview
              </Link>
            </div>
          }
        />
      </section>
    );
  }

  const score = feedback?.totalScore ?? 0;
  const scoreColor =
    score >= 80
      ? "text-emerald-700 dark:text-emerald-400"
      : score >= 50
        ? "text-amber-700 dark:text-amber-400"
        : "text-red-700 dark:text-red-400";
  const scoreBg =
    score >= 80
      ? "bg-emerald-500/15 border-emerald-500/20"
      : score >= 50
        ? "bg-amber-500/15 border-amber-500/20"
        : "bg-red-500/15 border-red-500/20";

  return (
    <section className="mx-auto max-w-4xl space-y-8 max-sm:px-4">
      {/* Back link */}
      <Link
        href={`/interview/${id}/attempts`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-100 hover:text-primary-200 transition-colors"
      >
        <ArrowLeft size={16} />
        {/* {t.interviewCard.viewAttempts} */}
        Back to Attempt History
      </Link>

      {/* Hero header */}
      <div
        className="relative overflow-hidden rounded-[28px] border border-[var(--surface-border)] p-7"
        style={{
          background: "var(--hero-gradient)",
          boxShadow: `0 24px 70px var(--shadow-heavy)`,
        }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-heading)" }}>
              {t.feedback.title}
              <span className="capitalize text-primary-100">
                {interview.role}
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={15} />
                {feedback?.createdAt
                  ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Score ring */}
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border ${scoreBg} px-10 py-5`}
          >
            <span className={`text-4xl font-extrabold ${scoreColor}`}>
              {score}
            </span>
            <Minus size={12} className="text-xs mt-1" style={{ color: "var(--text-muted)" }} />
            <span className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>100</span>
          </div>
        </div>
      </div>

      {/* Final Assessment */}
      <div className="rounded-2xl border border-[var(--surface-border)] p-6" style={{ background: "var(--surface-overlay)" }}>
        <p className="text-base leading-7" style={{ color: "var(--text-body)" }}>
          {feedback?.finalAssessment}
        </p>
      </div>

      {/* Category Breakdown */}
      {feedback?.categoryScores && feedback.categoryScores.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-heading)" }}>
            {t.feedback.breakdown}
          </h2>
          <div className="grid gap-3">
            {feedback.categoryScores.map((category, index) => {
              const catScoreColor =
                category.score >= 80
                  ? "text-emerald-700 dark:text-emerald-400"
                  : category.score >= 50
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-red-700 dark:text-red-400";
              const catBarColor =
                category.score >= 80
                  ? "bg-emerald-400"
                  : category.score >= 50
                    ? "bg-amber-400"
                    : "bg-red-400";

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[var(--surface-border)] p-5"
                  style={{ background: "var(--surface-overlay)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold" style={{ color: "var(--text-heading)" }}>
                      {category.name}
                    </h3>
                    <span
                      className={`text-sm font-extrabold ${catScoreColor}`}
                    >
                      {category.score}/100
                    </span>
                  </div>
                  {/* Score bar */}
                  <div className="h-1.5 w-full rounded-full mb-3" style={{ background: "var(--surface-border)" }}>
                    <div
                      className={`h-full rounded-full ${catBarColor} transition-all`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {category.comment}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Strengths */}
        {feedback?.strengths && feedback.strengths.length > 0 && (
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-700 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {t.feedback.strengths}
              </h3>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm leading-relaxed"
                  style={{ color: "var(--text-body)" }}
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {feedback?.areasForImprovement &&
          feedback.areasForImprovement.length > 0 && (
            <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-700 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {t.feedback.areasForImprovement}
                </h3>
              </div>
              <ul className="space-y-2">
                {feedback.areasForImprovement.map((area, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm leading-relaxed"
                    style={{ color: "var(--text-body)" }}
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-400" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center pt-2 pb-4">
        <Link
          href="/interview"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--surface-border)] px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--surface-overlay-hover)]"
          style={{ color: "var(--text-body)" }}
        >
          <House size={16} />
          {t.feedback.backToInterviews}
        </Link>

        <Link
          href={`/interview/${id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-200 px-5 py-3 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
        >
          <RotateCcw size={16} />
          {t.common.retakeInterview}
        </Link>
      </div>
    </section>
  );
};

export default Feedback;
