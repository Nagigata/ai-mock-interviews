"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ListChecks } from "lucide-react";
import UnderlineTabs from "@/components/UnderlineTabs";
import { ProfileActivityList } from "./ProfileActivityList";
import { ProfileSolutionsList } from "./ProfileSolutionsList";
import { ProfileDiscussList } from "./ProfileDiscussList";
import {
  ProfileActivityResponse,
  ProfileSolutionsResponse,
  ProfileDiscussResponse,
} from "@/types";

type ProfileTab = "challenge" | "interview" | "solutions" | "discuss";

interface Props {
  isOwn: boolean;
  initialChallengeActivity: ProfileActivityResponse | null;
  initialInterviewActivity: ProfileActivityResponse | null;
  initialSolutions: ProfileSolutionsResponse | null;
  initialDiscuss: ProfileDiscussResponse | null;
}

export function ProfileActivityTabs({
  isOwn,
  initialChallengeActivity,
  initialInterviewActivity,
  initialSolutions,
  initialDiscuss,
}: Props) {
  const tabs = useMemo(() => {
    const list: { id: ProfileTab; label: string }[] = [
      { id: "challenge", label: "Challenge" },
    ];
    if (isOwn) list.push({ id: "interview", label: "Interview" });
    list.push({ id: "solutions", label: "Solutions" });
    list.push({ id: "discuss", label: "Discuss" });
    return list;
  }, [isOwn]);

  const [activeTab, setActiveTab] = useState<ProfileTab>("challenge");

  const challengeItems = initialChallengeActivity?.items ?? [];
  const interviewItems = initialInterviewActivity?.items ?? [];
  const solutionItems = initialSolutions?.items ?? [];
  const discussItems = initialDiscuss?.items ?? [];

  return (
    <section
      className="rounded-[32px] border border-white/[0.08] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-7"
      style={{ background: "#101318" }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
          <ListChecks className="size-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-100">
            Recent
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Activity & Contributions
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-light-100/75">
            Latest practice, shared solutions, and discussions across the platform.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <UnderlineTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mt-5">
        {activeTab === "challenge" && (
          <>
            <ProfileActivityList items={challengeItems} kind="CHALLENGE" />
            {challengeItems.length > 0 && isOwn && (
              <div className="mt-4 flex justify-center">
                <Link
                  href="/practice-history"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-primary-100 transition hover:border-primary-200/25 hover:bg-primary-200/10"
                >
                  View all practice activities
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            )}
          </>
        )}

        {activeTab === "interview" && isOwn && (
          <>
            <ProfileActivityList items={interviewItems} kind="INTERVIEW" />
            {interviewItems.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Link
                  href="/practice-history"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-primary-100 transition hover:border-primary-200/25 hover:bg-primary-200/10"
                >
                  View all practice activities
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            )}
          </>
        )}

        {activeTab === "solutions" && <ProfileSolutionsList items={solutionItems} />}

        {activeTab === "discuss" && <ProfileDiscussList items={discussItems} />}
      </div>
    </section>
  );
}
