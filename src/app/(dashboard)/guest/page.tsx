import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ClipboardCheck, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GuestDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();
  
  const typedProfile = profile as { name: string } | null;

  // Get count of diwaniyas this guest has joined (invite-only model)
  const { count: joinedCount } = await supabase
    .from("diwaniya_access")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get user's registrations
  const { data: registrations } = await supabase
    .from("registrations")
    .select("status")
    .eq("user_id", user.id);

  const typedRegistrations = registrations as { status: string }[] | null;
  const pendingCount = typedRegistrations?.filter((r) => r.status === "pending").length || 0;
  const approvedCount = typedRegistrations?.filter((r) => r.status === "approved").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          Welcome back, {typedProfile?.name?.split(" ")[0] || "Guest"}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your Diwaniya registrations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Diwaniyas Joined
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{joinedCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Via your invite links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Registrations
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Registrations
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              You&apos;re all set to attend
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/host/new">
          <Button variant="gold">
            <Building2 className="h-4 w-4" />
            Host your own diwaniya
          </Button>
        </Link>
        <Link href="/guest/diwaniyas">
          <Button variant="outline">My Diwaniyas</Button>
        </Link>
        <Link href="/guest/registrations">
          <Button variant="outline">My Registrations</Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        Diwaniyas are invite-only — open an invite link from a host to join one.
      </p>
    </div>
  );
}
