import type { CorporateProfile, DonorProfile, OrganizationMember, User } from "@/lib/types";

export const users: User[] = [
  // -- GiveTrail admin --
  {
    id: "u-admin-alex",
    fullName: "Alex Kim",
    email: "alex.kim@givetrail.com",
    role: "admin",
    avatarUrl: "",
    createdAt: "2025-11-02T09:00:00Z",
    accountActivated: true,
    countryCode: "US",
  },

  // -- Demo individual donor (primary walkthrough account) --
  {
    id: "u-donor-sarah",
    fullName: "Sarah Bennett",
    email: "sarah.bennett@gmail.com",
    role: "donor",
    avatarUrl: "",
    createdAt: "2026-01-04T15:20:00Z",
    accountActivated: true,
    countryCode: "US",
  },

  // -- Demo corporate donor rep --
  {
    id: "u-corp-james",
    fullName: "James Okafor",
    email: "james.okafor@brightfuture-corp.com",
    role: "corporate",
    avatarUrl: "",
    createdAt: "2025-09-18T11:00:00Z",
    accountActivated: true,
    countryCode: "US",
  },
  {
    id: "u-corp-priyanka",
    fullName: "Priyanka Mehta",
    email: "priyanka.mehta@brightfuture-corp.com",
    role: "corporate",
    avatarUrl: "",
    createdAt: "2025-09-18T11:00:00Z",
    accountActivated: true,
    countryCode: "US",
  },

  // -- NGO representatives / org_member accounts --
  {
    id: "u-org-maria",
    fullName: "Maria Santos",
    email: "maria.santos@horizonhealth.org",
    role: "org_member",
    avatarUrl: "",
    createdAt: "2023-02-14T08:30:00Z",
    accountActivated: true,
    countryCode: "KE",
  },
  {
    id: "u-org-omar",
    fullName: "Omar Farooq",
    email: "omar.farooq@brightpathedu.org",
    role: "org_member",
    avatarUrl: "",
    createdAt: "2023-06-01T08:30:00Z",
    accountActivated: true,
    countryCode: "PK",
  },
  {
    id: "u-org-liam",
    fullName: "Liam Carter",
    email: "liam.carter@clearwaterrelief.org",
    role: "org_member",
    avatarUrl: "",
    createdAt: "2025-12-10T08:30:00Z",
    accountActivated: true,
    countryCode: "GB",
  },
  {
    id: "u-org-fatima",
    fullName: "Fatima Al Suwaidi",
    email: "fatima.alsuwaidi@alnoor.ae",
    role: "org_member",
    avatarUrl: "",
    createdAt: "2026-02-20T08:30:00Z",
    accountActivated: true,
    countryCode: "AE",
  },
  {
    id: "u-org-claire",
    fullName: "Claire Dubois",
    email: "claire.dubois@maplegrovefund.ca",
    role: "org_member",
    avatarUrl: "",
    createdAt: "2024-04-11T08:30:00Z",
    accountActivated: true,
    countryCode: "CA",
  },

  // -- Filler donors, used to populate organization-level statistics --
  { id: "u-donor-michael", fullName: "Michael Chen", email: "michael.chen@example.com", role: "donor", createdAt: "2026-01-20T10:00:00Z", accountActivated: true, countryCode: "US" },
  { id: "u-donor-priya", fullName: "Priya Patel", email: "priya.patel@example.com", role: "donor", createdAt: "2026-02-11T10:00:00Z", accountActivated: true, countryCode: "CA" },
  { id: "u-donor-david", fullName: "David Okonkwo", email: "david.okonkwo@example.com", role: "donor", createdAt: "2026-03-02T10:00:00Z", accountActivated: true, countryCode: "GB" },
  { id: "u-donor-emma", fullName: "Emma Wilson", email: "emma.wilson@example.com", role: "donor", createdAt: "2025-12-19T10:00:00Z", accountActivated: true, countryCode: "GB" },
  { id: "u-donor-noah", fullName: "Noah Anderson", email: "noah.anderson@example.com", role: "donor", createdAt: "2026-01-08T10:00:00Z", accountActivated: true, countryCode: "AU" },
  { id: "u-donor-layla", fullName: "Layla Hussain", email: "layla.hussain@example.com", role: "donor", createdAt: "2026-02-27T10:00:00Z", accountActivated: true, countryCode: "AE" },
  { id: "u-donor-grace", fullName: "Grace Kim", email: "grace.kim@example.com", role: "donor", createdAt: "2026-01-15T10:00:00Z", accountActivated: true, countryCode: "US" },
  { id: "u-donor-daniel", fullName: "Daniel Silva", email: "daniel.silva@example.com", role: "donor", createdAt: "2026-02-04T10:00:00Z", accountActivated: true, countryCode: "CA" },
  { id: "u-donor-aisha", fullName: "Aisha Rahman", email: "aisha.rahman@example.com", role: "donor", createdAt: "2026-05-30T10:00:00Z", accountActivated: true, countryCode: "PK" },
  { id: "u-donor-tom", fullName: "Tom Richardson", email: "tom.richardson@example.com", role: "donor", createdAt: "2026-03-14T10:00:00Z", accountActivated: true, countryCode: "CA" },
];

export const donorProfiles: DonorProfile[] = [
  { userId: "u-donor-sarah", preferredCurrency: "USD", causesFollowed: ["health", "education"] },
  { userId: "u-donor-michael", preferredCurrency: "USD", causesFollowed: ["health"] },
  { userId: "u-donor-priya", preferredCurrency: "CAD", causesFollowed: ["children"] },
  { userId: "u-donor-david", preferredCurrency: "GBP", causesFollowed: ["food_security"] },
  { userId: "u-donor-emma", preferredCurrency: "EUR", causesFollowed: ["health", "children"] },
  { userId: "u-donor-noah", preferredCurrency: "AUD", causesFollowed: ["health"] },
  { userId: "u-donor-layla", preferredCurrency: "AED", causesFollowed: ["education"] },
  { userId: "u-donor-grace", preferredCurrency: "USD", causesFollowed: ["education"] },
  { userId: "u-donor-daniel", preferredCurrency: "CAD", causesFollowed: ["children"] },
  { userId: "u-donor-aisha", preferredCurrency: "PKR", causesFollowed: ["health", "education"] },
  { userId: "u-donor-tom", preferredCurrency: "CAD", causesFollowed: ["health"] },
];

export const corporateProfiles: CorporateProfile[] = [
  { userId: "u-corp-james", companyId: "c-brightfuture" },
  { userId: "u-corp-priyanka", companyId: "c-brightfuture" },
];

export const organizationMembers: OrganizationMember[] = [
  { userId: "u-org-maria", organizationId: "org-horizon", title: "Executive Director", isPrimaryContact: true },
  { userId: "u-org-omar", organizationId: "org-brightpath", title: "Country Director", isPrimaryContact: true },
  { userId: "u-org-liam", organizationId: "org-clearwater", title: "Operations Lead", isPrimaryContact: true },
  { userId: "u-org-fatima", organizationId: "org-alnoor", title: "Programs Director", isPrimaryContact: true },
  { userId: "u-org-claire", organizationId: "org-maple", title: "Executive Director", isPrimaryContact: true },
];

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}
