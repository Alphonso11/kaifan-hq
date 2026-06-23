import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiwaniyaStatusBadge } from "@/components/diwaniya/status-badge";
import { RegistrationForm } from "@/components/registration/registration-form";
import { Building2, MapPin, Users, User } from "lucide-react";

interface DiwaniyaPageProps {
  params: Promise<{ slug: string }>;
}

interface DiwaniyaWithAdmin {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  description: string | null;
  admin_id: string;
  is_open: boolean;
  current_capacity: number;
  max_capacity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  admin: { id: string; name: string } | null;
}

interface RegistrationData {
  id: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
}

interface BanData {
  id: string;
  reason: string;
}

async function getDiwaniya(slug: string): Promise<DiwaniyaWithAdmin | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("diwaniyas")
    .select(
      `
      *,
      admin:users!diwaniyas_admin_id_fkey(id, name)
    `
    )
    .eq("slug", slug)
    .single();
  return data as DiwaniyaWithAdmin | null;
}

async function getExistingRegistration(diwaniyaId: string, userId: string): Promise<RegistrationData | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registrations")
    .select("id, status, notes")
    .eq("diwaniya_id", diwaniyaId)
    .eq("user_id", userId)
    .single();
  return data as RegistrationData | null;
}

async function getUserBan(diwaniyaId: string, userId: string): Promise<BanData | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bans")
    .select("id, reason")
    .eq("diwaniya_id", diwaniyaId)
    .eq("user_id", userId)
    .single();
  return data as BanData | null;
}

export default async function DiwaniyaPage({ params }: DiwaniyaPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get diwaniya details
  const diwaniya = await getDiwaniya(slug);

  if (!diwaniya) {
    notFound();
  }

  // Check if user is already registered
  const existingRegistration = await getExistingRegistration(diwaniya.id, user.id);

  // Check if user is banned from this diwaniya
  const ban = await getUserBan(diwaniya.id, user.id);

  const isBanned = !!ban;
  const isFull = diwaniya.current_capacity >= diwaniya.max_capacity;

  return (
    <div className="space-y-6">
      <div className="relative flex items-end justify-between overflow-hidden rounded-lg bg-gradient-to-br from-teal-900 to-teal-700 p-6 text-cream">
        <div className="lattice-gold absolute inset-0 opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <Building2 className="h-7 w-7 text-gold" />
            <h1 className="font-display text-3xl tracking-tight text-cream">
              {diwaniya.name}
            </h1>
          </div>
          {diwaniya.location && (
            <p className="mt-2 flex items-center gap-1 text-cream/70">
              <MapPin className="h-4 w-4" />
              {diwaniya.location}
            </p>
          )}
        </div>
        <DiwaniyaStatusBadge isOpen={diwaniya.is_open} className="relative" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {diwaniya.description || "No description available."}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {diwaniya.current_capacity} / {diwaniya.max_capacity} guests
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Host</p>
                  <p className="text-sm text-muted-foreground">
                    {(diwaniya.admin as { name: string })?.name || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <RegistrationForm
              diwaniyaId={diwaniya.id}
              isOpen={diwaniya.is_open}
              isFull={isFull}
              isBanned={isBanned}
              existingRegistration={existingRegistration}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
