"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/auth-guards";
import type { OrgVerificationStatus } from "@/lib/types";

export async function updateOrgVerificationStatus(
  organizationId: string,
  status: OrgVerificationStatus,
  reviewerNote?: string
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: org } = await admin.from("organizations").select("verified_since").eq("id", organizationId).maybeSingle();
  if (!org) throw new Error("Organization not found");

  const orgUpdate: Record<string, unknown> = { verification_status: status };
  if (status === "verified" && !org.verified_since) orgUpdate.verified_since = new Date().toISOString();

  const [{ error: orgError }, { error: verError }] = await Promise.all([
    admin.from("organizations").update(orgUpdate).eq("id", organizationId),
    admin
      .from("organization_verifications")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        ...(reviewerNote ? { reviewer_note: reviewerNote } : {}),
      })
      .eq("organization_id", organizationId),
  ]);
  if (orgError || verError) throw new Error(`Failed to update verification status: ${orgError?.message ?? verError?.message}`);

  revalidatePath(`/admin/ngos/${organizationId}`);
  revalidatePath("/admin/ngos");
  revalidatePath("/admin");
}

export async function updatePlatformFee(feePct: number): Promise<void> {
  await requireAdmin();
  if (Number.isNaN(feePct) || feePct < 0 || feePct > 0.2) throw new Error("Platform fee must be between 0% and 20%");

  const admin = createAdminClient();
  const { error } = await admin.from("platform_settings").update({ platform_fee_pct: feePct }).eq("id", true);
  if (error) throw new Error(`Failed to update platform fee: ${error.message}`);

  revalidatePath("/admin/settings");
}
