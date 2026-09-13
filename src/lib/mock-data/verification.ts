import type { OrganizationVerification, VerificationDocument, VerificationEvent } from "@/lib/types";

function docs(organizationId: string, items: { type: VerificationDocument["type"]; fileName: string; status: VerificationDocument["status"] }[]): VerificationDocument[] {
  return items.map((item, i) => ({
    id: `${organizationId}-doc-${i + 1}`,
    organizationId,
    type: item.type,
    fileName: item.fileName,
    uploadedAt: "2026-01-05T00:00:00Z",
    status: item.status,
  }));
}

export const organizationVerifications: OrganizationVerification[] = [
  {
    organizationId: "org-horizon",
    status: "verified",
    submittedAt: "2023-01-15T00:00:00Z",
    reviewedAt: "2023-03-01T00:00:00Z",
    reviewerNote: "All registration and tax-exemption documents verified. Approved for the health and children categories.",
    documents: docs("org-horizon", [
      { type: "registration_certificate", fileName: "hha-registration-certificate.pdf", status: "accepted" },
      { type: "tax_certificate", fileName: "hha-501c3-determination-letter.pdf", status: "accepted" },
      { type: "proof_of_authorization", fileName: "hha-board-resolution.pdf", status: "accepted" },
      { type: "annual_report", fileName: "hha-annual-report-2025.pdf", status: "accepted" },
    ]),
  },
  {
    organizationId: "org-brightpath",
    status: "verified",
    submittedAt: "2023-07-10T00:00:00Z",
    reviewedAt: "2023-09-14T00:00:00Z",
    reviewerNote: "Registration and FBR exemption confirmed with the Punjab Charity Commission.",
    documents: docs("org-brightpath", [
      { type: "registration_certificate", fileName: "bpe-ngo-registration.pdf", status: "accepted" },
      { type: "tax_certificate", fileName: "bpe-fbr-exemption.pdf", status: "accepted" },
      { type: "proof_of_authorization", fileName: "bpe-authorization-letter.pdf", status: "accepted" },
    ]),
  },
  {
    organizationId: "org-maple",
    status: "verified",
    submittedAt: "2024-03-02T00:00:00Z",
    reviewedAt: "2024-05-19T00:00:00Z",
    reviewerNote: "CRA charitable registration confirmed. Approved for the children and health categories.",
    documents: docs("org-maple", [
      { type: "registration_certificate", fileName: "mgf-cra-registration.pdf", status: "accepted" },
      { type: "tax_certificate", fileName: "mgf-cra-charitable-status.pdf", status: "accepted" },
      { type: "proof_of_authorization", fileName: "mgf-board-resolution.pdf", status: "accepted" },
      { type: "annual_report", fileName: "mgf-annual-report-2025.pdf", status: "accepted" },
    ]),
  },
  {
    organizationId: "org-clearwater",
    status: "under_review",
    submittedAt: "2026-08-28T00:00:00Z",
    documents: docs("org-clearwater", [
      { type: "registration_certificate", fileName: "cwr-uk-chc-registration.pdf", status: "pending" },
      { type: "proof_of_authorization", fileName: "cwr-authorization-letter.pdf", status: "pending" },
    ]),
  },
  {
    organizationId: "org-alnoor",
    status: "additional_info_required",
    submittedAt: "2026-07-02T00:00:00Z",
    reviewedAt: "2026-07-20T00:00:00Z",
    reviewerNote:
      "Registration certificate received. Please also submit proof of authorized banking signatory and your most recent annual report before verification can continue.",
    documents: docs("org-alnoor", [
      { type: "registration_certificate", fileName: "anc-registration-certificate.pdf", status: "accepted" },
      { type: "tax_certificate", fileName: "anc-tax-exemption.pdf", status: "pending" },
    ]),
  },
];

export function getVerificationForOrg(organizationId: string): OrganizationVerification | undefined {
  return organizationVerifications.find((v) => v.organizationId === organizationId);
}

export const verificationEvents: VerificationEvent[] = [
  {
    id: "vev-1",
    entityType: "expense",
    entityId: "exp-hero-diagnostic",
    fromLevel: "documented",
    toLevel: "program_verified",
    actorUserId: "u-org-maria",
    note: "Confirmed against clinic screening log and lab invoice.",
    createdAt: "2026-06-29T00:00:00Z",
  },
  {
    id: "vev-2",
    entityType: "expense",
    entityId: "exp-medsupplies-bulk",
    fromLevel: "documented",
    toLevel: "financially_verified",
    actorUserId: "u-org-maria",
    note: "Reconciled against bank statement for wire transfer to Eastgate Pharmaceuticals.",
    createdAt: "2026-05-20T00:00:00Z",
  },
  {
    id: "vev-3",
    entityType: "expense",
    entityId: "exp-teacher-stipends",
    fromLevel: "financially_verified",
    toLevel: "independently_verified",
    actorUserId: "u-org-omar",
    note: "Reviewed by an independent chartered accountant during the Q3 program audit.",
    createdAt: "2026-08-10T00:00:00Z",
  },
  {
    id: "vev-4",
    entityType: "organization",
    entityId: "org-horizon",
    toLevel: "verified",
    actorUserId: "u-admin-alex",
    note: "Full verification approved.",
    createdAt: "2023-03-01T00:00:00Z",
  },
  {
    id: "vev-5",
    entityType: "organization",
    entityId: "org-alnoor",
    fromLevel: "under_review",
    toLevel: "additional_info_required",
    actorUserId: "u-admin-alex",
    note: "Requested banking signatory proof and latest annual report.",
    createdAt: "2026-07-20T00:00:00Z",
  },
];

export function getVerificationEventsForEntity(entityType: VerificationEvent["entityType"], entityId: string): VerificationEvent[] {
  return verificationEvents.filter((v) => v.entityType === entityType && v.entityId === entityId);
}
