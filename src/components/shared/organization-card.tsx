import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Organization } from "@/lib/types";
import { OrgVerificationBadge } from "@/components/shared/verification-badge";
import { CATEGORY_META } from "@/lib/category-meta";
import { initials } from "@/lib/utils/format";
import { Money } from "@/components/shared/money";

export function OrganizationCard({
  organization,
  fundsReceived = 0,
}: {
  organization: Organization;
  fundsReceived?: number;
}) {
  return (
    <Link
      href={`/organizations/${organization.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card trail-card-shadow transition-transform hover:-translate-y-0.5"
    >
      <div className="trail-gradient-bg flex h-28 items-center justify-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-background/90 font-heading text-lg font-semibold text-foreground shadow-sm">
          {initials(organization.name)}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold leading-snug text-foreground">{organization.name}</h3>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {organization.operatingCountry}
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{organization.mission}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {organization.category.slice(0, 2).map((c) => (
            <span key={c} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
              {CATEGORY_META[c].label}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Raised on GiveTrail</p>
            <Money amount={fundsReceived} currency={organization.baseCurrency} className="font-heading text-sm font-semibold" />
          </div>
          <OrgVerificationBadge status={organization.verificationStatus} className="px-2 py-0.5 text-[10px]" />
        </div>
      </div>
    </Link>
  );
}
