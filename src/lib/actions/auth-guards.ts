import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Throws unless the signed-in user is a member of `organizationId` or an admin. Returns the user id. */
export async function requireOrgAccess(organizationId: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "admin") return user.id;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!membership) throw new Error("Not a member of this organization");
  return user.id;
}

/** Throws unless the signed-in user is an admin. Returns the user id. */
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Admin access required");
  return user.id;
}
