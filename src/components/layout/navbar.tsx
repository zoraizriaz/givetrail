"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/layout/account-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/explore", label: "Explore", tourId: "nav-explore" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/for-organizations", label: "For Organizations", tourId: "nav-for-organizations" },
  { href: "/for-companies", label: "For Companies" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-border/70 bg-background/75 px-3 backdrop-blur-xl transition-shadow duration-300 sm:px-4",
          scrolled && "shadow-[0_1px_2px_rgba(23,23,23,0.04),0_16px_40px_-20px_rgba(23,23,23,0.18)]"
        )}
      >
        <Link href="/" className="flex shrink-0 items-center pl-1">
          <Logo markSize={26} />
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-full md:flex">
          {NAV_LINKS.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm" className="rounded-full text-sm font-medium text-foreground/75">
              <Link href={link.href} data-tour={link.tourId}>
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex" data-tour="account-menu">
          <AccountMenu />
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-border/70 bg-background/95 p-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t border-border pt-3">
            <AccountMenu />
          </div>
        </div>
      )}
    </header>
  );
}
