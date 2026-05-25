"use client";

import { ChangeEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Camera, Save } from "lucide-react";

import AppButton from "@/components/AppButton";
import SelectFilter from "@/components/filters/SelectFilter";
import UserAvatar from "@/components/UserAvatar";
import { Gender, UserProfile } from "@/types";
import {
  updateMyProfile,
  updateProfileSettings,
} from "@/lib/actions/user.actions";

const GENDER_OPTIONS = [
  { value: "NONE", label: "Unspecified" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const inputClass =
  "h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-light-100/40 transition-colors focus:border-primary-200/40 focus:outline-none focus:ring-2 focus:ring-primary-200/20 disabled:opacity-50";

const labelClass = "text-sm font-semibold text-white";

interface ProfileTabProps {
  profile: UserProfile;
}

const ProfileTab = ({ profile }: ProfileTabProps) => {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender | "">(profile.gender ?? "");
  const [birthday, setBirthday] = useState(
    profile.birthday ? dayjs(profile.birthday).format("YYYY-MM-DD") : "",
  );
  const [location, setLocation] = useState(profile.location ?? "");
  const [readme, setReadme] = useState(profile.readme ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleSave = () => {
    startTransition(async () => {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("avatar", selectedFile);
        const avatarResult = await updateMyProfile(formData);
        if (!avatarResult.success) {
          toast.error(avatarResult.message || "Couldn't upload your photo.");
          return;
        }
      }

      const textResult = await updateProfileSettings({
        name,
        gender: gender || null,
        birthday: birthday || null,
        location,
        readme,
      });

      if (!textResult.success) {
        toast.error(textResult.message);
        return;
      }

      toast.success("Your profile is saved.");
      setSelectedFile(null);
      setPreviewUrl(null);
      router.refresh();
    });
  };

  const avatarUrl = previewUrl || profile.avatarUrl;
  const readmeCount = readme.length;

  return (
    <section className="rounded-[28px] border border-white/[0.08] bg-[#101318] p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <UserAvatar
            name={name || profile.name}
            avatarUrl={avatarUrl}
            size="xl"
            className="border-white/15"
          />
          <label className="absolute bottom-1 right-1 flex size-9 cursor-pointer items-center justify-center rounded-full border border-primary-200/25 bg-[#151922] text-primary-100 transition hover:bg-primary-200/10">
            <Camera className="size-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Public profile</h2>
          <p className="mt-1 text-sm leading-6 text-light-100/70">
            Anyone visiting your profile sees these details. Leave a field empty
            to hide it.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="settings-name" className={labelClass}>
            Display name
          </label>
          <input
            id="settings-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className={labelClass}>Gender</span>
          <SelectFilter
            label="Gender"
            value={gender || "NONE"}
            options={GENDER_OPTIONS}
            onChange={(value) =>
              setGender(value === "NONE" ? "" : (value as Gender))
            }
            hideLabel
            triggerClassName="h-11 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="settings-birthday" className={labelClass}>
            Birthday
          </label>
          <input
            id="settings-birthday"
            type="date"
            value={birthday}
            max={dayjs().format("YYYY-MM-DD")}
            onChange={(e) => setBirthday(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="settings-location" className={labelClass}>
            Location
          </label>
          <input
            id="settings-location"
            value={location}
            maxLength={100}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label htmlFor="settings-readme" className={labelClass}>
              About me
            </label>
            <span className="text-xs text-light-100/60">
              {readmeCount}/2000
            </span>
          </div>
          <textarea
            id="settings-readme"
            value={readme}
            onChange={(e) => setReadme(e.target.value.slice(0, 2000))}
            placeholder="Tell people a bit about yourself. Markdown works here."
            rows={6}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-light-100/40 transition-colors focus:border-primary-200/40 focus:outline-none focus:ring-2 focus:ring-primary-200/20 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <AppButton
          size="lg"
          loading={isPending}
          icon={<Save className="size-4" />}
          onClick={handleSave}
        >
          Save changes
        </AppButton>
      </div>
    </section>
  );
};

export default ProfileTab;
