import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TrailDetail } from "@/components/trail/trail-detail";
import { getDonationTrail, canViewDonation } from "@/lib/supabase-data";
import { createClient } from "@/lib/supabase/server";

export default async function GivingTrailPage({ params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const trail = await getDonationTrail(donationId);
  const visible = trail && authUser && canViewDonation(trail.donation, authUser.id);

  if (!visible) {
    return (
      <div className="text-center">
        <p className="font-heading text-lg font-semibold text-foreground">Donation not found</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to dashboard
      </Link>
      <div className="mt-4">
        <TrailDetail trail={trail} />
      </div>
    </div>
  );
}
