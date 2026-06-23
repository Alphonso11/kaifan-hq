"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UnbanButtonProps {
  banId: string;
  userName?: string;
}

export function UnbanButton({ banId, userName }: UnbanButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleUnban() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("bans").delete().eq("id", banId);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Unbanned",
        description: `${userName || "User"} has been unbanned and can now register again.`,
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
      variant="outline"
      size="sm"
      onClick={handleUnban}
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Unban
    </Button>
  );
}
