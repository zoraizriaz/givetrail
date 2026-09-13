"use client";

import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { LayoutDashboard, Megaphone, Receipt, GitBranch, ShieldCheck, FileBarChart, Settings } from "lucide-react";

const NAV: DashboardNavItem[] = [
  { href: "/org", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/org/campaigns", label: "Campaigns", icon: Megaphone, tourId: "nav-campaigns" },
  { href: "/org/expenses", label: "Expenses", icon: Receipt, tourId: "nav-expenses" },
  { href: "/org/allocations", label: "Allocations", icon: GitBranch, tourId: "nav-allocations" },
  { href: "/org/verification", label: "Verification", icon: ShieldCheck, tourId: "nav-verification" },
  { href: "/org/reports", label: "Reports", icon: FileBarChart, tourId: "nav-reports" },
  { href: "/org/settings", label: "Settings", icon: Settings },
];

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={NAV} sectionLabel="Organization">
      {children}
    </DashboardShell>
  );
}
