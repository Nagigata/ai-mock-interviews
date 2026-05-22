"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileCode2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type {
  AdminSolutionDetail,
  AdminSolutionItem,
  AdminSolutionsResponse,
} from "@/types";
import {
  deleteAdminSolution,
  getAdminSolutionDetail,
} from "@/lib/actions/admin.actions";
import { getErrorMessage } from "@/lib/errors";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import AdminSelectFilter from "@/components/admin/AdminSelectFilter";
import AdminStatePanel from "@/components/admin/AdminStatePanel";
import AdminTableContainer from "@/components/admin/AdminTableContainer";
import AdminSolutionPreviewModal from "@/components/admin/AdminSolutionPreviewModal";
import UserAvatar from "@/components/UserAvatar";

interface AdminSolutionsProps {
  data: AdminSolutionsResponse | null;
  challenges: Array<{ id: string; title: string }>;
  currentPage: number;
  currentSearch: string;
  currentLanguage: string;
  currentChallengeId: string;
  currentCreatedFrom: string;
  currentCreatedTo: string;
}

interface DeleteConfirmState {
  id: string;
  title: string;
  language: string;
  commentCount: number;
}

const languageOptions = [
  { value: "all", label: "All languages" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "ruby", label: "Ruby" },
  { value: "rust", label: "Rust" },
];

export default function AdminSolutionsClient({
  data,
  challenges,
  currentPage,
  currentSearch,
  currentLanguage,
  currentChallengeId,
  currentCreatedFrom,
  currentCreatedTo,
}: AdminSolutionsProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminSolutionDetail | null>(null);
  const [confirm, setConfirm] = useState<DeleteConfirmState | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const challengeOptions = [
    { value: "all", label: "All challenges" },
    ...challenges.map((challenge) => ({
      value: challenge.id,
      label: challenge.title,
    })),
  ];

  const buildParams = (overrides?: {
    page?: number;
    search?: string;
    language?: string;
    challengeId?: string;
    createdFrom?: string;
    createdTo?: string;
  }) => {
    const params = new URLSearchParams();
    const nextSearch = overrides?.search ?? currentSearch;
    const nextLanguage = overrides?.language ?? currentLanguage;
    const nextChallengeId = overrides?.challengeId ?? currentChallengeId;
    const nextFrom = overrides?.createdFrom ?? currentCreatedFrom;
    const nextTo = overrides?.createdTo ?? currentCreatedTo;
    const nextPage = overrides?.page ?? currentPage;

    if (nextSearch) params.set("search", nextSearch);
    if (nextLanguage) params.set("language", nextLanguage);
    if (nextChallengeId) params.set("challengeId", nextChallengeId);
    if (nextFrom) params.set("createdFrom", nextFrom);
    if (nextTo) params.set("createdTo", nextTo);
    params.set("page", String(nextPage));
    return params;
  };

  const handlePageChange = (page: number) => {
    const params = buildParams({ page });
    router.push(`/admin/solutions?${params.toString()}`);
  };

  const handleFilterChange = (
    key: "language" | "challengeId",
    value: string,
  ) => {
    const params = buildParams({
      [key]: value === "all" ? "" : value,
      page: 1,
    });
    router.push(`/admin/solutions?${params.toString()}`);
  };

  const handleDateChange = (
    key: "createdFrom" | "createdTo",
    value: string,
  ) => {
    const params = buildParams({ [key]: value, page: 1 });
    router.push(`/admin/solutions?${params.toString()}`);
  };

  const handleOpenPreview = async (solution: AdminSolutionItem) => {
    setPreviewLoadingId(solution.id);
    const detail = await getAdminSolutionDetail(solution.id);
    setPreviewLoadingId(null);
    if (detail) {
      setPreview(detail);
    }
  };

  const handleOpenConfirm = (solution: AdminSolutionItem) => {
    setConfirm({
      id: solution.id,
      title: solution.title,
      language: solution.language,
      commentCount: solution.commentCount,
    });
    setDeleteReason("");
  };

  const handleConfirmDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await deleteAdminSolution(confirm.id, {
        reason: deleteReason.trim() || undefined,
      });
      setConfirm(null);
      setDeleteReason("");
      router.refresh();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not delete solution. Please try again."),
      );
    }
    setDeleting(false);
  };

  if (!data) {
    return (
      <AdminStatePanel
        title="Failed to load solutions"
        description="The admin solutions table could not be loaded. Please refresh the page or try again later."
        tone="danger"
        className="h-[60vh]"
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminPageHeader
        eyebrow="Content moderation"
        title="Solution Management"
        description="Review, preview, and remove user-shared solutions across all challenges."
        icon={FileCode2}
        metrics={[`${data.total} total solutions`]}
      />

      <AdminFilterBar>
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => {
            const params = buildParams({ search: search.trim(), page: 1 });
            router.push(`/admin/solutions?${params.toString()}`);
          }}
          placeholder="Search by title, author, or challenge..."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminSelectFilter
            label="Language"
            value={currentLanguage || "all"}
            options={languageOptions}
            onChange={(value) => handleFilterChange("language", value)}
          />
          <AdminSelectFilter
            label="Challenge"
            value={currentChallengeId || "all"}
            options={challengeOptions}
            onChange={(value) => handleFilterChange("challengeId", value)}
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-light-500">
              Created from
            </span>
            <input
              type="date"
              value={currentCreatedFrom}
              onChange={(event) =>
                handleDateChange("createdFrom", event.target.value)
              }
              className="rounded-lg border border-white/10 bg-dark-100 px-3 py-2 text-sm text-white focus:border-primary-200/50 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-light-500">
              Created to
            </span>
            <input
              type="date"
              value={currentCreatedTo}
              onChange={(event) =>
                handleDateChange("createdTo", event.target.value)
              }
              className="rounded-lg border border-white/10 bg-dark-100 px-3 py-2 text-sm text-white focus:border-primary-200/50 focus:outline-none"
            />
          </label>
        </div>
      </AdminFilterBar>

      <AdminTableContainer>
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-light-400">
                Title
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-light-400">
                Author
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-light-400">
                Challenge
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Language
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Upvotes
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Comments
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Views
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Created
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-light-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.items.length ? (
              data.items.map((solution) => (
                <tr
                  key={solution.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <p className="max-w-[280px] truncate text-sm font-medium text-white">
                      {solution.title}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={solution.author.name || "User"}
                        avatarUrl={solution.author.avatarUrl}
                        size="sm"
                        className="shrink-0 shadow-none"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">
                          {solution.author.name}
                        </p>
                        {solution.author.email && (
                          <p className="truncate text-[11px] text-light-500">
                            {solution.author.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="max-w-[180px] truncate text-sm text-light-100">
                      {solution.challenge.title}
                    </p>
                    {solution.challenge.skill?.name && (
                      <p className="text-[11px] text-light-500">
                        {solution.challenge.skill.name}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="whitespace-nowrap rounded-md bg-white/5 px-2 py-1 text-xs text-light-400">
                      {solution.language}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-light-100">
                    {solution.upvoteCount}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-light-100">
                    {solution.commentCount}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-light-100">
                    {solution.viewCount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-center text-xs text-light-400">
                    {new Date(solution.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(solution)}
                        disabled={previewLoadingId === solution.id}
                        className="rounded-lg p-1.5 text-light-400 transition-colors hover:bg-primary-200/10 hover:text-primary-200 disabled:opacity-50"
                        title="View solution"
                        aria-label="View solution"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenConfirm(solution)}
                        className="rounded-lg p-1.5 text-red-400/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete solution"
                        aria-label="Delete solution"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center">
                  <AdminStatePanel
                    title="No solutions found"
                    description="Try changing the search keyword, language, challenge, or date filter."
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

      {preview && (
        <AdminSolutionPreviewModal
          solution={preview}
          onClose={() => setPreview(null)}
        />
      )}

      {confirm && (
        <AdminConfirmDialog
          title="Delete Solution"
          description="This solution will be hidden from users, but its audit snapshot will be kept."
          itemName={confirm.title}
          itemMeta={`${confirm.language} • ${confirm.commentCount} comment(s)`}
          warning="The original author will no longer see this solution in public lists."
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
          reasonValue={deleteReason}
          onReasonChange={setDeleteReason}
          onCancel={() => {
            setConfirm(null);
            setDeleteReason("");
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
