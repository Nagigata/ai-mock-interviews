"use client";

import ReactMarkdown from "react-markdown";
import { Challenge, ChallengeSubmissionDetail, LeetCodeExample } from "@/types";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  History,
  Layers,
  Lightbulb,
  MoveRight,
  XCircle,
  FlaskConical,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ChallengeSubmissionHistory from "@/components/ChallengeSubmissionHistory";
import SubmissionResultView, { SubmissionResultViewSkeleton } from "@/components/SubmissionResultView";
import UnderlineTabs from "@/components/UnderlineTabs";
import { SolutionsList } from "@/components/solutions/SolutionsList";
import { SolutionDetailLoader } from "@/components/solutions/SolutionDetailLoader";
import SolutionsFilterBar from "@/components/solutions/SolutionsFilterBar";

interface ProblemDescriptionProps {
  challenge: Challenge;
  currentUserId?: string;
}

type ProblemTab =
  | "description"
  | "solutions"
  | "submissions"
  | "submission-result";

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const styles: Record<string, string> = {
    EASY: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    MEDIUM: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    HARD: "bg-red-500/15 text-red-300 border-red-500/20",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${styles[difficulty] || styles.EASY}`}>
      {difficulty}
    </span>
  );
};

const ExamplesSection = ({ examples }: { examples: LeetCodeExample[] }) => (
  <div className="flex flex-col gap-4">
    {examples.map((ex, index) => {
      const exampleNum = ex.example_num ?? index + 1;
      return (
        <div key={`example-${exampleNum}`} className="rounded-xl border border-white/5 bg-dark-300/50 overflow-hidden">
          <div className="px-4 py-2 bg-dark-300 border-b border-white/5">
            <span className="text-xs font-bold text-light-400 uppercase tracking-widest">
              Example {exampleNum}
            </span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {ex.images && ex.images.length > 0 && ex.images.map((img, i) => (
              <div key={i} className="relative w-full max-h-48 rounded-lg overflow-hidden bg-dark-200">
                <img
                  src={img}
                  alt={`Example ${exampleNum} illustration`}
                  className="object-contain w-full max-h-48"
                />
              </div>
            ))}

            {ex.example_text ? (
              <pre className="font-mono text-sm text-light-100 whitespace-pre-wrap leading-relaxed bg-dark-200/60 p-3 rounded-lg border border-white/5">
                {ex.example_text}
              </pre>
            ) : (
              <div className="flex flex-col gap-2 bg-dark-200/60 p-4 rounded-lg border border-white/5">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-light-400 font-bold min-w-16">Input:</span>
                  <span className="font-mono text-light-100 break-all">{ex.input}</span>
                </div>
                <div className="flex items-start gap-2 text-sm mt-1">
                  <span className="text-light-400 font-bold min-w-16">Output:</span>
                  <span className="font-mono text-light-100 break-all">{ex.output}</span>
                </div>
                {ex.explanation && (
                  <div className="flex items-start gap-2 text-sm mt-2 pt-2 border-t border-white/5">
                    <span className="text-light-400 font-bold min-w-24">Explanation:</span>
                    <span className="text-light-100/90 leading-relaxed">{ex.explanation}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    })}
  </div>
);

const ConstraintsSection = ({ constraints }: { constraints: string[] }) => (
  <div className="rounded-xl border border-white/5 bg-dark-300/30 p-4">
    <h3 className="text-xs font-bold text-light-400 uppercase tracking-widest mb-3">Constraints</h3>
    <ul className="flex flex-col gap-2">
      {constraints.map((c, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-light-100">
          <span className="text-primary-200 mt-0.5 shrink-0">•</span>
          <code className="font-mono text-xs text-primary-200 bg-dark-300 px-1.5 py-0.5 rounded">{c}</code>
        </li>
      ))}
    </ul>
  </div>
);

const HintsSection = ({ hints }: { hints: string[] }) => {
  const [revealedCount, setRevealedCount] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold text-light-400 uppercase tracking-widest">
        <Lightbulb size={12} />
        <span>Hints</span>
      </div>
      <div className="flex flex-col gap-2">
        {hints.map((hint, i) => (
          <div key={i}>
            {i < revealedCount ? (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm text-light-100 flex items-start gap-2">
                <Lightbulb size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                <span>{hint}</span>
              </div>
            ) : (
              <button
                onClick={() => setRevealedCount(i + 1)}
                className="w-full text-left rounded-lg border border-white/5 bg-dark-300/30 p-3 text-sm text-light-400 hover:text-white hover:bg-dark-300/60 transition-all flex items-center gap-2"
              >
                <Lightbulb size={14} className="text-yellow-400/40" />
                <span>Show Hint {i + 1}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const getSubmissionStatusIcon = (status: string) => {
  if (status === "ACCEPTED") return CheckCircle2;
  if (status === "REJECTED") return XCircle;
  return Clock3;
};

const ProblemDescription = ({ challenge, currentUserId }: ProblemDescriptionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab");
  const urlTab: ProblemTab =
    rawTab === "solutions" || rawTab === "submissions" ? rawTab : "description";
  const selectedSolutionId = searchParams.get("solutionId");

  const [selectedSubmission, setSelectedSubmission] =
    useState<ChallengeSubmissionDetail | null>(null);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [solutionsTotal, setSolutionsTotal] = useState<number | undefined>(
    undefined,
  );

  // `submission-result` is a transient view — it overrides whatever the URL says.
  const activeTab: ProblemTab = (selectedSubmission || isLoadingSubmission) ? "submission-result" : urlTab;

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const topics = challenge.topics
    ? challenge.topics.split(", ").filter(Boolean)
    : [];
  const tabs = [
    { id: "description" as const, label: "Description", icon: BookOpen },
    { id: "solutions" as const, label: "Solutions", icon: FlaskConical },
    { id: "submissions" as const, label: "Submissions", icon: History },
  ];
  const closeSubmissionResult = () => {
    setSelectedSubmission(null);
    setIsLoadingSubmission(false);
  };
  const visibleTabs = selectedSubmission
    ? [
        ...tabs,
        {
          id: "submission-result" as const,
          label: selectedSubmission.status,
          icon: getSubmissionStatusIcon(selectedSubmission.status),
          onClose: closeSubmissionResult,
        },
      ]
    : isLoadingSubmission
      ? [
          ...tabs,
          {
            id: "submission-result" as const,
            label: "Loading...",
            icon: Clock3,
          },
        ]
      : tabs;

  const handleTabChange = (tab: ProblemTab) => {
    if (tab === "submission-result") return;
    setSelectedSubmission(null);
    updateSearchParams({
      tab: tab === "description" ? null : tab,
      solutionId: null,
    });
  };

  const handleSelectSolution = (solutionId: string) => {
    updateSearchParams({ tab: "solutions", solutionId });
  };

  const handleBackToSolutionsList = () => {
    updateSearchParams({ solutionId: null });
  };

  const handleSelectSubmission = (submission: ChallengeSubmissionDetail) => {
    setSelectedSubmission(submission);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-dark-200/20">
      <div className="sticky top-0 z-10 border-b border-white/5 bg-dark-300/95 px-6 pt-4 backdrop-blur-xl">
        <UnderlineTabs
          tabs={visibleTabs}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {activeTab === "description" ? (
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
              {challenge.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={challenge.difficulty} />
              {topics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/5 bg-dark-200 text-light-400 text-[10px] font-bold uppercase tracking-wider"
                >
                  <Layers size={10} />
                  {topic}
                </span>
              ))}
              {topics.length > 4 && (
                <span className="text-[10px] text-light-600">+{topics.length - 4} more</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none prose-p:text-light-100 prose-p:leading-relaxed prose-headings:text-white prose-strong:text-primary-100 prose-code:text-primary-200 prose-code:bg-dark-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-dark-300 prose-pre:border prose-pre:border-white/5 prose-li:text-light-100">
            <ReactMarkdown>{challenge.description}</ReactMarkdown>
          </div>

          {/* Examples */}
          {challenge.examples && challenge.examples.length > 0 && (
            <div className="flex flex-col gap-3">
              <ExamplesSection examples={challenge.examples} />
            </div>
          )}

          {/* Constraints */}
          {challenge.constraints && challenge.constraints.length > 0 && (
            <ConstraintsSection constraints={challenge.constraints} />
          )}

          {/* Follow-ups */}
          {challenge.followUps && challenge.followUps.length > 0 && (
            <div className="rounded-xl border border-primary-200/10 bg-primary-200/5 p-4">
              <h3 className="text-xs font-bold text-primary-200 uppercase tracking-widest mb-3">Follow-up</h3>
              <ul className="flex flex-col gap-2">
                {challenge.followUps.map((f, i) => (
                  <li key={i} className="text-sm text-light-100 flex items-start gap-2">
                    <span className="text-primary-200 shrink-0"><MoveRight size={12} className="mt-1" /></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hints */}
          {challenge.hints && challenge.hints.length > 0 && (
            <HintsSection hints={challenge.hints} />
          )}
        </div>
      ) : activeTab === "solutions" ? (
        <div className="flex flex-col gap-4 p-6">
          {selectedSolutionId ? (
            <SolutionDetailLoader
              key={selectedSolutionId}
              solutionId={selectedSolutionId}
              currentUserId={currentUserId}
              onBack={handleBackToSolutionsList}
            />
          ) : (
            <>
              <SolutionsFilterBar
                availableLanguages={availableLanguages}
                totalCount={solutionsTotal}
              />
              <SolutionsList
                challengeId={challenge.id}
                onSelectSolution={handleSelectSolution}
                onAvailableLanguagesChange={setAvailableLanguages}
                onTotalChange={setSolutionsTotal}
              />
            </>
          )}
        </div>
      ) : activeTab === "submissions" ? (
        <ChallengeSubmissionHistory
          challengeId={challenge.id}
          selectedSubmissionId={selectedSubmission?.id}
          onSelectSubmission={handleSelectSubmission}
          onLoadingChange={setIsLoadingSubmission}
        />
      ) : selectedSubmission ? (
        <div className="min-h-0 flex-1">
          <SubmissionResultView submission={selectedSubmission} />
        </div>
      ) : isLoadingSubmission ? (
        <div className="min-h-0 flex-1">
          <SubmissionResultViewSkeleton />
        </div>
      ) : (
        <div className="px-6 py-8 text-sm text-light-500">
          Select a submission to view its result.
        </div>
      )}
    </div>
  );
};

export default ProblemDescription;
