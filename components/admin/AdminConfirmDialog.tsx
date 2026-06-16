"use client";

import { useEffect, useId } from "react";
import { AlertTriangle, X } from "lucide-react";

interface AdminConfirmDialogProps {
  title: string;
  description: string;
  itemName?: string;
  itemMeta?: string;
  warning?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "success" | "warning";
  loading?: boolean;
  hideCancel?: boolean;
  reasonValue?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onReasonChange?: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const variantStyles = {
  danger: {
    icon: "bg-red-500/15 text-red-700 dark:text-red-400",
    button: "bg-red-500 text-white hover:bg-red-600",
    warning: "text-red-700 dark:text-red-400/80",
  },
  success: {
    icon: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    button: "bg-emerald-500 text-white hover:bg-emerald-600",
    warning: "text-emerald-700 dark:text-emerald-400/80",
  },
  warning: {
    icon: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    button: "bg-amber-500 text-white hover:bg-amber-600",
    warning: "text-amber-700 dark:text-amber-400/80",
  },
};

export default function AdminConfirmDialog({
  title,
  description,
  itemName,
  itemMeta,
  warning,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  hideCancel = false,
  reasonValue,
  reasonLabel = "Reason",
  reasonPlaceholder = "Optional moderation note...",
  onReasonChange,
  onCancel,
  onConfirm,
}: AdminConfirmDialogProps) {
  const styles = variantStyles[variant];
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, onCancel]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full max-w-md rounded-2xl border border-foreground/10 bg-muted p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={onCancel}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-white disabled:opacity-50"
        >
          <X className="size-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${styles.icon}`}>
            <AlertTriangle className="size-5" />
          </div>
          <h3 id={titleId} className="text-lg font-semibold text-white">{title}</h3>
        </div>

        <p id={descId} className="mb-1 text-sm text-foreground">{description}</p>

        {itemName && (
          <div className="my-4 rounded-xl bg-foreground/5 px-4 py-3">
            <p className="text-sm font-medium text-white">{itemName}</p>
            {itemMeta && (
              <p className="mt-0.5 text-xs text-muted-foreground">{itemMeta}</p>
            )}
          </div>
        )}

        {warning && (
          <p className={`mb-4 text-xs ${styles.warning}`}>{warning}</p>
        )}

        {onReasonChange && (
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {reasonLabel}
            </span>
            <textarea
              value={reasonValue || ""}
              onChange={(event) => onReasonChange(event.target.value)}
              disabled={loading}
              rows={3}
              maxLength={500}
              placeholder={reasonPlaceholder}
              className="w-full resize-none rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:border-primary-200/50 focus:outline-none disabled:opacity-50"
            />
          </label>
        )}

        <div className="flex justify-end gap-3">
          {!hideCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-foreground/10 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-white disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles.button}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
