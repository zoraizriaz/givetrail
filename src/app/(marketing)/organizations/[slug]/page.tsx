"use client";

import { use } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Globe, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Money } from "@/components/shared/money";
import { OrgVerificationBadge } from "@/components/shared/verification-badge";
import { CampaignCard } from "@/components/shared/campaign-card";
import { ExpenditureRow } from "@/components/shared/expenditure-row";
import { EmptyState } from "@/components/shared/empty-state";
import { AllocationPolicyBar } from "@/components/org/allocation-policy-bar";
import { CATEGORY_META } from "@/lib/category-meta";
import { initials } from "@/lib/utils/format";
import { getOrgPublicProfile } from "@/lib/data";
import { applyRuntimeOverrides } from "@/lib/runtime-overrides";
import { useMounted } from "@/lib/use-mounted";
import { PageTour } from "@/components/tour/page-tour";
import { orgProfileTourSteps } from "@/components/tour/steps";
import { Landmark } from "lucide-react";

export default function OrganizationProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const mounted = useMounted();
  if (!mounted) return null;

  applyRuntimeOverrides();
  const profile = getOrgPublicProfile(slug);
  if (!profile) {
    return <EmptyState icon={Landmark} title="Organization not found" className="mx-auto mt-20 max-w-lg" />;
  }

  const { organization, campaigns, transparency, recentExpenditures } = profile;
  const isVerified = organization.verificationStatus === "verified";
  const documentedPct = transparency.allocatedToPrograms > 0 ? transparency.documentedExpenditure / transparency.allocatedToPrograms : 0;

  return (
    <div>
      <div className="trail-gradient-bg border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-background font-heading text-2xl font-semibold text-foreground shadow-sm">
                {initials(organization.name)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">{organization.name}</h1>
                  <OrgVerificationBadge status={organization.verificationStatus} />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {organization.operatingCountry}</span>
                  <a href={organization.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                    <Globe className="size-3.5" /> Website
                  </a>
                  <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {transparency.donorCount} donors</span>
                </div>
              </div>
            </div>
            {isVerified ? (
              <Button asChild size="lg" className="shrink-0" data-tour="org-profile-donate">
                <Link href={`/donate/checkout/${organization.slug}`}>Donate to {organization.name.split(" ")[0]}</Link>
              </Button>
            ) : (
              <Button size="lg" disabled className="shrink-0">
                Donations open once verified
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!isVerified && (
          <div className="mb-10 flex items-start gap-3 rounded-2xl border border-warning/30 bg-[color-mix(in_oklab,var(--warning)_10%,var(--background))] p-5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">This organization&rsquo;s verification is in progress</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {organization.name} has not yet completed GiveTrail&rsquo;s verification process, so it cannot accept public
                donations. The profile below is shown for reference only.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">Mission</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{organization.mission}</p>
              <p className="mt-3 leading-relaxed text-muted-foreground">{organization.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {organization.category.map((c) => {
                  const meta = CATEGORY_META[c];
                  return (
                    <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                      <meta.icon className="size-3.5" /> {meta.label}
                    </span>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span>Operating regions: {organization.operatingRegions.join(", ")}</span>
              </div>
            </section>

            <section className="mt-12">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold text-foreground">Programs & Campaigns</h2>
              </div>
              {campaigns.length === 0 ? (
                <EmptyState className="mt-4" title="No campaigns yet" description="This organization hasn't published a campaign yet." />
              ) : (
                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  {campaigns.map((c) => (
                    <CampaignCard key={c.id} campaign={c} />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-12">
              <h2 className="font-heading text-xl font-semibold text-foreground">Recent Verified Expenditures</h2>
              {recentExpenditures.length === 0 ? (
                <EmptyState className="mt-4" title="No documented expenditures yet" description="Once this organization records and documents expenses, they'll appear here." />
              ) : (
                <div className="mt-4 rounded-2xl border border-border bg-card p-2 px-5">
                  {recentExpenditures.map((e) => (
                    <ExpenditureRow key={e.id} expense={e} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow" data-tour="org-profile-transparency">
              <h3 className="font-heading text-base font-semibold text-foreground">Transparency</h3>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Funds received", value: transparency.fundsReceived },
                  { label: "Allocated to programs", value: transparency.allocatedToPrograms },
                  { label: "Documented expenditure", value: transparency.documentedExpenditure },
                  { label: "Awaiting documentation", value: transparency.awaitingDocumentation },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <Money amount={row.value} currency={transparency.currency} className="font-semibold text-foreground" />
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Documentation completeness</span>
                  <span>{(documentedPct * 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(100, documentedPct * 100)} className="mt-2" />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow" data-tour="org-profile-allocation-policy">
              <h3 className="font-heading text-base font-semibold text-foreground">How funds are allocated</h3>
              <p className="mt-1 text-xs text-muted-foreground">Disclosed by {organization.name}, shown before you donate.</p>
              <div className="mt-4">
                <AllocationPolicyBar policy={organization.allocationPolicy} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 trail-card-shadow text-sm text-muted-foreground">
              <h3 className="font-heading text-base font-semibold text-foreground">Organization details</h3>
              <dl className="mt-4 space-y-2.5">
                <div className="flex justify-between gap-4">
                  <dt>Legal entity country</dt>
                  <dd className="text-right text-foreground">{organization.legalEntityCountry}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Registration number</dt>
                  <dd className="text-right text-foreground">{organization.registrationNumber}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Base currency</dt>
                  <dd className="text-right text-foreground">{organization.baseCurrency}</dd>
                </div>
                {organization.verifiedSince && (
                  <div className="flex justify-between gap-4">
                    <dt>Verified since</dt>
                    <dd className="text-right text-foreground">{new Date(organization.verifiedSince).getFullYear()}</dd>
                  </div>
                )}
              </dl>
            </div>

            {isVerified && (
              <Button asChild size="lg" className="w-full gap-2">
                <Link href={`/donate/checkout/${organization.slug}`}>
                  Donate now <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </aside>
        </div>
      </div>
      <PageTour tourId="org-profile" steps={orgProfileTourSteps} />
    </div>
  );
}
