import type { Grant } from "@/lib/types";
import { toMinorUnits } from "@/lib/utils/currency";

export const grants: Grant[] = [
  {
    id: "grant-1",
    companyId: "c-brightfuture",
    organizationId: "org-horizon",
    campaignId: "camp-maternal-health",
    title: "Maternal Health Program Grant",
    currency: "USD",
    amount: toMinorUnits(250000),
    amountTransferred: toMinorUnits(250000),
    amountUtilized: toMinorUnits(4600),
    amountVerified: toMinorUnits(3750),
    status: "active",
    createdAt: "2026-01-20T00:00:00Z",
    budgetLines: [
      { id: "gbl-1", grantId: "grant-1", label: "Medical supplies", amount: toMinorUnits(80000) },
      { id: "gbl-2", grantId: "grant-1", label: "Community outreach", amount: toMinorUnits(60000) },
      { id: "gbl-3", grantId: "grant-1", label: "Transportation", amount: toMinorUnits(35000) },
      { id: "gbl-4", grantId: "grant-1", label: "Training", amount: toMinorUnits(40000) },
      { id: "gbl-5", grantId: "grant-1", label: "Monitoring", amount: toMinorUnits(35000) },
    ],
  },
  {
    id: "grant-2",
    companyId: "c-brightfuture",
    organizationId: "org-maple",
    campaignId: "camp-pediatric-nutrition",
    title: "Pediatric Nutrition Expansion Grant",
    currency: "CAD",
    amount: toMinorUnits(75000),
    amountTransferred: toMinorUnits(37500),
    amountUtilized: toMinorUnits(0),
    amountVerified: toMinorUnits(0),
    status: "pending_transfer",
    createdAt: "2026-08-25T00:00:00Z",
    budgetLines: [
      { id: "gbl-6", grantId: "grant-2", label: "Specialized nutrition formula", amount: toMinorUnits(45000) },
      { id: "gbl-7", grantId: "grant-2", label: "Dietitian support", amount: toMinorUnits(20000) },
      { id: "gbl-8", grantId: "grant-2", label: "Program monitoring", amount: toMinorUnits(10000) },
    ],
  },
];

export function getGrantById(id: string): Grant | undefined {
  return grants.find((g) => g.id === id);
}

export function getGrantsByCompany(companyId: string): Grant[] {
  return grants.filter((g) => g.companyId === companyId);
}

export function getGrantsByOrg(organizationId: string): Grant[] {
  return grants.filter((g) => g.organizationId === organizationId);
}
