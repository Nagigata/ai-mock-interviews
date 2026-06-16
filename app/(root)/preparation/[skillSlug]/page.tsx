import type { Metadata } from "next";
import { getSkillBySlug } from "@/lib/actions/challenges.action";
import { getDictionary } from "@/lib/i18n";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ChallengeCard from "@/components/ChallengeCard";
import ChallengeFilterBar from "@/components/ChallengeFilterBar";

import {
  BookOpen,
  ChevronRight,
  CircleAlert,
  Code2,
  Layers3,
} from "lucide-react";

interface Props {
  params: Promise<{ skillSlug: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ skillSlug: string }>;
}): Promise<Metadata> {
  const { skillSlug } = await params;
  const skill = await getSkillBySlug(skillSlug);
  return { title: skill?.name ?? "Skill" };
}

const SkillPage = async ({ params, searchParams }: Props) => {
  const { skillSlug } = await params;
  const filters = await searchParams;
  
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const t = getDictionary(locale);

  const [skill, unfilteredSkill] = await Promise.all([
    getSkillBySlug(skillSlug, filters),
    getSkillBySlug(skillSlug),
  ]);

  if (!skill) {
    notFound();
  }

  const skillStats = unfilteredSkill ?? skill;
  const totalSkillChallenges =
    skillStats._count?.challenges ?? skillStats.challenges?.length ?? 0;
  const showingSkillChallenges = skill.challenges?.length ?? 0;

  // Extract unique topics by splitting topics strings
  const topics = Array.from(
    new Set(
      (skillStats.challenges ?? []).flatMap(c =>
        c.topics ? c.topics.split(", ").map(t => t.trim()) : []
      ).filter(Boolean)
    )
  ).sort();


  return (
    <div className="flex flex-col gap-8">
      <header className="rounded-[26px] border border-[var(--surface-border)] px-5 py-5 shadow-[0_10px_30px_var(--shadow-color)] sm:px-6" style={{ background: "var(--hero-gradient)" }}>
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-sm"
        >
          <Link
            href="/preparation"
            className="font-semibold text-muted-foreground transition-colors hover:text-primary-100"
          >
            Preparation
          </Link>
          <ChevronRight className="size-4 text-muted-foreground" />
          <span className="font-semibold text-white">{skill.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-foreground/[0.08] bg-foreground/[0.04] p-3.5">
              {skill.icon ? (
                <Image
                  src={skill.icon}
                  alt={skill.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <BookOpen className="size-7 text-primary-100" />
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {skill.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/80 sm:text-base">
                {skill.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:max-w-[440px] lg:justify-end">
            <div className="inline-flex items-center gap-2 rounded-xl border border-foreground/[0.08] bg-foreground/[0.035] px-3.5 py-2.5">
              <Layers3 className="size-4 text-primary-100" />
              <span className="text-sm font-bold text-white">
                {totalSkillChallenges}
              </span>
              <span className="text-sm text-muted-foreground">Challenges</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-foreground/[0.08] bg-foreground/[0.035] px-3.5 py-2.5">
              <Code2 className="size-4 text-cyan-700 dark:text-cyan-300" />
              <span className="text-sm font-bold text-white">{topics.length}</span>
              <span className="text-sm text-muted-foreground">Topics</span>
            </div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-foreground/[0.08] bg-foreground/[0.035] px-3.5 py-2.5">
              <BookOpen className="size-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
              <span className="truncate text-sm font-semibold text-foreground">
                {skill.slug}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <section className="flex-1 flex flex-col gap-6">
          <ChallengeFilterBar topics={topics} />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {t.preparation.challenges}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a challenge and keep the practice flow moving.
              </p>
            </div>
            <span className="w-fit rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1.5 text-sm font-bold text-primary-100">
              {showingSkillChallenges} showing
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {skill.challenges && skill.challenges.length > 0 ? (
              skill.challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  skillSlug={skill.slug}
                  dictionary={t}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-foreground/10 bg-foreground/[0.03] p-16 text-center">
                <div className="mb-4 rounded-2xl border border-foreground/10 bg-foreground/[0.04] p-4">
                  <CircleAlert size={32} className="text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium">No challenges found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters to find what you are looking for.</p>
                <Link href={`/preparation/${skill.slug}`} className="mt-6 text-primary-200 hover:text-primary-100 font-bold text-sm">
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

export default SkillPage;
