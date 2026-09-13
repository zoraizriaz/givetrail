"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { platformSettings } from "@/lib/data";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [fee, setFee] = useState(String(platformSettings.platformFeePct * 100));

  function save() {
    const pct = Number(fee) / 100;
    if (Number.isNaN(pct) || pct < 0 || pct > 0.2) {
      toast.error("Enter a platform fee between 0% and 20%.");
      return;
    }
    platformSettings.platformFeePct = pct;
    toast.success(`Platform fee updated to ${fee}%. New donations will reflect this rate.`);
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Platform Settings</h1>
      <p className="text-sm text-muted-foreground">Configure GiveTrail-wide defaults.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <Label>GiveTrail platform fee</Label>
        <div className="mt-1.5 flex items-center gap-3">
          <Input value={fee} onChange={(e) => setFee(e.target.value.replace(/[^0-9.]/g, ""))} className="w-24" />
          <span className="text-sm text-muted-foreground">%</span>
          <Button onClick={save}>Save</Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Applied to every new donation at checkout and always shown transparently to donors before they give.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Supported currencies: {platformSettings.supportedCurrencies.join(", ")}
      </div>
    </div>
  );
}
