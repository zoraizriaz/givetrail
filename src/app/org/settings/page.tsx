import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getCurrentMemberships, getOrganizationById } from "@/lib/ngo-data";
import { createClient } from "@/lib/supabase/server";
import { AllocationPolicyBar } from "@/components/org/allocation-policy-bar";

export default async function OrgSettingsPage() {
  const { organizationId } = await getCurrentMemberships();
  if (!organizationId) return null;
  const org = await getOrganizationById(organizationId);
  if (!org) return null;

  const supabase = await createClient();
  const { data: settingsRow } = await supabase.from("platform_settings").select("platform_fee_pct").eq("id", true).maybeSingle();
  const platformFeePct = Number(settingsRow?.platform_fee_pct ?? 0.01);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Organization profile and payout information.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <h2 className="font-heading text-base font-semibold text-foreground">Organization profile</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Organization name</Label>
            <Input defaultValue={org.name} />
          </div>
          <div className="space-y-1.5">
            <Label>Mission</Label>
            <Textarea defaultValue={org.mission} rows={3} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input defaultValue={org.website} />
            </div>
            <div className="space-y-1.5">
              <Label>Representative email</Label>
              <Input defaultValue={org.representativeEmail} />
            </div>
          </div>
          <Button>Save changes</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <h2 className="font-heading text-base font-semibold text-foreground">Payout information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Base currency</p>
            <p className="font-medium text-foreground">{org.baseCurrency}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Payout currency</p>
            <p className="font-medium text-foreground">{org.payoutCurrency}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          In production, GiveTrail routes donations through regulated payment infrastructure directly to your connected
          payout account rather than holding funds in a GiveTrail operating account.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <h2 className="font-heading text-base font-semibold text-foreground">Disclosed allocation policy</h2>
        <p className="mt-1 text-xs text-muted-foreground">Shown to donors before they give. Contact GiveTrail support to update this.</p>
        <div className="mt-4">
          <AllocationPolicyBar policy={org.allocationPolicy} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Current GiveTrail platform fee: <span className="font-medium text-foreground">{(platformFeePct * 100).toFixed(1)}%</span> per
        donation, set by GiveTrail and shown to donors at checkout.
      </div>
    </div>
  );
}
