"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, X } from "lucide-react";

import AppButton from "@/components/AppButton";
import { deleteMyAccount } from "@/lib/actions/user.actions";

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  hasPassword: boolean;
}

const inputClass =
  "h-11 w-full rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-4 text-sm text-white placeholder:text-foreground/40 transition-colors focus:border-primary-200/40 focus:outline-none focus:ring-2 focus:ring-primary-200/20 disabled:opacity-50";

const DeleteAccountDialog = ({
  open,
  onClose,
  hasPassword,
}: DeleteAccountDialogProps) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isPending, onClose]);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirm("");
    }
  }, [open]);

  if (!open) return null;

  const canSubmit =
    hasPassword && password.length > 0 && confirm === "DELETE" && !isPending;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMyAccount({
        password,
        confirmText: confirm,
      });
      if (!result.success) {
        toast.error(result.message || "Couldn't delete your account.");
        return;
      }
      toast.success("Your account has been removed.");
      router.replace("/sign-in");
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full max-w-md rounded-[28px] border border-foreground/10 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          aria-label="Close dialog"
          className="absolute right-4 top-4 text-foreground/60 transition-colors hover:text-white disabled:opacity-50"
        >
          <X className="size-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-red-500/15 p-2.5 text-red-700 dark:text-red-400">
            <AlertTriangle className="size-5" />
          </div>
          <h3 id={titleId} className="text-lg font-bold text-white">
            Delete your account?
          </h3>
        </div>

        <p id={descId} className="mb-5 text-sm leading-6 text-foreground/75">
          This removes your name, avatar, and personal info. Past solutions and
          comments stay visible but appear as &ldquo;Deleted User&rdquo;. You
          can&rsquo;t undo this.
        </p>

        {!hasPassword ? (
          <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-700 dark:text-amber-200">
            Please set a password first so we can confirm it&rsquo;s really you.
            Close this dialog, then choose &ldquo;Set password&rdquo;.
          </div>
        ) : (
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="delete-password"
                className="text-sm font-semibold text-white"
              >
                Confirm with your password
              </label>
              <input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="delete-confirm"
                className="text-sm font-semibold text-white"
              >
                Type <span className="font-mono text-rose-700 dark:text-rose-300">DELETE</span> to
                confirm
              </label>
              <input
                id="delete-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="DELETE"
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <AppButton variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </AppButton>
          {hasPassword && (
            <AppButton
              variant="destructive"
              loading={isPending}
              disabled={!canSubmit}
              onClick={handleDelete}
            >
              Delete account
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountDialog;
