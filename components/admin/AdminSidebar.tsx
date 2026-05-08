"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Code2,
  Layers,
  ScrollText,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/interviews", label: "Interviews", icon: MessageSquare },
  { href: "/admin/challenges", label: "Challenges", icon: Code2 },
  { href: "/admin/skills", label: "Skills", icon: Layers },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-16 z-40 flex w-[var(--admin-sidebar-width)] flex-col border-r border-white/10 bg-dark-100/95 backdrop-blur-md transition-[width] duration-300 ease-out">
      <div
        className={cn(
          "flex items-center border-b border-white/10 p-5",
          collapsed ? "justify-center px-3" : "justify-between",
        )}
      >
        {!collapsed && (
          <div>
            <h2 className="text-lg font-bold tracking-wide text-primary-200">
              Admin Panel
            </h2>
            <p className="mt-0.5 text-xs text-light-400">System Management</p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-xl border border-white/10 p-2 text-light-400 transition-colors hover:bg-white/5 hover:text-white"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {sidebarItems.map((item) => {
          const isActive =
            (item.href === "/admin" && pathname === "/admin") ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-primary-200/15 text-primary-200 shadow-[0_0_12px_rgba(202,197,254,0.08)]"
                  : "text-light-400 hover:text-light-100 hover:bg-white/5"
              )}
            >
              <Icon className={cn("size-[18px]", isActive && "text-primary-200")} />
              {!collapsed && item.label}
              {isActive && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-200" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/preparation"
          title={collapsed ? "Back to App" : undefined}
          className={cn(
            "flex items-center rounded-xl py-2.5 text-sm text-light-400 transition-colors hover:bg-white/5 hover:text-white",
            collapsed ? "justify-center px-0" : "gap-2 px-3",
          )}
        >
          <ArrowLeft className="size-4" />
          {!collapsed && "Back to App"}
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
