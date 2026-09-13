"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileUp, Landmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ALL_CURRENCIES } from "@/lib/utils/currency";
import { useCurrentUser } from "@/context/current-user-context";

const STEPS = ["Organization", "Representative", "Mission & Programs", "Banking & Documents", "Review"];

export default function NgoOnboardingPage() {
  const router = useRouter();
  const { setCurrentUserId } = useCurrentUser();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    orgName: "",
    orgType: "Nonprofit / NGO",
    country: "",
    registrationNumber: "",
    taxNumber: "",
    website: "",
    address: "",
    repName: "",
    repTitle: "",
    repEmail: "",
    repPhone: "",
    description: "",
    mission: "",
    operatingRegions: "",
    payoutCurrency: "USD",
    bankDetails: "",
    docsUploaded: false,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (submitted) {
    return (
      <div className="w-full max-w-lg rounded-3xl border border-border bg-background p-8 text-center trail-card-shadow">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-warning/15 text-warning">
          <Check className="size-6" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-semibold text-foreground">Application submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {form.orgName || "Your organization"}&rsquo;s verification status is now <strong className="text-foreground">Under Review</strong>. Our
          team typically reviews submissions within 3–5 business days. You&rsquo;ll be notified as soon as there&rsquo;s an update.
        </p>
        <Button
          className="mt-6 w-full"
          onClick={() => {
            setCurrentUserId("u-org-maria");
            router.push("/org/verification");
          }}
        >
          Preview NGO dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-border bg-background p-8 trail-card-shadow">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Register your organization</h1>
      <p className="mt-1 text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>

      <div className="mt-4 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {step === 0 && (
          <>
            <Field label="Organization name">
              <Input value={form.orgName} onChange={(e) => update("orgName", e.target.value)} placeholder="e.g. Bright Path Education Trust" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Organization type">
                <Input value={form.orgType} onChange={(e) => update("orgType", e.target.value)} />
              </Field>
              <Field label="Country">
                <Input value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="e.g. Kenya" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Registration number">
                <Input value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} />
              </Field>
              <Field label="Tax / charity number (if applicable)">
                <Input value={form.taxNumber} onChange={(e) => update("taxNumber", e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Website">
                <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
              </Field>
              <Field label="Registered address">
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
              </Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Authorized representative name">
                <Input value={form.repName} onChange={(e) => update("repName", e.target.value)} />
              </Field>
              <Field label="Representative title">
                <Input value={form.repTitle} onChange={(e) => update("repTitle", e.target.value)} placeholder="e.g. Executive Director" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Representative email">
                <Input type="email" value={form.repEmail} onChange={(e) => update("repEmail", e.target.value)} />
              </Field>
              <Field label="Representative phone">
                <Input value={form.repPhone} onChange={(e) => update("repPhone", e.target.value)} />
              </Field>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Mission statement">
              <Textarea value={form.mission} onChange={(e) => update("mission", e.target.value)} rows={3} />
            </Field>
            <Field label="Organization description">
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
            </Field>
            <Field label="Operating regions">
              <Input value={form.operatingRegions} onChange={(e) => update("operatingRegions", e.target.value)} placeholder="e.g. Kenya, Uganda" />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="Payout currency">
              <Select value={form.payoutCurrency} onValueChange={(v) => update("payoutCurrency", v)}>
                <SelectTrigger className="w-full">
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
            </Field>
            <Field label="Bank / payout account details">
              <Textarea value={form.bankDetails} onChange={(e) => update("bankDetails", e.target.value)} rows={2} placeholder="Bank name, account holder, account/IBAN number" />
            </Field>
            <div>
              <Label>Registration & authorization documents</Label>
              <button
                type="button"
                onClick={() => update("docsUploaded", !form.docsUploaded)}
                className={cn(
                  "mt-1.5 flex w-full items-center gap-3 rounded-xl border border-dashed p-4 text-left text-sm transition-colors",
                  form.docsUploaded ? "border-success bg-[color-mix(in_oklab,var(--success)_10%,var(--background))]" : "border-border hover:bg-accent/40"
                )}
              >
                {form.docsUploaded ? <Check className="size-4 text-success" /> : <FileUp className="size-4 text-muted-foreground" />}
                {form.docsUploaded
                  ? "3 documents attached (registration certificate, tax certificate, authorization letter)"
                  : "Click to attach registration certificate, tax certificate & proof of authorization"}
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <div className="space-y-3 text-sm">
            <SummaryRow label="Organization" value={form.orgName || "—"} />
            <SummaryRow label="Country" value={form.country || "—"} />
            <SummaryRow label="Representative" value={`${form.repName || "—"} (${form.repTitle || "—"})`} />
            <SummaryRow label="Payout currency" value={form.payoutCurrency} />
            <SummaryRow label="Documents" value={form.docsUploaded ? "Attached" : "Not attached"} />
            <div className="flex items-start gap-2.5 rounded-xl bg-muted p-4 text-xs text-muted-foreground">
              <Landmark className="mt-0.5 size-4 shrink-0" />
              Submitting sets your verification status to <strong className="text-foreground">Under Review</strong>. GiveTrail does not
              guarantee approval, and verification is not a government endorsement.
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>Continue</Button>
        ) : (
          <Button onClick={() => setSubmitted(true)}>Submit application</Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/70 pb-2.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
