import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MessageSquareText,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import AdminAttemptReviewTabs from "@/components/admin/AdminAttemptReviewTabs";
import { getAdminInterviewAttemptDetail } from "@/lib/actions/admin.actions";

export const metadata: Metadata = {
  title: "Admin attempt review",
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "Not completed";

const getScoreTone = (score = 0) => {
  if (score >= 80) {
    return "bg-emerald-500/15 border-emerald-500/20 text-emerald-700 dark:text-emerald-400";
  }

  if (score >= 50) {
    return "bg-amber-500/15 border-amber-500/20 text-amber-700 dark:text-amber-400";
  }

  return "bg-red-500/15 border-red-500/20 text-red-700 dark:text-red-400";
};

export default async function AdminInterviewAttemptDetailPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id, attemptId } = await params;
  const attempt = await getAdminInterviewAttemptDetail(id, attemptId);

  if (!attempt) {
    redirect(`/admin/interviews/${id}`);
  }

  const feedback = attempt.feedback;

  return (
    <section className="space-y-6 animate-fadeIn">
      <Link
        href={`/admin/interviews/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-100 transition-colors hover:text-primary-200"
      >
        <ArrowLeft className="size-4" />
        Back to Interview Detail
      </Link>

      <div
        className="rounded-[28px] border border-[var(--surface-border)] p-7"
        style={{ background: "var(--hero-gradient)", boxShadow: "0 24px 70px var(--shadow-heavy)" }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold capitalize" style={{ color: "var(--text-heading)" }}>
              {attempt.interview.role} Attempt
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
              Review this attempt by switching between AI feedback and the
              captured transcript.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-3.5" />
                {attempt.user?.name} ({attempt.user?.email})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {formatDate(attempt.completedAt || attempt.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquareText className="size-3.5" />
                {attempt.transcripts?.length || 0} messages
              </span>
            </div>
          </div>

          {feedback ? (
            <div
              className={`flex min-w-[150px] flex-col items-center justify-center rounded-2xl border px-8 py-5 ${getScoreTone(
                feedback.totalScore,
              )}`}
            >
              <span className="text-4xl font-extrabold">
                {feedback.totalScore}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">/100</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--surface-border)] px-8 py-5 text-center" style={{ background: "var(--surface-overlay)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--text-heading)" }}>No Feedback</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Feedback has not been generated.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400" />
          <div>
            <h2 className="text-sm font-bold text-amber-700 dark:text-amber-400">
              Sensitive Admin View
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Use this content only for moderation, support, debugging, and
              interview quality review.
            </p>
          </div>
        </div>
      </div>

      <AdminAttemptReviewTabs attempt={attempt} />
    </section>
  );
}
