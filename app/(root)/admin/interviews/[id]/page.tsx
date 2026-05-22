import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Eye,
  MessageSquareText,
  ShieldAlert,
  Star,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { getAdminInterviewDetail } from "@/lib/actions/admin.actions";

export const metadata: Metadata = {
  title: "Admin interview detail",
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "Not completed";

export default async function AdminInterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const interview = await getAdminInterviewDetail(id);

  if (!interview) {
    redirect("/admin/interviews");
  }

  return (
    <section className="space-y-6 animate-fadeIn">
      <Link
        href="/admin/interviews"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-100 transition-colors hover:text-primary-200"
      >
        <ArrowLeft className="size-4" />
        Back to Interviews
      </Link>

      <div className="rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(202,197,254,0.14),_transparent_35%),linear-gradient(135deg,#1d1f24_0%,#11141a_100%)] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold capitalize text-white">
                {interview.role}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-light-400">
                Admin view for interview configuration, attempts, feedback
                availability, and transcript counts.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary-200/15 px-3 py-1 text-xs font-medium capitalize text-primary-200">
                {interview.level}
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium capitalize text-light-100">
                {interview.type}
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-light-100">
                {interview.language?.toUpperCase()}
              </span>
              {interview.finalized && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  Finalized
                </span>
              )}
              {interview.archivedAt && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400">
                  <Archive className="size-3" />
                  Archived
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs text-light-400">Attempts</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {interview.totalAttempts}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs text-light-400">Feedbacks</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {interview.totalFeedbacks}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-400" />
          <div>
            <h2 className="text-sm font-bold text-amber-400">
              Privacy Notice
            </h2>
            <p className="mt-1 text-sm leading-6 text-light-300">
              Interview transcript and feedback may contain personal
              information. Admin access is intended only for moderation, support,
              and quality review.
            </p>
          </div>
        </div>
      </div>

      {interview.archivedAt && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
          <div className="flex gap-3">
            <Archive className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Archived Interview
              </h2>
              <p className="mt-1 text-sm leading-6 text-light-400">
                This interview is hidden from Explore since{" "}
                {formatDate(interview.archivedAt)}. Existing attempts,
                transcripts, and feedback remain available for admin review.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/6 bg-dark-200/50 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <UserRound className="size-4 text-primary-200" />
            Creator
          </div>
          <p className="text-sm text-light-100">{interview.user?.name}</p>
          <p className="mt-1 text-xs text-light-400">{interview.user?.email}</p>
        </div>

        <div className="rounded-2xl border border-white/6 bg-dark-200/50 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <CalendarDays className="size-4 text-primary-200" />
            Created
          </div>
          <p className="text-sm text-light-100">
            {formatDate(interview.createdAt)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/6 bg-dark-200/50 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <MessageSquareText className="size-4 text-primary-200" />
            Tech Stack
          </div>
          <div className="flex flex-wrap gap-2">
            {interview.techstack?.map((tech: string) => (
              <span
                key={tech}
                className="rounded-md bg-primary-200/10 px-2 py-1 text-xs text-primary-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {interview.questions?.length > 0 && (
        <div className="rounded-2xl border border-white/6 bg-dark-200/50 p-5">
          <h2 className="mb-4 text-lg font-bold text-white">
            Generated Questions
          </h2>
          <ol className="space-y-3">
            {interview.questions.map((question: string, index: number) => (
              <li
                key={`${question}-${index}`}
                className="rounded-xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-6 text-light-100"
              >
                <span className="mr-2 text-primary-200">{index + 1}.</span>
                {question}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-dark-200/50 overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-bold text-white">Attempts</h2>
          <p className="mt-1 text-sm text-light-400">
            Review who attempted this interview and whether feedback exists.
          </p>
        </div>

        {interview.attempts?.length === 0 ? (
          <div className="p-10 text-center">
            <MessageSquareText className="mx-auto mb-3 size-9 text-light-600" />
            <p className="text-sm font-semibold text-white">No attempts yet</p>
            <p className="mt-1 text-sm text-light-400">
              This interview has not been taken by any user.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-light-400">
                  User
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                  Transcript
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                  Feedback
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                  Completed
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-light-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {interview.attempts.map((attempt: any) => (
                <tr
                  key={attempt.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">
                      {attempt.user?.name}
                    </p>
                    <p className="text-xs text-light-400">
                      {attempt.user?.email}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center text-sm text-light-100">
                    {attempt.transcriptCount}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {attempt.hasFeedback ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        <Star className="size-3" />
                        {attempt.feedback?.totalScore}/100
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-light-400">
                        No feedback
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center text-xs text-light-400">
                    {formatDate(attempt.completedAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/interviews/${interview.id}/attempts/${attempt.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-light-100 transition-colors hover:border-primary-200/40 hover:bg-primary-200/10 hover:text-primary-200"
                    >
                      <Eye className="size-3.5" />
                      View Attempt
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
