"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Flame, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import UserMenu from "@/components/UserMenu";
import { UserProfile } from "@/types";
import NotificationCenter from "@/components/NotificationCenter";

interface NavbarProps {
  locale: string;
  t: {
    common: {
      preparation: string;
      challenges: string;
      logout: string;
    };
  };
  user?: UserProfile | null;
}

const Navbar = ({ locale, t, user }: NavbarProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/preparation",
      label: t.common.preparation,
      isActive: pathname === "/preparation" || pathname.startsWith("/preparation/"),
    },
    {
      href: "/challenges",
      label: t.common.challenges,
      isActive: pathname === "/challenges" || pathname.startsWith("/challenges/"),
    },
    {
      href: "/interview",
      label: "Interview",
      isActive: pathname === "/interview" || pathname.startsWith("/interview/"),
    },
  ];

  // Close mobile menu on Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[var(--surface-border)] backdrop-blur-md" style={{ background: "var(--navbar-bg)" }}>
      <nav className="flex justify-between items-center h-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/preparation" className="flex items-center gap-2 hover:opacity-80 transition-all">
            <Image src="/logo.svg" alt="MockMate Logo" width={32} height={28} />
            <h2 className="text-primary-100 dark:text-primary-100 font-bold text-xl uppercase tracking-wider">PrepWise</h2>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative pb-1 text-sm font-medium transition-all rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2 focus-visible:ring-offset-(--navbar-bg)",
                  item.isActive
                    ? "text-[var(--text-heading)]"
                    : "text-[var(--text-muted)] hover:text-primary-100"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-primary-100 transition-opacity",
                    item.isActive ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <div className="group relative hidden md:block">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--surface-border)] px-3 py-2" style={{ background: "var(--surface-overlay)" }}>
              <Flame className="size-4 text-[#f59e0b]" />
              <span className="text-sm font-semibold" style={{ color: "var(--text-heading)" }}>
                {user?.stats.currentStreak ?? 0}
              </span>
            </div>

            <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-[var(--surface-border)] px-3 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100" style={{ background: "var(--surface-card)", color: "var(--text-body)" }}>
              {user?.stats.currentStreak ?? 0} Streaks
            </div>
          </div>

          {/* <ThemeToggle /> */}
          <NotificationCenter />
          <UserMenu currentLocale={locale} user={user} />

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
            className="md:hidden flex size-9 items-center justify-center rounded-xl border border-[var(--surface-border)] text-[var(--text-body)] transition hover:border-primary-200/25 hover:bg-primary-200/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2 focus-visible:ring-offset-(--navbar-bg)"
            style={{ background: "var(--surface-overlay)" }}
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden border-t border-[var(--surface-border)] shadow-lg backdrop-blur-xl"
          style={{ background: "var(--menu-bg)" }}
        >
          <div className="flex flex-col gap-1 px-6 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2 focus-visible:ring-offset-(--navbar-bg)",
                  item.isActive
                    ? "bg-primary-100/10 text-primary-100"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-overlay-hover)] hover:text-[var(--text-heading)]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
