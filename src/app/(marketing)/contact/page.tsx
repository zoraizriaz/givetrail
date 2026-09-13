"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/shared/money";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <SectionEyebrow>Contact</SectionEyebrow>
      <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground">Get in touch</h1>
      <p className="mt-3 text-muted-foreground">Questions about GiveTrail for your organization, company or as a donor? We&rsquo;d love to hear from you.</p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-success/30 bg-[color-mix(in_oklab,var(--success)_10%,var(--background))] p-6 text-sm text-muted-foreground">
          Thanks for reaching out — our team will respond within one business day.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 trail-card-shadow"
        >
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input required />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea rows={4} required />
          </div>
          <Button type="submit" className="w-full">
            Send message
          </Button>
        </form>
      )}
    </div>
  );
}
