"use client";

import { useEffect, useId, useState } from "react";
import { BellPlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { sendUserSystemNotification } from "@/lib/actions/admin.actions";

interface AdminNotifyUserDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onClose: () => void;
  onSent?: () => void;
}

const TITLE_MAX = 200;
const MESSAGE_MAX = 1000;
const ACTION_URL_MAX = 500;

export default function AdminNotifyUserDialog({
  user,
  onClose,
  onSent,
}: AdminNotifyUserDialogProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [submitting, onClose]);

  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();
  const trimmedActionUrl = actionUrl.trim();
  const canSubmit =
    trimmedTitle.length > 0 &&
    trimmedMessage.length > 0 &&
    trimmedTitle.length <= TITLE_MAX &&
    trimmedMessage.length <= MESSAGE_MAX &&
    trimmedActionUrl.length <= ACTION_URL_MAX;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await sendUserSystemNotification(user.id, {
        title: trimmedTitle,
        message: trimmedMessage,
        actionUrl: trimmedActionUrl || undefined,
      });
      toast.success(`Notification sent to ${user.name}`);
      onSent?.();
      onClose();
    } catch (error) {
      const description =
        error instanceof Error ? error.message : "Please try again later.";
      toast.error("Failed to send notification", { description });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full max-w-lg rounded-2xl border border-foreground/10 bg-muted p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          disabled={submitting}
          aria-label="Close dialog"
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-white disabled:opacity-50"
        >
          <X className="size-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-primary-200/15 p-2.5 text-primary-200">
            <BellPlus className="size-5" />
          </div>
          <h3 id={titleId} className="text-lg font-semibold text-white">
            Send system notification
          </h3>
        </div>

        <p id={descId} className="mb-1 text-sm text-foreground">
          This notification will be delivered directly to the user&apos;s inbox
          and bypass their notification preferences.
        </p>

        <div className="my-4 rounded-xl bg-foreground/5 px-4 py-3">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>
                Title <span className="text-red-700 dark:text-red-400">*</span>
              </span>
              <span
                className={
                  title.length > TITLE_MAX
                    ? "text-red-700 dark:text-red-400"
                    : "text-muted-foreground"
                }
              >
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={submitting}
              maxLength={TITLE_MAX}
              placeholder="e.g. Scheduled maintenance tonight"
              className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm text-white focus:border-primary-200/50 focus:outline-none disabled:opacity-50"
            />
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>
                Message <span className="text-red-700 dark:text-red-400">*</span>
              </span>
              <span
                className={
                  message.length > MESSAGE_MAX
                    ? "text-red-700 dark:text-red-400"
                    : "text-muted-foreground"
                }
              >
                {message.length}/{MESSAGE_MAX}
              </span>
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={submitting}
              rows={4}
              maxLength={MESSAGE_MAX}
              placeholder="Explain the reason or context. This is what the user will see."
              className="w-full resize-none rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm text-white focus:border-primary-200/50 focus:outline-none disabled:opacity-50"
            />
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Action URL (optional)</span>
              <span
                className={
                  actionUrl.length > ACTION_URL_MAX
                    ? "text-red-700 dark:text-red-400"
                    : "text-muted-foreground"
                }
              >
                {actionUrl.length}/{ACTION_URL_MAX}
              </span>
            </div>
            <input
              type="text"
              value={actionUrl}
              onChange={(event) => setActionUrl(event.target.value)}
              disabled={submitting}
              maxLength={ACTION_URL_MAX}
              placeholder="/preparation or https://..."
              className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm text-white  focus:border-primary-200/50 focus:outline-none disabled:opacity-50"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              When clicked, the notification will route the user to this URL.
            </p>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-foreground/10 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-200 px-4 py-2 text-sm font-medium text-dark-100 transition-colors hover:bg-primary-200/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <BellPlus className="size-4" />
                Send notification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
