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
import { Button } from "@/components/ui/button";
import { BanDialog } from "@/components/admin/ban-dialog";
import { formatDateTime } from "@/lib/utils";
import { Download } from "lucide-react";

async function getAdminDiwaniya(userId: string): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("diwaniyas")
    .select("id")
    .eq("admin_id", userId)
    .single();
  return data as { id: string } | null;
}

interface GuestWithUser {
  id: string;
  diwaniya_id: string;
  user_id: string;
  status: string;
  registered_at: string;
  updated_at: string;
  notes: string | null;
  admin_notes: string | null;
  user: { id: string; name: string; email: string; phone: string | null } | null;
}

async function getApprovedGuests(diwaniyaId: string): Promise<GuestWithUser[] | null> {
  // Service client: ownership already confirmed by the caller; RLS otherwise
  // hides guest user rows (names would show as "Unknown").
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
    .eq("status", "approved")
    .order("registered_at", { ascending: false });
  return data as GuestWithUser[] | null;
}

export default async function AdminGuestsPage() {
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

  // Get approved guests with user details
  const guests = await getApprovedGuests(diwaniya.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest List</h1>
          <p className="text-muted-foreground">
            View and manage approved guests.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {guests && guests.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Approved At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">
                      {guest.user?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{guest.user?.email || "-"}</TableCell>
                    <TableCell>{guest.user?.phone || "-"}</TableCell>
                    <TableCell>{formatDateTime(guest.updated_at)}</TableCell>
                    <TableCell className="text-right">
                      <BanDialog
                        userId={guest.user?.id}
                        userName={guest.user?.name}
                        diwaniyaId={diwaniya.id}
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
            No approved guests yet. Approve registrations to see them here.
          </p>
        </div>
      )}
    </div>
  );
}
