import { getAdminAuditLogs } from "@/lib/actions/admin.actions";
import AdminAuditLogsClient from "@/components/admin/AdminAuditLogs";

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    action?: string;
    entityType?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || "";
  const action = params.action || "";
  const entityType = params.entityType || "";
  const data = await getAdminAuditLogs({
    page,
    limit: 5,
    search,
    action,
    entityType,
  });

  return (
    <AdminAuditLogsClient
      data={data}
      currentPage={page}
      currentSearch={search}
      currentAction={action}
      currentEntityType={entityType}
    />
  );
}
