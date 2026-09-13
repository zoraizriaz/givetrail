import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { href: "/explore", label: "Explore Causes" },
      { href: "/how-it-works", label: "How GiveTrail Works" },
      { href: "/for-organizations", label: "For Organizations" },
      { href: "/for-companies", label: "For Companies" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/trust-and-safety", label: "Trust & Safety" },
      { href: "/pricing", label: "Platform Fee" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/disclosures", label: "Donor Disclosures" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Every donation leaves a trail. GiveTrail is a global giving platform that lets donors follow their
              contribution from payment to documented impact.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-foreground">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GiveTrail, Inc. All organizations and data shown are demo content.</p>
          <p>GiveTrail verification reflects platform review only and is not a government endorsement.</p>
        </div>
      </div>
    </footer>
  );
}
