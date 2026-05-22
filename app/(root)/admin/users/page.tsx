import type { Metadata } from "next";

import { getAdminUsers } from "@/lib/actions/admin.actions";
import { getMyProfile } from "@/lib/actions/user.actions";
import AdminUsersClient from "@/components/admin/AdminUsers";

export const metadata: Metadata = {
  title: "Admin users",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || "";
  const role = params.role || "";
  const status = params.status || "";
  const [data, profile] = await Promise.all([
    getAdminUsers({ page, limit: 10, search, role, status }),
    getMyProfile(),
  ]);

  return (
    <AdminUsersClient
      data={data}
      currentPage={page}
      currentSearch={search}
      currentRole={role}
      currentStatus={status}
      currentUserId={profile?.id || ""}
    />
  );
}
