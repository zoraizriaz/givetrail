"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { postCampaignUpdate } from "@/lib/actions/ngo";

export function PostCampaignUpdateForm({ campaignId, organizationId }: { campaignId: string; organizationId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function postUpdate() {
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    try {
      await postCampaignUpdate(campaignId, organizationId, draft);
      setDraft("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 rounded-2xl border border-border bg-card p-5">
      <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Share progress with your donors…" rows={3} />
      <Button className="mt-3" onClick={postUpdate} disabled={!draft.trim() || submitting}>
        {submitting ? "Posting…" : "Post update"}
      </Button>
    </div>
  );
}
