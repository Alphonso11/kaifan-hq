"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types/database";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single<User>();

          if (error) {
            console.error("Error fetching user profile:", error);
          }
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (session?.user) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single<User>();

        setUser(data);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
}
