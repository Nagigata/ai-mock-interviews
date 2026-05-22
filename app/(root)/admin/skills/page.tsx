import type { Metadata } from "next";

import { getAdminSkills } from "@/lib/actions/admin.actions";
import AdminSkillsClient from "@/components/admin/AdminSkills";

export const metadata: Metadata = {
  title: "Admin skills",
};

export default async function AdminSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "";
  const skills = await getAdminSkills({ status });
  return <AdminSkillsClient skills={skills} currentStatus={status} />;
}
