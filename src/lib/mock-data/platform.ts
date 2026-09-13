import type { AuditLogEntry, PlatformSettings } from "@/lib/types";

export const platformSettings: PlatformSettings = {
  platformFeePct: 0.01,
  supportedCurrencies: ["USD", "GBP", "EUR", "CAD", "AED", "PKR", "AUD"],
};

export const auditLog: AuditLogEntry[] = [
  {
    id: "audit-1",
    actorUserId: "u-admin-alex",
    action: "organization.verified",
    entityType: "organization",
    entityId: "org-horizon",
    createdAt: "2023-03-01T00:00:00Z",
  },
  {
    id: "audit-2",
    actorUserId: "u-admin-alex",
    action: "organization.status_changed",
    entityType: "organization",
    entityId: "org-alnoor",
    metadata: { from: "under_review", to: "additional_info_required" },
    createdAt: "2026-07-20T00:00:00Z",
  },
  {
    id: "audit-3",
    actorUserId: "u-org-maria",
    action: "expense.created",
    entityType: "expense",
    entityId: "exp-medsupplies-bulk",
    createdAt: "2026-05-15T00:00:00Z",
  },
  {
    id: "audit-4",
    actorUserId: "u-org-maria",
    action: "allocation.created",
    entityType: "expense",
    entityId: "exp-medsupplies-bulk",
    metadata: { totalAllocated: 480000 },
    createdAt: "2026-05-20T00:00:00Z",
  },
  {
    id: "audit-5",
    actorUserId: "u-donor-sarah",
    action: "donation.created",
    entityType: "donation",
    entityId: "don-hero-1",
    metadata: { grossAmount: 50000, currency: "USD" },
    createdAt: "2026-06-19T14:32:00Z",
  },
];
