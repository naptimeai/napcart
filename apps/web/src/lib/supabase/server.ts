import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/config/server-env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    serverEnv.supabaseUrl,
    serverEnv.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Next.js server components cannot persist cookies directly.
            // The request proxy refresh flow handles auth cookie writes safely.
          }
        },
      },
    },
  );
}
