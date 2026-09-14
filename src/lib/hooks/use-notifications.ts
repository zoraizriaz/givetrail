"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";

function mapRow(row: {
  id: string;
  user_id: string;
  message: string;
  href: string | null;
  read: boolean;
  created_at: string;
}): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    message: row.message,
    href: row.href ?? undefined,
    read: row.read,
    createdAt: row.created_at,
  };
}

/** Live notifications for a signed-in user, newest first. */
export function useNotifications(userId: string | undefined) {
  const supabase = useMemo(() => createClient(), []);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setNotifications((data ?? []).map(mapRow));
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [supabase, userId]);

  return { notifications, isLoading };
}

/** Lightweight unread count for the header bell — same source, just a count. */
export function useUnreadNotificationCount(userId: string | undefined) {
  const { notifications } = useNotifications(userId);
  return notifications.filter((n) => !n.read).length;
}
