"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/context/current-user-context";
import { createClient } from "@/lib/supabase/client";
import { createExpense } from "@/lib/actions/ngo";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/expense-category-meta";
import type { Campaign, Currency, ExpenseCategory } from "@/lib/types";

const CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

export default function NewExpensePage() {
  const router = useRouter();
  const { organizationId } = useCurrentUser();
  const [baseCurrency, setBaseCurrency] = useState<Currency>("USD");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!organizationId) return;
    const supabase = createClient();
    supabase
      .from("organizations")
      .select("base_currency")
      .eq("id", organizationId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setBaseCurrency(data.base_currency as Currency);
      });
    supabase
      .from("campaigns")
      .select("id, title")
      .eq("organization_id", organizationId)
      .then(({ data }) => {
        setCampaigns((data ?? []).map((c) => ({ id: c.id, title: c.title }) as Campaign));
      });
  }, [organizationId]);

  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [campaignId, setCampaignId] = useState<string>("none");
  const [category, setCategory] = useState<ExpenseCategory>("medical_supplies");
  const [description, setDescription] = useState("");
  const [donorSafeDescription, setDonorSafeDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank transfer");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [beneficiaryProtected, setBeneficiaryProtected] = useState(false);
  const [receiptAttached, setReceiptAttached] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!organizationId) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId || submitting) return;
    setSubmitting(true);
    try {
      const { expenseId } = await createExpense({
        organizationId,
        campaignId: campaignId === "none" ? undefined : campaignId,
        title,
        vendor,
        expenseDate: new Date(date).toISOString(),
        amountMajor: Number(amount) || 0,
        currency: baseCurrency,
        category,
        description,
        donorSafeDescription: donorSafeDescription || description,
        paymentMethod,
        referenceNumber,
        beneficiaryProtected,
        receiptAttached,
      });
      router.push(`/org/expenses/${expenseId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">New Expense</h1>
      <p className="mt-1 text-sm text-muted-foreground">Record an expenditure so it can be allocated and documented.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Expense title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Vendor</Label>
            <Input value={vendor} onChange={(e) => setVendor(e.target.value)} required />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Expense date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Amount ({baseCurrency})</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} required inputMode="decimal" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Program / campaign</Label>
            <Select value={campaignId} onValueChange={setCampaignId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General / unrestricted</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {EXPENSE_CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Internal description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} required />
        </div>
        <div className="space-y-1.5">
          <Label>Donor-safe description</Label>
          <Textarea
            value={donorSafeDescription}
            onChange={(e) => setDonorSafeDescription(e.target.value)}
            rows={2}
            placeholder="What donors will see — omit beneficiary names or identifying details"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Payment method</Label>
            <Input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Reference number</Label>
            <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={beneficiaryProtected} onCheckedChange={(v) => setBeneficiaryProtected(v === true)} />
          This expense involves an identifiable beneficiary — protect their identity in donor-facing views
        </label>

        <div>
          <Label>Receipt / invoice</Label>
          <button
            type="button"
            onClick={() => setReceiptAttached((v) => !v)}
            className={cn(
              "mt-1.5 flex w-full items-center gap-3 rounded-xl border border-dashed p-4 text-left text-sm transition-colors",
              receiptAttached ? "border-success bg-[color-mix(in_oklab,var(--success)_10%,var(--background))]" : "border-border hover:bg-accent/40"
            )}
          >
            {receiptAttached ? <Check className="size-4 text-success" /> : <FileUp className="size-4 text-muted-foreground" />}
            {receiptAttached ? "receipt.pdf attached — verification level set to Documented" : "Click to attach a receipt or invoice (optional)"}
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Saving…" : "Save expense"}
        </Button>
      </form>
    </div>
  );
}
