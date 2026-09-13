import { SectionEyebrow } from "@/components/shared/money";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionEyebrow>About</SectionEyebrow>
      <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">Every donation leaves a trail.</h1>
      <div className="mt-6 space-y-5 text-muted-foreground">
        <p>
          GiveTrail exists because giving and knowing shouldn&rsquo;t be two separate acts. Donors want to trust that
          their contribution reaches real programs and real people. Organizations want a modern way to prove it
          without drowning in spreadsheets and PDFs.
        </p>
        <p>
          We built GiveTrail as an allocation and reconciliation ledger for philanthropy: every donation is tracked
          from payment, through an organization&rsquo;s disclosed allocation policy, to a specific documented
          expenditure — with a clear, honest accounting of what can and can&rsquo;t be traced once funds are pooled.
        </p>
        <p>
          We don&rsquo;t claim to trace a single physical dollar to a single purchase. We do commit to showing donors,
          organizations and companies the same numbers, reconciled the same way, every time.
        </p>
      </div>
    </div>
  );
}
