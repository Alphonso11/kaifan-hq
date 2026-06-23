export const dynamic = "force-dynamic";

import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DiwaniyaStatusBadge } from "@/components/diwaniya/status-badge";
import { formatDateTime } from "@/lib/utils";
import { Plus } from "lucide-react";

interface DiwaniyaWithAdmin {
  id: string;
  name: string;
  slug: string;
  is_open: boolean;
  current_capacity: number;
  max_capacity: number;
  created_at: string;
  admin: { id: string; name: string; email: string } | null;
}

export default async function SuperAdminDiwaniyasPage() {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("diwaniyas")
    .select(
      `
      id, name, slug, is_open, current_capacity, max_capacity, created_at,
      admin:users!diwaniyas_admin_id_fkey(id, name, email)
    `
    )
    .order("created_at", { ascending: false });

  const diwaniyas = data as DiwaniyaWithAdmin[] | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Diwaniyas</h1>
          <p className="text-muted-foreground">
            Manage all Diwaniyas in the system.
          </p>
        </div>
        <Link href="/super-admin/diwaniyas/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Diwaniya
          </Button>
        </Link>
      </div>

      {diwaniyas && diwaniyas.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diwaniyas.map((diwaniya) => (
                  <TableRow key={diwaniya.id}>
                    <TableCell className="font-medium">
                      {diwaniya.name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{diwaniya.admin?.name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">
                          {diwaniya.admin?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DiwaniyaStatusBadge isOpen={diwaniya.is_open} />
                    </TableCell>
                    <TableCell>
                      {diwaniya.current_capacity} / {diwaniya.max_capacity}
                    </TableCell>
                    <TableCell>{formatDateTime(diwaniya.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground mb-4">
            No Diwaniyas have been created yet.
          </p>
          <Link href="/super-admin/diwaniyas/new">
            <Button>Create First Diwaniya</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
