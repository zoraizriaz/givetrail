import { SectionEyebrow } from "@/components/shared/money";
import { platformSettings } from "@/lib/data";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionEyebrow>Platform Fee</SectionEyebrow>
      <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">Simple, visible pricing</h1>
      <p className="mt-4 text-muted-foreground">
        GiveTrail charges a platform fee of <strong className="text-foreground">{(platformSettings.platformFeePct * 100).toFixed(1)}%</strong> on
        each donation. It funds verification, allocation tooling and platform operations — and it&rsquo;s always shown
        before you confirm a donation, never bundled in silently.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
          <p className="font-heading text-2xl font-semibold text-foreground">{(platformSettings.platformFeePct * 100).toFixed(1)}%</p>
          <p className="mt-1 text-sm text-muted-foreground">GiveTrail platform fee, shown at checkout</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
          <p className="font-heading text-2xl font-semibold text-foreground">Varies</p>
          <p className="mt-1 text-sm text-muted-foreground">Payment processing cost, by payment method</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow">
          <p className="font-heading text-2xl font-semibold text-foreground">Free</p>
          <p className="mt-1 text-sm text-muted-foreground">For organizations to register and get verified</p>
        </div>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        We never claim &ldquo;100% of your donation goes to the cause.&rdquo; Instead, we show you precisely what
        reaches the organization, down to the cent, before you give.
      </p>
    </div>
  );
}
