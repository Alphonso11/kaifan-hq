"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDiwaniyaSchema, type UpdateDiwaniyaInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Diwaniya } from "@/types/database";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [diwaniya, setDiwaniya] = useState<Diwaniya | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateDiwaniyaInput>({
    resolver: zodResolver(updateDiwaniyaSchema),
  });

  useEffect(() => {
    async function fetchDiwaniya() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("diwaniyas")
          .select("*")
          .eq("admin_id", user.id)
          .single();

        const typedData = data as Diwaniya | null;
        if (typedData) {
          setDiwaniya(typedData);
          reset({
            name: typedData.name,
            slug: typedData.slug,
            location: typedData.location || "",
            description: typedData.description || "",
            max_capacity: typedData.max_capacity,
          });
        }
      }
    }

    fetchDiwaniya();
  }, [reset]);

  async function onSubmit(data: UpdateDiwaniyaInput) {
    if (!diwaniya) return;

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("diwaniyas")
        .update({
          name: data.name,
          slug: data.slug,
          location: data.location || null,
          description: data.description || null,
          max_capacity: data.max_capacity,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", diwaniya.id);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Settings updated",
        description: "Your Diwaniya settings have been updated.",
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

  if (!diwaniya) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diwaniya Settings</h1>
        <p className="text-muted-foreground">
          Update your Diwaniya details and settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Diwaniya Name</Label>
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
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  disabled={isLoading}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Used in the URL: /guest/diwaniyas/{diwaniya.slug}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Block 5, Street 10, Kaifan"
                {...register("location")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your Diwaniya..."
                {...register("description")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_capacity">Maximum Capacity</Label>
              <Input
                id="max_capacity"
                type="number"
                min="1"
                {...register("max_capacity", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.max_capacity && (
                <p className="text-sm text-destructive">
                  {errors.max_capacity.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
