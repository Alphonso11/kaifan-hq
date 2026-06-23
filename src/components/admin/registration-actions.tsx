"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Check, X, Clock, Loader2 } from "lucide-react";
import type { RegistrationStatus } from "@/types/database";

interface RegistrationActionsProps {
  registrationId: string;
  currentStatus: RegistrationStatus;
}

export function RegistrationActions({
  registrationId,
  currentStatus,
}: RegistrationActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(status: RegistrationStatus) {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("registrations")
        .update({
          status,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", registrationId);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const statusLabels = {
        pending: "set to pending",
        approved: "approved",
        rejected: "rejected",
      };

      toast({
        title: "Status Updated",
        description: `Registration has been ${statusLabels[status]}.`,
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

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus !== "approved" && (
          <DropdownMenuItem onClick={() => updateStatus("approved")}>
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Approve
          </DropdownMenuItem>
        )}
        {currentStatus !== "rejected" && (
          <DropdownMenuItem onClick={() => updateStatus("rejected")}>
            <X className="mr-2 h-4 w-4 text-destructive" />
            Reject
          </DropdownMenuItem>
        )}
        {currentStatus !== "pending" && (
          <DropdownMenuItem onClick={() => updateStatus("pending")}>
            <Clock className="mr-2 h-4 w-4 text-yellow-500" />
            Set Pending
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
