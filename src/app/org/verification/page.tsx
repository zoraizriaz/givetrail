"use client";

import { AlertTriangle, FileCheck, FileClock, FileX } from "lucide-react";
import { useCurrentUser } from "@/context/current-user-context";
import { getOrganizationById, getVerificationForOrg } from "@/lib/data";
import { OrgVerificationBadge } from "@/components/shared/verification-badge";
import { formatDate } from "@/lib/utils/format";
import { PageTour } from "@/components/tour/page-tour";
import { orgVerificationTourSteps } from "@/components/tour/steps";

const DOC_STATUS_ICON = { accepted: FileCheck, pending: FileClock, rejected: FileX } as const;

export default function OrgVerificationPage() {
  const { organizationId } = useCurrentUser();
  if (!organizationId) return null;
  const org = getOrganizationById(organizationId)!;
  const verification = getVerificationForOrg(organizationId);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between" data-tour="org-verification-status">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Verification</h1>
        <OrgVerificationBadge status={org.verificationStatus} />
      </div>

      {org.verificationStatus === "additional_info_required" && verification?.reviewerNote && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-warning/30 bg-[color-mix(in_oklab,var(--warning)_10%,var(--background))] p-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-foreground">Additional information required</p>
            <p className="mt-1 text-sm text-muted-foreground">{verification.reviewerNote}</p>
          </div>
        </div>
      )}

      {org.verificationStatus === "verified" && (
        <div className="mt-6 rounded-2xl border border-success/30 bg-[color-mix(in_oklab,var(--success)_10%,var(--background))] p-5 text-sm text-muted-foreground">
          Verified since {org.verifiedSince ? formatDate(org.verifiedSince) : "—"}.{" "}
          {verification?.reviewerNote}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 trail-card-shadow" data-tour="org-verification-docs">
        <h2 className="font-heading text-base font-semibold text-foreground">Submitted documents</h2>
        <div className="mt-4 space-y-3">
          {verification?.documents.length ? (
            verification.documents.map((doc) => {
              const Icon = DOC_STATUS_ICON[doc.status];
              return (
                <div key={doc.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{doc.fileName}</p>
                      <p className="text-xs capitalize text-muted-foreground">{doc.type.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                  <span className="text-xs capitalize text-muted-foreground">{doc.status}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No documents submitted yet.</p>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        GiveTrail verification confirms registration documentation and financial reconciliation practices. It is not a
        government endorsement.
      </p>
      <PageTour tourId="org-verification" steps={orgVerificationTourSteps} />
    </div>
  );
}
