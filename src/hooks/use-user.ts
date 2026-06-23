"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types/database";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadProfile(userId: string) {
      try {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single<User>();
        if (active) setUser(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    // Initial load from the stored session (local read, no network).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // IMPORTANT: never call other supabase methods synchronously inside this
      // callback — it holds the auth lock and would deadlock. Defer with a
      // timeout so the callback returns and releases the lock first.
      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
        return;
      }
      if (session?.user) {
        const userId = session.user.id;
        setTimeout(() => {
          if (active) loadProfile(userId);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
}
