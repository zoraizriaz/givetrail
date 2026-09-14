"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PENDING_STATUSES = new Set(["initiated", "processing"]);

/** Refreshes the page every few seconds while a Safepay payment is still pending confirmation. */
export function PaymentStatusPoller({ status }: { status: string | undefined }) {
  const router = useRouter();

  useEffect(() => {
    if (!status || !PENDING_STATUSES.has(status)) return;
    const interval = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(interval);
  }, [status, router]);

  return null;
}
