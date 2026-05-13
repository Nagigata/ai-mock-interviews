import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  History,
  MessageSquareText,
  RotateCcw,
  Star,
  Clock,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewAttempts,
  getInterviewById,
} from "@/lib/actions/general.action";
import { InterviewAttemptStatus } from "@/types";

const formatDateTime = (value: string | null | undefined, timeZone: string) => {
  if (!value) {
    return "Not completed yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
};

const getAttemptStatusConfig = (
  status: InterviewAttemptStatus | undefined,
  hasFeedback: boolean,
) => {
  if (hasFeedback || status === "COMPLETED") {
    return {
      label: "Completed",
      className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      emptyText: "Feedback is available for this completed attempt.",
    };
  }

  if (status === "TOO_SHORT") {
    return {
      label: "Too short",
      className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
      emptyText:
        "This interview ended before enough answers were provided, so feedback was not generated.",
    };
  }

  if (status === "FAILED") {
    return {
      label: "Failed",
      className: "border-red-400/20 bg-red-400/10 text-red-300",
      emptyText:
        "Feedback generation failed for this attempt. Please try another attempt.",
    };
  }

  return {
    label: "In progress",
    className: "border-white/10 bg-white/[0.04] text-light-300",
    emptyText: "This attempt has not generated feedback yet.",
  };
};

const AttemptsPage = async ({
  params,
}: {
  params: Promise<Record<string, string>>;
}) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [interview, attempts] = await Promise.all([
    getInterviewById(id),
    getInterviewAttempts(id),
  ]);

  if (!interview) {
    redirect("/interview");
  }

  const cookieStore = await cookies();
  const timeZone = cookieStore.get("USER_TIMEZONE")?.value || "UTC";

  const bestScore =
    attempts
      ?.filter((a) => a.status === "COMPLETED" || a.feedback)
      .map((a) => a.feedback?.totalScore ?? 0)
      .reduce((max, s) => Math.max(max, s), 0) || 0;
  const completedAttempts =
    attempts?.filter((attempt) => attempt.status === "COMPLETED" || attempt.feedback)
      .length || 0;

  return (
    <section className="flex flex-col gap-8">
      {/* Back link */}
      <Link
        href="/interview"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-100 hover:text-primary-200 transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Interviews
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(202,197,254,0.16),_transparent_34%),linear-gradient(135deg,#1d1f24_0%,#11141a_100%)] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/20 bg-primary-200/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primary-100">
              <History size={14} />
              Attempt History
            </div>
            <h1 className="mt-4 text-3xl font-bold capitalize text-white sm:text-4xl">
              {interview.role} Interview
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-light-400">
              Review every time you took this interview, compare scores, and
              reopen the feedback for each attempt.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 text-center">
              <div className="text-2xl font-bold text-white">
                {attempts?.length || 0}
              </div>
              <div className="text-[11px] text-light-400 mt-1">Attempts</div>
            </div>
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] px-5 py-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {completedAttempts}
              </div>
              <div className="text-[11px] text-light-400 mt-1">
                Completed
              </div>
            </div>
            {bestScore > 0 && (
              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] px-5 py-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {bestScore}
                </div>
                <div className="text-[11px] text-light-400 mt-1">
                  Best Score
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!attempts || attempts.length === 0 ? (
        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-10 text-center">
          <Clock size={40} className="mx-auto text-light-600 mb-4" />
          <p className="text-lg font-semibold text-white">No attempts yet</p>
          <p className="mt-2 text-sm text-light-400">
            Start this interview once and your result will appear here.
          </p>
          <Link
            href={`/interview/${id}`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-200 px-5 py-3 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
          >
            <RotateCcw size={16} />
            Start Interview
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {attempts.map((attempt, index) => {
            const feedback = attempt.feedback;
            const displayDate = formatDateTime(
              attempt.completedAt || attempt.endedAt || attempt.createdAt,
              timeZone,
            );
            const attemptNumber = attempts.length - index;
            const attemptScore = feedback?.totalScore ?? 0;
            const statusConfig = getAttemptStatusConfig(
              attempt.status,
              Boolean(feedback),
            );
            const scoreColor =
              attemptScore >= 80
                ? "text-emerald-400"
                : attemptScore >= 50
                  ? "text-amber-400"
                  : attemptScore > 0
                    ? "text-red-400"
                    : "text-light-400";

            return (
              <article
                key={attempt.id}
                className="group rounded-2xl border border-white/6 bg-[#171a20] p-5 transition-all duration-200 hover:border-white/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Attempt header */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-lg bg-primary-200 px-3 py-1 text-xs font-extrabold text-dark-100">
                        #{attemptNumber}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-light-400">
                        <CalendarDays size={13} />
                        {displayDate}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold ${scoreColor}`}
                      >
                        <Star size={13} />
                        {feedback
                          ? `${feedback.totalScore}/100`
                          : "No score"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-light-400">
                        <MessageSquareText size={13} />
                        {attempt.transcriptCount || 0} messages
                      </span>
                    </div>

                    {/* Assessment preview */}
                    <p className="line-clamp-2 text-sm text-light-100 leading-relaxed">
                      {feedback?.finalAssessment ||
                        attempt.failureReason ||
                        statusConfig.emptyText}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/interview/${id}/attempts/${attempt.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-light-100 transition-colors hover:bg-white/5"
                    >
                      <FileText size={14} />
                      Transcript
                    </Link>
                    {feedback ? (
                      <Link
                        href={`/interview/${id}/feedback?attemptId=${attempt.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-200 px-4 py-2.5 text-xs font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
                      >
                        View Feedback
                      </Link>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Bottom action */}
      {attempts && attempts.length > 0 && (
        <div className="flex justify-center pb-4">
          <Link
            href={`/interview/${id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-200 px-6 py-3 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
          >
            <RotateCcw size={16} />
            Retake Interview
          </Link>
        </div>
      )}
    </section>
  );
};

export default AttemptsPage;
