"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Eye, MessageSquare, RotateCcw } from "lucide-react";
import {
  archiveAdminInterview,
  restoreAdminInterview,
} from "@/lib/actions/admin.actions";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminSelectFilter from "@/components/admin/AdminSelectFilter";
import AdminStatePanel from "@/components/admin/AdminStatePanel";
import AdminTableContainer from "@/components/admin/AdminTableContainer";

interface AdminInterviewsProps {
  data: any;
  currentPage: number;
  currentSearch: string;
  currentStatus: string;
  currentType: string;
  currentLevel: string;
}

interface InterviewArchiveDialog {
  id: string;
  role: string;
  userName?: string;
  archivedAt?: string | null;
  totalAttempts: number;
}

const statusOptions = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

const typeOptions = [
  { value: "all", label: "All types" },
  { value: "Technical", label: "Technical" },
  { value: "Behavioral", label: "Behavioral" },
  { value: "Mixed", label: "Mixed" },
];

const levelOptions = [
  { value: "all", label: "All levels" },
  { value: "Junior", label: "Junior" },
  { value: "Mid-level", label: "Mid-level" },
  { value: "Senior", label: "Senior" },
];

export default function AdminInterviewsClient({
  data,
  currentPage,
  currentSearch,
  currentStatus,
  currentType,
  currentLevel,
}: AdminInterviewsProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [archiveDialog, setArchiveDialog] =
    useState<InterviewArchiveDialog | null>(null);
  const [archiveUpdatingId, setArchiveUpdatingId] = useState<string | null>(
    null,
  );
  const [noticeDialog, setNoticeDialog] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const buildParams = (overrides?: {
    page?: number;
    search?: string;
    status?: string;
    type?: string;
    level?: string;
  }) => {
    const params = new URLSearchParams();
    const nextSearch = overrides?.search ?? currentSearch;
    const nextStatus = overrides?.status ?? currentStatus;
    const nextType = overrides?.type ?? currentType;
    const nextLevel = overrides?.level ?? currentLevel;
    const nextPage = overrides?.page ?? currentPage;

    if (nextSearch) params.set("search", nextSearch);
    if (nextStatus) params.set("status", nextStatus);
    if (nextType) params.set("type", nextType);
    if (nextLevel) params.set("level", nextLevel);
    params.set("page", String(nextPage));
    return params;
  };

  const handlePageChange = (page: number) => {
    const params = buildParams({ page });
    router.push(`/admin/interviews?${params.toString()}`);
  };

  const handleFilterChange = (
    key: "status" | "type" | "level",
    value: string,
  ) => {
    const params = buildParams({
      [key]: value === "all" ? "" : value,
      page: 1,
    });
    router.push(`/admin/interviews?${params.toString()}`);
  };

  const openArchiveDialog = (interview: any) => {
    setArchiveDialog({
      id: interview.id,
      role: interview.role,
      userName: interview.user?.name,
      archivedAt: interview.archivedAt,
      totalAttempts: interview.totalAttempts || 0,
    });
  };

  const handleConfirmArchiveChange = async () => {
    if (!archiveDialog) return;

    setArchiveUpdatingId(archiveDialog.id);
    try {
      if (archiveDialog.archivedAt) {
        await restoreAdminInterview(archiveDialog.id);
      } else {
        await archiveAdminInterview(archiveDialog.id);
      }
      setArchiveDialog(null);
      router.refresh();
    } catch (error) {
      setNoticeDialog({
        title: archiveDialog.archivedAt
          ? "Restore Interview Failed"
          : "Archive Interview Failed",
        description: getErrorMessage(
          error,
          archiveDialog.archivedAt
            ? "Failed to restore interview"
            : "Failed to archive interview",
        ),
      });
    }
    setArchiveUpdatingId(null);
  };

  if (!data) {
    return (
      <AdminStatePanel
        title="Failed to load interviews"
        description="The interview management table could not be loaded. Please refresh the page or try again later."
        tone="danger"
        className="h-[60vh]"
      />
    );
  }

  const levelColors: Record<string, string> = {
    junior: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    mid: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
    "mid-level": "bg-amber-500/20 text-amber-700 dark:text-amber-400",
    senior: "bg-red-500/20 text-red-700 dark:text-red-400",
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminPageHeader
        eyebrow="Interview operations"
        title="Interview Management"
        description="Inspect generated sessions, attempts, archive status, transcripts, and feedback details."
        icon={MessageSquare}
        metrics={[`${data.total} total interviews`]}
      />

      <AdminFilterBar>
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => {
            const params = buildParams({ search: search.trim(), page: 1 });
            router.push(`/admin/interviews?${params.toString()}`);
          }}
          placeholder="Search by role or user name..."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <AdminSelectFilter
            label="Status"
            value={currentStatus || "all"}
            options={statusOptions}
            onChange={(value) => handleFilterChange("status", value)}
          />
          <AdminSelectFilter
            label="Type"
            value={currentType || "all"}
            options={typeOptions}
            onChange={(value) => handleFilterChange("type", value)}
          />
          <AdminSelectFilter
            label="Level"
            value={currentLevel || "all"}
            options={levelOptions}
            onChange={(value) => handleFilterChange("level", value)}
          />
        </div>
      </AdminFilterBar>

      {/* Table */}
      <AdminTableContainer>
          <table className="w-full min-w-[1120px]">
          <thead>
            <tr className="border-b border-foreground/5">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="text-center px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Level
              </th>
              <th className="text-center px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tech Stack
              </th>
              <th className="text-center px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Attempts
              </th>
              <th className="text-center px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-center px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {data.items?.length ? data.items.map((interview: any) => (
              <tr
                key={interview.id}
                className="hover:bg-foreground/[0.02] transition-colors"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-white capitalize">
                    {interview.role}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-foreground">
                    {interview.user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {interview.user?.email}
                  </p>
                </td>
                <td className="px-5 py-4 text-center">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                      levelColors[interview.level?.toLowerCase()] ||
                      "bg-foreground/10 text-muted-foreground"
                    }`}
                  >
                    {interview.level}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-xs text-muted-foreground bg-foreground/5 px-2 py-1 rounded-md capitalize">
                    {interview.type}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {interview.techstack?.slice(0, 3).map((tech: string) => (
                      <span
                        key={tech}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-primary-200/10 text-primary-200"
                      >
                        {tech}
                      </span>
                    ))}
                    {interview.techstack?.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{interview.techstack.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-center text-sm text-foreground">
                  {interview.totalAttempts}
                </td>
                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      interview.archivedAt
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {interview.archivedAt ? "Archived" : "Active"}
                  </span>
                </td>
                <td className="px-5 py-4 text-center text-xs text-muted-foreground">
                  {new Date(interview.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/interviews/${interview.id}`}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary-200/10 hover:text-primary-200"
                      title="View interview"
                      aria-label="View interview"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => openArchiveDialog(interview)}
                      disabled={archiveUpdatingId === interview.id}
                      className={`rounded-lg p-1.5 transition-colors disabled:opacity-50 ${
                        interview.archivedAt
                          ? "text-emerald-700 dark:text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400"
                          : "text-amber-700 dark:text-amber-400/70 hover:bg-amber-500/10 hover:text-amber-400"
                      }`}
                      title={
                        interview.archivedAt
                          ? "Restore interview"
                          : "Archive interview"
                      }
                      aria-label={
                        interview.archivedAt
                          ? "Restore interview"
                          : "Archive interview"
                      }
                    >
                      {interview.archivedAt ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <Archive className="size-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center">
                  <AdminStatePanel
                    title="No interviews found"
                    description="Try changing the search keyword, status, type, or level filter."
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

      {archiveDialog && (
        <AdminConfirmDialog
          title={
            archiveDialog.archivedAt ? "Restore Interview" : "Archive Interview"
          }
          description={
            archiveDialog.archivedAt
              ? "This interview will be visible to users again in Explore."
              : "This interview will be hidden from Explore and users will not start new attempts from it."
          }
          itemName={archiveDialog.role}
          itemMeta={`${archiveDialog.userName || "Unknown user"} • ${
            archiveDialog.totalAttempts
          } attempt(s)`}
          warning={
            archiveDialog.archivedAt
              ? undefined
              : "Existing attempts, transcripts, and feedback will be kept for history."
          }
          confirmLabel={archiveDialog.archivedAt ? "Restore" : "Archive"}
          variant={archiveDialog.archivedAt ? "success" : "warning"}
          loading={archiveUpdatingId === archiveDialog.id}
          onCancel={() => setArchiveDialog(null)}
          onConfirm={handleConfirmArchiveChange}
        />
      )}

      {noticeDialog && (
        <AdminConfirmDialog
          title={noticeDialog.title}
          description={noticeDialog.description}
          confirmLabel="Got it"
          variant="warning"
          hideCancel
          onCancel={() => setNoticeDialog(null)}
          onConfirm={() => setNoticeDialog(null)}
        />
      )}
    </div>
  );
}
