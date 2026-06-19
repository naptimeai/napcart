import { createHmac, timingSafeEqual } from "crypto";

function getOrderAccessSecret() {
  const secret =
    process.env.NAPCART_ORDER_ACCESS_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Missing order access token secret.");
  }

  return secret;
}

function buildOrderAccessPayload({
  orderId,
  orderNumber,
  customerPhone,
}: {
  orderId: string;
  orderNumber: string;
  customerPhone: string;
}) {
  return `${orderId}:${orderNumber}:${customerPhone}`;
}

export function signStorefrontOrderAccessToken({
  orderId,
  orderNumber,
  customerPhone,
}: {
  orderId: string;
  orderNumber: string;
  customerPhone: string;
}) {
  return createHmac("sha256", getOrderAccessSecret())
    .update(buildOrderAccessPayload({ orderId, orderNumber, customerPhone }))
    .digest("base64url");
}

export function verifyStorefrontOrderAccessToken({
  orderId,
  orderNumber,
  customerPhone,
  token,
}: {
  orderId: string;
  orderNumber: string;
  customerPhone: string;
  token: string | null | undefined;
}) {
  if (!token) {
    return false;
  }

  const expected = signStorefrontOrderAccessToken({
    orderId,
    orderNumber,
    customerPhone,
  });
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(token);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}
