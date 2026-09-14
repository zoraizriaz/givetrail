"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { useCurrentUser } from "@/context/current-user-context";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { user, isReady } = useCurrentUser();

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Logo markSize={26} />
        </Link>
        <AccountMenu />
      </header>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Notifications</h1>

        {!user ? (
          <EmptyState className="mt-8" icon={Bell} title="Log in to see your notifications" />
        ) : (
          <NotificationsList userId={user.id} />
        )}
      </div>
    </div>
  );
}

function NotificationsList({ userId }: { userId: string }) {
  const { notifications, isLoading } = useNotifications(userId);

  if (isLoading) return null;

  if (notifications.length === 0) {
    return <EmptyState className="mt-8" icon={Bell} title="You're all caught up" description="New updates about your donations will appear here." />;
  }

  return (
    <div className="mt-6 space-y-2">
      {notifications.map((n) => {
        const content = (
          <div
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 transition-colors",
              n.read ? "border-border bg-card" : "border-primary/30 bg-accent/50"
            )}
          >
            {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
            <div className={n.read ? "pl-5" : ""}>
              <p className="text-sm text-foreground">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
            </div>
          </div>
        );
        return n.href ? (
          <Link key={n.id} href={n.href}>
            {content}
          </Link>
        ) : (
          <div key={n.id}>{content}</div>
        );
      })}
    </div>
  );
}
