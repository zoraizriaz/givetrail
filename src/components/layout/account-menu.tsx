"use client";

import Link from "next/link";
import { Bell, ChevronDown, LayoutDashboard, LogOut, UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEMO_ACCOUNTS, dashboardHrefForRole, useCurrentUser } from "@/context/current-user-context";
import { initials } from "@/lib/utils/format";
import { getDonorNotifications } from "@/lib/data";

const ROLE_LABEL: Record<string, string> = {
  donor: "Individual donor",
  corporate: "Corporate donor",
  org_member: "NGO administrator",
  admin: "GiveTrail admin",
};

export function AccountMenu() {
  const { user, setCurrentUserId, logOut } = useCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Get started</Link>
        </Button>
      </div>
    );
  }

  const unreadCount = getDonorNotifications(user.id).filter((n) => !n.read).length;

  return (
    <div className="flex items-center gap-1.5">
      <Button asChild variant="ghost" size="icon" className="relative rounded-full">
        <Link href="/notifications" aria-label="Notifications">
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-primary" />
          )}
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 hover:bg-accent">
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initials(user.fullName)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{user.fullName.split(" ")[0]}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-medium">{user.fullName}</span>
            <span className="text-xs font-normal text-muted-foreground">{ROLE_LABEL[user.role]}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={dashboardHrefForRole(user.role)}>
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/notifications">
              <Bell className="size-4" /> Notifications
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Demo · switch account</DropdownMenuLabel>
          {DEMO_ACCOUNTS.map((account) => (
            <DropdownMenuItem key={account.id} onSelect={() => setCurrentUserId(account.id)} disabled={account.id === user.id}>
              <UserCircle2 className="size-4" />
              <span className="flex flex-col">
                <span>{account.label}</span>
                <span className="text-xs text-muted-foreground">{account.description}</span>
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => logOut()}>
            <LogOut className="size-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
