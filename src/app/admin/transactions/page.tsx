"use client";

import { donations, getOrganizationById, getUserById, getPaymentByDonationId } from "@/lib/data";
import { Money } from "@/components/shared/money";
import { PAYMENT_STATUS_META } from "@/lib/payment-status-meta";
import { formatDateShort } from "@/lib/utils/format";

export default function AdminTransactionsPage() {
  const sorted = [...donations].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Transactions</h1>
      <p className="text-sm text-muted-foreground">Every donation processed through GiveTrail.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Donor</th>
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">GiveTrail fee</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => {
              const donor = getUserById(d.donorUserId);
              const org = getOrganizationById(d.organizationId);
              const status = getPaymentByDonationId(d.id)?.status;
              const statusMeta = status ? PAYMENT_STATUS_META[status] : undefined;
              return (
                <tr key={d.id} className="border-b border-border/70 last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-3 text-foreground">{d.isAnonymous ? "Anonymous" : donor?.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{org?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateShort(d.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Money amount={d.grossAmount} currency={d.currency} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Money amount={d.platformFee} currency={d.currency} />
                  </td>
                  <td className="px-4 py-3">
                    {statusMeta && (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
