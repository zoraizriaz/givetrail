"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, UserRole } from "@/lib/types";

export interface DemoAccount {
  id: string;
  email: string;
  label: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: "u-donor-sarah", email: "sarah.bennett@gmail.com", label: "Sarah Bennett", description: "Individual donor" },
  { id: "u-corp-james", email: "james.okafor@brightfuture-corp.com", label: "James Okafor", description: "Corporate donor · Brightfuture Industries" },
  { id: "u-org-maria", email: "maria.santos@horizonhealth.org", label: "Maria Santos", description: "NGO admin · Horizon Health Alliance" },
  { id: "u-admin-alex", email: "alex.kim@givetrail.com", label: "Alex Kim", description: "GiveTrail admin" },
];

export const DEMO_PASSWORD = "GiveTrail#Demo2026";

interface CurrentUserContextValue {
  user: User | undefined;
  organizationId: string | undefined;
  companyId: string | undefined;
  logOut: () => void;
  isReady: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(undefined);

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);

  const loadProfile = useCallback(
    async (authUserId: string) => {
      const [{ data: profile }, { data: membership }, { data: corp }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", authUserId).maybeSingle(),
        supabase.from("organization_members").select("organization_id").eq("user_id", authUserId).maybeSingle(),
        supabase.from("corporate_profiles").select("company_id").eq("user_id", authUserId).maybeSingle(),
      ]);

      if (profile) {
        setUser({
          id: profile.id,
          fullName: profile.full_name,
          email: profile.email,
          role: profile.role as UserRole,
          avatarUrl: profile.avatar_url ?? undefined,
          createdAt: profile.created_at,
          accountActivated: profile.account_activated,
          countryCode: profile.country_code,
        });
      } else {
        setUser(undefined);
      }
      setOrganizationId(membership?.organization_id ?? undefined);
      setCompanyId(corp?.company_id ?? undefined);
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      if (session?.user) await loadProfile(session.user.id);
      if (active) setIsReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setUser(undefined);
        setOrganizationId(undefined);
        setCompanyId(undefined);
      }
      setIsReady(true);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const logOut = useCallback(() => {
    void supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo<CurrentUserContextValue>(
    () => ({ user, organizationId, companyId, logOut, isReady }),
    [user, organizationId, companyId, logOut, isReady]
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  return ctx;
}

export function dashboardHrefForRole(role: User["role"] | undefined): string {
  switch (role) {
    case "donor":
      return "/dashboard";
    case "corporate":
      return "/corporate";
    case "org_member":
      return "/org";
    case "admin":
      return "/admin";
    default:
      return "/login";
  }
}
