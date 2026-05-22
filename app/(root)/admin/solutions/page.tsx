import type { Metadata } from "next";

import {
  getAdminChallenges,
  getAdminSolutions,
} from "@/lib/actions/admin.actions";
import AdminSolutionsClient from "@/components/admin/AdminSolutions";

export const metadata: Metadata = {
  title: "Admin solutions",
};

export default async function AdminSolutionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    language?: string;
    challengeId?: string;
    createdFrom?: string;
    createdTo?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || "";
  const language = params.language || "";
  const challengeId = params.challengeId || "";
  const createdFrom = params.createdFrom || "";
  const createdTo = params.createdTo || "";

  const [data, challenges] = await Promise.all([
    getAdminSolutions({
      page,
      limit: 10,
      search,
      language,
      challengeId,
      createdFrom,
      createdTo,
    }),
    getAdminChallenges({ page: 1, limit: 50 }),
  ]);

  return (
    <AdminSolutionsClient
      data={data}
      challenges={
        (challenges?.items || []).map(
          (challenge: { id: string; title: string }) => ({
            id: challenge.id,
            title: challenge.title,
          }),
        )
      }
      currentPage={page}
      currentSearch={search}
      currentLanguage={language}
      currentChallengeId={challengeId}
      currentCreatedFrom={createdFrom}
      currentCreatedTo={createdTo}
    />
  );
}
