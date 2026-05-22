import type { Metadata } from "next";
import ProfileEditor from "@/components/ProfileEditor";
import AcceptanceOverview from "@/components/AcceptanceOverview";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import PageState from "@/components/shared/PageState";
import { ProfileActivityTabs } from "@/components/profile/ProfileActivityTabs";
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
  type LucideIcon,
} from "lucide-react";
import {
  getMyProfile,
  getProfileActivity,
} from "@/lib/actions/user.actions";
import {
  getProfileSolutions,
  getProfileDiscuss,
} from "@/lib/actions/solutions.actions";
import {
  getAttemptedInterviews,
  getInterviewAttempts,
  getInterviewsByUserId,
} from "@/lib/actions/general.action";
import { Interview, InterviewAttempt } from "@/types";

type ProgressCard = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

type InterviewMetricCard = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

const getLatestInterview = (interviews: Interview[]) =>
  interviews
    .filter((interview) => interview.createdAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

const getAttemptDate = (attempt: InterviewAttempt) =>
  attempt.completedAt || attempt.endedAt || attempt.createdAt;

const getAttemptStatusLabel = (status: InterviewAttempt["status"]) => {
  if (status === "COMPLETED") {
    return "Completed";
  }

  if (status === "TOO_SHORT") {
    return "Too short";
  }

  if (status === "FAILED") {
    return "Failed";
  }

  return "In progress";
};

const PROFILE_TAB_PAGE_SIZE = 10;

export const metadata: Metadata = {
  title: "Profile",
};

const ProfilePage = async () => {
  const [profile, initialActivity, initialSolutions, initialDiscuss] = await Promise.all([
    getMyProfile(),
    getProfileActivity(1, PROFILE_TAB_PAGE_SIZE),
    getProfileSolutions(1, PROFILE_TAB_PAGE_SIZE),
    getProfileDiscuss(1, PROFILE_TAB_PAGE_SIZE),
  ]);

  if (!profile) {
    return (
      <div className="flex flex-col gap-8">
        <PageState
          tone="neutral"
          title="Sign-in required"
          description="We couldn't load your profile. Please sign in again to view your stats and activity."
          action={
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-200 px-5 py-3 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80"
            >
              Go to sign-in
            </Link>
          }
        />
      </div>
    );
  }

  const [myInterviews, attemptedInterviews] = await Promise.all([
    getInterviewsByUserId(profile.id),
    getAttemptedInterviews(),
  ]);

  const createdInterviews = myInterviews ?? [];
  const practicedInterviews = attemptedInterviews ?? [];
  const trackedInterviews = Array.from(
    new Map(
      [...createdInterviews, ...practicedInterviews].map((interview) => [
        interview.id,
        interview,
      ]),
    ).values(),
  );
  const attemptGroups = await Promise.all(
    trackedInterviews.map(async (interview) => ({
      interview,
      attempts: (await getInterviewAttempts(interview.id)) ?? [],
    })),
  );
  const interviewAttempts = attemptGroups.flatMap(({ interview, attempts }) =>
    attempts.map((attempt) => ({ attempt, interview })),
  );
  const completedInterviewAttempts = interviewAttempts.filter(
    ({ attempt }) => attempt.status === "COMPLETED" || attempt.feedback,
  ).length;
  const attentionInterviewAttempts = interviewAttempts.filter(
    ({ attempt }) => attempt.status === "TOO_SHORT" || attempt.status === "FAILED",
  ).length;
  const latestAttemptRecord = interviewAttempts
    .filter(({ attempt }) => getAttemptDate(attempt))
    .sort(
      (a, b) =>
        new Date(getAttemptDate(b.attempt)).getTime() -
        new Date(getAttemptDate(a.attempt)).getTime(),
    )[0];
  const latestInterview = getLatestInterview([
    ...createdInterviews,
    ...practicedInterviews,
  ]);
  const latestInterviewDate = latestAttemptRecord
    ? getAttemptDate(latestAttemptRecord.attempt)
    : latestInterview?.createdAt;
  const latestInterviewLabel = latestAttemptRecord
    ? `${latestAttemptRecord.interview.role} - ${getAttemptStatusLabel(
        latestAttemptRecord.attempt.status,
      )}`
    : latestInterview
      ? `${latestInterview.role} - ${latestInterview.level}`
      : "No interview activity yet";


  const progressCards: ProgressCard[] = [
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

  const interviewMetricCards: InterviewMetricCard[] = [
    {
      label: "Created",
      value: createdInterviews.length,
      helper: "Mock interviews generated by you",
      icon: WandSparkles,
      tone: "border-primary-200/20 bg-primary-200/10 text-primary-100",
    },
    {
      label: "Completed",
      value: completedInterviewAttempts,
      helper: "Attempts with feedback generated",
      icon: UserRoundCheck,
      tone: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    },
    {
      label: "Needs Review",
      value: attentionInterviewAttempts,
      helper: "Too short or failed attempts",
      icon: AlertTriangle,
      tone: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    },
    {
      label: "Latest",
      value: latestInterviewDate ? dayjs(latestInterviewDate).format("MMM D") : "--",
      helper: latestInterviewLabel,
      icon: TimerReset,
      tone: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <ProfileEditor profile={profile} />

      <section className="rounded-[32px] border border-white/[0.08] bg-[#101318] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-7">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-100">
              Progress
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Personal Coding Overview
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-light-100/75">
              Follow your solved count, acceptance trend, and long-term consistency from one place.
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
            {progressCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-5"
                >
                  <div className="mb-6 flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-light-100/80">
                      {card.label}
                    </p>
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-2xl border ${card.tone}`}
                    >
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                  <p className="mt-2 text-sm leading-5 text-light-400">
                    {card.helper}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
          {interviewMetricCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-5"
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-light-100/80">
                    {card.label}
                  </p>
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
          })}
        </div>
      </section>

      <ActivityHeatmap
        activity={profile.activityCalendar}
        activeDays={profile.stats.activeDays}
        maxStreak={profile.stats.maxStreak}
      />

      <ProfileActivityTabs
        initialActivity={initialActivity}
        initialSolutions={initialSolutions}
        initialDiscuss={initialDiscuss}
      />
    </div>
  );
};

export default ProfilePage;
