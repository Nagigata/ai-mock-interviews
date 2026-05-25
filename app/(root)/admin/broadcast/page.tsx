import type { Metadata } from "next";

import AdminBroadcast from "@/components/admin/AdminBroadcast";

export const metadata: Metadata = {
  title: "Admin broadcast",
};

export default function AdminBroadcastPage() {
  return <AdminBroadcast />;
}
