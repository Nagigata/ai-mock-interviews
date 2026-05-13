import PreparationLanding from "@/components/PreparationLanding";
import { getSkills } from "@/lib/actions/challenges.action";
import {
  getMyProfile,
  getMyRecommendedSkills,
} from "@/lib/actions/user.actions";
import { getDictionary } from "@/lib/i18n";
import { RecentActivityItem } from "@/types";
import { cookies } from "next/headers";

const isChallengeActivity = (item: RecentActivityItem) =>
  item.activityType !== "INTERVIEW_ATTEMPT" &&
  Boolean(item.challengeId && item.challengeTitle && item.skillSlug);

const dedupeRecentChallenges = (items: RecentActivityItem[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (!isChallengeActivity(item)) {
      return false;
    }

    const challengeId = item.challengeId as string;

    if (seen.has(challengeId)) {
      return false;
    }

    seen.add(challengeId);
    return true;
  });
};

const PreparationPage = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dictionary = getDictionary(locale);

  const [skillsResponse, profile, recommendedSkillsResponse] = await Promise.all([
    getSkills(),
    getMyProfile(),
    getMyRecommendedSkills(3),
  ]);

  const skills = skillsResponse ?? [];
  const recentActivity = dedupeRecentChallenges(profile?.recentActivity ?? []);
  const continueChallenges = recentActivity
    .filter((item) => item.status !== "ACCEPTED")
    .slice(0, 3);
  const recentChallenges = recentActivity.slice(0, 4);
  const recommendedSkills = recommendedSkillsResponse ?? skills.slice(0, 3);

  return (
    <PreparationLanding
      dictionary={dictionary}
      locale={locale}
      profile={profile}
      recentChallenges={recentChallenges}
      continueChallenges={continueChallenges}
      recommendedSkills={recommendedSkills}
      skills={skills}
    />
  );
};

export default PreparationPage;
