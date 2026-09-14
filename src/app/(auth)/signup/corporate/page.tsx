"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DEMO_PASSWORD } from "@/context/current-user-context";
import { createClient } from "@/lib/supabase/client";

export default function CorporateSignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [submitted, setSubmitted] = useState(false);
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 text-center trail-card-shadow">
        <h1 className="font-heading text-xl font-semibold text-foreground">Thanks, {name.split(" ")[0] || "there"}.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A GiveTrail partnerships specialist will reach out to {email || "your email"} to set up {company || "your company"}&rsquo;s account.
          In the meantime, here&rsquo;s a preview of the corporate dashboard.
        </p>
        <Button
          className="mt-6 w-full"
          onClick={async () => {
            await supabase.auth.signInWithPassword({ email: "james.okafor@brightfuture-corp.com", password: DEMO_PASSWORD });
            router.push("/corporate");
            router.refresh();
          }}
        >
          Preview corporate dashboard
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-border bg-background p-8 trail-card-shadow">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Set up a corporate account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Tell us about your company — a GiveTrail specialist will follow up.</p>
      <div className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="company">Company name</Label>
          <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="work-email">Work email</Label>
          <Input id="work-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <Button type="submit" className="mt-6 w-full">
        Submit
      </Button>
    </form>
  );
}
