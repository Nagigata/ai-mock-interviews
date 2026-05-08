import { getAdminDashboard, getAdminStats } from "@/lib/actions/admin.actions";
import AdminDashboardClient from "@/components/admin/AdminDashboard";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = params.range || "6m";

  const [dashboard, stats] = await Promise.all([
    getAdminDashboard({ range }),
    getAdminStats({ range }),
  ]);

  return (
    <AdminDashboardClient
      dashboard={dashboard}
      stats={stats}
      currentRange={range}
    />
  );
}
