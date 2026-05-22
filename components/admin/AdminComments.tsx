"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, MessagesSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type {
  AdminCommentDetail,
  AdminCommentItem,
  AdminCommentsResponse,
} from "@/types";
import {
  deleteAdminComment,
  getAdminCommentDetail,
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
import AdminCommentPreviewModal from "@/components/admin/AdminCommentPreviewModal";
import UserAvatar from "@/components/UserAvatar";

interface AdminCommentsProps {
  data: AdminCommentsResponse | null;
  currentPage: number;
  currentSearch: string;
  currentHasReplies: string;
  currentCreatedFrom: string;
  currentCreatedTo: string;
}

interface DeleteConfirmState {
  id: string;
  content: string;
  solutionTitle: string;
}

const replyOptions = [
  { value: "all", label: "All comments" },
  { value: "true", label: "Has replies" },
  { value: "false", label: "No replies" },
];

const truncate = (value: string, max = 120) =>
  value.length > max ? `${value.slice(0, max)}...` : value;

export default function AdminCommentsClient({
  data,
  currentPage,
  currentSearch,
  currentHasReplies,
  currentCreatedFrom,
  currentCreatedTo,
}: AdminCommentsProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminCommentDetail | null>(null);
  const [confirm, setConfirm] = useState<DeleteConfirmState | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const buildParams = (overrides?: {
    page?: number;
    search?: string;
    hasReplies?: string;
    createdFrom?: string;
    createdTo?: string;
  }) => {
    const params = new URLSearchParams();
    const nextSearch = overrides?.search ?? currentSearch;
    const nextHasReplies = overrides?.hasReplies ?? currentHasReplies;
    const nextFrom = overrides?.createdFrom ?? currentCreatedFrom;
    const nextTo = overrides?.createdTo ?? currentCreatedTo;
    const nextPage = overrides?.page ?? currentPage;

    if (nextSearch) params.set("search", nextSearch);
    if (nextHasReplies) params.set("hasReplies", nextHasReplies);
    if (nextFrom) params.set("createdFrom", nextFrom);
    if (nextTo) params.set("createdTo", nextTo);
    params.set("page", String(nextPage));
    return params;
  };

  const handlePageChange = (page: number) => {
    const params = buildParams({ page });
    router.push(`/admin/comments?${params.toString()}`);
  };

  const handleHasRepliesChange = (value: string) => {
    const params = buildParams({
      hasReplies: value === "all" ? "" : value,
      page: 1,
    });
    router.push(`/admin/comments?${params.toString()}`);
  };

  const handleDateChange = (
    key: "createdFrom" | "createdTo",
    value: string,
  ) => {
    const params = buildParams({ [key]: value, page: 1 });
    router.push(`/admin/comments?${params.toString()}`);
  };

  const handleOpenPreview = async (comment: AdminCommentItem) => {
    setPreviewLoadingId(comment.id);
    const detail = await getAdminCommentDetail(comment.id);
    setPreviewLoadingId(null);
    if (detail) {
      setPreview(detail);
    }
  };

  const handleOpenConfirm = (comment: AdminCommentItem) => {
    setConfirm({
      id: comment.id,
      content: comment.content,
      solutionTitle: comment.solution.title,
    });
    setDeleteReason("");
  };

  const handleConfirmDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await deleteAdminComment(confirm.id, {
        reason: deleteReason.trim() || undefined,
      });
      setConfirm(null);
      setDeleteReason("");
      router.refresh();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not delete comment. Please try again."),
      );
    }
    setDeleting(false);
  };

  if (!data) {
    return (
      <AdminStatePanel
        title="Failed to load comments"
        description="The admin comments table could not be loaded. Please refresh the page or try again later."
        tone="danger"
        className="h-[60vh]"
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminPageHeader
        eyebrow="Content moderation"
        title="Comment Management"
        description="Review and remove comments across all solution discussions."
        icon={MessagesSquare}
        metrics={[`${data.total} total comments`]}
      />

      <AdminFilterBar>
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          onSubmit={() => {
            const params = buildParams({ search: search.trim(), page: 1 });
            router.push(`/admin/comments?${params.toString()}`);
          }}
          placeholder="Search by content, author, or solution..."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <AdminSelectFilter
            label="Replies"
            value={currentHasReplies || "all"}
            options={replyOptions}
            onChange={handleHasRepliesChange}
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
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-light-400">
                Content
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-light-400">
                Author
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-light-400">
                Solution
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Replies
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-light-400">
                Upvotes
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
              data.items.map((comment) => (
                <tr
                  key={comment.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <p className="max-w-[360px] truncate text-sm text-light-100">
                      {truncate(comment.content)}
                    </p>
                    {comment.parentId && (
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-light-500">
                        Reply
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={comment.author.name || "User"}
                        avatarUrl={comment.author.avatarUrl}
                        size="sm"
                        className="shrink-0 shadow-none"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">
                          {comment.author.name}
                        </p>
                        {comment.author.email && (
                          <p className="truncate text-[11px] text-light-500">
                            {comment.author.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="max-w-[200px] truncate text-sm text-light-100">
                      {comment.solution.title}
                    </p>
                    <p className="text-[11px] text-light-500">
                      {comment.solution.challenge.title}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-light-100">
                    {comment.replyCount}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-light-100">
                    {comment.upvoteCount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-center text-xs text-light-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(comment)}
                        disabled={previewLoadingId === comment.id}
                        className="rounded-lg p-1.5 text-light-400 transition-colors hover:bg-primary-200/10 hover:text-primary-200 disabled:opacity-50"
                        title="View comment"
                        aria-label="View comment"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenConfirm(comment)}
                        className="rounded-lg p-1.5 text-red-400/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete comment"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <AdminStatePanel
                    title="No comments found"
                    description="Try changing the search keyword, replies filter, or date range."
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
        <AdminCommentPreviewModal
          comment={preview}
          onClose={() => setPreview(null)}
        />
      )}

      {confirm && (
        <AdminConfirmDialog
          title="Delete Comment"
          description="This comment will be soft deleted and shown as deleted in the solution discussion."
          itemName={truncate(confirm.content, 80)}
          itemMeta={confirm.solutionTitle}
          warning="Replies will remain attached to the thread."
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
