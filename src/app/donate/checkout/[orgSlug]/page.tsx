import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { EmptyState } from "@/components/shared/empty-state";
import { getVerifiedOrganizationBySlug, getCampaignsForOrg } from "@/lib/supabase-data";
import { createClient } from "@/lib/supabase/server";
import { Landmark } from "lucide-react";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { orgSlug } = await params;
  const { campaign } = await searchParams;
  const organization = await getVerifiedOrganizationBySlug(orgSlug);

  if (!organization) {
    return <EmptyState icon={Landmark} title="This organization can't accept donations yet" className="mx-auto mt-20 max-w-lg" />;
  }

  const supabase = await createClient();
  const [campaigns, { data: settings }] = await Promise.all([
    getCampaignsForOrg(organization.id).then((all) => all.filter((c) => c.status === "active")),
    supabase.from("platform_settings").select("platform_fee_pct").eq("id", true).maybeSingle(),
  ]);
  const platformFeePct = Number(settings?.platform_fee_pct ?? 0.01);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/">
            <Logo markSize={26} />
          </Link>
          <Link href={`/organizations/${organization.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
            Cancel and return to profile
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Donating to</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">{organization.name}</h1>

        <div className="mt-10">
          <CheckoutForm organization={organization} campaigns={campaigns} preselectedCampaignId={campaign} platformFeePct={platformFeePct} />
        </div>
      </div>
    </div>
  );
}
