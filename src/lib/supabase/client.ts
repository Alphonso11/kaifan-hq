import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// A single shared browser client. Creating a new GoTrue client on every
// createClient() call (useUser, header, forms, …) spawns multiple auth
// instances over the same storage, which can deadlock on the auth lock and
// make getUser()/getSession() hang forever (stuck loading spinner).
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return browserClient;
}
