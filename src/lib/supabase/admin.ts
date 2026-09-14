import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS entirely. Only ever import this
 * from Server Actions / Route Handlers, never from a Client Component or
 * anything that ships to the browser. Used for: trusted financial writes
 * (donations, payments, allocations), admin operations (creating auth users
 * for seeding, approving NGOs), and anything else that must not be
 * tamperable from the client.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
