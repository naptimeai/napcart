import type { NextConfig } from "next";

function getSupabaseImageRemotePatterns() {
  const staticSupabaseHost = "xdnbllqsbalbnjjsrcos.supabase.co";
  const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hostnames = new Set([staticSupabaseHost]);

  if (configuredSupabaseUrl) {
    try {
      hostnames.add(new URL(configuredSupabaseUrl).hostname);
    } catch {
      console.warn("Invalid NEXT_PUBLIC_SUPABASE_URL for image host allowlist.");
    }
  }

  return Array.from(hostnames).map((hostname) => ({
    protocol: "https" as const,
    hostname,
    pathname: "/storage/v1/object/public/**",
  }));
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...getSupabaseImageRemotePatterns(),
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
