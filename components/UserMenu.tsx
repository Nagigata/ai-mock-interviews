"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  ChevronDown,
  Globe2,
  LogOut,
  ReceiptText,
  Shield,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";

import { signOut } from "@/lib/actions/auth.action";
import UserAvatar from "@/components/UserAvatar";
import { UserProfile } from "@/types";

interface UserMenuProps {
  currentLocale: string;
  user?: UserProfile | null;
}

const languages = [
  {
    code: "en",
    label: "English",
    short: "EN",
    flag: "https://flagcdn.com/gb.svg",
  },
  {
    code: "vi",
    label: "Tiếng Việt",
    short: "VI",
    flag: "https://flagcdn.com/vn.svg",
  },
];

const menuItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/profile",
    label: "Profile",
    icon: UserCircle2,
  },
  {
    href: "/bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
  },
  {
    href: "/submissions",
    label: "Submissions",
    icon: ReceiptText,
  },
];

const UserMenu = ({ currentLocale, user }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const currentLanguage =
    languages.find((language) => language.code === currentLocale) ||
    languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (locale: string) => {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    setIsOpen(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.22)] transition-all hover:border-primary-200/25 hover:bg-primary-200/[0.07]"
      >
        <UserAvatar
          name={user?.name || "User"}
          avatarUrl={user?.avatarUrl}
          size="sm"
          className="shrink-0 shadow-none"
        />
        <span className="hidden min-w-0 flex-col items-start lg:flex">
          <span className="max-w-28 truncate text-sm font-bold text-white">
            {user?.name || "Account"}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-light-400">
            {currentLanguage.short}
          </span>
        </span>
        <ChevronDown
          className={`size-4 text-light-400 transition-transform group-hover:text-primary-100 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-[26px] border border-white/10 bg-[#151922]/95 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="relative overflow-hidden border-b border-white/8 px-4 py-4">
            <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-primary-200/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <UserAvatar
                name={user?.name || "User"}
                avatarUrl={user?.avatarUrl}
                size="md"
                className="shrink-0 shadow-none"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-white">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-sm text-light-400">
                  {user?.email || ""}
                </p>
                {user?.role ? (
                  <p className="mt-1 inline-flex rounded-full border border-primary-200/15 bg-primary-200/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-100">
                    {user.role.toLowerCase()}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="group/item flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-light-100 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-light-400 transition group-hover/item:border-primary-200/20 group-hover/item:bg-primary-200/10 group-hover/item:text-primary-100">
                    <Icon className="size-4" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                role="menuitem"
                className="group/item flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/10"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/10 text-amber-300">
                  <Shield className="size-4" />
                </span>
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          <div className="border-t border-white/8 px-4 py-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-light-400">
              <Globe2 className="size-3.5" />
              <span>Language</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-bold transition ${
                    currentLocale === language.code
                      ? "border-primary-100/40 bg-primary-100/10 text-primary-100"
                      : "border-white/8 bg-white/[0.035] text-light-100 hover:bg-white/[0.07]"
                  }`}
                >
                  <Image
                    src={language.flag}
                    alt={language.label}
                    width={18}
                    height={12}
                  />
                  <span>{language.short}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/8 p-2">
            <button
              onClick={handleLogout}
              role="menuitem"
              className="group/item flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#f29a9a] transition hover:bg-[#ff6b6b]/10 hover:text-red-200"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-red-300/15 bg-red-300/10 text-red-300">
                <LogOut className="size-4" />
              </span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
