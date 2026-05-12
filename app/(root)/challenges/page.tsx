import { getAllChallenges, getTopics } from "@/lib/actions/challenges.action";
import { getDictionary } from "@/lib/i18n";
import { cookies } from "next/headers";
import ChallengeFilters from "@/components/ChallengeFilters";
import ChallengeCard from "@/components/ChallengeCard";
import LoadMoreChallenges from "@/components/LoadMoreChallenges";
import ChallengeSearch from "@/components/ChallengeSearch";
import {
  CircleAlert,
  Code2,
  FolderOpenDot,
  Sparkles,
  Swords,
} from "lucide-react";
import { Challenge } from "@/types";
import Link from "next/link";

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
  const challenges = result?.data || [];
  const filteredTotalCount = result?.total || 0;
  const totalCount = allChallengesResult?.total || filteredTotalCount;

  return (
    <div className="flex flex-col gap-8">
      <header className="relative animate-fadeIn overflow-hidden rounded-[34px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,_rgba(202,197,254,0.2),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_34%),linear-gradient(160deg,_rgba(23,26,36,0.98),_rgba(7,9,13,0.98))] px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.35)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute right-10 top-8 h-28 w-28 rounded-full bg-primary-200/15 blur-3xl" />

        <div className="relative grid gap-7 xl:grid-cols-[1.35fr_0.95fr] xl:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/15 bg-primary-200/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-100">
              <Sparkles className="size-3.5" />
              Challenge library
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FolderOpenDot className="text-primary-100" size={30} />
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {t.common.challenges}
                </h1>
              </div>
              <p className="max-w-2xl text-base leading-7 text-light-100/85 sm:text-lg">
                Explore curated coding problems, filter by difficulty or topic,
                and jump straight into the challenges that match your current
                focus.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-black/20 p-4 backdrop-blur-xl">
            <div className="mb-4 px-1">
              <h2 className="text-lg font-bold text-white">
                Practice library
              </h2>
              <p className="mt-1 text-xs leading-5 text-light-400">
                A focused collection of coding problems for interview practice.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-light-100/80">
                    Challenges
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
                    <Swords className="size-4" />
                  </span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {totalCount}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-light-100/80">
                    Focus
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                    <Code2 className="size-4" />
                  </span>
                </div>
                <div className="text-lg font-semibold leading-snug text-white">
                  Interview-ready practice
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="animate-fadeIn flex flex-col gap-10 lg:flex-row" style={{ animationDelay: "0.08s", animationFillMode: "both" }}>
        {/* Challenges List (Left) */}
        <section className="flex-1 flex flex-col gap-6">
          <div className="w-full">
            <ChallengeSearch />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Problem set
              </h2>
              <p className="mt-1 text-sm text-light-400">
                Select a challenge and practice inside the code workspace.
              </p>
            </div>
            <span className="w-fit rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1.5 text-sm font-bold text-primary-100">
              {filteredTotalCount} showing
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {challenges && challenges.length > 0 ? (
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
              <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-16 text-center">
                <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <CircleAlert size={32} className="text-light-400" />
                </div>
                <p className="text-light-100 font-medium">No challenges found</p>
                <p className="text-sm text-light-400 mt-1">Try adjusting your filters to find what you are looking for.</p>
                <Link href="/challenges" className="mt-6 text-primary-200 hover:text-primary-100 font-bold text-sm">
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Filter Sidebar (Right) */}
        <ChallengeFilters topics={topics} />
      </div>
    </div>
  );
};

export default ChallengesLibraryPage;
