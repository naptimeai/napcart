import { notFound } from "next/navigation";
import { SmogyOrderSuccessPage } from "@/components/storefront/smogy-pages";
import { SmogyStorefrontShell } from "@/components/storefront/smogy-shell";
import {
  getStorefrontData,
  getStorefrontOrderSummary,
} from "@/server/storefront/repository";

export default async function StorefrontOrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantSlug: string; orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { restaurantSlug, orderNumber } = await params;
  const { token } = await searchParams;
  const [data, order] = await Promise.all([
    getStorefrontData(restaurantSlug),
    getStorefrontOrderSummary({
      restaurantSlug,
      orderNumber,
      accessToken: token,
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
