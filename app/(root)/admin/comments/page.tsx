import type { Metadata } from "next";

import { getAdminComments } from "@/lib/actions/admin.actions";
import AdminCommentsClient from "@/components/admin/AdminComments";

export const metadata: Metadata = {
  title: "Admin comments",
};

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    hasReplies?: string;
    createdFrom?: string;
    createdTo?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || "";
  const hasReplies = params.hasReplies || "";
  const createdFrom = params.createdFrom || "";
  const createdTo = params.createdTo || "";

  const data = await getAdminComments({
    page,
    limit: 10,
    search,
    hasReplies,
    createdFrom,
    createdTo,
  });

  return (
    <AdminCommentsClient
      data={data}
      currentPage={page}
      currentSearch={search}
      currentHasReplies={hasReplies}
      currentCreatedFrom={createdFrom}
      currentCreatedTo={createdTo}
    />
  );
}
