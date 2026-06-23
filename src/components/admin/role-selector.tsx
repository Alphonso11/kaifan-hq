"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, User, Shield, Crown, Loader2 } from "lucide-react";
import type { UserRole } from "@/types/database";

interface RoleSelectorProps {
  userId: string;
  currentRole: UserRole;
}

export function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function updateRole(newRole: UserRole) {
    if (newRole === currentRole) return;

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("users")
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", userId);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const roleLabels = {
        guest: "Guest",
        admin: "Admin",
        super_admin: "Super Admin",
      };

      toast({
        title: "Role Updated",
        description: `User role has been changed to ${roleLabels[newRole]}.`,
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
        <DropdownMenuItem
          onClick={() => updateRole("guest")}
          disabled={currentRole === "guest"}
        >
          <User className="mr-2 h-4 w-4" />
          Set as Guest
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => updateRole("admin")}
          disabled={currentRole === "admin"}
        >
          <Shield className="mr-2 h-4 w-4" />
          Set as Admin
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => updateRole("super_admin")}
          disabled={currentRole === "super_admin"}
        >
          <Crown className="mr-2 h-4 w-4" />
          Set as Super Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
