import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import dayjs from "dayjs";

import UserProfileContent, {
  type InterviewSummary,
} from "@/components/UserProfileContent";
import {
  getUserProfileById,
  getProfileActivityByUserId,
} from "@/lib/actions/user.actions";
import {
  getProfileSolutionsByUserId,
  getProfileDiscussByUserId,
} from "@/lib/actions/solutions.actions";
import { getCurrentUser } from "@/lib/actions/auth.action";

export const metadata: Metadata = {
  title: "Profile",
};

interface PageProps {
  params: Promise<{ userId: string }>;
}

const PROFILE_TAB_PAGE_SIZE = 10;

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

const PublicProfilePage = async ({ params }: PageProps) => {
  const { userId } = await params;
  const currentUser = await getCurrentUser();

  if (currentUser?.id === userId) {
    redirect("/profile");
  }

  const profile = await getUserProfileById(userId);

  if (!profile) {
    notFound();
  }

  const [initialChallengeActivity, initialSolutions, initialDiscuss] =
    await Promise.all([
      getProfileActivityByUserId(userId, 1, PROFILE_TAB_PAGE_SIZE, "CHALLENGE"),
      getProfileSolutionsByUserId(userId, 1, PROFILE_TAB_PAGE_SIZE),
      getProfileDiscussByUserId(userId, 1, PROFILE_TAB_PAGE_SIZE),
    ]);

  const interviewSummary = buildInterviewSummary(
    (profile as unknown as { interviewSummary?: RawInterviewSummary })
      .interviewSummary,
  );

  return (
    <UserProfileContent
      profile={profile}
      isOwn={false}
      initialChallengeActivity={initialChallengeActivity}
      initialInterviewActivity={null}
      initialSolutions={initialSolutions}
      initialDiscuss={initialDiscuss}
      interviewSummary={interviewSummary}
    />
  );
};

export default PublicProfilePage;
