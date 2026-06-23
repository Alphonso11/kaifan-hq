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
import { diwaniyaSchema, type DiwaniyaInput } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { User } from "@/types/database";

export default function NewDiwaniyaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DiwaniyaInput>({
    resolver: zodResolver(diwaniyaSchema),
    defaultValues: {
      max_capacity: 50,
    },
  });

  const name = watch("name");

  useEffect(() => {
    if (name) {
      setValue("slug", generateSlug(name));
    }
  }, [name, setValue]);

  useEffect(() => {
    async function fetchAdmins() {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("*")
        .in("role", ["admin", "super_admin"])
        .order("name");

      if (data) {
        setAdmins(data as User[]);
      }
    }

    fetchAdmins();
  }, []);

  async function onSubmit(data: DiwaniyaInput) {
    if (!selectedAdmin) {
      toast({
        title: "Error",
        description: "Please select an admin for this Diwaniya",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("diwaniyas").insert({
        name: data.name,
        slug: data.slug,
        location: data.location || null,
        description: data.description || null,
        max_capacity: data.max_capacity,
        admin_id: selectedAdmin,
        is_open: false,
        current_capacity: 0,
      } as never);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Diwaniya Created",
        description: "The new Diwaniya has been created successfully.",
      });

      router.push("/super-admin/diwaniyas");
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Diwaniya</h1>
        <p className="text-muted-foreground">
          Add a new Diwaniya to the system.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Diwaniya Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Diwaniya"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                placeholder="my-diwaniya"
                {...register("slug")}
                disabled={isLoading}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin">Admin</Label>
              <select
                id="admin"
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isLoading}
              >
                <option value="">Select an admin...</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Block 5, Street 10, Kaifan"
                {...register("location")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this Diwaniya..."
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

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Diwaniya
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
