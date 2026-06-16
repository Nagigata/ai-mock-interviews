import type { Metadata } from "next";
import { getChallengeById } from "@/lib/actions/challenges.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { notFound } from "next/navigation";
import ChallengeEditorView from "@/components/ChallengeEditorView";

interface Props {
  params: Promise<{ skillSlug: string; challengeId: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ skillSlug: string; challengeId: string }>;
}): Promise<Metadata> {
  const { challengeId } = await params;
  const challenge = await getChallengeById(challengeId);
  return { title: challenge?.title ?? "Challenge" };
}

const ChallengeEditorPage = async ({ params }: Props) => {
  const { skillSlug, challengeId } = await params;

  const [challenge, me] = await Promise.all([
    getChallengeById(challengeId),
    getCurrentUser().catch(() => null),
  ]);

  if (!challenge) {
    notFound();
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 bg-background">
      <ChallengeEditorView
        challenge={challenge}
        skillSlug={skillSlug}
        currentUserId={me?.id}
      />
    </div>
  );
};

export default ChallengeEditorPage;
