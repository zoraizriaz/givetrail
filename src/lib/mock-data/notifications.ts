import type { Notification } from "@/lib/types";

export const notifications: Notification[] = [
  {
    id: "notif-1",
    userId: "u-donor-sarah",
    message: "$120 of your donation has just been allocated to medication procurement.",
    createdAt: "2026-07-03T10:00:00Z",
    read: false,
    href: "/dashboard/giving-trail/don-hero-1",
  },
  {
    id: "notif-2",
    userId: "u-donor-sarah",
    message: "Your $200 contribution to Horizon Health Alliance is now 100% accounted for.",
    createdAt: "2026-03-16T09:30:00Z",
    read: true,
    href: "/dashboard/giving-trail/don-sarah-complete",
  },
  {
    id: "notif-3",
    userId: "u-donor-sarah",
    message: "New evidence has been added to your donation to Maternal Health Program.",
    createdAt: "2026-07-11T08:00:00Z",
    read: false,
    href: "/dashboard/giving-trail/don-hero-1",
  },
  {
    id: "notif-4",
    userId: "u-org-maria",
    message: "3 expenditures are awaiting receipts.",
    createdAt: "2026-09-09T08:00:00Z",
    read: false,
    href: "/org/expenses?status=declared",
  },
  {
    id: "notif-5",
    userId: "u-org-maria",
    message: "Your NGO verification has been approved.",
    createdAt: "2023-03-01T08:00:00Z",
    read: true,
    href: "/org/verification",
  },
  {
    id: "notif-6",
    userId: "u-corp-james",
    message: "Corporate Grant #GT-381 is being tracked — utilization is currently at 1.8%.",
    createdAt: "2026-08-20T08:00:00Z",
    read: false,
    href: "/corporate/grants/grant-1",
  },
  {
    id: "notif-7",
    userId: "u-org-liam",
    message: "Your organization's verification requires additional documentation before campaigns can go live.",
    createdAt: "2026-08-01T08:00:00Z",
    read: false,
    href: "/org/verification",
  },
  {
    id: "notif-8",
    userId: "u-admin-alex",
    message: "Al Noor Community Foundation submitted updated verification documents for review.",
    createdAt: "2026-09-11T08:00:00Z",
    read: false,
    href: "/admin/ngos/org-alnoor",
  },
  {
    id: "notif-9",
    userId: "u-donor-sarah",
    message: "Your donation to Bright Path Education Trust has been confirmed and is awaiting allocation.",
    createdAt: "2026-09-01T10:05:00Z",
    read: true,
    href: "/dashboard/giving-trail/don-sarah-4",
  },
];

export function getNotificationsForUser(userId: string): Notification[] {
  return notifications.filter((n) => n.userId === userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
