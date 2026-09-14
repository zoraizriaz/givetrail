"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { User, UserRole } from "@/lib/types";

const ROLE_LABEL: Record<UserRole, string> = {
  donor: "Individual Donor",
  corporate: "Corporate Donor",
  org_member: "NGO Admin",
  admin: "GiveTrail Admin",
};

const FILTERS: (UserRole | "all")[] = ["all", "donor", "corporate", "org_member", "admin"];

export function UsersTable({ users }: { users: User[] }) {
  const [filter, setFilter] = useState<UserRole | "all">("all");
  const filtered = useMemo(() => (filter === "all" ? users : users.filter((u) => u.role === filter)), [filter, users]);

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="rounded-full capitalize">
            {f === "all" ? "All" : ROLE_LABEL[f]}
          </Button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border/70 last:border-0 hover:bg-accent/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                      {initials(u.fullName)}
                    </span>
                    <span className="font-medium text-foreground">{u.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{ROLE_LABEL[u.role]}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.countryCode}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", u.accountActivated ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground")}>
                    {u.accountActivated ? "Active" : "Pending activation"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
