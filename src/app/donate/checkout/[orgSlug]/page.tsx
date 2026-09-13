"use client";

import { use } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrganizationBySlug, getCampaignsByOrg } from "@/lib/data";
import { applyRuntimeOverrides } from "@/lib/runtime-overrides";
import { useMounted } from "@/lib/use-mounted";
import { Landmark } from "lucide-react";

export default function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { orgSlug } = use(params);
  const { campaign } = use(searchParams);
  const mounted = useMounted();
  if (!mounted) return null;

  applyRuntimeOverrides();
  const organization = getOrganizationBySlug(orgSlug);

  if (!organization || organization.verificationStatus !== "verified") {
    return <EmptyState icon={Landmark} title="This organization can't accept donations yet" className="mx-auto mt-20 max-w-lg" />;
  }

  const campaigns = getCampaignsByOrg(organization.id).filter((c) => c.status === "active");

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
          <CheckoutForm organization={organization} campaigns={campaigns} preselectedCampaignId={campaign} />
        </div>
      </div>
    </div>
  );
}
