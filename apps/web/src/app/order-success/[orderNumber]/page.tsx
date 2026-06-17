import { notFound } from "next/navigation";
import { SmogyOrderSuccessPage } from "@/components/storefront/smogy-pages";
import {
  getDefaultStorefrontSlug,
  isStorefrontDeployment,
  SmogyDefaultStorefrontRoute,
} from "@/components/storefront/smogy-route-frame";
import { getStorefrontOrderSummary } from "@/server/storefront/repository";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  if (!isStorefrontDeployment()) {
    notFound();
  }

  const restaurantSlug = getDefaultStorefrontSlug();
  const { orderNumber } = await params;
  const order = await getStorefrontOrderSummary({
    restaurantSlug,
    orderNumber,
  });

  if (!order) {
    notFound();
  }

  return (
    <SmogyDefaultStorefrontRoute>
      <SmogyOrderSuccessPage order={order} />
    </SmogyDefaultStorefrontRoute>
  );
}
