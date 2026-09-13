import type { AllocationPolicy, Organization } from "@/lib/types";

function policy(programPct: number, operationsPct: number, fundraisingPct: number): AllocationPolicy {
  const paymentProcessingPct = 1 - programPct - operationsPct - fundraisingPct;
  return { programPct, operationsPct, fundraisingPct, paymentProcessingPct };
}

export const organizations: Organization[] = [
  {
    id: "org-horizon",
    slug: "horizon-health-alliance",
    name: "Horizon Health Alliance",
    logoUrl: "",
    coverImageUrl: "",
    category: ["health", "children"],
    operatingCountry: "Kenya",
    legalEntityCountry: "United States",
    baseCurrency: "USD",
    payoutCurrency: "USD",
    registrationNumber: "US-EIN-84-2210394",
    taxNumber: "501(c)(3) — 84-2210394",
    website: "https://horizonhealthalliance.org",
    address: "228 Baraka Street, Nairobi, Kenya",
    representativeName: "Maria Santos",
    representativeTitle: "Executive Director",
    representativeEmail: "maria.santos@horizonhealth.org",
    representativePhone: "+254 700 112 233",
    description:
      "Horizon Health Alliance delivers maternal health, nutrition and primary care services across underserved communities in East Africa, working through a network of community clinics and mobile health teams.",
    mission:
      "To close the maternal and child health gap in East Africa by making essential medical care, diagnostics and nutrition support reachable for every family, regardless of income.",
    operatingRegions: ["Kenya", "Uganda", "Tanzania"],
    verificationStatus: "verified",
    verifiedSince: "2023-03-01T00:00:00Z",
    // Program allocation calibrated so a $500 donation nets exactly $426 to program — see mock-data/donations.ts
    allocationPolicy: policy(426 / 481, 0.08, 0.024),
    documentationCompletenessPct: 0.91,
    createdAt: "2022-11-08T00:00:00Z",
  },
  {
    id: "org-brightpath",
    slug: "bright-path-education-trust",
    name: "Bright Path Education Trust",
    logoUrl: "",
    coverImageUrl: "",
    category: ["education", "poverty"],
    operatingCountry: "Pakistan",
    legalEntityCountry: "Pakistan",
    baseCurrency: "PKR",
    payoutCurrency: "PKR",
    registrationNumber: "PK-NGO-2019-4471",
    taxNumber: "FBR-EXEMPT-4471",
    website: "https://brightpathedu.org",
    address: "14-C Gulberg III, Lahore, Pakistan",
    representativeName: "Omar Farooq",
    representativeTitle: "Country Director",
    representativeEmail: "omar.farooq@brightpathedu.org",
    representativePhone: "+92 42 3571 2200",
    description:
      "Bright Path Education Trust builds school infrastructure, trains teachers and runs literacy programs in rural and low-income districts of Pakistan.",
    mission:
      "To make quality primary education a realistic option for every child in the communities we serve, with a particular focus on girls' access to school.",
    operatingRegions: ["Punjab", "Sindh"],
    verificationStatus: "verified",
    verifiedSince: "2023-09-14T00:00:00Z",
    allocationPolicy: policy(0.8, 0.13, 0.04),
    documentationCompletenessPct: 0.78,
    createdAt: "2023-04-20T00:00:00Z",
  },
  {
    id: "org-clearwater",
    slug: "clearwater-emergency-relief",
    name: "Clearwater Emergency Relief",
    logoUrl: "",
    coverImageUrl: "",
    category: ["emergency_relief", "food_security"],
    operatingCountry: "Philippines",
    legalEntityCountry: "United Kingdom",
    baseCurrency: "GBP",
    payoutCurrency: "GBP",
    registrationNumber: "UK-CHC-1189302",
    taxNumber: "HMRC-1189302",
    website: "https://clearwaterrelief.org",
    address: "42 Riverside Quay, London, United Kingdom",
    representativeName: "Liam Carter",
    representativeTitle: "Operations Lead",
    representativeEmail: "liam.carter@clearwaterrelief.org",
    representativePhone: "+44 20 7946 0958",
    description:
      "Clearwater Emergency Relief provides rapid-response flood, typhoon and displacement relief across South and Southeast Asia, coordinating shelter, clean water and emergency food distribution.",
    mission:
      "To reach families in the first 72 hours after a disaster with the shelter, water and food they need to stay safe — and to stay until recovery is underway.",
    operatingRegions: ["Philippines", "Bangladesh"],
    verificationStatus: "under_review",
    allocationPolicy: policy(0.78, 0.14, 0.05),
    documentationCompletenessPct: 0.42,
    createdAt: "2025-12-01T00:00:00Z",
  },
  {
    id: "org-alnoor",
    slug: "al-noor-community-foundation",
    name: "Al Noor Community Foundation",
    logoUrl: "",
    coverImageUrl: "",
    category: ["poverty", "disability"],
    operatingCountry: "United Arab Emirates",
    legalEntityCountry: "United Arab Emirates",
    baseCurrency: "AED",
    payoutCurrency: "AED",
    registrationNumber: "AE-CD-2021-0937",
    website: "https://alnoorfoundation.ae",
    address: "Al Noor Building, Al Wasl Road, Dubai, UAE",
    representativeName: "Fatima Al Suwaidi",
    representativeTitle: "Programs Director",
    representativeEmail: "fatima.alsuwaidi@alnoor.ae",
    representativePhone: "+971 4 221 8890",
    description:
      "Al Noor Community Foundation supports low-income families and people with disabilities across the UAE with direct assistance, assistive devices and community programs.",
    mission:
      "To ensure that economic hardship or disability never stands between a family in the UAE and dignity, mobility and opportunity.",
    operatingRegions: ["United Arab Emirates"],
    verificationStatus: "additional_info_required",
    allocationPolicy: policy(0.75, 0.15, 0.05),
    documentationCompletenessPct: 0.31,
    createdAt: "2026-02-20T00:00:00Z",
  },
  {
    id: "org-maple",
    slug: "maple-grove-childrens-fund",
    name: "Maple Grove Children's Fund",
    logoUrl: "",
    coverImageUrl: "",
    category: ["children", "health"],
    operatingCountry: "Canada",
    legalEntityCountry: "Canada",
    baseCurrency: "CAD",
    payoutCurrency: "CAD",
    registrationNumber: "CA-BN-887744221RR0001",
    taxNumber: "CRA-887744221RR0001",
    website: "https://maplegrovefund.ca",
    address: "88 Elm Street, Toronto, ON, Canada",
    representativeName: "Claire Dubois",
    representativeTitle: "Executive Director",
    representativeEmail: "claire.dubois@maplegrovefund.ca",
    representativePhone: "+1 416 555 0148",
    description:
      "Maple Grove Children's Fund covers treatment, nutrition and family-support costs for children facing cancer and other serious illnesses across Canadian communities with limited access to specialist care.",
    mission:
      "To make sure a child's postal code never determines whether their family can afford the treatment, nutrition and support they need.",
    operatingRegions: ["Ontario", "Quebec", "Manitoba"],
    verificationStatus: "verified",
    verifiedSince: "2024-05-19T00:00:00Z",
    allocationPolicy: policy(0.83, 0.1, 0.03),
    documentationCompletenessPct: 0.86,
    createdAt: "2024-01-09T00:00:00Z",
  },
];

export function getOrganizationById(id: string): Organization | undefined {
  return organizations.find((o) => o.id === id);
}

export function getOrganizationBySlug(slug: string): Organization | undefined {
  return organizations.find((o) => o.slug === slug);
}

/** @deprecated snapshot at module load — use getVerifiedOrganizations() so admin approvals are reflected live. */
export const verifiedOrganizations = organizations.filter((o) => o.verificationStatus === "verified");

export function getVerifiedOrganizations(): Organization[] {
  return organizations.filter((o) => o.verificationStatus === "verified");
}
