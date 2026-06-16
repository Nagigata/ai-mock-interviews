"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UserProfile } from "@/types";
import { updateNotificationPreferences } from "@/lib/actions/user.actions";

interface NotificationsTabProps {
  profile: UserProfile;
}

const NotificationsTab = ({ profile }: NotificationsTabProps) => {
  const [interview, setInterview] = useState(
    profile.notifyInterviewActivity ?? true,
  );
  const [comments, setComments] = useState(profile.notifyComments ?? true);
  const [sound, setSound] = useState(profile.notifySound ?? true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const scheduleSave = (
    next: Partial<{
      notifyInterviewActivity: boolean;
      notifyComments: boolean;
      notifySound: boolean;
    }>,
  ) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const result = await updateNotificationPreferences(next);
      if (!result.success) {
        toast.error(result.message || "Couldn't save that change.");
        return;
      }
      toast.success("Saved.");
      router.refresh();
    }, 500);
  };

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  return (
    <section className="flex flex-col gap-2 rounded-[28px] border border-foreground/[0.08] bg-card p-5 sm:p-6">
      <h2 className="text-xl font-bold text-white">Notifications</h2>
      <p className="mb-4 text-sm leading-6 text-foreground/70">
        Pick what you want to hear about. Your choices save automatically.
      </p>

      <PreferenceRow
        title="Interview updates"
        description="When your mock interview is ready or your feedback is generated."
        checked={interview}
        onChange={(value) => {
          setInterview(value);
          scheduleSave({ notifyInterviewActivity: value });
        }}
      />
      <PreferenceRow
        title="Comments & mentions"
        description="When someone comments on your solution, replies to your comment, or mentions you."
        checked={comments}
        onChange={(value) => {
          setComments(value);
          scheduleSave({ notifyComments: value });
        }}
      />
      <PreferenceRow
        title="Notification sound"
        description="Play a short chime when a new notification arrives."
        checked={sound}
        onChange={(value) => {
          setSound(value);
          scheduleSave({ notifySound: value });
        }}
      />
      <PreferenceRow
        title="Important alerts"
        description="Account security and service notices. Can't be turned off."
        checked
        disabled
      />
    </section>
  );
};

interface PreferenceRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}

const PreferenceRow = ({
  title,
  description,
  checked,
  onChange,
  disabled,
}: PreferenceRowProps) => (
  <div className="flex items-center justify-between gap-4 border-t border-foreground/[0.06] py-4 first:border-t-0 first:pt-0">
    <div className="flex-1">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs leading-5 text-foreground/65">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={title}
      onClick={() => onChange?.(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-primary-200" : "bg-foreground/[0.12]"
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow-lg transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  </div>
);

export default NotificationsTab;
