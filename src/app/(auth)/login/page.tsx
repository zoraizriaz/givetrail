"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, HeartHandshake, ShieldCheck, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, dashboardHrefForRole } from "@/context/current-user-context";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";

const ICONS: Record<string, typeof HeartHandshake> = {
  "u-donor-sarah": HeartHandshake,
  "u-corp-james": Building2,
  "u-org-maria": Users2,
  "u-admin-alex": ShieldCheck,
};

const ROLE_BY_DEMO_ID: Record<string, UserRole> = {
  "u-donor-sarah": "donor",
  "u-corp-james": "corporate",
  "u-org-maria": "org_member",
  "u-admin-alex": "admin",
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function signInWith(loginEmail: string, loginPassword: string, fallbackRole?: UserRole) {
    setSubmitting(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setSubmitting(false);
    if (signInError || !data.user) {
      setError(signInError?.message ?? "Couldn't sign in with those details.");
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    router.push(dashboardHrefForRole((profile?.role as UserRole | undefined) ?? fallbackRole));
    router.refresh();
  }

  function loginAsDemo(id: string) {
    const account = DEMO_ACCOUNTS.find((a) => a.id === id);
    if (!account) return;
    void signInWith(account.email, DEMO_PASSWORD, ROLE_BY_DEMO_ID[id]);
  }

  function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    void signInWith(email, password);
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 trail-card-shadow">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Log in to GiveTrail</h1>
      <p className="mt-1 text-sm text-muted-foreground">Use a demo account to explore, or sign in with your own.</p>

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
                disabled={submitting}
                onClick={() => loginAsDemo(account.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-3.5 text-left transition-colors hover:border-primary hover:bg-accent/50 disabled:opacity-60"
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
          {error && <p className="text-sm text-destructive">{error}</p>}
        </TabsContent>
        <TabsContent value="email" className="mt-5">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Continue"}
            </Button>
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
