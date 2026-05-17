"use client";

import { useEffect, useState, useTransition } from "react";
import {
  CalendarClock,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getChallengeSubmissionHistory,
  getSubmissionDetail,
  updateSubmissionNote,
} from "@/lib/actions/submissions.action";
import {
  ChallengeSubmissionDetail,
  ChallengeSubmissionHistoryItem,
} from "@/types";
import { Button } from "@/components/ui/button";
import SelectFilter from "@/components/filters/SelectFilter";
import { cn } from "@/lib/utils";

interface ChallengeSubmissionHistoryProps {
  challengeId: string;
  selectedSubmissionId?: string | null;
  onSelectSubmission?: (submission: ChallengeSubmissionDetail) => void;
}

const PAGE_SIZE = 5;

const noteColors = [
  { value: "gray", className: "border-light-300 bg-light-300" },
  { value: "yellow", className: "border-yellow-400 bg-yellow-400" },
  { value: "blue", className: "border-sky-400 bg-sky-400" },
  { value: "green", className: "border-emerald-400 bg-emerald-400" },
  { value: "pink", className: "border-pink-400 bg-pink-400" },
  { value: "purple", className: "border-purple-400 bg-purple-400" },
] as const;

type NoteColor = (typeof noteColors)[number]["value"];

const getNoteColorClass = (color?: string | null) =>
  noteColors.find((item) => item.value === color)?.className ||
  noteColors.find((item) => item.value === "gray")?.className;

const formatSubmittedAt = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatMemory = (memory?: number | null) => {
  if (!memory) return "--";
  if (memory >= 1024) return `${(memory / 1024).toFixed(1)} MB`;
  return `${memory} KB`;
};

const ChallengeSubmissionHistory = ({
  challengeId,
  selectedSubmissionId,
  onSelectSubmission,
}: ChallengeSubmissionHistoryProps) => {
  const [items, setItems] = useState<ChallengeSubmissionHistoryItem[]>([]);
  const [requestedPage, setRequestedPage] = useState(1);
  const [loadedPage, setLoadedPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [languageOptions, setLanguageOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingSubmission, setEditingSubmission] =
    useState<ChallengeSubmissionHistoryItem | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [draftNoteColor, setDraftNoteColor] = useState<NoteColor>("gray");
  const [loadingSubmissionId, setLoadingSubmissionId] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    startTransition(async () => {
      const result = await getChallengeSubmissionHistory(challengeId, {
        page: requestedPage,
        limit: PAGE_SIZE,
        status: statusFilter,
        language: languageFilter,
      });

      if (cancelled) return;

      if (result.success && result.data) {
        setItems((currentItems) =>
          requestedPage === 1
            ? result.data.items
            : [...currentItems, ...result.data.items],
        );
        setLoadedPage(requestedPage);
        setTotalPages(result.data.totalPages);
        setStatusOptions(result.data.filters?.statuses || []);
        setLanguageOptions(result.data.filters?.languages || []);
        setError(null);
        return;
      }

      setError(result.error || "Could not load submission history.");
    });

    return () => {
      cancelled = true;
    };
  }, [challengeId, languageFilter, requestedPage, statusFilter]);

  const updateStatusFilter = (value: string) => {
    setStatusFilter(value);
    setRequestedPage(1);
    setLoadedPage(1);
  };

  const updateLanguageFilter = (value: string) => {
    setLanguageFilter(value);
    setRequestedPage(1);
    setLoadedPage(1);
  };

  const canLoadMore = loadedPage < totalPages;

  const statusFilterOptions = [
    { value: "all", label: "Status" },
    ...statusOptions.map((status) => ({
      value: status,
      label: status,
    })),
  ];

  const languageFilterOptions = [
    { value: "all", label: "Languages" },
    ...languageOptions.map((language) => ({
      value: language,
      label: language,
    })),
  ];

  const beginEditing = (submission: ChallengeSubmissionHistoryItem) => {
    setEditingSubmission(submission);
    setDraftNote(submission.note || "");
    setDraftNoteColor((submission.noteColor as NoteColor) || "gray");
  };

  const selectSubmission = async (submissionId: string) => {
    if (!onSelectSubmission) return;

    setLoadingSubmissionId(submissionId);
    const result = await getSubmissionDetail(submissionId);
    setLoadingSubmissionId(null);

    if (!result.success || !result.data) {
      toast.error(result.error || "Could not load submission detail.");
      return;
    }

    onSelectSubmission(result.data);
  };

  const cancelEditing = () => {
    setEditingSubmission(null);
    setDraftNote("");
    setDraftNoteColor("gray");
  };

  const saveNote = () => {
    if (!editingSubmission) return;

    startTransition(async () => {
      const result = await updateSubmissionNote(
        editingSubmission.id,
        draftNote,
        draftNoteColor,
      );

      if (!result.success || !result.data) {
        toast.error(result.error || "Could not update note.");
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingSubmission.id
            ? {
                ...item,
                note: result.data?.note ?? null,
                noteColor: result.data?.noteColor ?? null,
              }
            : item,
        ),
      );
      setEditingSubmission(null);
      setDraftNote("");
      setDraftNoteColor("gray");
      toast.success(result.data.note ? "Note saved." : "Note cleared.");
    });
  };

  return (
    <section className="h-full bg-dark-200/20">
      <div className="overflow-x-auto">
        {isPending && !items.length ? (
          <div className="flex items-center gap-3 px-4 py-6 text-sm text-light-400">
            <div className="size-3 rounded-full border-2 border-primary-200/30 border-t-primary-200 animate-spin" />
            Loading submission history...
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-300">{error}</div>
        ) : items.length ? (
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-light-500">
                <th className="w-10 px-4 py-3">#</th>
                <th className="px-4 py-3">
                  <SelectFilter
                    label="Filter submissions by status"
                    hideLabel
                    value={statusFilter}
                    options={statusFilterOptions}
                    onChange={updateStatusFilter}
                    className="min-w-0"
                    triggerClassName="h-auto gap-1 rounded-md border-transparent px-0 py-0 text-[10px] font-bold uppercase tracking-widest text-light-500 [background:transparent] hover:border-transparent hover:bg-transparent hover:text-light-200 data-[state=open]:border-transparent focus:border-transparent"
                  />
                </th>
                <th className="px-4 py-3">
                  <SelectFilter
                    label="Filter submissions by language"
                    hideLabel
                    value={languageFilter}
                    options={languageFilterOptions}
                    onChange={updateLanguageFilter}
                    className="min-w-0"
                    triggerClassName="h-auto gap-1 rounded-md border-transparent px-0 py-0 text-[10px] font-bold uppercase tracking-widest text-light-500 [background:transparent] hover:border-transparent hover:bg-transparent hover:text-light-200 data-[state=open]:border-transparent focus:border-transparent"
                  />
                </th>
                <th className="px-4 py-3">Runtime</th>
                <th className="px-4 py-3">Memory</th>
                <th className="min-w-[280px] px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((submission, index) => (
                  <tr
                    key={submission.id}
                    onClick={() => selectSubmission(submission.id)}
                    className={cn(
                      "cursor-pointer border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.03]",
                      selectedSubmissionId === submission.id &&
                        "bg-primary-200/5",
                    )}
                  >
                    <td className="px-4 py-4 align-top text-xs font-medium text-light-500">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={cn(
                          "block text-xs font-bold",
                          submission.status === "ACCEPTED"
                            ? "text-emerald-300"
                            : submission.status === "REJECTED"
                              ? "text-red-300"
                              : "text-amber-300",
                        )}
                      >
                        {submission.status}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[11px] text-light-500">
                        <CalendarClock className="size-3 text-light-600" />
                        {formatSubmittedAt(submission.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-lg border border-white/5 bg-dark-200 px-2.5 py-1 text-xs font-bold capitalize text-light-100">
                        {submission.language}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-light-300">
                      {submission.runtime ? `${submission.runtime} ms` : "--"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-light-300">
                      {formatMemory(submission.memory)}
                    </td>
                    <td className="px-4 py-4">
                      {submission.note ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            beginEditing(submission);
                          }}
                          className="flex w-full items-start gap-2 text-left text-xs leading-relaxed text-light-300 transition-colors hover:text-light-100 focus:outline-none"
                        >
                          <span className="line-clamp-3 flex-1">
                            {submission.note}
                          </span>
                          <span
                            className={cn(
                              "mt-1.5 size-2 shrink-0 rounded-full border",
                              getNoteColorClass(submission.noteColor),
                            )}
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            beginEditing(submission);
                          }}
                          className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-semibold text-light-500 transition-colors hover:border-primary-200/30 hover:bg-primary-200/5 hover:text-primary-200"
                        >
                          + Add note
                        </button>
                      )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-8 text-sm text-light-500">
            No submissions yet. Submit a solution and your history will appear here.
          </div>
        )}
      </div>

      {items.length > 0 && canLoadMore && (
        <div className="border-t border-white/5 px-4 py-4 text-center">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setRequestedPage((currentPage) => currentPage + 1)}
            className="h-9 border-white/10 bg-dark-200 px-5 text-xs font-semibold text-light-100 hover:bg-dark-100"
          >
            {isPending ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}

      {editingSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#1c1f26] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={cancelEditing}
              className="absolute right-4 top-4 text-light-400 transition-colors hover:text-white"
              aria-label="Close note editor"
            >
              <X className="size-5" />
            </button>

            <div className="mb-5 pr-8">
              <h3 className="text-lg font-semibold text-white">
                Submission note
              </h3>
              <p className="mt-1 text-xs text-light-500">
                {formatSubmittedAt(editingSubmission.createdAt)} •{" "}
                {editingSubmission.language} • {editingSubmission.status}
              </p>
            </div>

            <textarea
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              placeholder="What did you learn from this submission?"
              maxLength={1000}
              autoFocus
              className="min-h-44 w-full resize-none rounded-xl border border-white/10 bg-dark-200 px-4 py-3 text-sm leading-relaxed text-light-100 outline-none transition-colors placeholder:text-light-600 focus:border-primary-200/50"
            />

            <div className="mt-2 text-right text-[11px] text-light-600">
              {draftNote.length}/1000
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {noteColors.map((color) => {
                  const isSelected = draftNoteColor === color.value;

                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setDraftNoteColor(color.value)}
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-200/40",
                        color.className,
                        isSelected ? "ring-2 ring-white/70" : "bg-transparent",
                      )}
                      aria-label={`Use ${color.value} note color`}
                    >
                      {isSelected && (
                        <span className="size-2 rounded-full bg-dark-100" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={cancelEditing}
                className="border-white/10 bg-transparent text-light-300 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={saveNote}
                className="bg-primary-200 text-dark-100 hover:bg-primary-200/80"
              >
                <Save className="size-4" />
                {isPending ? "Saving..." : "Save note"}
              </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loadingSubmissionId && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[120] rounded-xl border border-white/10 bg-[#1c1f26] px-4 py-3 text-xs font-semibold text-light-100 shadow-2xl">
          Loading submission detail...
        </div>
      )}
    </section>
  );
};

export default ChallengeSubmissionHistory;
