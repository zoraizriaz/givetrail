"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@/lib/types";
import { getUserById, getOrgForMember, getCompanyById, corporateProfiles } from "@/lib/data";
import { applyRuntimeOverrides } from "@/lib/runtime-overrides";

const STORAGE_KEY = "givetrail:currentUserId";
const LOGGED_OUT = "__logged_out__";

export interface DemoAccount {
  id: string;
  label: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: "u-donor-sarah", label: "Sarah Bennett", description: "Individual donor" },
  { id: "u-corp-james", label: "James Okafor", description: "Corporate donor · Brightfuture Industries" },
  { id: "u-org-maria", label: "Maria Santos", description: "NGO admin · Horizon Health Alliance" },
  { id: "u-admin-alex", label: "Alex Kim", description: "GiveTrail admin" },
];

interface CurrentUserContextValue {
  user: User | undefined;
  organizationId: string | undefined;
  companyId: string | undefined;
  setCurrentUserId: (id: string) => void;
  logOut: () => void;
  isReady: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(undefined);

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>(LOGGED_OUT);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      applyRuntimeOverrides();
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setUserId(stored);
    } catch {
      // localStorage unavailable — fall back to logged out.
    }
    setIsReady(true);
  }, []);

  const persist = useCallback((id: string) => {
    setUserId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const setCurrentUserId = useCallback((id: string) => persist(id), [persist]);
  const logOut = useCallback(() => persist(LOGGED_OUT), [persist]);

  const value = useMemo<CurrentUserContextValue>(() => {
    const user = userId === LOGGED_OUT ? undefined : getUserById(userId);
    const organizationId = user?.role === "org_member" ? getOrgForMember(user.id)?.id : undefined;
    const companyId = user?.role === "corporate" ? corporateProfiles.find((p) => p.userId === user.id)?.companyId : undefined;
    return { user, organizationId, companyId, setCurrentUserId, logOut, isReady };
  }, [userId, setCurrentUserId, logOut, isReady]);

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  return ctx;
}

export function useCurrentCompany() {
  const { companyId } = useCurrentUser();
  return companyId ? getCompanyById(companyId) : undefined;
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
