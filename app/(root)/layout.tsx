import { ReactNode } from "react";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import { getMyProfile } from "@/lib/actions/user.actions";
import NotificationWatcher from "@/components/NotificationWatcher";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated) redirect("/sign-in");

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const socketToken = cookieStore.get("token")?.value ?? null;
  const t = getDictionary(locale);
  const profile = await getMyProfile();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--surface-base)" }}>
      <Navbar locale={locale} t={t} user={profile} />
      <NotificationWatcher soundEnabled={profile?.notifySound ?? true} token={socketToken} />

      {/* Main Content Area - Increased spacing (pt-24) to avoid "stuck" feeling */}
      <main className="flex-1 pt-24 pb-12 w-full max-w-7xl mx-auto px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default RootLayout;
