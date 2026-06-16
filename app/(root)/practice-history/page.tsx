import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  History,
  ListChecks,
  Mic2,
} from "lucide-react";

import { getMyRecentActivity } from "@/lib/actions/user.actions";
import PageState from "@/components/shared/PageState";
import RecentActivityTable from "@/components/RecentActivityTable";
import UnderlineTabs from "@/components/UnderlineTabs";
import { PracticeActivityType } from "@/types";

export const metadata: Metadata = {
  title: "Practice history",
};

interface Props {
  searchParams: Promise<Record<string, string | string[]>>;
}

const PracticeHistoryPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const rawPage = Array.isArray(filters.page) ? filters.page[0] : filters.page;
  const rawActivityType = Array.isArray(filters.activityType)
    ? filters.activityType[0]
    : filters.activityType;
  const activeTab: PracticeActivityType =
    rawActivityType === "challenges" || rawActivityType === "interviews"
      ? rawActivityType
      : "all";
  const currentPage = Math.max(Number(rawPage || 1) || 1, 1);
  const activity = await getMyRecentActivity(
    currentPage,
    10,
    activeTab === "all" ? undefined : { activityType: activeTab },
  );

  if (activity === null) {
    return (
      <div className="flex flex-col gap-8">
        <PageState
          tone="neutral"
          title="Activity is unavailable"
          description="We couldn't load your recent practice activity. Please try again in a moment."
          action={
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-200 px-5 py-3 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
            >
              Start a session
            </Link>
          }
        />
      </div>
    );
  }

  const totalPages = activity?.totalPages || 1;
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const summary = activity?.summary || {
    total: activity?.total || 0,
    challengeSubmissions: 0,
    interviewAttempts: 0,
  };

  const createPageHref = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (activeTab !== "all") {
      params.set("activityType", activeTab);
    }
    return `/practice-history?${params.toString()}`;
  };
  const createTabHref = (tab: PracticeActivityType) =>
    tab === "all" ? "/practice-history" : `/practice-history?activityType=${tab}`;
  const tableTitle =
    activeTab === "challenges"
      ? "Challenge Submissions"
      : activeTab === "interviews"
        ? "Interview Attempts"
        : "All Practice Activity";
  const tabs = [
    {
      id: "all" as const,
      label: "All",
      count: summary.total,
      icon: ListChecks,
      href: createTabHref("all"),
    },
    {
      id: "challenges" as const,
      label: "Challenges",
      count: summary.challengeSubmissions,
      icon: Code2,
      href: createTabHref("challenges"),
    },
    {
      id: "interviews" as const,
      label: "Interviews",
      count: summary.interviewAttempts,
      icon: Mic2,
      href: createTabHref("interviews"),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-[28px] border border-foreground/[0.08] bg-card p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
              <History className="size-5" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Practice History
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/75">
                Review your latest challenge submissions and completed mock
                interview attempts in one place.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full border border-foreground/10 bg-foreground/[0.04] px-4 py-2 text-sm font-semibold text-foreground">
            {summary.total} total records
          </span>
        </div>
      </section>

      <UnderlineTabs tabs={tabs} activeTab={activeTab} />

      <RecentActivityTable
        items={activity?.items || []}
        title={tableTitle}
        totalItems={activity?.total || 0}
      />

      {totalPages > 1 && (
        <section className="flex flex-col flex-wrap gap-2 rounded-[24px] border border-foreground/[0.08] bg-card px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
          <Link
            href={hasPreviousPage ? createPageHref(currentPage - 1) : "#"}
            aria-disabled={!hasPreviousPage}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${
              hasPreviousPage
                ? "border border-foreground/10 bg-foreground/[0.04] text-white hover:bg-foreground/[0.08]"
                : "pointer-events-none border border-foreground/5 bg-foreground/[0.02] text-muted-foreground"
            }`}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {pageNumbers.map((pageNumber) => {
              const isActive = pageNumber === currentPage;

              return (
                <Link
                  key={pageNumber}
                  href={createPageHref(pageNumber)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-bold transition-colors ${
                    isActive
                      ? "border-primary-200 bg-primary-200 text-dark-100"
                      : "border-foreground/8 bg-foreground/[0.035] text-foreground hover:bg-foreground/[0.08] hover:text-white"
                  }`}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </div>

          <Link
            href={hasNextPage ? createPageHref(currentPage + 1) : "#"}
            aria-disabled={!hasNextPage}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${
              hasNextPage
                ? "bg-primary-200 text-dark-100 hover:bg-primary-100"
                : "pointer-events-none border border-foreground/5 bg-foreground/[0.02] text-muted-foreground"
            }`}
          >
            Next
            <ChevronRight className="size-4" />
          </Link>
        </section>
      )}
    </div>
  );
};

export default PracticeHistoryPage;
