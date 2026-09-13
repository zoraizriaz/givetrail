"use client";

import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";
import { LayoutDashboard, HandCoins, FileBarChart } from "lucide-react";

const NAV: DashboardNavItem[] = [
  { href: "/corporate", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/corporate/grants", label: "Grants", icon: HandCoins },
  { href: "/corporate/reports", label: "Reports", icon: FileBarChart },
];

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={NAV} sectionLabel="Corporate">
      {children}
    </DashboardShell>
  );
}
