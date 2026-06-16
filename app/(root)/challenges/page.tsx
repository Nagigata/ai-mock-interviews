import type { Metadata } from "next";
import { getAllChallenges, getTopics } from "@/lib/actions/challenges.action";
import { getDictionary } from "@/lib/i18n";
import { cookies } from "next/headers";
import ChallengeCard from "@/components/ChallengeCard";
import ChallengeFilterBar from "@/components/ChallengeFilterBar";
import LoadMoreChallenges from "@/components/LoadMoreChallenges";
import PageState from "@/components/shared/PageState";
import {
  CircleAlert,
  Code2,
  FolderOpenDot,
  Sparkles,
  Swords,
} from "lucide-react";
import { Challenge } from "@/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Challenges",
};

interface Props {
  searchParams: Promise<Record<string, string | string[]>>;
}

type ChallengeListItem = Challenge & {
  skillSlug?: string;
};

const getChallengeSkillSlug = (challenge: ChallengeListItem) =>
  challenge.skillSlug || challenge.skill?.slug || "algorithms";

const ChallengesLibraryPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const t = getDictionary(locale);

  const [topics, result, allChallengesResult] = await Promise.all([
    getTopics(),
    getAllChallenges({ ...filters, page: 1, limit: 100 }),
    getAllChallenges({ page: 1, limit: 1 }),
  ]);
  const topicsFailed = topics == null;
  const resultFailed = result == null;
  if (topicsFailed && resultFailed) {
    return (
      <div className="flex flex-col gap-8">
        <PageState
          tone="danger"
          icon={<CircleAlert size={20} />}
          title="Couldn't load challenges"
          description="Something went wrong fetching the challenge library. Please retry in a moment."
        />
      </div>
    );
  }
  const safeTopics = topics ?? [];
  const challenges = result?.data || [];
  const filteredTotalCount = result?.total || 0;
  const totalCount = allChallengesResult?.total || filteredTotalCount;

  return (
    <div className="flex flex-col gap-8">
      <header
        className="relative animate-fadeIn overflow-hidden rounded-[34px] border border-[var(--surface-border)] px-6 py-7 sm:px-8 lg:px-10"
        style={{ background: "var(--hero-gradient)", boxShadow: `0 28px 80px var(--shadow-heavy)` }}
      >
        <div className="pointer-events-none absolute right-10 top-8 hidden h-28 w-28 rounded-full bg-primary-200/15 blur-3xl md:block" />

        <div className="relative grid gap-7 xl:grid-cols-[1.35fr_0.95fr] xl:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/15 bg-primary-200/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-100">
              <Sparkles className="size-3.5" />
              Challenge library
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FolderOpenDot className="text-primary-100" size={30} />
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--text-heading)" }}>
                  {t.common.challenges}
                </h1>
              </div>
              <p className="max-w-2xl text-base leading-7 sm:text-lg" style={{ color: "var(--text-body)", opacity: 0.85 }}>
                Explore curated coding problems, filter by difficulty or topic,
                and jump straight into the challenges that match your current
                focus.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--surface-border)] p-4 backdrop-blur-xl" style={{ background: "var(--surface-overlay)" }}>
            <div className="mb-4 px-1">
              <h2 className="text-lg font-bold" style={{ color: "var(--text-heading)" }}>
                Practice library
              </h2>
              <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-muted)" }}>
                A focused collection of coding problems for interview practice.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-[var(--surface-border)] p-4" style={{ background: "var(--surface-overlay)" }}>
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--text-body)", opacity: 0.8 }}>
                    Challenges
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
                    <Swords className="size-4" />
                  </span>
                </div>
                <div className="text-3xl font-bold" style={{ color: "var(--text-heading)" }}>
                  {totalCount}
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--surface-border)] p-4" style={{ background: "var(--surface-overlay)" }}>
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--text-body)", opacity: 0.8 }}>
                    Focus
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-700 dark:text-cyan-300">
                    <Code2 className="size-4" />
                  </span>
                </div>
                <div className="text-lg font-semibold leading-snug" style={{ color: "var(--text-heading)" }}>
                  Interview-ready practice
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className="animate-fadeIn flex flex-col gap-6"
        style={{ animationDelay: "0.08s", animationFillMode: "both" }}
      >
        <section className="flex-1 flex flex-col gap-6">
          <ChallengeFilterBar topics={safeTopics} />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-heading)" }}>
                Problem set
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Select a challenge and practice inside the code workspace.
              </p>
            </div>
            <span className="w-fit rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1.5 text-sm font-bold text-primary-100">
              {filteredTotalCount} showing
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {resultFailed ? (
              <PageState
                tone="danger"
                icon={<CircleAlert size={20} />}
                title="Couldn't load challenges"
                description="The challenge list failed to load. Please retry in a moment."
              />
            ) : challenges && challenges.length > 0 ? (
              <>
                {challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    skillSlug={getChallengeSkillSlug(challenge as ChallengeListItem)}
                    dictionary={t}
                  />
                ))}

                {/* Infinite Scroll Listener */}
                {challenges.length === 100 && (
                  <LoadMoreChallenges initialFilters={filters} dictionary={t} />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--surface-border)] p-16 text-center" style={{ background: "var(--surface-overlay)" }}>
                <div className="mb-4 rounded-2xl border border-[var(--surface-border)] p-4" style={{ background: "var(--surface-overlay)" }}>
                  <CircleAlert size={32} style={{ color: "var(--text-muted)" }} />
                </div>
                <p className="font-medium" style={{ color: "var(--text-body)" }}>No challenges found</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Try adjusting your filters to find what you are looking for.</p>
                <Link href="/challenges" className="mt-6 text-primary-200 hover:text-primary-100 font-bold text-sm">
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChallengesLibraryPage;
