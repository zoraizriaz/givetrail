export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Demo content — for illustration only.</p>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          This is a prototype of the GiveTrail platform. No real financial transactions occur, and no organizations
          shown are actually verified by GiveTrail in the real world.
        </p>
        <p>
          In a production deployment, this page would contain the full terms governing donor accounts, organization
          accounts, corporate accounts, platform fees, and the allocation and reconciliation methodology described
          throughout the product.
        </p>
      </div>
    </div>
  );
}
