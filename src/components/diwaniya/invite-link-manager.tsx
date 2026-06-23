"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link2, Copy, Check, Trash2, Clock } from "lucide-react";
import type { InviteLink } from "@/types/database";

interface InviteLinkManagerProps {
  diwaniyaId: string;
}

function joinUrl(token: string) {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "";
  return `${base}/join/${token}`;
}

function timeLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const hours = Math.floor(ms / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (hours >= 1) return `expires in ${hours}h ${mins}m`;
  return `expires in ${mins}m`;
}

export function InviteLinkManager({ diwaniyaId }: InviteLinkManagerProps) {
  const { toast } = useToast();
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("invite_links")
      .select("*")
      .eq("diwaniya_id", diwaniyaId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    setLinks((data as InviteLink[]) || []);
  }, [diwaniyaId]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  async function createLink() {
    setIsCreating(true);
    const supabase = createClient();
    try {
      const { data: token, error } = await supabase.rpc("create_invite_link", {
        p_diwaniya_id: diwaniyaId,
      } as never);

      if (error || !token) {
        toast({
          title: "Couldn't create link",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
        return;
      }

      await copy(token);
      toast({
        title: "Invite link created",
        description: "Copied to clipboard — it expires in 24 hours.",
      });
      loadLinks();
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(joinUrl(token));
      setCopied(token);
      setTimeout(() => setCopied((c) => (c === token ? null : c)), 2000);
    } catch {
      // clipboard may be unavailable; ignore
    }
  }

  async function revoke(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("invite_links").delete().eq("id", id);
    if (error) {
      toast({
        title: "Couldn't revoke link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setLinks((prev) => prev.filter((l) => l.id !== id));
    toast({ title: "Link revoked" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Share a link to let guests join. Each link works for 24 hours, then
          expires.
        </p>
        <Button variant="gold" size="sm" onClick={createLink} disabled={isCreating}>
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          New invite link
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center">
          <Link2 className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No active invite links. Create one to start welcoming guests.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs text-foreground">
                  {joinUrl(link.token)}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeLeft(link.expires_at)}
                </p>
              </div>
              <button
                onClick={() => copy(link.token)}
                title="Copy link"
                className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {copied === link.token ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => revoke(link.id)}
                title="Revoke link"
                className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
