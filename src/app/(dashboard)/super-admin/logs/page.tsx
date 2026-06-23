export const dynamic = "force-dynamic";

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
import { formatDateTime } from "@/lib/utils";

interface LogWithRelations {
  id: string;
  action: string;
  ip_address: string | null;
  created_at: string;
  user: { id: string; name: string; email: string } | null;
  diwaniya: { id: string; name: string; slug: string } | null;
}

export default async function SuperAdminLogsPage() {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("activity_logs")
    .select(
      `
      id, action, ip_address, created_at,
      user:users(id, name, email),
      diwaniya:diwaniyas(id, name, slug)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = data as LogWithRelations[] | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">
          View system-wide activity and audit logs.
        </p>
      </div>

      {logs && logs.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Diwaniya</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const logUser = log.user as {
                  id: string;
                  name: string;
                  email: string;
                } | null;
                const logDiwaniya = log.diwaniya as {
                  id: string;
                  name: string;
                  slug: string;
                } | null;
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      {logUser ? (
                        <div>
                          <p className="font-medium">{logUser.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {logUser.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">System</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {logDiwaniya?.name || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ip_address || "-"}
                    </TableCell>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <p className="text-muted-foreground">
            No activity logs available. Activity will be logged as users
            interact with the system.
          </p>
        </div>
      )}
    </div>
  );
}
