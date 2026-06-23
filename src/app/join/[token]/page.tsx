import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Building2, Clock, MapPin } from "lucide-react";

interface JoinPageProps {
  params: Promise<{ token: string }>;
}

interface DiwaniyaRow {
  name: string;
  slug: string;
  location: string | null;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="lattice-gold pointer-events-none fixed inset-0 z-0 opacity-50" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params;

  // Validate the invite with the service client (bypasses RLS, read-only).
  const service = await createServiceClient();
  const { data: linkRow } = await service
    .from("invite_links")
    .select("diwaniya_id, expires_at")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  const link = linkRow as { diwaniya_id: string; expires_at: string } | null;

  const { data: diwaniyaRow } = link
    ? await service
        .from("diwaniyas")
        .select("name, slug, location")
        .eq("id", link.diwaniya_id)
        .maybeSingle()
    : { data: null };

  const diwaniya = diwaniyaRow as DiwaniyaRow | null;

  // Invalid or expired
  if (!link || !diwaniya) {
    return (
      <Shell>
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl">This link has expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Invite links are only valid for 24 hours. Ask the host for a fresh
            link.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </Shell>
    );
  }

  // Must be signed in to accept an invite.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectTo = `/join/${token}`;
    return (
      <Shell>
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-primary text-gold">
            <Building2 className="h-7 w-7" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">
            You&apos;re invited
          </p>
          <h1 className="mt-1 font-display text-2xl">{diwaniya.name}</h1>
          {diwaniya.location && (
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {diwaniya.location}
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in or create an account to join this diwaniya and request a
            seat.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`}>
              <Button className="w-full">Sign in to join</Button>
            </Link>
            <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}>
              <Button variant="outline" className="w-full">
                Create an account
              </Button>
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // Signed in + valid invite → grant access and send them to the diwaniya.
  await supabase.rpc("use_invite", { p_token: token } as never);
  redirect(`/guest/diwaniyas/${diwaniya.slug}`);
}
