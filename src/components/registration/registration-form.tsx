"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RegistrationStatusBadge } from "@/components/diwaniya/status-badge";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Ban, AlertCircle, CheckCircle } from "lucide-react";

interface ExistingRegistration {
  id: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
}

interface RegistrationFormProps {
  diwaniyaId: string;
  isOpen: boolean;
  isFull: boolean;
  isBanned: boolean;
  existingRegistration: ExistingRegistration | null;
}

export function RegistrationForm({
  diwaniyaId,
  isOpen,
  isFull,
  isBanned,
  existingRegistration,
}: RegistrationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState("");

  async function handleRegister() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to register",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("registrations").insert({
        diwaniya_id: diwaniyaId,
        user_id: user.id,
        notes: notes || null,
        status: "pending",
      } as never);

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registration submitted!",
        description: "Your registration is pending approval.",
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

  async function handleCancelRegistration() {
    if (!existingRegistration) return;

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("id", existingRegistration.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registration cancelled",
        description: "Your registration has been cancelled.",
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

  if (isBanned) {
    return (
      <div className="text-center py-4">
        <Ban className="h-12 w-12 mx-auto text-destructive mb-3" />
        <p className="font-medium text-destructive">You are banned</p>
        <p className="text-sm text-muted-foreground mt-1">
          You cannot register for this Diwaniya.
        </p>
      </div>
    );
  }

  if (existingRegistration) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          {existingRegistration.status === "approved" ? (
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
          ) : (
            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
          )}
          <p className="font-medium">Registration Status</p>
          <div className="mt-2">
            <RegistrationStatusBadge status={existingRegistration.status} />
          </div>
          {existingRegistration.notes && (
            <p className="text-sm text-muted-foreground mt-3">
              Your note: {existingRegistration.notes}
            </p>
          )}
        </div>

        {existingRegistration.status === "pending" && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleCancelRegistration}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancel Registration
          </Button>
        )}
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="font-medium">Diwaniya is Closed</p>
        <p className="text-sm text-muted-foreground mt-1">
          Registration is not available at this time.
        </p>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="font-medium">Diwaniya is Full</p>
        <p className="text-sm text-muted-foreground mt-1">
          Maximum capacity has been reached.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or information for the host..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button
        className="w-full"
        onClick={handleRegister}
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Register to Attend
      </Button>
    </div>
  );
}
