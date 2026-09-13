# GiveTrail

A global donation transparency and accountability platform prototype. Donate → Track → Verify.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- `src/lib/types.ts` — the full domain model (User, Organization, Campaign, Donation, Payment, Grant, Expense, Allocation, VerificationEvent, Notification, AuditLog, …).
- `src/lib/mock-data/` — seeded demo data (5 NGOs, 10 campaigns, 24 donations, 22 expenses, allocations, grants, notifications) backing the whole prototype. Every entity has a stable id and money is always an integer minor-unit amount + currency, so a real backend can be dropped in later.
- `src/lib/data.ts` — the data-access layer every page reads through (`getDonationTrail`, `getOrgDashboard`, `getCorporateDashboard`, `getAdminAnalytics`, the allocation workflow, …). This is the seam where Supabase (or any backend) would replace the static arrays without touching page code.
- `src/lib/session-*.ts` + `src/lib/runtime-overrides.ts` — since there's no backend yet, checkout, NGO campaign/expense creation, admin approvals and the allocation workflow mutate the in-memory data live and persist the *actions taken* to `localStorage`, so the whole app stays consistent within a browsing session and survives a reload.
- `src/context/current-user-context.tsx` — a demo persona switcher (Individual donor / Corporate donor / NGO admin / GiveTrail admin) standing in for real authentication.

## Demo accounts

Use the account switcher in the header, or `/login`:

- **Sarah Bennett** — individual donor
- **James Okafor** — corporate donor (Brightfuture Industries)
- **Maria Santos** — NGO admin (Horizon Health Alliance)
- **Alex Kim** — GiveTrail admin

All organizations, people and transactions are demo content.
