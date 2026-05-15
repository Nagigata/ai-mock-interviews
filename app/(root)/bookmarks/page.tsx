import { cookies } from "next/headers";
import Link from "next/link";
import { Bookmark, Code2, Mic2 } from "lucide-react";

import ChallengeFilterBar from "@/components/ChallengeFilterBar";
import ChallengeCard from "@/components/ChallengeCard";
import InterviewFilterBar from "@/components/InterviewFilterBar";
import InterviewCard from "@/components/InterviewCard";
import UnderlineTabs from "@/components/UnderlineTabs";
import { getDictionary } from "@/lib/i18n";
import {
  getMyStarredChallenges,
  getMyStarredInterviews,
} from "@/lib/actions/user.actions";

interface Props {
  searchParams: Promise<Record<string, string | string[]>>;
}

type BookmarkTab = "interviews" | "challenges";

const getFirstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const BookmarksPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const t = getDictionary(locale);
  const challengeFilters = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
  };
  const interviewFilters = {
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.level ? { level: filters.level } : {}),
  };
  const [starredChallenges, starredInterviews] = await Promise.all([
    getMyStarredChallenges(1, 100, challengeFilters),
    getMyStarredInterviews(1, 100, interviewFilters),
  ]);
  const totalSaved =
    (starredChallenges?.total || 0) + (starredInterviews?.total || 0);
  const hasChallengeFilters = Boolean(filters.status || filters.difficulty);
  const hasInterviewFilters = Boolean(filters.type || filters.level);
  const requestedTab = getFirstParam(filters.tab);
  const activeTab: BookmarkTab =
    requestedTab === "interviews" || requestedTab === "challenges"
      ? requestedTab
      : starredChallenges?.items.length
        ? "challenges"
        : "interviews";

  const buildTabHref = (tab: BookmarkTab) => {
    const params = new URLSearchParams();
    params.set("tab", tab);

    if (tab === "challenges") {
      ["status", "difficulty"].forEach((key) => {
        const value = filters[key];
        if (Array.isArray(value)) {
          value.forEach((entry) => params.append(key, entry));
        } else if (value) {
          params.append(key, value);
        }
      });
    }

    if (tab === "interviews") {
      ["type", "level"].forEach((key) => {
        const value = filters[key];
        if (Array.isArray(value)) {
          value.forEach((entry) => params.append(key, entry));
        } else if (value) {
          params.append(key, value);
        }
      });
    }

    return `/bookmarks?${params.toString()}`;
  };

  const tabs: Array<{
    id: BookmarkTab;
    label: string;
    count: number;
    icon: typeof Mic2;
    href: string;
  }> = [
    {
      id: "challenges",
      label: "Challenges",
      count: starredChallenges?.total || 0,
      icon: Code2,
      href: buildTabHref("challenges"),
    },
    {
      id: "interviews",
      label: "Interviews",
      count: starredInterviews?.total || 0,
      icon: Mic2,
      href: buildTabHref("interviews"),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-[28px] border border-white/[0.08] bg-[#101318] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
              <Bookmark className="size-5" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Saved Items
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-light-100/75">
                Keep important challenges and mock interviews in one place for
                quick review.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-light-100">
            {totalSaved} saved
          </span>
        </div>
      </section>

      <UnderlineTabs tabs={tabs} activeTab={activeTab} />

      <div className="flex flex-col gap-10">
        <section className="flex flex-1 flex-col gap-4">
          {activeTab === "interviews" ? (
            <>
              <InterviewFilterBar preserveParams={["tab"]} />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Saved Interviews
                  </h2>
                  <p className="mt-1 text-sm text-light-400">
                    Mock interviews you marked for later practice.
                  </p>
                </div>
                <span className="w-fit rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1.5 text-sm font-bold text-primary-100">
                  {starredInterviews?.items.length || 0} showing
                </span>
              </div>

              {starredInterviews?.items.length ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {starredInterviews.items.map((item) => (
                    <InterviewCard
                      key={item.id}
                      interviewId={item.id}
                      role={item.role}
                      level={item.level}
                      type={item.type}
                      techstack={item.techstack}
                      createdAt={item.createdAt}
                      language={item.language}
                      isStarred={item.isStarred}
                      feedback={item.feedback}
                      attemptCount={item.attemptCount}
                      locale={locale}
                    />
                  ))}
                </div>
              ) : hasInterviewFilters ? (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-light-400">
                  <p>No bookmarked interviews match these filters.</p>
                  <Link
                    href="/bookmarks?tab=interviews"
                    className="mt-4 inline-flex rounded-2xl border border-primary-200/20 bg-primary-200/10 px-4 py-2.5 font-bold text-primary-100 hover:bg-primary-200/15"
                  >
                    Clear all filters
                  </Link>
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-light-400">
                  <p>You have not bookmarked any interviews yet.</p>
                  <Link
                    href="/interview"
                    className="mt-4 inline-flex rounded-2xl border border-primary-200/20 bg-primary-200/10 px-4 py-2.5 font-bold text-primary-100 hover:bg-primary-200/15"
                  >
                    Browse interviews
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              <ChallengeFilterBar
                showSearch={false}
                showTopics={false}
                preserveParams={["tab"]}
              />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Saved Challenges
                  </h2>
                  <p className="mt-1 text-sm text-light-400">
                    Problems you want to revisit or solve later.
                  </p>
                </div>
                <span className="w-fit rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1.5 text-sm font-bold text-primary-100">
                  {starredChallenges?.items.length || 0} showing
                </span>
              </div>

              {starredChallenges?.items.length ? (
                starredChallenges.items.map((item) => (
                  <ChallengeCard
                    key={item.id}
                    challenge={{
                      id: item.id,
                      title: item.title,
                      slug: item.slug,
                      description: item.description,
                      difficulty: item.difficulty,
                      topics: item.topics,
                      isSolved: item.isSolved,
                      isStarred: item.isStarred,
                      templateCode: {},
                      testCases: [],
                      skillId: "",
                    }}
                    skillSlug={item.skillSlug}
                    dictionary={t}
                  />
                ))
              ) : hasChallengeFilters ? (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-light-400">
                  <p>No bookmarked challenges match these filters.</p>
                  <Link
                    href="/bookmarks"
                    className="mt-4 inline-flex rounded-2xl border border-primary-200/20 bg-primary-200/10 px-4 py-2.5 font-bold text-primary-100 hover:bg-primary-200/15"
                  >
                    Clear all filters
                  </Link>
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-light-400">
                  <p>You have not bookmarked any challenges yet.</p>
                  <Link
                    href="/challenges"
                    className="mt-4 inline-flex rounded-2xl border border-primary-200/20 bg-primary-200/10 px-4 py-2.5 font-bold text-primary-100 hover:bg-primary-200/15"
                  >
                    Browse challenges
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default BookmarksPage;
