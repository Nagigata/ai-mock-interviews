import Link from "next/link";
import { cookies } from "next/headers";
import { BrainCircuit, Clock3, Mic2, Sparkles } from "lucide-react";

import InterviewTabs from "@/components/InterviewTabs";
import { getDictionary } from "@/lib/i18n";
import { getMyProfile } from "@/lib/actions/user.actions";
import {
  getInterviewsByUserId,
  getLatestInterviews,
  getAttemptedInterviews,
  getFeedbackByInterviewId,
  getInterviewAttempts,
} from "@/lib/actions/general.action";
import { Feedback, Interview } from "@/types";

async function buildFeedbackAndAttemptMaps(
  interviews: Interview[],
  userId: string,
) {
  const feedbackMap: Record<string, Feedback | null> = {};
  const attemptCountMap: Record<string, number> = {};

  await Promise.all(
    interviews.map(async (interview) => {
      const [feedback, attempts] = await Promise.all([
        getFeedbackByInterviewId({ interviewId: interview.id, userId }),
        getInterviewAttempts(interview.id),
      ]);
      feedbackMap[interview.id] = feedback;
      attemptCountMap[interview.id] = attempts?.length || 0;
    }),
  );

  return { feedbackMap, attemptCountMap };
}

const page = async () => {
  const user = await getMyProfile();

  if (!user) {
    return null;
  }

  const [myInterviews, latestInterviews, attemptedInterviews] =
    await Promise.all([
      getInterviewsByUserId(user.id),
      getLatestInterviews({ userId: user.id, limit: 20 }),
      getAttemptedInterviews(),
    ]);

  // Collect all unique interviews for feedback/attempt lookup
  const allInterviews = [
    ...(myInterviews || []),
    ...(attemptedInterviews || []),
    ...(latestInterviews || []),
  ];
  const uniqueInterviews = Array.from(
    new Map(allInterviews.map((i) => [i.id, i])).values(),
  );

  const { feedbackMap, attemptCountMap } = await buildFeedbackAndAttemptMaps(
    uniqueInterviews,
    user.id,
  );
  const totalAttempts = Object.values(attemptCountMap).reduce(
    (total, count) => total + count,
    0,
  );

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const t = getDictionary(locale);

  return (
    <div className="flex flex-col gap-8">
      <section className="relative animate-fadeIn overflow-hidden rounded-[34px] border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(202,197,254,0.2),_transparent_28%),linear-gradient(155deg,_rgba(18,22,30,0.98),_rgba(8,10,14,0.98))] px-7 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.3)] sm:px-10 sm:py-10">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary-200/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative grid gap-7 xl:grid-cols-[1.35fr_0.95fr] xl:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/15 bg-primary-200/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primary-100">
              <Sparkles size={14} />
              AI Interview
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-primary-100" size={30} />
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {t.agent.aiInterviewer}
                </h1>
              </div>
              <p className="max-w-2xl text-base leading-7 text-light-100 sm:text-lg">
                Start a new mock interview, explore public interview templates,
                and keep your own interview sessions in one place.
              </p>
            </div>

            <Link
              href="/interview/setup"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-200 px-5 py-3 text-sm font-extrabold text-dark-100 transition-transform hover:-translate-y-0.5"
            >
              <Mic2 size={16} />
              {t.home.startBtn}
            </Link>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-black/20 p-4 backdrop-blur-xl">
            <div className="mb-4 px-1">
              <h2 className="text-lg font-bold text-white">
                Interview workspace
              </h2>
              <p className="mt-1 text-xs leading-5 text-light-400">
                Keep your generated sessions and practice attempts in one place.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-light-100/80">
                    Interviews
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
                    <Mic2 className="size-4" />
                  </span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {myInterviews?.length || 0}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-light-100/80">
                    Attempts
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                    <Clock3 className="size-4" />
                  </span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {totalAttempts}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="animate-fadeIn"
        style={{ animationDelay: "0.08s", animationFillMode: "both" }}
      >
        <InterviewTabs
          userId={user.id}
          myInterviews={myInterviews || []}
          attemptedInterviews={attemptedInterviews || []}
          latestInterviews={latestInterviews || []}
          feedbackMap={feedbackMap}
          attemptCountMap={attemptCountMap}
          locale={locale}
        />
      </section>
    </div>
  );
};

export default page;
