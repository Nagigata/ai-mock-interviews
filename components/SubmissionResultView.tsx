"use client";

import {
  CalendarClock,
  Check,
  Code2,
  Copy,
  Cpu,
  FileText,
  HardDrive,
  ListChecks,
  Share2,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ChallengeSubmissionDetail } from "@/types";
import { cn } from "@/lib/utils";

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

const SubmittedCodeBlock = ({ code }: { code: string }) => {
  const lines = code.split("\n");

  return (
    <pre className="h-full min-h-[360px] overflow-auto bg-[#08090D] p-5 text-sm leading-6 text-light-100">
      <code className="grid grid-cols-[auto_1fr] gap-x-4 font-mono">
        {lines.map((line, index) => (
          <span key={`${index}-${line}`} className="contents">
            <span className="select-none text-right text-light-600">
              {index + 1}
            </span>
            <span className="whitespace-pre">{line || " "}</span>
          </span>
        ))}
      </code>
    </pre>
  );
};

const SubmissionResultView = ({ submission }: SubmissionResultViewProps) => {
  const [copiedSubmissionId, setCopiedSubmissionId] = useState<string | null>(
    null,
  );
  const copied = copiedSubmissionId === submission.id;

  const copySubmittedCode = async () => {
    try {
      await navigator.clipboard.writeText(submission.code);
      setCopiedSubmissionId(submission.id);
      toast.success("Submitted code copied.");
      window.setTimeout(() => setCopiedSubmissionId(null), 1600);
    } catch {
      toast.error("Could not copy submitted code.");
    }
  };

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

      <div className="flex min-h-[420px] flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/5 bg-dark-300 px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-light-500">
            <Code2 className="size-4" />
            Submitted code
          </div>
          <button
            type="button"
            onClick={copySubmittedCode}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
              copied
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 bg-white/[0.03] text-light-300 hover:border-primary-200/30 hover:text-primary-100",
            )}
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <SubmittedCodeBlock code={submission.code} />
        </div>
      </div>
    </div>
  );
};

export default SubmissionResultView;
