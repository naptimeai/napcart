const requiredPublicEnv = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "NapCart",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  deploymentMode:
    process.env.NEXT_PUBLIC_NAPCART_DEPLOYMENT_MODE ?? "core",
  defaultRestaurantSlug:
    process.env.NEXT_PUBLIC_DEFAULT_RESTAURANT_SLUG ?? "",
  clientName: process.env.NEXT_PUBLIC_CLIENT_NAME ?? "NapCart",
  clientDescription:
    process.env.NEXT_PUBLIC_CLIENT_DESCRIPTION ??
    "Restaurant ordering, catalog, branch, delivery, and WhatsApp operations dashboard.",
  clientIconPath: process.env.NEXT_PUBLIC_CLIENT_ICON_PATH ?? "",
  clientWebsiteUrl: process.env.NEXT_PUBLIC_CLIENT_WEBSITE_URL ?? "",
  defaultCountry: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ?? "PK",
  defaultCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "PKR",
  defaultTimezone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "Asia/Karachi",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "",
};

export const publicEnv = requiredPublicEnv;
