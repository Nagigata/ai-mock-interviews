"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";

const STORAGE_KEY = "admin-sidebar-collapsed";

const AdminShell = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const handleToggle = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-background"
      style={
        {
          "--admin-sidebar-width": collapsed ? "4.75rem" : "15rem",
        } as CSSProperties
      }
    >
      <AdminSidebar collapsed={collapsed} onToggle={handleToggle} />
      <main className="ml-[var(--admin-sidebar-width)] min-h-full px-8 pb-8 pt-4 transition-[margin] duration-300 ease-out sm:px-10 lg:px-12">
        {children}
      </main>
    </div>
  );
};

export default AdminShell;
