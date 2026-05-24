import Link from "next/link";
import dayjs from "dayjs";
import {
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  Flame,
  MessageSquareText,
  Target,
  TimerReset,
  UserRoundCheck,
  WandSparkles,
  CalendarDays,
  MapPin,
  type LucideIcon,
} from "lucide-react";

import ProfileEditor from "@/components/ProfileEditor";
import UserAvatar from "@/components/UserAvatar";
import AcceptanceOverview from "@/components/AcceptanceOverview";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { ProfileActivityTabs } from "@/components/profile/ProfileActivityTabs";
import {
  ProfileActivityResponse,
  ProfileDiscussResponse,
  ProfileSolutionsResponse,
  UserProfile,
} from "@/types";

interface InterviewSummary {
  created: number;
  completedAttempts: number;
  attentionAttempts: number;
  latestLabel: string;
  latestDate?: string | null;
}

interface UserProfileContentProps {
  profile: UserProfile;
  isOwn: boolean;
  initialChallengeActivity: ProfileActivityResponse | null;
  initialInterviewActivity: ProfileActivityResponse | null;
  initialSolutions: ProfileSolutionsResponse | null;
  initialDiscuss: ProfileDiscussResponse | null;
  interviewSummary: InterviewSummary;
}

type Card = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

const UserProfileContent = ({
  profile,
  isOwn,
  initialChallengeActivity,
  initialInterviewActivity,
  initialSolutions,
  initialDiscuss,
  interviewSummary,
}: UserProfileContentProps) => {
  const progressCards: Card[] = [
    {
      label: "Accepted",
      value: profile.stats.acceptedSubmissions,
      helper: `${profile.stats.acceptanceRate}% overall acceptance rate`,
      icon: CheckCircle2,
      tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    },
    {
      label: "Attempting",
      value: profile.stats.attemptingChallenges,
      helper: "Problems currently in progress",
      icon: Target,
      tone: "border-primary-200/20 bg-primary-200/10 text-primary-100",
    },
    {
      label: "Active Days",
      value: profile.stats.activeDays,
      helper: "Tracked across the last 12 months",
      icon: CalendarCheck2,
      tone: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    },
    {
      label: "Best Streak",
      value: profile.stats.maxStreak,
      helper: "Longest uninterrupted run",
      icon: Flame,
      tone: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    },
  ];

  const interviewMetricCards: Card[] = [
    {
      label: "Created",
      value: interviewSummary.created,
      helper: "Mock interviews generated",
      icon: WandSparkles,
      tone: "border-primary-200/20 bg-primary-200/10 text-primary-100",
    },
    {
      label: "Completed",
      value: interviewSummary.completedAttempts,
      helper: "Attempts with feedback",
      icon: UserRoundCheck,
      tone: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    },
    {
      label: "Needs Review",
      value: interviewSummary.attentionAttempts,
      helper: "Too short or failed attempts",
      icon: AlertTriangle,
      tone: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    },
    {
      label: "Latest",
      value: interviewSummary.latestDate
        ? dayjs(interviewSummary.latestDate).format("MMM D")
        : "--",
      helper: interviewSummary.latestLabel,
      icon: TimerReset,
      tone: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    },
  ];

  const joinedDate = profile.createdAt
    ? dayjs(profile.createdAt).format("DD/MM/YYYY")
    : "";

  return (
    <div className="flex flex-col gap-8">
      {isOwn ? (
        <ProfileEditor profile={profile} />
      ) : (
        <PublicProfileHeader profile={profile} joinedDate={joinedDate} />
      )}

      {profile.readme && (
        <section className="rounded-[28px] border border-white/[0.08] bg-[#101318] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-100">
            About
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-light-100/85">
            {profile.readme}
          </p>
        </section>
      )}

      <section className="rounded-[32px] border border-white/[0.08] bg-[#101318] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-7">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-100">
              Progress
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              {isOwn ? "Personal Coding Overview" : `${profile.name}'s Progress`}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-light-100/75">
              Solved count, acceptance trend, and long-term consistency.
            </p>
          </div>
          <div className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-light-100">
            {profile.stats.totalSubmissions} total submissions
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <AcceptanceOverview
            stats={profile.stats}
            className="rounded-[28px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,_rgba(202,197,254,0.08),_transparent_34%),#151922] p-5"
          />

          <div className="grid gap-4 self-stretch sm:grid-cols-2">
            {progressCards.map((card) => (
              <MetricCard key={card.label} card={card} />
            ))}
          </div>
        </div>
      </section>

      {isOwn && (
        <section className="rounded-[32px] border border-white/[0.08] bg-[#101318] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
                <MessageSquareText className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-100">
                  Interviews
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Mock Interview Overview
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-light-100/75">
                  A quick snapshot of your generated interviews and practice activity.
                </p>
              </div>
            </div>

            <Link
              href="/interview"
              className="inline-flex w-fit items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-primary-100 transition hover:border-primary-200/25 hover:bg-primary-200/10"
            >
              View interviews
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {interviewMetricCards.map((card) => (
              <MetricCard key={card.label} card={card} />
            ))}
          </div>
        </section>
      )}

      <ActivityHeatmap
        activity={profile.activityCalendar}
        activeDays={profile.stats.activeDays}
        maxStreak={profile.stats.maxStreak}
      />

      <ProfileActivityTabs
        isOwn={isOwn}
        initialChallengeActivity={initialChallengeActivity}
        initialInterviewActivity={initialInterviewActivity}
        initialSolutions={initialSolutions}
        initialDiscuss={initialDiscuss}
      />
    </div>
  );
};

const MetricCard = ({ card }: { card: Card }) => {
  const Icon = card.icon;
  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-5">
      <div className="mb-6 flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-light-100/80">{card.label}</p>
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-2xl border ${card.tone}`}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="text-3xl font-bold text-white">{card.value}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-light-400">
        {card.helper}
      </p>
    </div>
  );
};

const PublicProfileHeader = ({
  profile,
  joinedDate,
}: {
  profile: UserProfile;
  joinedDate: string;
}) => (
  <section className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,_rgba(202,197,254,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.1),_transparent_32%),linear-gradient(160deg,_rgba(23,26,36,0.98),_rgba(7,9,13,0.98))] px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:px-8 lg:px-10">
    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <UserAvatar
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          size="xl"
          className="relative border-white/15"
        />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-100">
            Candidate profile
          </p>
          <h1 className="mt-3 truncate pb-1 text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl sm:leading-[1.15]">
            {profile.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-light-100">
              <CalendarDays className="size-3.5 text-cyan-300" />
              Joined {joinedDate}
            </span>
            {profile.location && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-light-100">
                <MapPin className="size-3.5 text-emerald-300" />
                {profile.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export { type InterviewSummary };
export default UserProfileContent;
