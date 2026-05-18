import { redirect } from "next/navigation";
import { getSubmissionDetail } from "@/lib/actions/submissions.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getChallengeById } from "@/lib/actions/challenges.action";
import { ShareSolutionForm } from "@/components/solutions/ShareSolutionForm";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submissionId?: string }>;
}

export default async function NewSolutionPage({ params, searchParams }: Props) {
  const { id: challengeId } = await params;
  const { submissionId } = await searchParams;

  const me = await getCurrentUser().catch(() => null);
  if (!me) {
    redirect(
      `/sign-in?redirect=/challenges/${challengeId}/solutions/new?submissionId=${submissionId}`,
    );
  }

  if (!submissionId) {
    redirect(`/challenges`);
  }

  const [challenge, result] = await Promise.all([
    getChallengeById(challengeId),
    getSubmissionDetail(submissionId),
  ]);

  const skillSlug = challenge?.skill?.slug;
  if (!challenge || !skillSlug) {
    redirect(`/challenges`);
  }

  if (!result.success || !result.data) {
    redirect(`/preparation/${skillSlug}/${challengeId}`);
  }

  const submission = result.data;

  if (submission.status !== "ACCEPTED") {
    redirect(`/preparation/${skillSlug}/${challengeId}`);
  }

  return (
    <ShareSolutionForm
      challengeId={challengeId}
      skillSlug={skillSlug}
      submissionId={submission.id}
      language={submission.language}
      code={submission.code}
    />
  );
}
