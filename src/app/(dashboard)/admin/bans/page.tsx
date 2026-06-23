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
import { UnbanButton } from "@/components/admin/unban-button";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

async function getAdminDiwaniya(userId: string): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("diwaniyas")
    .select("id")
    .eq("admin_id", userId)
    .single();
  return data;
}

interface BanWithRelations {
  id: string;
  diwaniya_id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  banned_at: string;
  expires_at: string | null;
  is_permanent: boolean;
  user: { id: string; name: string; email: string } | null;
  banned_by_user: { id: string; name: string } | null;
}

async function getBans(diwaniyaId: string): Promise<BanWithRelations[] | null> {
  // Service client: ownership already confirmed by the caller; RLS otherwise
  // hides the related user rows (names would show as "Unknown").
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("bans")
    .select(
      `
      *,
      user:users!bans_user_id_fkey(id, name, email),
      banned_by_user:users!bans_banned_by_fkey(id, name)
    `
    )
    .eq("diwaniya_id", diwaniyaId)
    .order("banned_at", { ascending: false });
  return data as BanWithRelations[] | null;
}

export default async function AdminBansPage() {
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

  const diwaniyaId = diwaniya.id;

  // Get banned users
  const bans = await getBans(diwaniyaId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Banned Users</h1>
        <p className="text-muted-foreground">
          View and manage banned users from your Diwaniya.
        </p>
      </div>

      {bans && bans.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Banned At</TableHead>
                <TableHead>Banned By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bans.map((ban) => (
                  <TableRow key={ban.id}>
                    <TableCell className="font-medium">
                      {ban.user?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{ban.user?.email || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {ban.reason}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ban.is_permanent ? "destructive" : "secondary"}>
                        {ban.is_permanent ? "Permanent" : "Temporary"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(ban.banned_at)}</TableCell>
                    <TableCell>{ban.banned_by_user?.name || "Unknown"}</TableCell>
                    <TableCell className="text-right">
                      <UnbanButton banId={ban.id} userName={ban.user?.name} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground">
            No banned users. Users you ban will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
