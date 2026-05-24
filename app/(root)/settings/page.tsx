import { redirect } from "next/navigation";
import type { Metadata } from "next";

import SettingsView from "@/components/settings/SettingsView";
import { getMyProfile } from "@/lib/actions/user.actions";

export const metadata: Metadata = {
  title: "Settings",
};

const SettingsPage = async () => {
  const profile = await getMyProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  return <SettingsView profile={profile} />;
};

export default SettingsPage;
