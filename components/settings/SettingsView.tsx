"use client";

import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  AlertTriangle,
  Camera,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/UserAvatar";
import { Gender, UserProfile } from "@/types";
import {
  changeMyPassword,
  deleteMyAccount,
  setMyPassword,
  updateMyProfile,
  updateNotificationPreferences,
  updateProfileSettings,
} from "@/lib/actions/user.actions";

interface SettingsViewProps {
  profile: UserProfile;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const SettingsView = ({ profile }: SettingsViewProps) => {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-100">
          Account
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Settings
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-light-100/75">
          Manage your profile details, notification preferences, and account
          security.
        </p>
      </header>

      <Tabs defaultValue="profile" className="gap-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab profile={profile} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab profile={profile} />
        </TabsContent>
        <TabsContent value="account">
          <AccountTab profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ProfileTab = ({ profile }: { profile: UserProfile }) => {
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
          toast.error(avatarResult.message || "Failed to upload avatar.");
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

      toast.success("Profile updated.");
      setSelectedFile(null);
      setPreviewUrl(null);
      router.refresh();
    });
  };

  const avatarUrl = previewUrl || profile.avatarUrl;
  const readmeCount = readme.length;

  return (
    <section className="rounded-[28px] border border-white/[0.08] bg-[#101318] p-6">
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
            These fields are visible to anyone who opens your profile page.
            Leave fields empty to hide them.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="settings-name">Display name</Label>
          <Input
            id="settings-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your display name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="settings-gender">Gender</Label>
          <select
            id="settings-gender"
            value={gender}
            onChange={(event) => setGender(event.target.value as Gender | "")}
            className="h-10 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-200/40"
          >
            <option value="">Unspecified</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="settings-birthday">Birthday</Label>
          <Input
            id="settings-birthday"
            type="date"
            value={birthday}
            max={dayjs().format("YYYY-MM-DD")}
            onChange={(event) => setBirthday(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="settings-location">Location</Label>
          <Input
            id="settings-location"
            value={location}
            maxLength={100}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City, Country"
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="settings-readme">About me</Label>
            <span className="text-xs text-light-100/60">
              {readmeCount}/2000
            </span>
          </div>
          <Textarea
            id="settings-readme"
            value={readme}
            onChange={(event) => setReadme(event.target.value.slice(0, 2000))}
            placeholder="Share a short bio. Markdown is supported."
            rows={6}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save changes
        </Button>
      </div>
    </section>
  );
};

const NotificationsTab = ({ profile }: { profile: UserProfile }) => {
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
        toast.error(result.message || "Failed to save preference.");
        return;
      }
      toast.success("Preferences saved.");
      router.refresh();
    }, 500);
  };

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const toggleInterview = (value: boolean) => {
    setInterview(value);
    scheduleSave({ notifyInterviewActivity: value });
  };

  const toggleComments = (value: boolean) => {
    setComments(value);
    scheduleSave({ notifyComments: value });
  };

  const toggleSound = (value: boolean) => {
    setSound(value);
    scheduleSave({ notifySound: value });
  };

  return (
    <section className="flex flex-col gap-2 rounded-[28px] border border-white/[0.08] bg-[#101318] p-6">
      <h2 className="text-xl font-bold text-white">Notification preferences</h2>
      <p className="mb-4 text-sm leading-6 text-light-100/70">
        Choose which events trigger a toast and Socket.IO push. Changes save
        automatically.
      </p>

      <PreferenceRow
        title="Interview activity"
        description="Interview generation and feedback completion events."
        checked={interview}
        onCheckedChange={toggleInterview}
      />
      <PreferenceRow
        title="Comments & mentions"
        description="New comments on your solutions, replies, and @mentions."
        checked={comments}
        onCheckedChange={toggleComments}
      />
      <PreferenceRow
        title="Notification sound"
        description="Play a short sound when a new notification arrives."
        checked={sound}
        onCheckedChange={toggleSound}
      />
      <PreferenceRow
        title="System announcements"
        description="Security and account alerts. Required."
        checked
        disabled
      />
    </section>
  );
};

const PreferenceRow = ({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange?: (value: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] py-4 first:border-t-0 first:pt-0">
    <div className="flex-1">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs leading-5 text-light-100/65">{description}</p>
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  </div>
);

const AccountTab = ({ profile }: { profile: UserProfile }) => {
  const hasPassword = Boolean(profile.hasPassword);
  const lastProvider = profile.provider || "LOCAL";

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[28px] border border-white/[0.08] bg-[#101318] p-6">
        <h2 className="text-xl font-bold text-white">Sign-in methods</h2>
        <p className="mt-1 mb-5 text-sm leading-6 text-light-100/70">
          How you authenticate into PrepWise. Email cannot be changed.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <Mail className="size-4 text-primary-100" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{profile.email}</p>
              <p className="text-xs text-light-100/60">Last sign-in via {lastProvider}</p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Verified
            </span>
          </div>

          <PasswordSection hasPassword={hasPassword} />
        </div>
      </section>

      <section className="rounded-[28px] border border-rose-500/20 bg-rose-500/[0.04] p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 size-5 text-rose-300" />
          <div>
            <h2 className="text-xl font-bold text-white">Delete account</h2>
            <p className="mt-1 text-sm leading-6 text-light-100/75">
              This soft-deletes your account: your name and avatar are removed,
              your email is anonymized, but your solutions and comments remain
              visible as &ldquo;Deleted User&rdquo;.
            </p>
            <div className="mt-4">
              <DeleteAccountDialog hasPassword={hasPassword} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const PasswordSection = ({ hasPassword }: { hasPassword: boolean }) => {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = hasPassword
        ? await changeMyPassword({ currentPassword, newPassword })
        : await setMyPassword(newPassword);

      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(hasPassword ? "Password changed." : "Password set.");
      reset();
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) reset();
        setOpen(value);
      }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <ShieldCheck className="size-4 text-primary-100" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Password</p>
          <p className="text-xs text-light-100/60">
            {hasPassword ? "Set" : "Not set — required to delete your account"}
          </p>
        </div>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {hasPassword ? "Change password" : "Set password"}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasPassword ? "Change your password" : "Set a password"}
          </DialogTitle>
          <DialogDescription>
            {hasPassword
              ? "You'll need to sign in again on other devices."
              : "After setting a password, you can sign in with email or continue using OAuth."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {hasPassword && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={isPending || newPassword.length < 6}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {hasPassword ? "Update password" : "Set password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteAccountDialog = ({ hasPassword }: { hasPassword: boolean }) => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canSubmit =
    hasPassword && password.length > 0 && confirm === "DELETE" && !isPending;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMyAccount({
        password,
        confirmText: confirm,
      });
      if (!result.success) {
        toast.error(result.message || "Failed to delete account.");
        return;
      }
      toast.success("Your account has been deleted.");
      router.replace("/sign-in");
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setPassword("");
          setConfirm("");
        }
        setOpen(value);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="size-4" />
          Delete my account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This action soft-deletes your account and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {!hasPassword ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-200">
            You need to set a password before deleting an OAuth-only account.
            Close this dialog and use &ldquo;Set password&rdquo; first.
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="delete-password">Confirm with your password</Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="delete-confirm">
                Type <span className="font-mono text-rose-300">DELETE</span> to
                confirm
              </Label>
              <Input
                id="delete-confirm"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {hasPassword && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canSubmit}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete account
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsView;
