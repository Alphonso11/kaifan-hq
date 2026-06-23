"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Loader2, Building2, ArrowLeft } from "lucide-react";

export default function NewHostDiwaniyaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DiwaniyaInput>({
    resolver: zodResolver(diwaniyaSchema),
    defaultValues: { max_capacity: 50 },
  });

  const name = watch("name");

  useEffect(() => {
    if (name) setValue("slug", generateSlug(name));
  }, [name, setValue]);

  async function onSubmit(data: DiwaniyaInput) {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.rpc("create_diwaniya", {
        p_name: data.name,
        p_slug: data.slug,
        p_location: data.location || null,
        p_description: data.description || null,
        p_max_capacity: data.max_capacity,
      } as never);

      if (error) {
        toast({
          title: "Couldn't create your diwaniya",
          description: error.message.includes("duplicate")
            ? "That URL slug is already taken — try a different name."
            : error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Your majlis is ready",
        description: "You're now the host. Open your doors and invite guests.",
      });

      // Role was upgraded to host — refresh so middleware routes to /admin.
      router.push("/admin");
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="lattice-gold pointer-events-none fixed inset-0 z-0 opacity-50" />
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/guest"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary text-gold">
            <Building2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">
              Become a host
            </p>
            <h1 className="font-display text-3xl tracking-tight">
              Open your diwaniya
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Diwaniya details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Diwaniya Al Salam"
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL slug</Label>
                <Input
                  id="slug"
                  placeholder="diwaniya-al-salam"
                  {...register("slug")}
                  disabled={isLoading}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Kaifan, Block 4"
                  {...register("location")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell guests what your majlis is about..."
                  {...register("description")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_capacity">Maximum capacity</Label>
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

              <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                Hosting is free while we&apos;re getting started. You can create
                one diwaniya and manage it from your host dashboard.
              </p>

              <Button type="submit" variant="gold" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create my diwaniya
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
