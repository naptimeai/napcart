import { notFound } from "next/navigation";
import { SmogyMenuPage } from "@/components/storefront/smogy-pages";
import { SmogyStorefrontShell } from "@/components/storefront/smogy-shell";
import { getStorefrontData } from "@/server/storefront/repository";

export default async function StorefrontMenuPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;
  const data = await getStorefrontData(restaurantSlug);

  if (!data) {
    notFound();
  }

  return (
    <SmogyStorefrontShell data={data} restaurantSlug={restaurantSlug}>
      <SmogyMenuPage />
    </SmogyStorefrontShell>
  );
}
