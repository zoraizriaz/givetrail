"use client";

import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { LayoutDashboard, Landmark, Receipt, Megaphone, Users, Settings } from "lucide-react";

const NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/ngos", label: "NGOs", icon: Landmark },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={NAV} sectionLabel="Admin">
      {children}
    </DashboardShell>
  );
}
