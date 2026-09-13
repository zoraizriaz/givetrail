import type { TourStep } from "./types";

export const homeTourSteps: TourStep[] = [
  {
    target: "nav-explore",
    title: "Start here: Explore",
    body: "Browse every GiveTrail-verified organization and campaign, filterable by cause — health, education, emergency relief and more.",
    placement: "bottom",
  },
  {
    target: "hero-trail-visual",
    title: "Follow the money, honestly",
    body: "Hover each step to see exactly how a donation moves — from what you gave, to what the organization received, to what's been verifiably spent.",
    placement: "top",
  },
  {
    target: "hero-explore-cta",
    title: "Ready to give?",
    body: "This takes you straight to the causes — no account needed to donate. We'll set one up for you automatically afterward.",
    placement: "bottom",
  },
  {
    target: "nav-for-organizations",
    title: "Running an NGO?",
    body: "If you represent a nonprofit, this is where you register and go through GiveTrail's verification process.",
    placement: "bottom",
  },
  {
    target: "account-menu",
    title: "Your account, anytime",
    body: "Log in here later to track your giving, or switch between the demo donor, corporate, NGO and admin views to explore the whole platform.",
    placement: "left",
  },
];

export const exploreTourSteps: TourStep[] = [
  {
    target: "explore-search",
    title: "Search by name",
    body: "Look for a specific organization or campaign by name here.",
    placement: "bottom",
  },
  {
    target: "explore-categories",
    title: "Filter by cause",
    body: "Narrow the list to a cause you care about — health, education, emergency relief, and more.",
    placement: "bottom",
  },
  {
    target: "explore-tabs",
    title: "Organizations vs. campaigns",
    body: "Switch between browsing whole organizations or their individual fundraising campaigns.",
    placement: "bottom",
  },
];

export const orgProfileTourSteps: TourStep[] = [
  {
    target: "org-profile-transparency",
    title: "The transparency snapshot",
    body: "Every verified organization publishes this live: funds received, allocated to programs, documented, and still awaiting documentation.",
    placement: "left",
  },
  {
    target: "org-profile-allocation-policy",
    title: "How they split funds",
    body: "Organizations disclose their own program vs. operations vs. fundraising split — shown to you before you give, not hidden in fine print.",
    placement: "left",
  },
  {
    target: "org-profile-donate",
    title: "Give to this organization",
    body: "Choose a specific campaign or their general fund, and you'll see exactly what fees apply before you confirm.",
    placement: "top",
  },
];

export const donorDashboardTourSteps: TourStep[] = [
  {
    target: "donor-stats",
    title: "Your giving, totaled",
    body: "Lifetime giving, how many organizations and campaigns you've supported, and how many donations are fully documented.",
    placement: "bottom",
  },
  {
    target: "donor-allocation-summary",
    title: "Where your money stands",
    body: "Every dollar you've given falls into one of three buckets: fully allocated to documented spending, currently being utilized, or still awaiting allocation.",
    placement: "bottom",
  },
  {
    target: "donor-donations-list",
    title: "Your Giving Trails",
    body: "Click any donation to open its full Giving Trail — the step-by-step story of where that specific contribution went.",
    placement: "top",
  },
];

export const givingTrailTourSteps: TourStep[] = [
  {
    target: "trail-flow",
    title: "How your donation moved",
    body: "From what you donated, through fees, to what the organization received and assigned to program work.",
    placement: "right",
  },
  {
    target: "trail-expenditures",
    title: "Documented expenditures",
    body: "The specific, evidence-backed expenses your contribution has been attributed to — each with a verification level badge.",
    placement: "left",
  },
];

export const orgDashboardTourSteps: TourStep[] = [
  {
    target: "nav-campaigns",
    title: "Campaigns",
    body: "Create and manage fundraising campaigns for specific programs.",
    placement: "right",
  },
  {
    target: "nav-expenses",
    title: "Expenses",
    body: "Record expenditures and attach receipts or invoices as evidence.",
    placement: "right",
  },
  {
    target: "nav-allocations",
    title: "Allocations",
    body: "Match donations and grants to specific expenses — this is the heart of GiveTrail's transparency engine.",
    placement: "right",
  },
  {
    target: "nav-verification",
    title: "Verification",
    body: "Track your organization's GiveTrail verification status and submitted documents.",
    placement: "right",
  },
  {
    target: "nav-reports",
    title: "Reports",
    body: "A generated transparency report summarizing everything donors and auditors would want to see.",
    placement: "right",
  },
  {
    target: "org-stats",
    title: "Your transparency snapshot",
    body: "Funds received, program allocation, verified expenses and what's still awaiting documentation — at a glance.",
    placement: "bottom",
  },
];

export const orgExpensesTourSteps: TourStep[] = [
  {
    target: "org-new-expense",
    title: "Record an expense",
    body: "Log a new expenditure with vendor, amount, category and a donor-safe description that protects beneficiary privacy.",
    placement: "bottom",
  },
  {
    target: "org-expenses-table",
    title: "Verification levels",
    body: "Each expense shows its verification level — from Declared, up through Documented, Financially Verified, Program Verified, and Independently Verified.",
    placement: "top",
  },
];

export const orgAllocationsTourSteps: TourStep[] = [
  {
    target: "org-allocation-list",
    title: "Expenses needing allocation",
    body: "These are recorded expenses that haven't been fully matched to a donation or grant yet.",
    placement: "right",
  },
  {
    target: "org-allocation-panel",
    title: "Match funds to spending",
    body: "Split one expense across multiple donations or grants — enter an amount for each eligible source and save. Donors will immediately see their share on their Giving Trail.",
    placement: "left",
  },
];

export const orgVerificationTourSteps: TourStep[] = [
  {
    target: "org-verification-status",
    title: "Your verification status",
    body: "This badge is what donors and companies see on your public profile — it only shows as GiveTrail Verified once you're fully approved.",
    placement: "bottom",
  },
  {
    target: "org-verification-docs",
    title: "Submitted documents",
    body: "Registration, tax status and authorization documents you've submitted, with their individual review status.",
    placement: "top",
  },
];

export const corporateDashboardTourSteps: TourStep[] = [
  {
    target: "corporate-stats",
    title: "Your giving, at a glance",
    body: "Total giving, organizations funded, and overall utilization across every grant.",
    placement: "bottom",
  },
  {
    target: "corporate-grants-list",
    title: "Track each grant",
    body: "Open any grant to see budget vs. actual spending, broken down by category, and how much has been independently verified.",
    placement: "top",
  },
];

export const adminDashboardTourSteps: TourStep[] = [
  {
    target: "admin-stats",
    title: "Platform-wide analytics",
    body: "Total donation volume, GiveTrail's revenue, and how many NGOs and donors are on the platform.",
    placement: "bottom",
  },
  {
    target: "admin-verification-queue",
    title: "Verification queue",
    body: "Review NGO applications here — approve, reject, or request more information before they can accept public donations.",
    placement: "top",
  },
];
