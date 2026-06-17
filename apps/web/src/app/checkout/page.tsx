import { notFound } from "next/navigation";
import { SmogyCheckoutPage } from "@/components/storefront/smogy-pages";
import {
  isStorefrontDeployment,
  SmogyDefaultStorefrontRoute,
} from "@/components/storefront/smogy-route-frame";

export default function CheckoutPage() {
  if (!isStorefrontDeployment()) {
    notFound();
  }

  return (
    <SmogyDefaultStorefrontRoute>
      <SmogyCheckoutPage />
    </SmogyDefaultStorefrontRoute>
  );
}
