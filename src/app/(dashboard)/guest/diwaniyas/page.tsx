import { createClient } from "@/lib/supabase/server";
import { DiwaniyaCard } from "@/components/diwaniya/diwaniya-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Diwaniya } from "@/types/database";

export default async function DiwaniyasPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("diwaniyas")
    .select("*")
    .order("is_open", { ascending: false })
    .order("name");
  
  const diwaniyas = data as Diwaniya[] | null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">
          Tonight in Kuwait
        </p>
        <h1 className="font-display text-3xl tracking-tight">Diwaniyas</h1>
        <p className="text-muted-foreground">
          Find an open majlis and request your seat.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search Diwaniyas..." className="pl-9" />
      </div>

      {diwaniyas && diwaniyas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diwaniyas.map((diwaniya) => (
            <DiwaniyaCard key={diwaniya.id} diwaniya={diwaniya} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No Diwaniyas available yet.</p>
        </div>
      )}
    </div>
  );
}
