"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, HeartHandshake, ShieldCheck, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEMO_ACCOUNTS, dashboardHrefForRole, useCurrentUser } from "@/context/current-user-context";
import { getUserById } from "@/lib/data";

const ICONS: Record<string, typeof HeartHandshake> = {
  "u-donor-sarah": HeartHandshake,
  "u-corp-james": Building2,
  "u-org-maria": Users2,
  "u-admin-alex": ShieldCheck,
};

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUserId } = useCurrentUser();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function loginAs(id: string) {
    setCurrentUserId(id);
    const user = getUserById(id);
    router.push(dashboardHrefForRole(user?.role));
  }

  function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    const match = DEMO_ACCOUNTS.map((a) => getUserById(a.id)).find((u) => u?.email.toLowerCase() === email.trim().toLowerCase());
    if (!match) {
      setError("We couldn't find a demo account with that email. Try one of the accounts below instead.");
      return;
    }
    loginAs(match.id);
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 trail-card-shadow">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Log in to GiveTrail</h1>
      <p className="mt-1 text-sm text-muted-foreground">This preview uses demo accounts instead of real authentication.</p>

      <Tabs defaultValue="demo" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="demo">Demo accounts</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        <TabsContent value="demo" className="mt-5 space-y-2.5">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = ICONS[account.id] ?? HeartHandshake;
            return (
              <button
                key={account.id}
                onClick={() => loginAs(account.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-3.5 text-left transition-colors hover:border-primary hover:bg-accent/50"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{account.label}</p>
                  <p className="text-xs text-muted-foreground">{account.description}</p>
                </div>
              </button>
            );
          })}
        </TabsContent>
        <TabsContent value="email" className="mt-5">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah.bennett@gmail.com" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Continue
            </Button>
            <p className="text-xs text-muted-foreground">
              Try <span className="font-medium text-foreground">sarah.bennett@gmail.com</span> for the donor demo.
            </p>
          </form>
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to GiveTrail?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
