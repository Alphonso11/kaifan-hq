import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ClipboardList, Activity } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  created_at: string;
  user: { name: string } | null;
}

export default async function SuperAdminDashboard() {
  const supabase = await createServiceClient();

  // Get total diwaniyas
  const { count: diwaniyasCount } = await supabase
    .from("diwaniyas")
    .select("*", { count: "exact", head: true });

  // Get total users
  const { count: usersCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  // Get total registrations
  const { count: registrationsCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true });

  // Get open diwaniyas
  const { count: openDiwaniyasCount } = await supabase
    .from("diwaniyas")
    .select("*", { count: "exact", head: true })
    .eq("is_open", true);

  // Get recent activity
  const { data } = await supabase
    .from("activity_logs")
    .select(
      `
      id, action, created_at,
      user:users(name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const recentActivity = data as ActivityLog[] | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System overview and management controls.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Diwaniyas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{diwaniyasCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {openDiwaniyasCount || 0} currently open
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{usersCount || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Registrations
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{registrationsCount || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">
              {diwaniyasCount
                ? Math.round(((openDiwaniyasCount || 0) / diwaniyasCount) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Diwaniyas currently open
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/super-admin/diwaniyas/new"
              className="block p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="font-medium">Create New Diwaniya</div>
              <p className="text-sm text-muted-foreground">
                Add a new Diwaniya to the system
              </p>
            </a>
            <a
              href="/super-admin/diwaniyas"
              className="block p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="font-medium">Manage Diwaniyas</div>
              <p className="text-sm text-muted-foreground">
                View and manage all Diwaniyas
              </p>
            </a>
            <a
              href="/super-admin/users"
              className="block p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="font-medium">User Management</div>
              <p className="text-sm text-muted-foreground">
                Manage users and roles
              </p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-muted-foreground">
                          {activity.user?.name || "System"} -{" "}
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity to display.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
