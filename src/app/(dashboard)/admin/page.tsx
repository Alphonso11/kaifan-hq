import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusToggle } from "@/components/diwaniya/status-toggle";
import { DiwaniyaStatusBadge } from "@/components/diwaniya/status-badge";
import { InviteLinkManager } from "@/components/diwaniya/invite-link-manager";
import { Users, Clock, CheckCircle, XCircle, Building2, Link2 } from "lucide-react";
import type { Diwaniya } from "@/types/database";

async function getAdminDiwaniya(userId: string): Promise<Diwaniya | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("diwaniyas")
    .select("*")
    .eq("admin_id", userId)
    .single();
  return data as Diwaniya | null;
}

async function getRegistrationStats(diwaniyaId: string) {
  const supabase = await createClient();
  const { data: registrations } = await supabase
    .from("registrations")
    .select("status")
    .eq("diwaniya_id", diwaniyaId);
  
  const typedRegistrations = registrations as { status: string }[] | null;
  const pendingCount = typedRegistrations?.filter((r) => r.status === "pending").length || 0;
  const approvedCount = typedRegistrations?.filter((r) => r.status === "approved").length || 0;
  const rejectedCount = typedRegistrations?.filter((r) => r.status === "rejected").length || 0;
  
  return { pendingCount, approvedCount, rejectedCount };
}

async function getBannedCount(diwaniyaId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("bans")
    .select("*", { count: "exact", head: true })
    .eq("diwaniya_id", diwaniyaId);
  return count || 0;
}

export default async function AdminDashboard() {
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

  // Get registration stats and banned count
  const { pendingCount, approvedCount, rejectedCount } = await getRegistrationStats(diwaniya.id);
  const bannedCount = await getBannedCount(diwaniya.id);

  return (
    <div className="space-y-6">
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-lg bg-gradient-to-br from-teal-900 to-teal-700 p-6 text-cream sm:flex-row sm:items-center sm:justify-between">
        <div className="lattice-gold absolute inset-0 opacity-50" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Your majlis
          </p>
          <h1 className="mt-0.5 flex items-center gap-2 font-display text-3xl text-cream">
            <Building2 className="h-7 w-7 text-gold" />
            {diwaniya.name}
          </h1>
          <p className="mt-1 text-sm text-cream/70">
            Manage your Diwaniya and guest registrations.
          </p>
        </div>
        <div className="relative flex items-center gap-3">
          <DiwaniyaStatusBadge isOpen={diwaniya.is_open} />
          <StatusToggle diwaniyaId={diwaniya.id} isOpen={diwaniya.is_open} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Registrations
            </CardTitle>
            <Clock className="h-4 w-4 text-gold-deep" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Guests
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Ready to attend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Not approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Capacity
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">
              {diwaniya.current_capacity} / {diwaniya.max_capacity}
            </div>
            <p className="text-xs text-muted-foreground">
              Current / Maximum
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Invite guests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InviteLinkManager diwaniyaId={diwaniya.id} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/registrations"
              className="block p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="font-medium">Review Registrations</div>
              <p className="text-sm text-muted-foreground">
                {pendingCount} pending approvals
              </p>
            </a>
            <a
              href="/admin/guests"
              className="block p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="font-medium">View Guest List</div>
              <p className="text-sm text-muted-foreground">
                {approvedCount} approved guests
              </p>
            </a>
            <a
              href="/admin/settings"
              className="block p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="font-medium">Diwaniya Settings</div>
              <p className="text-sm text-muted-foreground">
                Update details and capacity
              </p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diwaniya Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">
                {diwaniya.location || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">
                {diwaniya.description || "No description"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Banned Users</p>
              <p className="text-sm text-muted-foreground">
                {bannedCount || 0} users banned
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
