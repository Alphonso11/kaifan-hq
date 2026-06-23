import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiwaniyaStatusBadge } from "@/components/diwaniya/status-badge";
import { cn } from "@/lib/utils";
import type { Diwaniya } from "@/types/database";

interface DiwaniyaCardProps {
  diwaniya: Diwaniya;
}

export function DiwaniyaCard({ diwaniya }: DiwaniyaCardProps) {
  const pct =
    diwaniya.max_capacity > 0
      ? Math.min(
          100,
          Math.round((diwaniya.current_capacity / diwaniya.max_capacity) * 100)
        )
      : 0;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* banner */}
      <div
        className={cn(
          "relative flex h-24 items-start justify-between p-3.5",
          diwaniya.is_open
            ? "bg-gradient-to-br from-teal-900 to-teal-700"
            : "bg-gradient-to-br from-[hsl(50_4%_35%)] to-[hsl(45_5%_25%)]"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 opacity-45",
            diwaniya.is_open ? "lattice-gold" : "lattice"
          )}
        />
        <DiwaniyaStatusBadge isOpen={diwaniya.is_open} className="relative" />
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-tight">{diwaniya.name}</h3>
        {diwaniya.location && (
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {diwaniya.location}
          </p>
        )}
        <p className="mt-2.5 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {diwaniya.description || "No description available."}
        </p>

        {/* capacity meter */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {diwaniya.is_open ? "Guests tonight" : "Capacity"}
            </span>
            <span>
              {diwaniya.current_capacity} / {diwaniya.max_capacity}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-primary to-teal-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <Link href={`/guest/diwaniyas/${diwaniya.slug}`} className="block">
            <Button
              variant={diwaniya.is_open ? "default" : "outline"}
              className="w-full"
            >
              View details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
