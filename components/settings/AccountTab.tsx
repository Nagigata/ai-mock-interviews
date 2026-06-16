"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Link2,
  Link2Off,
  Mail,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import AppButton from "@/components/AppButton";
import { OAuthProvider, UserProfile } from "@/types";
import { unlinkProvider } from "@/lib/actions/user.actions";
import ChangePasswordDialog from "./ChangePasswordDialog";
import DeleteAccountDialog from "./DeleteAccountDialog";

interface AccountTabProps {
  profile: UserProfile;
}

type ProviderKey = "google" | "github";

const PROVIDERS: { key: ProviderKey; label: string; id: OAuthProvider }[] = [
  { key: "google", label: "Google", id: "GOOGLE" },
  { key: "github", label: "GitHub", id: "GITHUB" },
];

const AccountTab = ({ profile }: AccountTabProps) => {
  const hasPassword = Boolean(profile.hasPassword);
  const linkedSet = useMemo(
    () => new Set(profile.linkedProviders ?? []),
    [profile.linkedProviders],
  );
  const linkedCount = linkedSet.size;

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busyProvider, setBusyProvider] = useState<ProviderKey | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const linkedStatus = searchParams.get("linked");
  const linkedProvider = searchParams.get("provider");
  const linkedMsg = searchParams.get("msg");

  const [banner, setBanner] = useState<
    | { kind: "ok"; provider: string }
    | { kind: "error"; provider: string | null; msg: string }
    | null
  >(null);

  useEffect(() => {
    if (!linkedStatus) {
      return;
    }
    if (linkedStatus === "ok" && linkedProvider) {
      setBanner({ kind: "ok", provider: linkedProvider });
    } else if (linkedStatus === "error") {
      setBanner({
        kind: "error",
        provider: linkedProvider,
        msg: linkedMsg || "Failed to link account.",
      });
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("linked");
    params.delete("provider");
    params.delete("msg");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [linkedStatus, linkedProvider, linkedMsg, pathname, router, searchParams]);

  const handleLink = (provider: ProviderKey) => {
    setActionError(null);
    setBusyProvider(provider);
    window.location.href = `/api/link-provider/${provider}`;
  };

  const canUnlink = (provider: ProviderKey) => {
    const isLinked = linkedSet.has(provider.toUpperCase() as OAuthProvider);
    if (!isLinked) return false;
    if (hasPassword) return true;
    return linkedCount > 1;
  };

  const handleUnlink = (provider: ProviderKey) => {
    setActionError(null);
    setBusyProvider(provider);
    startTransition(async () => {
      const result = await unlinkProvider(provider);
      setBusyProvider(null);
      if (!result.success) {
        setActionError(result.message);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {banner && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            banner.kind === "ok"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200"
              : "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-200"
          }`}
        >
          {banner.kind === "ok" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <div className="flex-1">
            {banner.kind === "ok" ? (
              <p>
                Linked{" "}
                <span className="font-semibold capitalize">
                  {banner.provider}
                </span>{" "}
                successfully.
              </p>
            ) : (
              <p>
                {banner.provider
                  ? `Couldn't link ${banner.provider}: `
                  : "Couldn't link account: "}
                <span className="opacity-90">{banner.msg}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-xs text-foreground/70 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="rounded-[28px] border border-foreground/[0.08] bg-card p-5 sm:p-6">
        <h2 className="text-xl font-bold text-white">Sign-in methods</h2>
        <p className="mt-1 mb-5 text-sm leading-6 text-foreground/70">
          How you get into PrepWise. Your email can&rsquo;t be changed.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.03] p-4">
            <Mail className="size-5 text-primary-100" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                {profile.email}
              </p>
              <p className="text-xs text-foreground/60">Primary email</p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Verified
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.03] p-4">
            <ShieldCheck className="size-5 text-primary-100" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Password</p>
              <p className="text-xs text-foreground/60">
                {hasPassword
                  ? "You can sign in with your email and password."
                  : "Not set yet — needed before you can delete your account."}
              </p>
            </div>
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => setPasswordOpen(true)}
            >
              {hasPassword ? "Change password" : "Set password"}
            </AppButton>
          </div>

          {PROVIDERS.map(({ key, label, id }) => {
            const isLinked = linkedSet.has(id);
            const isBusy = busyProvider === key;
            const allowUnlink = canUnlink(key);

            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.03] p-4"
              >
                <div className="flex size-7 items-center justify-center rounded-full bg-foreground/[0.08]">
                  {key === "google" ? (
                    <FcGoogle />
                  ) : (
                    <FaGithub className="size-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-foreground/60">
                    {isLinked
                      ? `Linked — you can sign in with ${label}.`
                      : `Not linked. Link to enable ${label} sign-in.`}
                  </p>
                </div>
                {isLinked ? (
                  <>
                    <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 sm:inline-flex">
                      Linked
                    </span>
                    <AppButton
                      variant="outline"
                      size="sm"
                      icon={<Link2Off className="size-3.5" />}
                      onClick={() => handleUnlink(key)}
                      loading={isBusy}
                      disabled={!allowUnlink}
                      title={
                        !allowUnlink
                          ? "Set a password or link another provider first."
                          : undefined
                      }
                    >
                      Unlink
                    </AppButton>
                  </>
                ) : (
                  <AppButton
                    variant="outline"
                    size="sm"
                    icon={<Link2 className="size-3.5" />}
                    onClick={() => handleLink(key)}
                    loading={isBusy}
                  >
                    Link
                  </AppButton>
                )}
              </div>
            );
          })}

          {actionError && (
            <p className="text-xs text-red-700 dark:text-red-300">{actionError}</p>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-foreground/[0.08] bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-red-500/15 p-2.5 text-red-700 dark:text-red-400">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Delete account</h2>
            <p className="mt-1 text-sm leading-6 text-foreground/75">
              Removes your name, avatar, and personal info. Past solutions and
              comments stay visible but appear as &ldquo;Deleted User&rdquo;.
              You can&rsquo;t undo this.
            </p>
            <div className="mt-4">
              <AppButton
                variant="destructive"
                icon={<Trash2 className="size-4" />}
                onClick={() => setDeleteOpen(true)}
              >
                Delete my account
              </AppButton>
            </div>
          </div>
        </div>
      </section>

      <ChangePasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        hasPassword={hasPassword}
      />
      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        hasPassword={hasPassword}
      />
    </div>
  );
};

export default AccountTab;
