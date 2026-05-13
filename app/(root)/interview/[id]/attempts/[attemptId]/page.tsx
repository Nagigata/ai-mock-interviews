import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  MessageSquareText,
  Star,
  UserRound,
} from "lucide-react";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewAttemptById } from "@/lib/actions/general.action";
import { cn } from "@/lib/utils";
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
    };
  }

  if (status === "TOO_SHORT") {
    return {
      label: "Too short",
      className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    };
  }

  if (status === "FAILED") {
    return {
      label: "Failed",
      className: "border-red-400/20 bg-red-400/10 text-red-300",
    };
  }

  return {
    label: "In progress",
    className: "border-white/10 bg-white/[0.04] text-light-300",
  };
};

const AttemptTranscriptPage = async ({
  params,
}: {
  params: Promise<Record<string, string>>;
}) => {
  const { id, attemptId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const attempt = await getInterviewAttemptById(attemptId);

  if (!attempt || attempt.interviewId !== id) {
    redirect(`/interview/${id}/attempts`);
  }

  const cookieStore = await cookies();
  const timeZone = cookieStore.get("USER_TIMEZONE")?.value || "UTC";
  const completedAt = formatDateTime(
    attempt.completedAt || attempt.endedAt || attempt.createdAt,
    timeZone,
  );

  const score = attempt.feedback?.totalScore;
  const statusConfig = getAttemptStatusConfig(
    attempt.status,
    Boolean(attempt.feedback),
  );
  const scoreColor = score
    ? score >= 80
      ? "text-emerald-400"
      : score >= 50
        ? "text-amber-400"
        : "text-red-400"
    : "text-light-400";

  return (
    <section className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href={`/interview/${id}/attempts`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-100 hover:text-primary-200 transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Attempt History
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(92,114,255,0.14),_transparent_34%),linear-gradient(135deg,#1d1f24_0%,#11141a_100%)] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold capitalize text-white sm:text-4xl">
              {attempt.interview.role} Transcript
            </h1>
            <p className="text-sm text-light-400 max-w-xl">
              Review the conversation captured during this interview attempt.
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-light-300">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 font-bold ${statusConfig.className}`}
              >
                {statusConfig.label}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                {completedAt}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquareText size={14} />
                {attempt.transcripts.length} messages
              </span>
              <span className={`inline-flex items-center gap-1.5 font-bold ${scoreColor}`}>
                <Star size={14} />
                {score ? `${score}/100` : statusConfig.label}
              </span>
            </div>
          </div>

          {attempt.feedback && (
            <Link
              href={`/interview/${id}/feedback?attemptId=${attempt.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-200 px-5 py-3 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80 shrink-0"
            >
              View Feedback
            </Link>
          )}
        </div>
        {!attempt.feedback && attempt.failureReason ? (
          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
            {attempt.failureReason}
          </div>
        ) : null}
      </div>

      {/* Transcript */}
      <div className="rounded-[24px] border border-white/6 bg-[#12151b] p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
        {attempt.transcripts.length === 0 ? (
          <div className="py-14 text-center">
            <MessageSquareText
              size={40}
              className="mx-auto text-light-600 mb-4"
            />
            <p className="text-lg font-semibold text-white">
              No transcript messages saved
            </p>
            <p className="mt-2 text-sm text-light-400 max-w-md mx-auto">
              This can happen if the call ended before transcript data was
              returned.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {attempt.transcripts.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isUser ? "justify-end" : "justify-start",
                  )}
                >
                  {!isUser && (
                    <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-200/15 text-primary-100">
                      <Bot size={17} />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-5 py-4",
                      isUser
                        ? "bg-primary-200 text-dark-100"
                        : "border border-white/6 bg-white/[0.04] text-light-100",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-2 text-[10px] font-bold uppercase tracking-[0.18em]",
                        isUser ? "opacity-60" : "opacity-50",
                      )}
                    >
                      {isUser ? "You" : "AI Interviewer"}
                    </div>
                    <p
                      className={cn(
                        "whitespace-pre-wrap text-sm leading-7",
                        isUser ? "text-dark-100" : "text-light-100",
                      )}
                    >
                      {message.content}
                    </p>
                  </div>

                  {isUser && (
                    <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-200 text-dark-100">
                      <UserRound size={17} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default AttemptTranscriptPage;
