import Link from "next/link";
import { listAllOrganizationsForAdmin } from "@/lib/ngo-data";
import { getOrgTransparency } from "@/lib/supabase-data";
import { OrgVerificationBadge } from "@/components/shared/verification-badge";
import { Money } from "@/components/shared/money";

export default async function AdminNgosPage() {
  const organizations = await listAllOrganizationsForAdmin();
  const transparencyByOrgId = new Map(
    await Promise.all(
      organizations.map(async (org) => [org.id, await getOrgTransparency(org.id, org.baseCurrency, org.allocationPolicy.programPct)] as const)
    )
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Organizations</h1>
      <p className="text-sm text-muted-foreground">Review verification requests and manage every organization on GiveTrail.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Funds received</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => {
              const transparency = transparencyByOrgId.get(org.id)!;
              return (
                <tr key={org.id} className="border-b border-border/70 last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/ngos/${org.id}`} className="font-medium text-foreground hover:underline">
                      {org.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{org.operatingCountry}</td>
                  <td className="px-4 py-3">
                    <Money amount={transparency.fundsReceived} currency={transparency.currency} />
                  </td>
                  <td className="px-4 py-3">
                    <OrgVerificationBadge status={org.verificationStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
