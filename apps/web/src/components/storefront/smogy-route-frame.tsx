import { Outfit, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SmogyStorefrontShell } from "@/components/storefront/smogy-shell";
import { publicEnv } from "@/lib/config/env";
import {
  getFallbackStorefrontSlug,
  getStorefrontData,
} from "@/server/storefront/repository";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-smogy-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-smogy-serif",
});

export function getDefaultStorefrontSlug() {
  return publicEnv.defaultRestaurantSlug.trim();
}

export function isStorefrontDeployment() {
  return publicEnv.deploymentMode === "storefront";
}

export async function SmogyDefaultStorefrontRoute({
  children,
}: {
  children: ReactNode;
}) {
  const restaurantSlug = getDefaultStorefrontSlug() || await getFallbackStorefrontSlug();

  if (!restaurantSlug) {
    notFound();
  }

  const data = await getStorefrontData(restaurantSlug);

  if (!data) {
    notFound();
  }

  return (
    <div
      className={`${outfit.variable} ${playfair.variable} smogy-storefront min-h-screen`}
    >
      <SmogyStorefrontShell data={data} restaurantSlug={restaurantSlug}>
        <Suspense fallback={null}>{children}</Suspense>
      </SmogyStorefrontShell>
    </div>
  );
}
