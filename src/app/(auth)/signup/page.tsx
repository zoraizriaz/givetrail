"use client";

import Link from "next/link";
import { ArrowRight, Building2, HeartHandshake, Landmark } from "lucide-react";

const OPTIONS = [
  {
    icon: HeartHandshake,
    title: "I'm an individual donor",
    body: "No signup required — donate to a cause and we'll set up your account automatically so you can track it.",
    cta: "Explore causes",
    href: "/explore",
  },
  {
    icon: Building2,
    title: "I'm giving on behalf of a company",
    body: "Set up a corporate account to track grants, budgets and utilization across the organizations you fund.",
    cta: "Set up corporate account",
    href: "/signup/corporate",
  },
  {
    icon: Landmark,
    title: "I represent an NGO or nonprofit",
    body: "Register your organization and go through GiveTrail's verification process to start receiving donations.",
    cta: "Register your organization",
    href: "/onboarding/ngo",
  },
];

export default function SignupPage() {
  return (
    <div className="w-full max-w-3xl">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Join GiveTrail</h1>
        <p className="mt-2 text-muted-foreground">Tell us who you are, and we&rsquo;ll get you to the right place.</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {OPTIONS.map((opt) => (
          <Link
            key={opt.title}
            href={opt.href}
            className="group flex flex-col rounded-2xl border border-border bg-background p-6 trail-card-shadow transition-transform hover:-translate-y-1"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <opt.icon className="size-5" />
            </div>
            <h2 className="mt-4 font-heading text-base font-semibold text-foreground">{opt.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{opt.body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              {opt.cta} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
