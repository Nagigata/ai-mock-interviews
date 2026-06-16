"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Compass,
  Filter,
  Inbox,
  Mic2,
  Plus,
  X,
} from "lucide-react";

import InterviewCard from "./InterviewCard";
import UnderlineTabs from "./UnderlineTabs";
import SelectFilter from "@/components/filters/SelectFilter";
import { deleteInterview } from "@/lib/actions/general.action";
import { Feedback, Interview } from "@/types";

interface InterviewTabsProps {
  userId: string;
  myInterviews: Interview[];
  attemptedInterviews: Interview[];
  latestInterviews: Interview[];
  feedbackMap: Record<string, Feedback | null>;
  attemptCountMap: Record<string, number>;
  locale: string;
}

type Tab = "my" | "explore";
type MyFilter = "all" | "created" | "attempted";

interface DeleteConfirm {
  interviewId: string;
  role: string;
  attemptCount: number;
}

const myFilters: Array<{ value: MyFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "created", label: "Created" },
  { value: "attempted", label: "Attempted" },
];

const typeOptions = [
  { value: "all", label: "All types" },
  { value: "Technical", label: "Technical" },
  { value: "Behavioral", label: "Behavioral" },
  { value: "Mixed", label: "Mixed" },
];

const levelOptions = [
  { value: "all", label: "All levels" },
  { value: "Junior", label: "Junior" },
  { value: "Mid-level", label: "Mid-level" },
  { value: "Senior", label: "Senior" },
];

const normalizeType = (type: string) => (/mix/gi.test(type) ? "Mixed" : type);

const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) => (
  <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-foreground/10 bg-card/35 px-6 py-12 text-center">
    <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
      <Inbox className="size-6" />
    </div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
      {description}
    </p>
    {action && (
      <Link
        href={action.href}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-200 px-5 py-3 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
      >
        <Plus className="size-4" />
        {action.label}
      </Link>
    )}
  </div>
);

export default function InterviewTabs({
  userId,
  myInterviews,
  attemptedInterviews,
  latestInterviews,
  feedbackMap,
  attemptCountMap,
  locale,
}: InterviewTabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("my");
  const [myFilter, setMyFilter] = useState<MyFilter>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);
  const [deleting, setDeleting] = useState(false);

  const myFilteredInterviews = useMemo(() => {
    if (myFilter === "created") return myInterviews;
    if (myFilter === "attempted") return attemptedInterviews;

    const seen = new Set<string>();
    const merged: Interview[] = [];
    for (const interview of [...myInterviews, ...attemptedInterviews]) {
      if (!seen.has(interview.id)) {
        seen.add(interview.id);
        merged.push(interview);
      }
    }

    return merged.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [myInterviews, attemptedInterviews, myFilter]);

  const exploreFiltered = useMemo(() => {
    return latestInterviews.filter((interview) => {
      if (typeFilter !== "all" && normalizeType(interview.type) !== typeFilter) {
        return false;
      }
      if (levelFilter !== "all" && interview.level !== levelFilter) {
        return false;
      }
      return true;
    });
  }, [latestInterviews, typeFilter, levelFilter]);

  const handleDelete = (interview: Interview) => {
    setDeleteConfirm({
      interviewId: interview.id,
      role: interview.role,
      attemptCount: attemptCountMap[interview.id] || 0,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    const result = await deleteInterview(deleteConfirm.interviewId);
    setDeleting(false);
    setDeleteConfirm(null);
    if (result.success) {
      router.refresh();
    }
  };

  const myCreatedIds = new Set(myInterviews.map((interview) => interview.id));
  const visibleInterviews = tab === "my" ? myFilteredInterviews : exploreFiltered;
  const tabs: Array<{
    id: Tab;
    label: string;
    count?: number;
    icon: typeof Mic2;
  }> = [
    {
      id: "my",
      label: "My Interviews",
      count: myFilteredInterviews.length,
      icon: Mic2,
    },
    {
      id: "explore",
      label: "Explore",
      icon: Compass,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-foreground/8 bg-card/35 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 border-b border-foreground/8 p-2 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <UnderlineTabs tabs={tabs} activeTab={tab} onChange={setTab} />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="size-4 text-primary-100" />
            <span>
              Showing{" "}
              <strong className="text-primary-100">
                {visibleInterviews.length}
              </strong>{" "}
              session{visibleInterviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {tab === "my" ? (
          <div className="flex flex-wrap items-center gap-2 px-2 pt-4">
            {myFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setMyFilter(filter.value)}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                  myFilter === filter.value
                    ? "border-primary-200/30 bg-primary-200/15 text-primary-100"
                    : "border-foreground/8 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/15 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 px-2 pt-4">
            <SelectFilter
              label="Type"
              value={typeFilter}
              options={typeOptions}
              onChange={setTypeFilter}
              className="min-w-[170px]"
            />
            <SelectFilter
              label="Level"
              value={levelFilter}
              options={levelOptions}
              onChange={setLevelFilter}
              className="min-w-[170px]"
            />
          </div>
        )}
      </div>

      {visibleInterviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleInterviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interviewId={interview.id}
              userId={userId}
              role={interview.role}
              level={interview.level}
              type={interview.type}
              techstack={interview.techstack}
              createdAt={interview.createdAt}
              language={interview.language}
              isStarred={interview.isStarred}
              feedback={feedbackMap[interview.id]}
              locale={locale}
              showDelete={tab === "my" && myCreatedIds.has(interview.id)}
              attemptCount={attemptCountMap[interview.id] || 0}
              onDelete={() => handleDelete(interview)}
            />
          ))}
        </div>
      ) : tab === "my" ? (
        <EmptyState
          title="No interviews yet"
          description="Create your first mock interview and PrepWise will notify you when the questions are ready."
          action={{ href: "/interview/setup", label: "Create interview" }}
        />
      ) : (
        <EmptyState
          title="No matching interviews"
          description="Try changing the type or level filter to discover more interview templates."
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-in rounded-2xl border border-foreground/10 bg-muted p-6 shadow-2xl duration-200 fade-in zoom-in-95">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-red-500/15 p-2.5 text-red-700 dark:text-red-400">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Delete Interview
              </h3>
            </div>

            {deleteConfirm.attemptCount > 0 ? (
              <>
                <p className="mb-3 text-sm text-foreground">
                  This interview has{" "}
                  <span className="font-semibold text-white">
                    {deleteConfirm.attemptCount} attempt
                    {deleteConfirm.attemptCount > 1 ? "s" : ""}
                  </span>{" "}
                  with feedback and transcripts.
                </p>
                <p className="mb-4 text-xs text-red-700 dark:text-red-400/80">
                  All attempts, feedback, and transcripts will be permanently
                  deleted. This action cannot be undone.
                </p>
              </>
            ) : (
              <p className="mb-4 text-sm text-foreground">
                Delete the{" "}
                <span className="font-semibold capitalize text-white">
                  {deleteConfirm.role}
                </span>{" "}
                interview? This action cannot be undone.
              </p>
            )}

            <div className="mb-5 rounded-xl bg-foreground/5 px-4 py-3">
              <p className="text-sm font-medium capitalize text-white">
                {deleteConfirm.role} Mock Interview
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {deleteConfirm.attemptCount} attempt
                {deleteConfirm.attemptCount !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl border border-foreground/10 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
