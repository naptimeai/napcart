import { notFound } from "next/navigation";
import { SmogyOrderSuccessPage } from "@/components/storefront/smogy-pages";
import { SmogyStorefrontShell } from "@/components/storefront/smogy-shell";
import {
  getStorefrontData,
  getStorefrontOrderSummary,
} from "@/server/storefront/repository";

export default async function StorefrontOrderSuccessPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string; orderNumber: string }>;
}) {
  const { restaurantSlug, orderNumber } = await params;
  const [data, order] = await Promise.all([
    getStorefrontData(restaurantSlug),
    getStorefrontOrderSummary({
      restaurantSlug,
      orderNumber,
    }),
  ]);

  if (!data || !order) {
    notFound();
  }

  return (
    <SmogyStorefrontShell data={data} restaurantSlug={restaurantSlug}>
      <SmogyOrderSuccessPage order={order} />
    </SmogyStorefrontShell>
  );
}
