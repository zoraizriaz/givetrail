"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function DashboardShell({
  nav,
  sectionLabel,
  children,
}: {
  nav: DashboardNavItem[];
  sectionLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Logo markSize={26} />
          </Link>
          <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground sm:inline">
            {sectionLabel}
          </span>
        </div>
        <AccountMenu />
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-border bg-card/40 px-3 py-6 md:block">
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-foreground/75 hover:bg-accent"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-background/95 py-2 backdrop-blur-md md:hidden">
          {nav.slice(0, 5).map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("flex flex-col items-center gap-0.5 px-2 text-[10px]", active ? "text-primary" : "text-muted-foreground")}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 md:pb-10">{children}</main>
      </div>
    </div>
  );
}
