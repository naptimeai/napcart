import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/config/server-env";

export function createAdminClient() {
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
