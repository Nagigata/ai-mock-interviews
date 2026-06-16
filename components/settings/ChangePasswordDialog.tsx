"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, X } from "lucide-react";

import AppButton from "@/components/AppButton";
import { changeMyPassword, setMyPassword } from "@/lib/actions/user.actions";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  hasPassword: boolean;
}

const inputClass =
  "h-11 w-full rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-4 text-sm text-white placeholder:text-foreground/40 transition-colors focus:border-primary-200/40 focus:outline-none focus:ring-2 focus:ring-primary-200/20 disabled:opacity-50";

const ChangePasswordDialog = ({
  open,
  onClose,
  hasPassword,
}: ChangePasswordDialogProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
      setCurrentPassword("");
      setNewPassword("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    startTransition(async () => {
      const result = hasPassword
        ? await changeMyPassword({ currentPassword, newPassword })
        : await setMyPassword(newPassword);

      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(hasPassword ? "Password updated." : "Password set.");
      onClose();
      router.refresh();
    });
  };

  const submitDisabled = isPending || newPassword.length < 6;

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
          <div className="rounded-xl bg-primary-200/15 p-2.5 text-primary-200">
            <ShieldCheck className="size-5" />
          </div>
          <h3 id={titleId} className="text-lg font-bold text-white">
            {hasPassword ? "Change your password" : "Set a password"}
          </h3>
        </div>

        <p id={descId} className="mb-5 text-sm leading-6 text-foreground/75">
          {hasPassword
            ? "You'll be signed out on your other devices after the change."
            : "Once set, you can sign in with your email and password — or keep using your social account."}
        </p>

        <div className="mb-6 flex flex-col gap-4">
          {hasPassword && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="current-password"
                className="text-sm font-semibold text-white"
              >
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="new-password"
              className="text-sm font-semibold text-white"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <AppButton variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </AppButton>
          <AppButton
            loading={isPending}
            disabled={submitDisabled}
            onClick={handleSubmit}
          >
            {hasPassword ? "Update password" : "Set password"}
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordDialog;
