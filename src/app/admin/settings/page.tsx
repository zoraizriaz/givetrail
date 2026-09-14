import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { PlatformFeeForm } from "@/components/admin/platform-fee-form";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("platform_settings").select("platform_fee_pct, supported_currencies").eq("id", true).maybeSingle();
  const platformFeePct = Number(settings?.platform_fee_pct ?? 0.01);
  const supportedCurrencies = (settings?.supported_currencies as string[] | undefined) ?? [];

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Platform Settings</h1>
      <p className="text-sm text-muted-foreground">Configure GiveTrail-wide defaults.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <Label>GiveTrail platform fee</Label>
        <PlatformFeeForm initialFeePct={platformFeePct} />
        <p className="mt-3 text-xs text-muted-foreground">
          Applied to every new donation at checkout and always shown transparently to donors before they give.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Supported currencies: {supportedCurrencies.join(", ")}
      </div>
    </div>
  );
}
