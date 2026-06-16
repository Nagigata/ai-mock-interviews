"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Settings as SettingsIcon } from "lucide-react";

import UnderlineTabs from "@/components/UnderlineTabs";
import { UserProfile } from "@/types";
import AccountTab from "./AccountTab";
import NotificationsTab from "./NotificationsTab";
import ProfileTab from "./ProfileTab";

type SettingsTab = "profile" | "notifications" | "account";

interface SettingsViewProps {
  profile: UserProfile;
}

const resolveTab = (raw: string | null): SettingsTab => {
  if (raw === "account" || raw === "notifications" || raw === "profile") {
    return raw;
  }
  return "profile";
};

const SettingsView = ({ profile }: SettingsViewProps) => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() =>
    resolveTab(searchParams.get("tab")),
  );

  useEffect(() => {
    const next = resolveTab(searchParams.get("tab"));
    setActiveTab(next);
  }, [searchParams]);

  const tabs = [
    { id: "profile" as const, label: "Profile" },
    { id: "notifications" as const, label: "Notifications" },
    { id: "account" as const, label: "Account" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-[28px] border border-foreground/[0.08] bg-card p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary-200/20 bg-primary-200/10 text-primary-100">
            <SettingsIcon className="size-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Settings
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/75">
              Update your profile, choose what to be notified about, and keep
              your account secure.
            </p>
          </div>
        </div>
      </section>

      <UnderlineTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "profile" && <ProfileTab profile={profile} />}
      {activeTab === "notifications" && <NotificationsTab profile={profile} />}
      {activeTab === "account" && <AccountTab profile={profile} />}
    </div>
  );
};

export default SettingsView;
