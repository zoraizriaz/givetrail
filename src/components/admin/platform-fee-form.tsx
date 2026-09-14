"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updatePlatformFee } from "@/lib/actions/admin";
import { toast } from "sonner";

export function PlatformFeeForm({ initialFeePct }: { initialFeePct: number }) {
  const router = useRouter();
  const [fee, setFee] = useState(String(initialFeePct * 100));
  const [submitting, setSubmitting] = useState(false);

  async function save() {
    const pct = Number(fee) / 100;
    if (Number.isNaN(pct) || pct < 0 || pct > 0.2) {
      toast.error("Enter a platform fee between 0% and 20%.");
      return;
    }
    setSubmitting(true);
    try {
      await updatePlatformFee(pct);
      toast.success(`Platform fee updated to ${fee}%. New donations will reflect this rate.`);
      router.refresh();
    } catch {
      toast.error("Failed to update the platform fee.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-1.5 flex items-center gap-3">
      <Input value={fee} onChange={(e) => setFee(e.target.value.replace(/[^0-9.]/g, ""))} className="w-24" />
      <span className="text-sm text-muted-foreground">%</span>
      <Button onClick={save} disabled={submitting}>
        {submitting ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
