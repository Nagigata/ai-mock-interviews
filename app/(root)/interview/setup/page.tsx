import type { Metadata } from "next";
import Link from "next/link";
import Agent from "@/components/Agent";
import { cookies } from "next/headers";
import { BrainCircuit, Sparkles } from "lucide-react";

import PageState from "@/components/shared/PageState";
import { getDictionary } from "@/lib/i18n";
import { getMyProfile } from "@/lib/actions/user.actions";

export const metadata: Metadata = {
  title: "Interview setup",
};

const InterviewSetupPage = async () => {
  const user = await getMyProfile();

  if (!user) {
    return (
      <div className="flex flex-col gap-8">
        <PageState
          tone="neutral"
          title="Sign-in required"
          description="We couldn't load your profile. Please sign in again to start a new interview."
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

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const t = getDictionary(locale);

  return (
    <div className="flex flex-col gap-8">
      <section className="relative animate-fadeIn overflow-hidden rounded-[34px] border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(202,197,254,0.2),_transparent_28%),linear-gradient(155deg,_rgba(18,22,30,0.98),_rgba(8,10,14,0.98))] px-7 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.3)] sm:px-10 sm:py-10">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary-200/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/15 bg-primary-200/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primary-100">
            <Sparkles size={14} />
            Interview setup
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <BrainCircuit className="text-primary-100" size={30} />
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {t.home.startBtn}
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-light-100 sm:text-lg">
              Pick your preferred language, connect with the assistant, and start a fresh mock interview session.
            </p>
          </div>
        </div>
      </section>

      <section
        className="animate-fadeIn"
        style={{ animationDelay: "0.08s", animationFillMode: "both" }}
      >
        <Agent
          userName={user.name}
          userId={user.id}
          type="generate"
          dictionary={t}
        />
      </section>
    </div>
  );
};

export default InterviewSetupPage;
