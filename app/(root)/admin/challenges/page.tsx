import type { Metadata } from "next";

import {
  getAdminChallenges,
  getAdminSkills,
} from "@/lib/actions/admin.actions";
import AdminChallengesClient from "@/components/admin/AdminChallenges";

export const metadata: Metadata = {
  title: "Admin challenges",
};

export default async function AdminChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    difficulty?: string;
    skillId?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || "";
  const status = params.status || "";
  const difficulty = params.difficulty || "";
  const skillId = params.skillId || "";
  const [data, skills] = await Promise.all([
    getAdminChallenges({
      page,
      limit: 10,
      search,
      status,
      difficulty,
      skillId,
    }),
    getAdminSkills(),
  ]);

  return (
    <AdminChallengesClient
      data={data}
      skills={skills}
      currentPage={page}
      currentSearch={search}
      currentStatus={status}
      currentDifficulty={difficulty}
      currentSkillId={skillId}
    />
  );
}
