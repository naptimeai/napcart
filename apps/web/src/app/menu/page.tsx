import { notFound } from "next/navigation";
import { SmogyMenuPage } from "@/components/storefront/smogy-pages";
import {
  isStorefrontDeployment,
  SmogyDefaultStorefrontRoute,
} from "@/components/storefront/smogy-route-frame";

export default function MenuPage() {
  if (!isStorefrontDeployment()) {
    notFound();
  }

  return (
    <SmogyDefaultStorefrontRoute>
      <SmogyMenuPage />
    </SmogyDefaultStorefrontRoute>
  );
}
