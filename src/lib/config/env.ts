const requiredPublicEnv = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "NapCart",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  defaultCountry: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ?? "PK",
  defaultCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "PKR",
  defaultTimezone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "Asia/Karachi",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const publicEnv = requiredPublicEnv;
