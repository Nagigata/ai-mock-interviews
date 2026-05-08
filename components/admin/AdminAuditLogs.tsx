"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Clock, Database, ScrollText } from "lucide-react";

import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminSelectFilter from "@/components/admin/AdminSelectFilter";
import UserAvatar from "@/components/UserAvatar";

interface AdminAuditLogsProps {
  data: any;
  currentPage: number;
  currentSearch: string;
  currentAction: string;
  currentEntityType: string;
}

const actionOptions = [
  { value: "all", label: "All actions" },
  { value: "UPDATE_USER_ROLE", label: "Update user role" },
  { value: "UPDATE_USER_STATUS", label: "Update user status" },
  { value: "CREATE_SKILL", label: "Create skill" },
  { value: "UPDATE_SKILL", label: "Update skill" },
  { value: "DISABLE_SKILL", label: "Disable skill" },
  { value: "ENABLE_SKILL", label: "Enable skill" },
  { value: "CREATE_CHALLENGE", label: "Create challenge" },
  { value: "UPDATE_CHALLENGE", label: "Update challenge" },
  { value: "DISABLE_CHALLENGE", label: "Disable challenge" },
  { value: "ENABLE_CHALLENGE", label: "Enable challenge" },
  { value: "ARCHIVE_INTERVIEW", label: "Archive interview" },
  { value: "RESTORE_INTERVIEW", label: "Restore interview" },
];

const entityOptions = [
  { value: "all", label: "All entities" },
  { value: "USER", label: "User" },
  { value: "SKILL", label: "Skill" },
  { value: "CHALLENGE", label: "Challenge" },
  { value: "INTERVIEW", label: "Interview" },
];

const actionTone: Record<string, string> = {
  CREATE_SKILL: "bg-emerald-500/15 text-emerald-400",
  CREATE_CHALLENGE: "bg-emerald-500/15 text-emerald-400",
  ENABLE_SKILL: "bg-emerald-500/15 text-emerald-400",
  ENABLE_CHALLENGE: "bg-emerald-500/15 text-emerald-400",
  DISABLE_SKILL: "bg-red-500/15 text-red-400",
  DISABLE_CHALLENGE: "bg-red-500/15 text-red-400",
  ARCHIVE_INTERVIEW: "bg-amber-500/15 text-amber-400",
  RESTORE_INTERVIEW: "bg-cyan-500/15 text-cyan-300",
};

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminAuditLogsClient({
  data,
  currentPage,
  currentSearch,
  currentAction,
  currentEntityType,
}: AdminAuditLogsProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);

  const buildParams = (overrides?: {
    page?: number;
    search?: string;
    action?: string;
    entityType?: string;
  }) => {
    const params = new URLSearchParams();
    const nextSearch = overrides?.search ?? currentSearch;
    const nextAction = overrides?.action ?? currentAction;
    const nextEntityType = overrides?.entityType ?? currentEntityType;
    const nextPage = overrides?.page ?? currentPage;

    if (nextSearch) params.set("search", nextSearch);
    if (nextAction) params.set("action", nextAction);
    if (nextEntityType) params.set("entityType", nextEntityType);
    params.set("page", String(nextPage));
    return params;
  };

  const handlePageChange = (page: number) => {
    router.push(`/admin/audit-logs?${buildParams({ page }).toString()}`);
  };

  const handleFilterChange = (key: "action" | "entityType", value: string) => {
    const params = buildParams({
      [key]: value === "all" ? "" : value,
      page: 1,
    });
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  if (!data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-light-400">Failed to load audit logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminPageHeader
        eyebrow="Audit trail"
        title="Admin Audit Logs"
        description="Review who changed what, when it happened, and which entity was affected."
        icon={ScrollText}
        metrics={[`${data.total} tracked admin actions`]}
      />

      <AdminFilterBar>
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => {
            const params = buildParams({ search: search.trim(), page: 1 });
            router.push(`/admin/audit-logs?${params.toString()}`);
          }}
          placeholder="Search by admin, entity, or action..."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <AdminSelectFilter
            label="Action"
            value={currentAction || "all"}
            options={actionOptions}
            onChange={(value) => handleFilterChange("action", value)}
          />
          <AdminSelectFilter
            label="Entity"
            value={currentEntityType || "all"}
            options={entityOptions}
            onChange={(value) => handleFilterChange("entityType", value)}
          />
        </div>
      </AdminFilterBar>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-dark-200/50">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-white/5">
              {["Admin", "Action", "Entity", "Metadata", "Context", "Time"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-primary-200"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {data.items?.length ? (
              data.items.map((log: any) => (
                <tr
                  key={log.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={log.admin?.name || "Admin"}
                        avatarUrl={log.admin?.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {log.admin?.name || "Unknown admin"}
                        </p>
                        <p className="truncate text-xs text-light-400">
                          {log.admin?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        actionTone[log.action] ||
                        "bg-primary-200/15 text-primary-200"
                      }`}
                    >
                      {formatLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-light-100">
                      <Database className="size-4 text-light-500" />
                      <div>
                        <p className="font-semibold">{log.entityType}</p>
                        <p className="max-w-[220px] truncate text-xs text-light-400">
                          {log.entityName || log.entityId || "Unknown entity"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {log.metadata ? (
                      <pre className="max-h-28 max-w-[320px] overflow-auto rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-light-300">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-sm text-light-500">No metadata</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1 text-xs text-light-400">
                      <div className="flex items-center gap-2">
                        <Activity className="size-3.5" />
                        <span>{log.ipAddress || "No IP"}</span>
                      </div>
                      <p className="max-w-[240px] truncate">
                        {log.userAgent || "No user agent"}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-light-300">
                      <Clock className="size-4 text-light-500" />
                      {formatDateTime(log.createdAt)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-light-400">
                  No audit logs match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={data.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
