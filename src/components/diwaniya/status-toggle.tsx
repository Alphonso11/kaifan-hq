"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DoorOpen, DoorClosed } from "lucide-react";

interface StatusToggleProps {
  diwaniyaId: string;
  isOpen: boolean;
}

export function StatusToggle({ diwaniyaId, isOpen }: StatusToggleProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function toggleStatus() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("diwaniyas")
        .update({
          is_open: !isOpen,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", diwaniyaId);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: isOpen ? "Diwaniya Closed" : "Diwaniya Opened",
        description: isOpen
          ? "Your Diwaniya is now closed for registrations."
          : "Your Diwaniya is now open for registrations!",
      });

      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant={isOpen ? "destructive" : "gold"}
      onClick={toggleStatus}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isOpen ? (
        <DoorClosed className="h-4 w-4" />
      ) : (
        <DoorOpen className="h-4 w-4" />
      )}
      {isOpen ? "Close Diwaniya" : "Open Diwaniya"}
    </Button>
  );
}
