"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Money } from "@/components/shared/money";
import { ALL_CURRENCIES } from "@/lib/utils/currency";
import { buildDonationFinancials, DEFAULT_PLATFORM_FEE_PCT } from "@/lib/mock-data/helpers";
import { createDonation } from "@/lib/actions/donations";
import { previewSettlement } from "@/lib/actions/fx";
import { useCurrentUser } from "@/context/current-user-context";
import type { Campaign, Currency, Organization } from "@/lib/types";

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

export function CheckoutForm({
  organization,
  campaigns,
  preselectedCampaignId,
  platformFeePct = DEFAULT_PLATFORM_FEE_PCT,
}: {
  organization: Organization;
  campaigns: Campaign[];
  preselectedCampaignId?: string;
  platformFeePct?: number;
}) {
  const { user } = useCurrentUser();

  const [designationId, setDesignationId] = useState<string>(preselectedCampaignId ?? "general");
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>(organization.baseCurrency);
  const [name, setName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [settlement, setSettlement] = useState<{ settlementCurrency: "PKR" | "USD"; settlementAmount: number; rate: number } | null>(null);

  const effectiveAmount = customAmount ? Number(customAmount) || 0 : amount;

  useEffect(() => {
    let active = true;
    if (!effectiveAmount) {
      setSettlement(null);
      return;
    }
    const timeout = setTimeout(() => {
      previewSettlement(effectiveAmount, currency).then((result) => {
        if (active) setSettlement(result);
      });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [effectiveAmount, currency]);

  const chargeCurrency = settlement?.settlementCurrency ?? currency;
  const chargeAmount = settlement?.settlementAmount ?? effectiveAmount;
  const financials = useMemo(() => buildDonationFinancials(chargeAmount || 0, "card", platformFeePct), [chargeAmount, platformFeePct]);

  const selectedCampaign = campaigns.find((c) => c.id === designationId);
  const canSubmit = effectiveAmount > 0 && name.trim().length > 1 && /\S+@\S+\.\S+/.test(email);

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const { checkoutUrl } = await createDonation({
        organizationId: organization.id,
        organizationSlug: organization.slug,
        designation: selectedCampaign ? { type: "campaign", campaignId: selectedCampaign.id } : { type: "general_fund" },
        donorName: name,
        donorEmail: email,
        grossMajor: effectiveAmount,
        currency,
        isAnonymous,
      });
      window.location.href = checkoutUrl;
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8">
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">Where should this go?</h2>
          <RadioGroup value={designationId} onValueChange={setDesignationId} className="mt-3 space-y-2">
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                designationId === "general" ? "border-primary bg-accent/60" : "border-border"
              )}
            >
              <RadioGroupItem value="general" />
              <div>
                <p className="text-sm font-medium text-foreground">General / Unrestricted Fund</p>
                <p className="text-xs text-muted-foreground">{organization.name} directs this where it&rsquo;s needed most.</p>
              </div>
            </label>
            {campaigns.map((c) => (
              <label
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                  designationId === c.id ? "border-primary bg-accent/60" : "border-border"
                )}
              >
                <RadioGroupItem value={c.id} />
                <div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.location}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">Donation amount</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={!customAmount && amount === preset ? "default" : "outline"}
                onClick={() => {
                  setAmount(preset);
                  setCustomAmount("");
                }}
                className="rounded-full"
              >
                {preset}
              </Button>
            ))}
            <Input
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="Custom amount"
              className="w-40"
              inputMode="decimal"
            />
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {settlement && settlement.settlementCurrency !== currency && (
            <p className="mt-2 text-xs text-muted-foreground">
              Charged as <span className="font-medium text-foreground">{settlement.settlementCurrency} {settlement.settlementAmount.toFixed(2)}</span> via
              our payment processor (1 {currency} ≈ {settlement.rate.toFixed(2)} {settlement.settlementCurrency}). Your Giving Trail will always
              show the {currency} amount you gave.
            </p>
          )}
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">Payment</h2>
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-border p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Pay securely via Safepay</p>
              <p className="text-xs text-muted-foreground">
                You&rsquo;ll enter your card details on Safepay&rsquo;s secure checkout page — GiveTrail never sees or stores them.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">Your information</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="donor-name">Full name</Label>
              <Input id="donor-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="donor-email">Email</Label>
              <Input id="donor-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={isAnonymous} onCheckedChange={(v) => setIsAnonymous(v === true)} />
            Give anonymously (hide my name from the public campaign page)
          </label>
          {!user && (
            <p className="mt-2 text-xs text-muted-foreground">
              No account needed to give. After your donation, you&rsquo;ll be able to activate an account to track it.
            </p>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-card p-6 trail-card-shadow lg:sticky lg:top-24">
        <h3 className="font-heading text-base font-semibold text-foreground">Summary</h3>
        <div className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Donation amount</span>
            <Money amount={financials.grossAmount} currency={chargeCurrency} className="font-medium text-foreground" />
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>GiveTrail fee ({(financials.platformFeePct * 100).toFixed(0)}%)</span>
            <span>
              −<Money amount={financials.platformFee} currency={chargeCurrency} />
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Payment processing</span>
            <span>
              −<Money amount={financials.paymentProcessingFee} currency={chargeCurrency} />
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2.5 font-medium text-foreground">
            <span>Total charged</span>
            <Money amount={financials.grossAmount} currency={chargeCurrency} />
          </div>
          <div className="flex justify-between rounded-lg bg-accent px-3 py-2.5 font-medium text-accent-foreground">
            <span>Est. net to organization</span>
            <Money amount={financials.amountReceivedByOrg} currency={chargeCurrency} />
          </div>
        </div>
        <Button size="lg" className="mt-6 w-full" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {submitting ? "Redirecting to Safepay…" : `Donate ${currency} ${effectiveAmount || 0}`}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">The GiveTrail fee is never hidden — it funds verification and platform operations.</p>
      </aside>
    </div>
  );
}
