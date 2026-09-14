import Link from "next/link";
import { ChevronLeft, FileCheck, FileClock, FileX, Landmark } from "lucide-react";
import { getOrganizationById, getVerificationForOrg } from "@/lib/ngo-data";
import { getOrgTransparency } from "@/lib/supabase-data";
import { OrgVerificationBadge } from "@/components/shared/verification-badge";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import { VerificationActions } from "@/components/admin/verification-actions";

const DOC_STATUS_ICON = { accepted: FileCheck, pending: FileClock, rejected: FileX } as const;

export default async function AdminNgoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrganizationById(id);
  if (!org) return <EmptyState icon={Landmark} title="Organization not found" />;

  const [verification, transparency] = await Promise.all([
    getVerificationForOrg(id),
    getOrgTransparency(id, org.baseCurrency, org.allocationPolicy.programPct),
  ]);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/ngos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to organizations
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{org.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {org.operatingCountry} · {org.registrationNumber}
          </p>
        </div>
        <OrgVerificationBadge status={org.verificationStatus} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Funds received</p>
          <Money amount={transparency.fundsReceived} currency={transparency.currency} className="mt-1 block font-heading text-lg font-semibold text-foreground" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Documentation completeness</p>
          <p className="mt-1 font-heading text-lg font-semibold text-foreground">{(org.documentationCompletenessPct * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Representative</p>
          <p className="mt-1 text-sm font-medium text-foreground">{org.representativeName}</p>
          <p className="text-xs text-muted-foreground">{org.representativeTitle}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <h2 className="font-heading text-base font-semibold text-foreground">Submitted documents</h2>
        <div className="mt-4 space-y-2">
          {verification?.documents.map((doc) => {
            const Icon = DOC_STATUS_ICON[doc.status];
            return (
              <div key={doc.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4 text-muted-foreground" /> {doc.fileName}
                </span>
                <span className="text-xs capitalize text-muted-foreground">{doc.status}</span>
              </div>
            );
          })}
        </div>
        {verification?.reviewerNote && (
          <p className="mt-4 rounded-xl bg-muted p-3 text-xs text-muted-foreground">Reviewer note: {verification.reviewerNote}</p>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <h2 className="font-heading text-base font-semibold text-foreground">Review actions</h2>
        <VerificationActions organizationId={org.id} currentStatus={org.verificationStatus} />
      </div>
    </div>
  );
}
