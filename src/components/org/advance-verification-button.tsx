"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setExpenseVerificationLevel } from "@/lib/actions/ngo";
import { VERIFICATION_LEVEL_LABELS } from "@/lib/expense-category-meta";
import type { VerificationLevel } from "@/lib/types";

export function AdvanceVerificationButton({ expenseId, nextLevel }: { expenseId: string; nextLevel: VerificationLevel }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function advance() {
    setSubmitting(true);
    try {
      await setExpenseVerificationLevel(expenseId, nextLevel);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button size="sm" variant="outline" className="mt-4 w-full" onClick={advance} disabled={submitting}>
      {submitting ? "Updating…" : `Advance to ${VERIFICATION_LEVEL_LABELS[nextLevel]}`}
    </Button>
  );
}
