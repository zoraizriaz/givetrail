export default function DisclosuresPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Donor Disclosures</h1>
      <p className="mt-2 text-sm text-muted-foreground">Demo content — for illustration only.</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>GiveTrail does not provide tax, legal or financial advice, and makes no representation about the tax-deductibility of any donation.</p>
        <p>
          &ldquo;GiveTrail Verified&rdquo; reflects GiveTrail&rsquo;s own review of an organization&rsquo;s
          documentation and is not a government endorsement, and not equivalent to any official regulatory
          certification (e.g. IRS determination) unless independently confirmed through the relevant authority.
        </p>
        <p>
          Once pooled with other donations, GiveTrail cannot claim that a specific physical dollar funded a specific
          purchase. Instead, contributions are reconciled against documented expenditures through an allocation
          ledger.
        </p>
      </div>
    </div>
  );
}
