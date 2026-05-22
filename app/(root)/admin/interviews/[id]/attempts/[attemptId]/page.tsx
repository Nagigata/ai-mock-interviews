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
    return "bg-emerald-500/15 border-emerald-500/20 text-emerald-400";
  }

  if (score >= 50) {
    return "bg-amber-500/15 border-amber-500/20 text-amber-400";
  }

  return "bg-red-500/15 border-red-500/20 text-red-400";
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

      <div className="rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(92,114,255,0.14),_transparent_34%),linear-gradient(135deg,#1d1f24_0%,#11141a_100%)] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold capitalize text-white">
              {attempt.interview.role} Attempt
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-light-400">
              Review this attempt by switching between AI feedback and the
              captured transcript.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-light-300">
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
              <span className="mt-1 text-xs text-light-400">/100</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-8 py-5 text-center">
              <p className="text-sm font-bold text-white">No Feedback</p>
              <p className="mt-1 text-xs text-light-400">
                Feedback has not been generated.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-400" />
          <div>
            <h2 className="text-sm font-bold text-amber-400">
              Sensitive Admin View
            </h2>
            <p className="mt-1 text-sm leading-6 text-light-300">
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
