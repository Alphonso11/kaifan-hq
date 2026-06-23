"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: user.phone || "",
      });
    }
  }, [user, reset]);

  async function onSubmit(data: ProfileInput) {
    if (!user) return;

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: data.name,
          phone: data.phone || null,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", user.id);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
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

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+965 XXXX XXXX"
                  {...register("phone")}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Avatar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar_url || ""} alt={user?.name} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Avatar is synced from your authentication provider.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
