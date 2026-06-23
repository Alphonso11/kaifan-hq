import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DiwaniyaCard } from "@/components/diwaniya/diwaniya-card";
import { Button } from "@/components/ui/button";
import { Building2, Link2 } from "lucide-react";
import type { Diwaniya } from "@/types/database";

export default async function MyDiwaniyasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Invite-only: a guest only sees diwaniyas they've been granted access to.
  const { data: accessRows } = await supabase
    .from("diwaniya_access")
    .select("diwaniya_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const ids = ((accessRows as { diwaniya_id: string }[] | null) || []).map(
    (r) => r.diwaniya_id
  );

  const { data: diwaniyaRows } =
    ids.length > 0
      ? await supabase.from("diwaniyas").select("*").in("id", ids)
      : { data: [] };

  const diwaniyas = (diwaniyaRows as Diwaniya[] | null) || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">
          Your invitations
        </p>
        <h1 className="font-display text-3xl tracking-tight">My Diwaniyas</h1>
        <p className="text-muted-foreground">
          Diwaniyas you&apos;ve joined via an invite link.
        </p>
      </div>

      {diwaniyas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diwaniyas.map((diwaniya) => (
            <DiwaniyaCard key={diwaniya.id} diwaniya={diwaniya} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Link2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl">No diwaniyas yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Diwaniyas are invite-only. Open an invite link from a host to join,
            or start your own majlis.
          </p>
          <Link href="/host/new" className="mt-5 inline-block">
            <Button variant="gold">
              <Building2 className="h-4 w-4" />
              Host your own
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
