"use client";

import { signOut } from "@/lib/actions/auth.action";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  label: string;
}

const LogoutButton = ({ label }: LogoutButtonProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-card hover:bg-muted text-foreground/80 hover:text-white rounded-lg border border-border transition-all font-medium text-sm ml-4"
    >
      <LogOut className="size-4" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};

export default LogoutButton;
