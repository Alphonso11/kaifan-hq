import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RegistrationStatusBadge } from "@/components/diwaniya/status-badge";
import { RegistrationActions } from "@/components/admin/registration-actions";
import { formatDateTime } from "@/lib/utils";

async function getAdminDiwaniya(userId: string): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("diwaniyas")
    .select("id")
    .eq("admin_id", userId)
    .single();
  return data as { id: string } | null;
}

interface RegistrationWithUser {
  id: string;
  diwaniya_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  registered_at: string;
  updated_at: string;
  notes: string | null;
  admin_notes: string | null;
  user: { id: string; name: string; email: string; phone: string | null } | null;
}

async function getRegistrations(diwaniyaId: string): Promise<RegistrationWithUser[] | null> {
  // Service client: the caller already confirmed ownership of this diwaniya,
  // and RLS otherwise hides the guests' user rows (names show as "Unknown").
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("registrations")
    .select(
      `
      *,
      user:users(id, name, email, phone)
    `
    )
    .eq("diwaniya_id", diwaniyaId)
    .order("registered_at", { ascending: false });
  return data as RegistrationWithUser[] | null;
}

export default async function AdminRegistrationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const diwaniya = await getAdminDiwaniya(user.id);

  if (!diwaniya) {
    redirect("/guest");
  }

  // Get registrations with user details
  const registrations = await getRegistrations(diwaniya.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
        <p className="text-muted-foreground">
          Review and manage guest registrations.
        </p>
      </div>

      {registrations && registrations.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered At</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.user?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{registration.user?.email || "-"}</TableCell>
                    <TableCell>{registration.user?.phone || "-"}</TableCell>
                    <TableCell>
                      <RegistrationStatusBadge status={registration.status} />
                    </TableCell>
                    <TableCell>
                      {formatDateTime(registration.registered_at)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {registration.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <RegistrationActions
                        registrationId={registration.id}
                        currentStatus={registration.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground">
            No registrations yet. Registrations will appear here when guests
            sign up.
          </p>
        </div>
      )}
    </div>
  );
}
