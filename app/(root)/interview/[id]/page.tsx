import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { getInterviewById } from "@/lib/actions/general.action";
import { getMyProfile } from "@/lib/actions/user.actions";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n";
import { RouteParams } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const interview = await getInterviewById(id);
  return {
    title: interview?.role ? `${interview.role} interview` : "Interview",
  };
}

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getMyProfile();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const t = getDictionary(locale);

  return (
    <>
      <div className="flex flex-row flex-wrap gap-4 justify-between">
        <div className="flex flex-row flex-wrap gap-4 items-center max-sm:flex-col max-sm:items-start">
          <div className="flex flex-row gap-4 items-center">
            <h3 className="capitalize text-2xl font-bold bg-primary-200/10 px-4 py-2 rounded-xl text-primary-100 border border-primary-200/20">
              {interview.role} {t.interviewCard.mockInterview}
            </h3>
          </div>

          <DisplayTechIcons techStack={interview.techstack} />
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          {interview.type}
        </p>
      </div>

      <Agent
        userName={user.name}
        userId={user.id}
        userAvatarUrl={user.avatarUrl}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        language={interview.language}
        dictionary={t}
      />
    </>
  );
};

export default InterviewDetails;
