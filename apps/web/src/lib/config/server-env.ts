function readRequiredServerEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabasePublishableKey) {
  throw new Error(
    "Missing required server environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

export const serverEnv = {
  databaseUrl: readRequiredServerEnv("DATABASE_URL"),
  supabaseServiceRoleKey: readRequiredServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseUrl: readRequiredServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabasePublishableKey,
} as const;
