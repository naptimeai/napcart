import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import {
  applyMockWhatsappStaffAction,
  type MockWhatsappStaffAction,
} from "@/server/storefront/whatsapp";

const mockActionSchema = z.object({
  action: z.enum(["confirm", "cancel"]),
  token: z.string().trim().min(20),
});

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      restaurantSlug: string;
      orderNumber: string;
    }>;
  },
) {
  try {
    const { restaurantSlug, orderNumber } = await context.params;
    const body = mockActionSchema.parse(await request.json());
    const result = await applyMockWhatsappStaffAction({
      restaurantSlug,
      orderNumber,
      action: body.action as MockWhatsappStaffAction,
      token: body.token,
    });

    return NextResponse.json({
      ok: true,
      orderNumber: result.orderNumber,
      status: result.status,
      changed: result.changed,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Mock WhatsApp action payload is invalid.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to process mock WhatsApp action.",
      },
      { status: 400 },
    );
  }
}
