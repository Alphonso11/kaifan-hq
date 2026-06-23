import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RegistrationStatusBadge } from "@/components/diwaniya/status-badge";
import { formatDateTime } from "@/lib/utils";

interface RegistrationWithDiwaniya {
  id: string;
  status: "pending" | "approved" | "rejected";
  registered_at: string;
  notes: string | null;
  diwaniya: { id: string; name: string; slug: string; is_open: boolean } | null;
}

export default async function RegistrationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("registrations")
    .select(
      `
      id, status, registered_at, notes,
      diwaniya:diwaniyas(id, name, slug, is_open)
    `
    )
    .eq("user_id", user.id)
    .order("registered_at", { ascending: false });

  const registrations = data as RegistrationWithDiwaniya[] | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Registrations</h1>
        <p className="text-muted-foreground">
          View and manage your Diwaniya registrations.
        </p>
      </div>

      {registrations && registrations.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Diwaniya</TableHead>
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
                      {registration.diwaniya?.name || "Unknown"}
                    </TableCell>
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
                      <Link href={`/guest/diwaniyas/${registration.diwaniya?.slug}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t registered for any Diwaniyas yet.
          </p>
          <Link href="/guest/diwaniyas">
            <Button>Browse Diwaniyas</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
