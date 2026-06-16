"use client";

import { ChangeEvent, useMemo, useState, useTransition } from "react";
import dayjs from "dayjs";
import {
  CalendarDays,
  Camera,
  Loader2,
  Mail,
  PencilLine,
  Save,
  X,
} from "lucide-react";

import { updateMyProfile } from "@/lib/actions/user.actions";
import { UserProfile } from "@/types";
import UserAvatar from "@/components/UserAvatar";

interface ProfileEditorProps {
  profile: UserProfile;
}

const ProfileEditor = ({ profile }: ProfileEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [isPending, startTransition] = useTransition();

  const avatarUrl = useMemo(() => previewUrl || currentProfile.avatarUrl, [previewUrl, currentProfile.avatarUrl]);
  const joinedDate = useMemo(
    () =>
      currentProfile.createdAt
        ? dayjs(currentProfile.createdAt).format("DD/MM/YYYY")
        : "",
    [currentProfile.createdAt],
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage(null);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", name);
    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }

    startTransition(async () => {
      const result = await updateMyProfile(formData);

      if (!result.success || !result.data) {
        setMessage(result.message || "Failed to update profile.");
        return;
      }

      setCurrentProfile(result.data);
      setMessage("Profile updated successfully.");
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditing(false);
    });
  };

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[var(--surface-border)] px-6 py-7 shadow-[0_28px_80px_var(--shadow-heavy)] sm:px-8 lg:px-10" style={{ background: "var(--hero-gradient)" }}>
      <div className="pointer-events-none absolute right-12 top-6 size-32 rounded-full bg-primary-200/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            <div className="absolute -inset-2 rounded-full border border-foreground/10 bg-foreground/[0.03]" />
            <UserAvatar
              name={currentProfile.name}
              avatarUrl={avatarUrl}
              size="xl"
              className="relative border-foreground/15"
            />
            {isEditing && (
              <label className="absolute bottom-1 right-1 flex size-11 cursor-pointer items-center justify-center rounded-full border border-primary-200/25 bg-card text-primary-100 shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition hover:bg-primary-200/10">
                <Camera className="size-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-100">
              Candidate profile
            </p>
            {isEditing ? (
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-3 w-full max-w-xl rounded-2xl border border-foreground/10 bg-foreground/[0.05] px-4 py-3 text-2xl font-bold leading-[1.25] text-white outline-none transition focus:border-primary-200/40 focus:bg-foreground/[0.07]"
              />
            ) : (
              <h1 className="mt-3 truncate pb-1 text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl sm:leading-[1.15]">
                {currentProfile.name}
              </h1>
            )}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1.5 text-sm text-foreground">
                <Mail className="size-3.5 text-primary-100" />
                <span className="max-w-[240px] truncate">
                  {currentProfile.email}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1.5 text-sm text-foreground">
                <CalendarDays className="size-3.5 text-cyan-700 dark:text-cyan-300" />
                Joined {joinedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(currentProfile.name);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setMessage(null);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-5 py-3 text-sm font-bold text-foreground transition hover:bg-foreground/[0.08]"
                disabled={isPending}
              >
                <X className="size-4" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-200 px-5 py-3 text-sm font-extrabold text-dark-100 transition hover:bg-primary-100 disabled:opacity-60"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/[0.05] px-5 py-3 text-sm font-bold text-white transition hover:border-primary-200/25 hover:bg-primary-200/[0.08]"
            >
              <PencilLine className="size-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {message && (
        <p className="relative mt-5 w-fit rounded-full border border-primary-200/15 bg-primary-200/10 px-3 py-1.5 text-sm font-medium text-primary-100">
          {message}
        </p>
      )}
    </section>
  );
};

export default ProfileEditor;
