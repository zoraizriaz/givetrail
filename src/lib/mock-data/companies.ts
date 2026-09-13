import type { Company } from "@/lib/types";

export const companies: Company[] = [
  {
    id: "c-brightfuture",
    name: "Brightfuture Industries",
    logoUrl: "",
    countryCode: "US",
    authorizedRepresentativeUserId: "u-corp-james",
  },
];

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}
