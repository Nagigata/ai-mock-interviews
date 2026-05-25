"use client";

import { useState } from "react";
import { Loader2, Megaphone, Send, Shield, User, Users } from "lucide-react";
import { toast } from "sonner";

import { broadcastSystemNotification } from "@/lib/actions/admin.actions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const TITLE_MAX = 200;
const MESSAGE_MAX = 1000;
const ACTION_URL_MAX = 500;

type Audience = "ALL" | "ADMIN" | "USER";

const audienceOptions: Array<{
  value: Audience;
  label: string;
  description: string;
  icon: typeof Users;
  accent: string;
}> = [
  {
    value: "ALL",
    label: "All users",
    description: "Everyone with an active account.",
    icon: Users,
    accent: "from-sky-500/20 to-sky-500/5 border-sky-400/40",
  },
  {
    value: "ADMIN",
    label: "Only admins",
    description: "Internal coordination, moderation policy.",
    icon: Shield,

    accent: "from-amber-500/20 to-amber-500/5 border-amber-400/40",
  },
  {
    value: "USER",
    label: "Only regular users",
    description: "Reach learners without bothering admins.",
    icon: User,
    accent: "from-rose-500/20 to-rose-500/5 border-rose-400/40",
  },
];

export default function AdminBroadcast() {
  const [audience, setAudience] = useState<Audience>("ALL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const result = await broadcastSystemNotification({
        title: trimmedTitle,
        message: trimmedMessage,
        actionUrl: trimmedActionUrl || undefined,
        audience,
      });
      const count = result?.recipientCount ?? 0;
      toast.success(
        `Broadcast sent to ${count} recipient${count === 1 ? "" : "s"}`,
        {
          description: `Audience: ${audience}`,
        },
      );
      setTitle("");
      setMessage("");
      setActionUrl("");
    } catch (error) {
      const description =
        error instanceof Error ? error.message : "Please try again later.";
      toast.error("Failed to broadcast notification", { description });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminPageHeader
        eyebrow="Admin broadcast"
        title="Broadcast notification"
        description="Send a system-wide announcement. Recipients cannot opt out — use sparingly."
        icon={Megaphone}
      />

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div>
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-light-400">
                Audience
              </span>
              <div className="grid gap-3 sm:grid-cols-3">
                {audienceOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = audience === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAudience(option.value)}
                      disabled={submitting}
                      className={`group flex flex-col gap-2 rounded-2xl border bg-gradient-to-br p-4 text-left transition-all disabled:opacity-50 ${
                        selected
                          ? `${option.accent} shadow-lg`
                          : "border-white/10 from-white/[0.03] to-transparent hover:border-white/20 hover:from-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon
                          className={`size-4 ${
                            selected ? "text-white" : "text-light-400"
                          }`}
                        />
                        <span
                          className={`size-3 rounded-full border-2 ${
                            selected
                              ? "border-white bg-white"
                              : "border-light-600 bg-transparent"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            selected ? "text-white" : "text-light-100"
                          }`}
                        >
                          {option.label}
                        </p>
                        <p className="mt-0.5 text-xs text-light-400">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-light-400">
                <span>
                  Title <span className="text-red-400">*</span>
                </span>
                <span
                  className={
                    title.length > TITLE_MAX ? "text-red-400" : "text-light-600"
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
                placeholder="e.g. Scheduled maintenance Saturday 2 AM"
                className="w-full rounded-xl border border-white/10 bg-dark-100 px-3 py-2 text-sm text-white  focus:border-primary-200/50 focus:outline-none disabled:opacity-50"
              />
            </label>

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-light-400">
                <span>
                  Message <span className="text-red-400">*</span>
                </span>
                <span
                  className={
                    message.length > MESSAGE_MAX
                      ? "text-red-400"
                      : "text-light-600"
                  }
                >
                  {message.length}/{MESSAGE_MAX}
                </span>
              </div>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={submitting}
                rows={5}
                maxLength={MESSAGE_MAX}
                placeholder="What do recipients need to know? Be clear and concise."
                className="w-full resize-none rounded-xl border border-white/10 bg-dark-100 px-3 py-2 text-sm text-white focus:border-primary-200/50 focus:outline-none disabled:opacity-50"
              />
            </label>

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-light-400">
                <span>Action URL (optional)</span>
                <span
                  className={
                    actionUrl.length > ACTION_URL_MAX
                      ? "text-red-400"
                      : "text-light-600"
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
                className="w-full rounded-xl border border-white/10 bg-dark-100 px-3 py-2 text-sm text-white  focus:border-primary-200/50 focus:outline-none disabled:opacity-50"
              />
              <p className="mt-1.5 text-xs text-light-500">
                When clicked, recipients route to this URL.
              </p>
            </label>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-200 px-5 py-2.5 text-sm font-semibold text-dark-100 transition-colors hover:bg-primary-200/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Broadcast now
                  </>
                )}
              </button>
            </div>
          </div>

          <aside className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-light-400">
              Preview
            </p>
            <div className="rounded-2xl border-l-4 border-amber-400 bg-amber-500/[0.08] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/10">
                  <Megaphone className="size-4 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-300">
                      System
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm font-bold text-amber-50">
                    {trimmedTitle || "Your title will appear here"}
                  </p>
                  <p className="mt-1 line-clamp-4 text-xs leading-5 text-light-400">
                    {trimmedMessage ||
                      "Your message body will preview here as the user will see it."}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300/70">
                    just now
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs leading-5 text-light-400">
              Inactive and deleted accounts are excluded automatically. This
              action is logged in the audit trail.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
