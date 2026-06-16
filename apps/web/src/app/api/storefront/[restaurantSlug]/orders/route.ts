import { ZodError } from "zod";
import { NextResponse } from "next/server";
import {
  placeStorefrontOrder,
  storefrontOrderSchema,
} from "@/server/storefront/order-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ restaurantSlug: string }> },
) {
  try {
    const { restaurantSlug } = await context.params;
    const body = storefrontOrderSchema.parse(await request.json());
    const order = await placeStorefrontOrder(restaurantSlug, body);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Order details are incomplete or invalid.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to place order right now.",
      },
      { status: 400 },
    );
  }
}
