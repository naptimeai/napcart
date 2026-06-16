import { NextResponse } from "next/server";
import { getStorefrontData } from "@/server/storefront/repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ restaurantSlug: string }> },
) {
  const { restaurantSlug } = await context.params;
  const data = await getStorefrontData(restaurantSlug);

  if (!data) {
    return NextResponse.json(
      { error: "Restaurant storefront was not found." },
      { status: 404 },
    );
  }

  return NextResponse.json(data);
}
