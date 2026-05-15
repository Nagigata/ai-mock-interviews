"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChartNoAxesColumn,
  Clock3,
  Flame,
  FolderOpenDot,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import SkillCard from "@/components/SkillCard";
import type { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { RecentActivityItem, Skill, UserProfile } from "@/types";

interface PreparationLandingProps {
  dictionary: ReturnType<typeof getDictionary>;
  locale: string;
  profile: UserProfile | null;
  recentChallenges: RecentActivityItem[];
  continueChallenges: RecentActivityItem[];
  recommendedSkills: Skill[];
  skills: Skill[];
}

type StatItem = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: string;
};

const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getStatusTone = (status: string) => {
  if (status === "ACCEPTED") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  return "border-amber-400/25 bg-amber-400/10 text-amber-300";
};

const SectionHeader = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex items-start gap-3">
      <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-[30px]" style={{ color: "var(--text-heading)" }}>
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
    </div>

    {action && (
      <Link
        href={action.href}
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--surface-border)] px-4 py-2.5 text-sm font-bold text-primary-100 transition-colors hover:border-primary-200/30 hover:bg-primary-200/10"
        style={{ background: "var(--surface-overlay)" }}
      >
        {action.label}
        <ArrowRight className="size-4" />
      </Link>
    )}
  </div>
);

const EmptyPanel = ({ children }: { children: ReactNode }) => (
  <div className="rounded-[24px] border border-dashed border-[var(--surface-border)] px-5 py-10 text-center text-sm leading-6" style={{ background: "var(--surface-overlay)", color: "var(--text-muted)" }}>
    {children}
  </div>
);

const ActivityPill = ({ status }: { status: string }) => (
  <span
    className={cn(
      "rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em]",
      getStatusTone(status),
    )}
  >
    {formatStatus(status)}
  </span>
);

const PreparationLanding = ({
  dictionary,
  locale,
  profile,
  recentChallenges,
  continueChallenges,
  recommendedSkills,
  skills,
}: PreparationLandingProps) => {
  const name = profile?.name?.split(" ")[0] || "there";
  const stats = profile?.stats;
  const resumeChallenge = continueChallenges[0] ?? recentChallenges[0];
  const continueTarget = resumeChallenge
    ? `/preparation/${resumeChallenge.skillSlug || "algorithms"}/${resumeChallenge.challengeId}`
    : "/challenges";

  const isVietnamese = locale === "vi";
  const copy = isVietnamese
    ? {
        heroTitle: `Chào mừng trở lại, ${name}.`,
        heroSubtitle:
          "Tiếp tục luyện challenge, chọn một track rõ ràng và chuyển sang mock interview khi bạn đã sẵn sàng.",
        continueLabel: "Tiếp tục luyện tập",
        browseLabel: "Xem challenges",
        interviewLabel: "AI Interview",
        statsTitle: "Tiến độ luyện tập",
        statsSubtitle:
          "Một ảnh chụp nhanh để bạn biết mình đang tiến đến đâu.",
        continueTitle: "Tiếp tục từ nơi bạn dừng lại",
        continueSubtitle:
          "Những challenge gần đây nhất nằm ở đây để bạn quay lại nhanh mà không cần tìm lại.",
        noContinue:
          "Chưa có hoạt động gần đây. Hãy bắt đầu bằng một track gợi ý bên dưới.",
        recentTitle: "Hoạt động gần đây",
        recentSubtitle:
          "Theo dõi nhanh các challenge bạn vừa submit và trạng thái hiện tại.",
        noRecent:
          "Khi bạn bắt đầu submit challenge, lịch sử gần đây sẽ xuất hiện ở đây.",
        recommendedTitle: "Track gợi ý",
        recommendedSubtitle:
          "Các track phù hợp để lấy đà trước khi luyện sâu hơn.",
        allSkillsTitle: dictionary.preparation.skillTitle,
        allSkillsSubtitle:
          "Mỗi skill là một đường vào rõ ràng để bạn luyện theo chủ đề thay vì học rời rạc.",
        viewPracticeHistory: "Xem lịch sử luyện tập",
      }
    : {
        heroTitle: `Welcome back, ${name}.`,
        heroSubtitle:
          "Pick up a challenge, choose a focused track, and jump into a mock interview when you are ready.",
        continueLabel: "Continue practice",
        browseLabel: "Browse challenges",
        interviewLabel: "AI Interview",
        statsTitle: "Practice momentum",
        statsSubtitle:
          "A quick snapshot of how your preparation is moving this week.",
        continueTitle: "Pick up where you left off",
        continueSubtitle:
          "Your latest challenges are right here so you can jump back in without digging around.",
        noContinue:
          "No recent challenge activity yet. Start with one of the recommended tracks below.",
        recentTitle: "Recent activity",
        recentSubtitle:
          "A quick look at the challenges you touched most recently and how they went.",
        noRecent:
          "Once you start submitting solutions, your latest challenge activity will appear here.",
        recommendedTitle: "Recommended tracks",
        recommendedSubtitle:
          "Useful starting points based on your recent activity and available practice paths.",
        allSkillsTitle: dictionary.preparation.skillTitle,
        allSkillsSubtitle:
          "Each skill gives you a clear entry point so your practice feels guided instead of scattered.",
        viewPracticeHistory: "View practice history",
      };

  const statItems: StatItem[] = [
    {
      label: isVietnamese ? "Đã giải" : "Solved",
      value: stats?.totalSolvedChallenges ?? 0,
      icon: Target,
      tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    },
    {
      label: isVietnamese ? "Chuỗi ngày" : "Streak",
      value: stats?.currentStreak ?? 0,
      icon: Flame,
      tone: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    },
    {
      label: isVietnamese ? "Tỉ lệ đúng" : "Acceptance",
      value: `${Math.round(stats?.acceptanceRate ?? 0)}%`,
      icon: ChartNoAxesColumn,
      tone: "border-primary-200/20 bg-primary-200/10 text-primary-100",
    },
    {
      label: isVietnamese ? "Interviews" : "Interviews",
      value: stats?.totalInterviews ?? 0,
      icon: BrainCircuit,
      tone: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[34px] border border-[var(--surface-border)] px-6 py-7 sm:px-8 lg:px-10"
        style={{
          background: "var(--hero-gradient)",
          boxShadow: `0 28px 80px var(--shadow-heavy)`,
        }}
      >
        <div className="pointer-events-none absolute right-10 top-8 h-28 w-28 rounded-full bg-primary-200/15 blur-3xl" />
        <div className="relative grid gap-7 xl:grid-cols-[1.35fr_0.95fr] xl:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/15 bg-primary-200/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-100">
              <Sparkles className="size-3.5" />
              Preparation
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--text-heading)" }}>
                {copy.heroTitle}
              </h1>
              <p className="max-w-2xl text-base leading-7 sm:text-lg" style={{ color: "var(--text-body)", opacity: 0.85 }}>
                {copy.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={continueTarget}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-200 px-5 py-3 text-sm font-extrabold text-dark-100 transition-all hover:-translate-y-0.5 hover:bg-primary-200/85"
              >
                {copy.continueLabel}
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/challenges"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--surface-border)] px-5 py-3 text-sm font-bold transition-colors hover:bg-[var(--surface-overlay-hover)]"
                style={{ background: "var(--surface-overlay)", color: "var(--text-heading)" }}
              >
                <FolderOpenDot className="size-4" />
                {copy.browseLabel}
              </Link>

              <Link
                href="/interview"
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-200 transition-colors hover:bg-cyan-400/15"
              >
                <BrainCircuit className="size-4" />
                {copy.interviewLabel}
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--surface-border)] p-4 backdrop-blur-xl" style={{ background: "rgba(0,0,0,0.12)" }}>
            <div className="mb-4 flex items-start justify-between gap-4 px-1">
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-heading)" }}>
                  {copy.statsTitle}
                </h2>
                <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-muted)" }}>
                  {copy.statsSubtitle}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {statItems.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-[22px] border border-[var(--surface-border)] p-4"
                    style={{ background: "var(--surface-overlay)" }}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: "var(--text-body)", opacity: 0.8 }}>
                        {stat.label}
                      </span>
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-xl border",
                          stat.tone,
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                    </div>
                    <div className="text-3xl font-bold" style={{ color: "var(--text-heading)" }}>
                      {stat.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"
      >
        <div
          className="rounded-[30px] border border-[var(--surface-border)] p-5 sm:p-7"
          style={{ background: "var(--section-bg)", boxShadow: `0 24px 60px var(--shadow-color)` }}
        >
          <SectionHeader
            icon={Clock3}
            title={copy.continueTitle}
            description={copy.continueSubtitle}
          />

          {continueChallenges.length > 0 ? (
            <div className="space-y-3">
              {continueChallenges.map((item) => (
                <Link
                  key={item.id}
                  href={`/preparation/${item.skillSlug || "algorithms"}/${item.challengeId}`}
                  className="group flex items-center justify-between gap-4 rounded-[22px] border border-[var(--surface-border)] px-4 py-4 transition-all hover:border-primary-200/20 hover:bg-primary-200/[0.06]"
                  style={{ background: "var(--surface-overlay)" }}
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <ActivityPill status={item.status} />
                      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        {item.language || "-"}
                      </span>
                    </div>
                    <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary-100" style={{ color: "var(--text-heading)" }}>
                      {item.challengeTitle || "Untitled Challenge"}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {dayjs(item.submittedAt).format("DD MMM YYYY, HH:mm")}
                    </p>
                  </div>

                  <ArrowRight className="size-4 shrink-0 transition-all group-hover:translate-x-1 group-hover:text-primary-100" style={{ color: "var(--text-muted)" }} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyPanel>{copy.noContinue}</EmptyPanel>
          )}
        </div>

        <div
          className="rounded-[30px] border border-[var(--surface-border)] p-5 sm:p-7"
          style={{ background: "var(--section-bg-alt)", boxShadow: `0 24px 60px var(--shadow-color)` }}
        >
          <SectionHeader
            icon={BookOpen}
            title={copy.recommendedTitle}
            description={copy.recommendedSubtitle}
          />

          {recommendedSkills.length > 0 ? (
            <div className="space-y-3">
              {recommendedSkills.map((skill, index) => (
                <Link
                  key={skill.id}
                  href={`/preparation/${skill.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-[22px] border border-[var(--surface-border)] px-4 py-4 transition-all hover:border-cyan-400/20 hover:bg-cyan-400/[0.06]"
                  style={{ background: "var(--surface-overlay)" }}
                >
                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                      Track {index + 1}
                    </p>
                    <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-cyan-200" style={{ color: "var(--text-heading)" }}>
                      {skill.name}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                      {skill._count?.challenges ?? 0}{" "}
                      {dictionary.preparation.challenges.toLowerCase()}
                    </p>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-200">
                    <BookOpen className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyPanel>{dictionary.preparation.noSkills}</EmptyPanel>
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16, ease: "easeOut" }}
        className="rounded-[30px] border border-[var(--surface-border)] p-5 sm:p-7"
        style={{ background: "var(--section-bg)", boxShadow: `0 24px 60px var(--shadow-color)` }}
      >
        <SectionHeader
          icon={Target}
          title={copy.recentTitle}
          description={copy.recentSubtitle}
          action={{
            href: "/practice-history",
            label: copy.viewPracticeHistory,
          }}
        />

        {recentChallenges.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recentChallenges.map((item) => (
              <Link
                key={item.id}
                href={`/preparation/${item.skillSlug || "algorithms"}/${item.challengeId}`}
                className="group flex min-h-[190px] flex-col rounded-[24px] border border-[var(--surface-border)] p-5 transition-all hover:-translate-y-0.5 hover:border-primary-200/15 hover:bg-primary-200/[0.05]"
                style={{ background: "var(--surface-overlay)" }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <ActivityPill status={item.status} />
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {item.language || "-"}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary-100" style={{ color: "var(--text-heading)" }}>
                  {item.challengeTitle || "Untitled Challenge"}
                </h3>
                <p className="mt-auto pt-5 text-sm" style={{ color: "var(--text-muted)" }}>
                  {dayjs(item.submittedAt).format("DD MMM YYYY, HH:mm")}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyPanel>{copy.noRecent}</EmptyPanel>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.24, ease: "easeOut" }}
        className="space-y-6"
      >
        <SectionHeader
          icon={FolderOpenDot}
          title={copy.allSkillsTitle}
          description={copy.allSkillsSubtitle}
        />

        {skills.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {skills.map((skill, index) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                dictionary={dictionary}
                index={index}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <EmptyPanel>{dictionary.preparation.noSkills}</EmptyPanel>
        )}
      </motion.section>
    </div>
  );
};

export default PreparationLanding;
