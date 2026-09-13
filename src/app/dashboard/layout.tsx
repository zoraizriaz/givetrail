"use client";

import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { LayoutDashboard, Bell, UserCog } from "lucide-react";

const NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/account", label: "Account", icon: UserCog },
];

export default function DonorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={NAV} sectionLabel="Donor">
      {children}
    </DashboardShell>
  );
}
