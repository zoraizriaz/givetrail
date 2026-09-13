"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/context/current-user-context";
import { ALL_CURRENCIES } from "@/lib/utils/currency";
import { donorProfiles } from "@/lib/data";
import { EmptyState } from "@/components/shared/empty-state";
import { UserCog } from "lucide-react";

export default function DonorAccountPage() {
  const { user } = useCurrentUser();
  if (!user) return <EmptyState icon={UserCog} title="Log in to manage your account" />;

  const profile = donorProfiles.find((p) => p.userId === user.id);

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your GiveTrail profile and preferences.</p>

      <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 trail-card-shadow">
        <div className="space-y-1.5">
          <Label>Full name</Label>
          <Input defaultValue={user.fullName} />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input defaultValue={user.email} type="email" />
        </div>
        <div className="space-y-1.5">
          <Label>Preferred currency</Label>
          <Select defaultValue={profile?.preferredCurrency ?? "USD"}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button>Save changes</Button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Account created {new Date(user.createdAt).toLocaleDateString()} · {user.accountActivated ? "Active" : "Not yet activated"}
      </div>
    </div>
  );
}
