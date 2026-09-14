"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateOrgVerificationStatus } from "@/lib/actions/admin";
import type { OrgVerificationStatus } from "@/lib/types";

export function VerificationActions({ organizationId, currentStatus }: { organizationId: string; currentStatus: OrgVerificationStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function updateStatus(status: OrgVerificationStatus) {
    setPending(true);
    try {
      await updateOrgVerificationStatus(organizationId, status);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button size="sm" disabled={pending || currentStatus === "verified"} onClick={() => updateStatus("verified")}>
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => updateStatus("additional_info_required")}>
        Request more info
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => updateStatus("rejected")}>
        Reject
      </Button>
      <Button size="sm" variant="outline" disabled={pending || currentStatus !== "verified"} onClick={() => updateStatus("suspended")}>
        Suspend
      </Button>
    </div>
  );
}
