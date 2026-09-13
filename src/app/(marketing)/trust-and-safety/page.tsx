import { SectionEyebrow } from "@/components/shared/money";
import { VerificationLevelBadge } from "@/components/shared/verification-badge";
import type { VerificationLevel } from "@/lib/types";

const LEVELS: { level: VerificationLevel; body: string }[] = [
  { level: "declared", body: "The organization entered the expenditure. No supporting document yet." },
  { level: "documented", body: "A receipt or invoice has been uploaded." },
  { level: "financially_verified", body: "The payment or bank transaction has been reconciled against records." },
  { level: "program_verified", body: "Evidence of program delivery or use has been supplied." },
  { level: "independently_verified", body: "An authorized auditor, accountant or third party has verified it." },
];

export default function TrustAndSafetyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionEyebrow>Trust & Safety</SectionEyebrow>
      <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">How we protect trust on GiveTrail</h1>

      <section className="mt-10">
        <h2 className="font-heading text-xl font-semibold text-foreground">Verification levels</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every expenditure carries one of five verification levels. We never mark something verified beyond what the
          underlying evidence supports.
        </p>
        <div className="mt-5 space-y-3">
          {LEVELS.map((l) => (
            <div key={l.level} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <VerificationLevelBadge level={l.level} variant="full" className="shrink-0" />
              <p className="text-sm text-muted-foreground">{l.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-xl font-semibold text-foreground">Beneficiary privacy</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Organizations control what donors can see. Internal records may include vendor details, bank references and
          beneficiary information. Donor-facing records show only what's needed to understand impact — for example,
          &ldquo;Medication Assistance — $400, Beneficiary: Protected&rdquo; rather than any identifying details.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-xl font-semibold text-foreground">What GiveTrail verification means — and doesn't</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>✓ Registration and tax documentation reviewed by GiveTrail</li>
          <li>✓ Financial reconciliation practices in place</li>
          <li>✗ Not a government endorsement</li>
          <li>✗ Not a guarantee of program outcomes</li>
          <li>✗ Not a claim that a single physical dollar can be traced to a single purchase</li>
        </ul>
      </section>
    </div>
  );
}
