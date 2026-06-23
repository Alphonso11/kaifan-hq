"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Ban, Loader2 } from "lucide-react";

interface BanDialogProps {
  userId?: string;
  userName?: string;
  diwaniyaId: string;
}

export function BanDialog({ userId, userName, diwaniyaId }: BanDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");

  async function handleBan() {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the ban",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "No user ID provided",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        toast({
          title: "Error",
          description: "You must be logged in to ban users",
          variant: "destructive",
        });
        return;
      }

      // Create ban record
      const { error: banError } = await supabase.from("bans").insert({
        diwaniya_id: diwaniyaId,
        user_id: userId,
        banned_by: currentUser.id,
        reason: reason.trim(),
        is_permanent: true,
      } as never);

      if (banError) {
        toast({
          title: "Error",
          description: banError.message,
          variant: "destructive",
        });
        return;
      }

      // Remove any existing registrations
      await supabase
        .from("registrations")
        .delete()
        .eq("diwaniya_id", diwaniyaId)
        .eq("user_id", userId);

      toast({
        title: "User Banned",
        description: `${userName || "User"} has been banned from your Diwaniya.`,
      });

      setIsOpen(false);
      setReason("");
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Ban className="h-4 w-4 mr-1" />
          Ban
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Are you sure you want to ban {userName}? They will not be able to
            register for your Diwaniya.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for ban</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for this ban..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleBan}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
