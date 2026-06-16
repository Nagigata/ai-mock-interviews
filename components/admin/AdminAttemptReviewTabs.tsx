"use client";

import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  MessageSquareText,
  Star,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

type AdminAttemptReviewTabsProps = {
  attempt: any;
};

const getScoreTone = (score = 0) => {
  if (score >= 80) {
    return {
      text: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-500/15 border-emerald-500/20",
      bar: "bg-emerald-400",
    };
  }

  if (score >= 50) {
    return {
      text: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-500/15 border-amber-500/20",
      bar: "bg-amber-400",
    };
  }

  return {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-500/15 border-red-500/20",
    bar: "bg-red-400",
  };
};

const tabs = [
  { id: "feedback", label: "Feedback", icon: Star },
  { id: "transcript", label: "Transcript", icon: MessageSquareText },
] as const;

export default function AdminAttemptReviewTabs({
  attempt,
}: AdminAttemptReviewTabsProps) {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["id"]>("feedback");
  const feedback = attempt.feedback;

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-2xl border border-foreground/8 bg-card/70 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-primary-200 text-dark-100"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
              {tab.id === "transcript" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px]",
                    isActive
                      ? "bg-background/15 text-dark-100"
                      : "bg-foreground/8 text-muted-foreground",
                  )}
                >
                  {attempt.transcripts?.length || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "feedback" ? (
        <FeedbackTab feedback={feedback} />
      ) : (
        <TranscriptTab transcripts={attempt.transcripts || []} />
      )}
    </div>
  );
}

function FeedbackTab({ feedback }: { feedback: any }) {
  if (!feedback) {
    return (
      <div className="rounded-2xl border border-foreground/6 bg-foreground/[0.03] p-12 text-center">
        <Star className="mx-auto mb-4 size-10 text-muted-foreground" />
        <p className="text-lg font-semibold text-white">
          No feedback generated
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          This attempt does not have AI feedback yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-foreground/6 bg-foreground/[0.03] p-6">
          <h2 className="mb-3 text-lg font-bold text-white">
            Final Assessment
          </h2>
          <p className="text-sm leading-7 text-foreground">
            {feedback.finalAssessment}
          </p>
        </div>

        {feedback.categoryScores?.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">Category Scores</h2>
            {feedback.categoryScores.map((category: any) => {
              const tone = getScoreTone(category.score);

              return (
                <div
                  key={category.id}
                  className="rounded-2xl border border-foreground/6 bg-foreground/[0.03] p-5"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      {category.name}
                    </h3>
                    <span className={`text-sm font-extrabold ${tone.text}`}>
                      {category.score}/100
                    </span>
                  </div>
                  <div className="mb-3 h-1.5 w-full rounded-full bg-foreground/10">
                    <div
                      className={`h-full rounded-full ${tone.bar}`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {category.comment}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {feedback.strengths?.length > 0 && (
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-700 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                Strengths
              </h3>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((strength: string, index: number) => (
                <li
                  key={`${strength}-${index}`}
                  className="flex items-start gap-2 text-sm leading-6 text-foreground"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.areasForImprovement?.length > 0 && (
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-amber-700 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                Areas for Improvement
              </h3>
            </div>
            <ul className="space-y-2">
              {feedback.areasForImprovement.map(
                (area: string, index: number) => (
                  <li
                    key={`${area}-${index}`}
                    className="flex items-start gap-2 text-sm leading-6 text-foreground"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" />
                    {area}
                  </li>
                ),
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function TranscriptTab({ transcripts }: { transcripts: any[] }) {
  return (
    <div className="rounded-[24px] border border-foreground/6 bg-card p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:p-6">
      <h2 className="mb-5 text-lg font-bold text-white">Transcript</h2>

      {transcripts.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquareText className="mx-auto mb-4 size-10 text-muted-foreground" />
          <p className="text-lg font-semibold text-white">
            No transcript messages saved
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            This can happen if the call ended before transcript data was
            returned.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {transcripts.map((message: any) => {
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
                    <Bot className="size-4" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-5 py-4",
                    isUser
                      ? "bg-primary-200 text-dark-100"
                      : "border border-foreground/6 bg-foreground/[0.04] text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "mb-2 text-[10px] font-bold uppercase tracking-[0.18em]",
                      isUser ? "opacity-60" : "opacity-50",
                    )}
                  >
                    {isUser ? "Candidate" : "AI Interviewer"}
                  </div>
                  <p
                    className={cn(
                      "whitespace-pre-wrap text-sm leading-7",
                      isUser ? "text-dark-100" : "text-foreground",
                    )}
                  >
                    {message.content}
                  </p>
                </div>

                {isUser && (
                  <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-200 text-dark-100">
                    <UserRound className="size-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
