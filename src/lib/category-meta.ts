import { HeartPulse, GraduationCap, LifeBuoy, Baby, HandCoins, Wheat, Accessibility, Leaf, MoreHorizontal } from "lucide-react";
import type { OrgCategory } from "@/lib/types";

export const CATEGORY_META: Record<OrgCategory, { label: string; icon: typeof HeartPulse }> = {
  health: { label: "Health", icon: HeartPulse },
  education: { label: "Education", icon: GraduationCap },
  emergency_relief: { label: "Emergency Relief", icon: LifeBuoy },
  children: { label: "Children", icon: Baby },
  poverty: { label: "Poverty", icon: HandCoins },
  food_security: { label: "Food Security", icon: Wheat },
  disability: { label: "Disability", icon: Accessibility },
  environment: { label: "Environment", icon: Leaf },
  other: { label: "Other", icon: MoreHorizontal },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_META) as OrgCategory[];
