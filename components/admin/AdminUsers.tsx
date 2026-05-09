"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  User,
  Users,
  Ban,
  CheckCircle2,
  ShieldCheck,
  UserMinus,
} from "lucide-react";
import { updateAdminUser } from "@/lib/actions/admin.actions";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminSelectFilter from "@/components/admin/AdminSelectFilter";
import AdminStatePanel from "@/components/admin/AdminStatePanel";
import AdminTableContainer from "@/components/admin/AdminTableContainer";
import UserAvatar from "@/components/UserAvatar";

interface AdminUsersProps {
  data: any;
  currentPage: number;
  currentSearch: string;
  currentRole: string;
  currentStatus: string;
  currentUserId: string;
}

interface ConfirmState {
  action: "role" | "status";
  userId: string;
  userName: string;
  currentRole?: string;
  newRole?: string;
  currentActive?: boolean;
  newActive?: boolean;
}

const getConfirmDetails = (confirm: ConfirmState) => {
  if (confirm.action === "role") {
    const isPromote = confirm.newRole === "ADMIN";
    return {
      title: isPromote ? "Promote to Admin" : "Demote to User",
      description: `Are you sure you want to ${
        isPromote ? "promote" : "demote"
      } the following user?`,
      itemMeta: `${confirm.currentRole} -> ${confirm.newRole}`,
      warning: isPromote
        ? "Admin users have full access to manage all data in the system."
        : undefined,
      confirmLabel: isPromote ? "Promote" : "Demote",
      variant: isPromote ? "success" : "danger",
    } as const;
  }

  const isReactivate = confirm.newActive === true;
  return {
    title: isReactivate ? "Reactivate Account" : "Deactivate Account",
    description: `Are you sure you want to ${
      isReactivate ? "reactivate" : "deactivate"
    } the following user?`,
    itemMeta: `${confirm.currentActive ? "Active" : "Inactive"} -> ${
      confirm.newActive ? "Active" : "Inactive"
    }`,
    warning: isReactivate
      ? undefined
      : "This user will not be able to sign in or use protected APIs until reactivated.",
    confirmLabel: isReactivate ? "Reactivate" : "Deactivate",
    variant: isReactivate ? "success" : "danger",
  } as const;
};

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];

const statusOptions = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AdminUsersClient({
  data,
  currentPage,
  currentSearch,
  currentRole,
  currentStatus,
  currentUserId,
}: AdminUsersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const buildParams = (overrides?: {
    page?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    const nextSearch = overrides?.search ?? currentSearch;
    const nextRole = overrides?.role ?? currentRole;
    const nextStatus = overrides?.status ?? currentStatus;
    const nextPage = overrides?.page ?? currentPage;

    if (nextSearch) params.set("search", nextSearch);
    if (nextRole) params.set("role", nextRole);
    if (nextStatus) params.set("status", nextStatus);
    params.set("page", String(nextPage));
    return params;
  };

  const handlePageChange = (page: number) => {
    const params = buildParams({ page });
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleFilterChange = (
    key: "role" | "status",
    value: string,
  ) => {
    const params = buildParams({
      [key]: value === "all" ? "" : value,
      page: 1,
    });
    router.push(`/admin/users?${params.toString()}`);
  };

  const openRoleConfirm = (user: any) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setConfirm({
      action: "role",
      userId: user.id,
      userName: user.name,
      currentRole: user.role,
      newRole,
    });
  };

  const openStatusConfirm = (user: any) => {
    setConfirm({
      action: "status",
      userId: user.id,
      userName: user.name,
      currentActive: user.isActive !== false,
      newActive: user.isActive === false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirm) return;

    setUpdating(confirm.userId);
    const payload =
      confirm.action === "role"
        ? { role: confirm.newRole }
        : { isActive: confirm.newActive };

    await updateAdminUser(confirm.userId, payload);
    setUpdating(null);
    setConfirm(null);
    router.refresh();
  };

  if (!data) {
    return (
      <AdminStatePanel
        title="Failed to load users"
        description="The admin users table could not be loaded. Please refresh the page or try again later."
        tone="danger"
        className="h-[60vh]"
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminPageHeader
        eyebrow="Admin user control"
        title="User Management"
        description="Review accounts, roles, activation status, and platform activity from one place."
        icon={Users}
        metrics={[`${data.total} total users`]}
      />

      <AdminFilterBar>
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => {
            const params = buildParams({ search: search.trim(), page: 1 });
            router.push(`/admin/users?${params.toString()}`);
          }}
          placeholder="Search by name or email..."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <AdminSelectFilter
            label="Role"
            value={currentRole || "all"}
            options={roleOptions}
            onChange={(value) => handleFilterChange("role", value)}
          />
          <AdminSelectFilter
            label="Status"
            value={currentStatus || "all"}
            options={statusOptions}
            onChange={(value) => handleFilterChange("status", value)}
          />
        </div>
      </AdminFilterBar>

      <AdminTableContainer>
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-light-400">
                User
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-light-400">
                Provider
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Interviews
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Submissions
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Role
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Status
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Joined
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-light-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.items?.length ? data.items.map((user: any) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={user.name || "User"}
                        avatarUrl={user.avatarUrl}
                        size="sm"
                        className="shrink-0 shadow-none"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {user.name}
                          {isSelf && (
                            <span className="ml-1.5 text-[10px] text-light-600">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-light-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="whitespace-nowrap rounded-md bg-white/5 px-2 py-1 text-xs text-light-400">
                      {user.provider || "LOCAL"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-light-100">
                    {user.totalInterviews}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-light-100">
                    {user.totalSubmissions}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-white/10 text-light-400"
                      }`}
                    >
                      {user.role === "ADMIN" ? (
                        <Shield className="size-3" />
                      ) : (
                        <User className="size-3" />
                      )}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.isActive === false
                          ? "bg-red-500/15 text-red-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {user.isActive === false ? (
                        <Ban className="size-3" />
                      ) : (
                        <CheckCircle2 className="size-3" />
                      )}
                      {user.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-center text-xs text-light-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {isSelf ? (
                      <span className="text-xs italic text-light-600">-</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openStatusConfirm(user)}
                          disabled={updating === user.id}
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                            user.isActive === false
                              ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                              : "border-red-500/20 text-red-400 hover:bg-red-500/10"
                          }`}
                        >
                          {updating === user.id ? (
                            "..."
                          ) : user.isActive === false ? (
                            <>
                              <CheckCircle2 className="size-3.5" />
                              Reactivate
                            </>
                          ) : (
                            <>
                              <Ban className="size-3.5" />
                              Deactivate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openRoleConfirm(user)}
                          disabled={updating === user.id}
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                            user.role === "ADMIN"
                              ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                              : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {updating === user.id ? (
                            "..."
                          ) : user.role === "ADMIN" ? (
                            <>
                              <UserMinus className="size-3.5" />
                              Demote
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="size-3.5" />
                              Promote
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <AdminStatePanel
                    title="No users found"
                    description="Try changing the search keyword, role, or status filter."
                    className="min-h-[180px] border-0 bg-transparent py-6"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminTableContainer>

      <AdminPagination
        currentPage={currentPage}
        totalPages={data.totalPages}
        onPageChange={handlePageChange}
      />

      {confirm && (
        <AdminConfirmDialog
          {...getConfirmDetails(confirm)}
          itemName={confirm.userName}
          loading={updating === confirm.userId}
          onCancel={() => setConfirm(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
