import type { PaymentStatus } from "@/lib/types";

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; className: string }> = {
  initiated: { label: "Initiated", className: "bg-muted text-muted-foreground" },
  processing: { label: "Processing", className: "bg-muted text-muted-foreground" },
  confirmed: { label: "Confirmed", className: "bg-secondary text-secondary-foreground" },
  funds_transferred: { label: "Funds transferred", className: "bg-accent text-accent-foreground" },
  available_to_ngo: { label: "Available to NGO", className: "bg-accent text-accent-foreground" },
  refunded: { label: "Refunded", className: "bg-[color-mix(in_oklab,var(--destructive)_16%,var(--card))] text-destructive" },
  failed: { label: "Payment failed", className: "bg-[color-mix(in_oklab,var(--destructive)_16%,var(--card))] text-destructive" },
};
