import { Outfit, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { publicEnv } from "@/lib/config/env";
import { getStorefrontData } from "@/server/storefront/repository";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-smogy-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-smogy-serif",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}): Promise<Metadata> {
  const { restaurantSlug } = await params;
  const data = await getStorefrontData(restaurantSlug);
  const restaurantName = data?.restaurant.name ?? publicEnv.clientName;
  const description = data
    ? `Order ${restaurantName} online for delivery or pickup.`
    : publicEnv.clientDescription;
  const logoUrl = data?.restaurant.logoUrl || publicEnv.clientIconPath || "";
  const canonicalPath = `/storefront/${restaurantSlug}`;
  const metadataBase = publicEnv.appUrl ? new URL(publicEnv.appUrl) : undefined;

  return {
    title: restaurantName,
    description,
    metadataBase,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: restaurantName,
      description,
      url: canonicalPath,
      siteName: restaurantName,
      images: logoUrl ? [{ url: logoUrl }] : undefined,
      type: "website",
    },
    icons: logoUrl
      ? {
          icon: logoUrl,
          apple: logoUrl,
        }
      : undefined,
  };
}

export default function StorefrontTenantLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div
      className={`${outfit.variable} ${playfair.variable} smogy-storefront min-h-screen`}
    >
      {children}
    </div>
  );
}
