export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Demo content — for illustration only.</p>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          GiveTrail is designed to eventually handle sensitive financial and personal information responsibly. This
          prototype does not collect, store or transmit real personal data — form submissions are simulated locally in
          your browser.
        </p>
        <p>
          In production, GiveTrail would never expose full bank account numbers, full card details, beneficiary
          identities, or private internal receipts to donors. Role-based access controls would govern every view.
        </p>
      </div>
    </div>
  );
}
