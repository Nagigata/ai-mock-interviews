"use client";

import {
  CalendarClock,
  Code2,
  Cpu,
  FileText,
  HardDrive,
  ListChecks,
  Share2,
  Terminal,
} from "lucide-react";

import { ChallengeSubmissionDetail } from "@/types";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/CodeBlock";

interface SubmissionResultViewProps {
  submission: ChallengeSubmissionDetail;
}

const getStatusStyle = (status: string) => {
  if (status === "ACCEPTED") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "REJECTED") {
    return "border-red-500/20 bg-red-500/10 text-red-300";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-300";
};

const formatSubmittedAt = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatMemory = (memory?: number | null) => {
  if (!memory) return "--";
  if (memory >= 1024) return `${(memory / 1024).toFixed(1)} MB`;
  return `${memory} KB`;
};

const formatTestCases = (
  passedTestCases?: number | null,
  totalTestCases?: number | null,
) => {
  if (typeof passedTestCases !== "number" || typeof totalTestCases !== "number") {
    return "--";
  }

  return `${passedTestCases} / ${totalTestCases} passed`;
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-light-500">
      <Icon className="size-3.5" />
      {label}
    </div>
    <p className="text-lg font-bold text-white">{value}</p>
  </div>
);

const SubmissionResultView = ({ submission }: SubmissionResultViewProps) => {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#08090D]">
      <div className="space-y-5 border-b border-white/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-lg border px-3 py-1 text-xs font-bold uppercase tracking-wider",
                  getStatusStyle(submission.status),
                )}
              >
                {submission.status}
              </span>
              <span className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1 text-xs font-semibold capitalize text-light-300">
                {submission.language}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">Submission result</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-light-500">
              <CalendarClock className="size-4" />
              Submitted {formatSubmittedAt(submission.createdAt)}
            </p>
          </div>
          {submission.status === "ACCEPTED" && (
            <a
              href={`/challenges/${submission.challengeId}/solutions/new?submissionId=${submission.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/3 px-3 py-1.5 text-xs font-semibold text-light-300 transition-colors hover:border-primary-200/30 hover:text-primary-100"
            >
              <Share2 className="size-3.5" />
              Share Solution
            </a>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            icon={ListChecks}
            label="Test cases"
            value={formatTestCases(
              submission.passedTestCases,
              submission.totalTestCases,
            )}
          />
          <MetricCard
            icon={Cpu}
            label="Runtime"
            value={submission.runtime ? `${submission.runtime} ms` : "--"}
          />
          <MetricCard
            icon={HardDrive}
            label="Memory"
            value={formatMemory(submission.memory)}
          />
        </div>

        {submission.errorMessage && (
          <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-300">
              <Terminal className="size-4" />
              Error message
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-6 text-red-100">
              {submission.errorMessage}
            </pre>
          </div>
        )}

        {submission.note && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-light-500">
              <FileText className="size-4" />
              Note
            </div>
            <p className="text-sm leading-6 text-light-200">{submission.note}</p>
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-light-500">
          <Code2 className="size-4" />
          Submitted code
        </div>
        <CodeBlock code={submission.code} language={submission.language} />
      </div>
    </div>
  );
};

export const SubmissionResultViewSkeleton = () => (
  <div className="flex h-full flex-col overflow-y-auto bg-[#08090D]">
    <div className="space-y-5 border-b border-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex gap-2">
            <div className="h-6 w-24 animate-pulse rounded-lg bg-white/[0.06]" />
            <div className="h-6 w-16 animate-pulse rounded-lg bg-white/[0.06]" />
          </div>
          <div className="h-7 w-48 animate-pulse rounded-md bg-white/[0.06]" />
          <div className="mt-2 h-4 w-40 animate-pulse rounded-md bg-white/[0.06]" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-3 h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-7 w-16 animate-pulse rounded-md bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-3 p-5">
      <div className="h-3 w-28 animate-pulse rounded bg-white/[0.06]" />
      <div className="h-64 animate-pulse rounded-md bg-white/[0.06]" />
    </div>
  </div>
);

export default SubmissionResultView;
