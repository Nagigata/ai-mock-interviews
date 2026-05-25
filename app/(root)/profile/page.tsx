import type { Metadata } from "next";
import Link from "next/link";
import dayjs from "dayjs";

import UserProfileContent, {
  type InterviewSummary,
} from "@/components/UserProfileContent";
import PageState from "@/components/shared/PageState";
import {
  getMyProfile,
  getProfileActivity,
} from "@/lib/actions/user.actions";
import {
  getProfileSolutions,
  getProfileDiscuss,
} from "@/lib/actions/solutions.actions";

const PROFILE_TAB_PAGE_SIZE = 10;

export const metadata: Metadata = {
  title: "Profile",
};

type RawInterviewSummary = {
  created?: number;
  completedAttempts?: number;
  averageScore?: number | null;
  scoredFeedbacks?: number;
  latestRole?: string | null;
  latestStatus?: string | null;
  latestDate?: string | null;
};

const buildInterviewSummary = (
  raw?: RawInterviewSummary | null,
): InterviewSummary => {
  const r = raw ?? {};
  const latestLabel = r.latestRole
    ? `${r.latestRole}${r.latestStatus ? ` - ${r.latestStatus}` : ""}`
    : "No interview activity yet";
  return {
    created: r.created ?? 0,
    completedAttempts: r.completedAttempts ?? 0,
    averageScore: r.averageScore ?? null,
    scoredFeedbacks: r.scoredFeedbacks ?? 0,
    latestLabel,
    latestDate: r.latestDate ? dayjs(r.latestDate).toISOString() : null,
  };
};

const ProfilePage = async () => {
  const [
    profile,
    initialChallengeActivity,
    initialInterviewActivity,
    initialSolutions,
    initialDiscuss,
  ] = await Promise.all([
    getMyProfile(),
    getProfileActivity(1, PROFILE_TAB_PAGE_SIZE, "CHALLENGE"),
    getProfileActivity(1, PROFILE_TAB_PAGE_SIZE, "INTERVIEW"),
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

  const interviewSummary = buildInterviewSummary(
    (profile as unknown as { interviewSummary?: RawInterviewSummary })
      .interviewSummary,
  );

  return (
    <UserProfileContent
      profile={profile}
      isOwn
      initialChallengeActivity={initialChallengeActivity}
      initialInterviewActivity={initialInterviewActivity}
      initialSolutions={initialSolutions}
      initialDiscuss={initialDiscuss}
      interviewSummary={interviewSummary}
    />
  );
};

export default ProfilePage;
