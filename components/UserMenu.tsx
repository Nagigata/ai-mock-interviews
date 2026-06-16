"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  ChevronDown,
  Globe2,
  History,
  LogOut,
  Settings,
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
    href: "/practice-history",
    label: "Practice History",
    icon: History,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

const UserMenu = ({ currentLocale, user }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open account menu"
        className="group flex items-center gap-3 rounded-2xl border border-[var(--surface-border)] px-2.5 py-1.5 transition-all hover:border-primary-200/25 hover:bg-primary-200/[0.07]"
        style={{ background: "var(--surface-overlay)" }}
      >
        <UserAvatar
          name={user?.name || "User"}
          avatarUrl={user?.avatarUrl}
          size="sm"
          className="shrink-0 shadow-none"
        />
        <span className="hidden min-w-0 flex-col items-start lg:flex">
          <span className="max-w-28 truncate text-sm font-bold" style={{ color: "var(--text-heading)" }}>
            {user?.name || "Account"}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
            {currentLanguage.short}
          </span>
        </span>
        <ChevronDown
          className={`size-4 transition-transform group-hover:text-primary-100 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-[26px] border border-[var(--surface-border)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
          style={{ background: "var(--menu-bg)", boxShadow: `0 24px 70px var(--shadow-heavy)` }}
        >
          <div className="relative overflow-hidden border-b border-[var(--surface-border)] px-4 py-4">
            <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-primary-200/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <UserAvatar
                name={user?.name || "User"}
                avatarUrl={user?.avatarUrl}
                size="md"
                className="shrink-0 shadow-none"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-bold" style={{ color: "var(--text-heading)" }}>
                  {user?.name || "User"}
                </p>
                <p className="truncate text-sm" style={{ color: "var(--text-muted)" }}>
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
                  className="group/item flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition"
                  style={{ color: "var(--text-body)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-overlay-hover)";
                    e.currentTarget.style.color = "var(--text-heading)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-body)";
                  }}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-[var(--surface-border)] transition group-hover/item:border-primary-200/20 group-hover/item:bg-primary-200/10 group-hover/item:text-primary-100" style={{ background: "var(--surface-overlay)", color: "var(--text-muted)" }}>
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
                className="group/item flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-300 transition hover:bg-amber-500/10"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/10 text-amber-700 dark:text-amber-300">
                  <Shield className="size-4" />
                </span>
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          <div className="border-t border-[var(--surface-border)] px-4 py-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
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
                      : "border-[var(--surface-border)] text-[var(--text-body)] hover:bg-[var(--surface-overlay-hover)]"
                  }`}
                  style={currentLocale !== language.code ? { background: "var(--surface-overlay)" } : undefined}
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

          <div className="border-t border-[var(--surface-border)] p-2">
            <button
              onClick={handleLogout}
              role="menuitem"
              className="group/item flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#f29a9a] transition hover:bg-[#ff6b6b]/10 hover:text-red-200"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-red-300/15 bg-red-300/10 text-red-700 dark:text-red-300">
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
