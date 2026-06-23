import { createServiceClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RoleSelector } from "@/components/admin/role-selector";
import { formatDateTime } from "@/lib/utils";
import type { User } from "@/types/database";

export default async function SuperAdminUsersPage() {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  const users = data as User[] | null;

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      default:
        return "secondary";
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      default:
        return "Guest";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all users in the system.
        </p>
      </div>

      {users && users.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(user.role)}>
                      {roleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <RoleSelector userId={user.id} currentRole={user.role} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground">No users found.</p>
        </div>
      )}
    </div>
  );
}
