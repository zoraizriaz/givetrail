import { getAllUsersForAdmin } from "@/lib/ngo-data";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const users = await getAllUsersForAdmin();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Users</h1>
      <p className="text-sm text-muted-foreground">All accounts across GiveTrail.</p>
      <UsersTable users={users} />
    </div>
  );
}
