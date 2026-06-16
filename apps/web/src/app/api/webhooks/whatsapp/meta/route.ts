import { NextResponse, type NextRequest } from "next/server";
import {
  processMetaCloudWebhookPayload,
  verifyMetaWebhookSignature,
  verifyMetaWebhookToken,
} from "@/server/whatsapp/meta-cloud";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message, ok: false }, { status });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !verifyToken || !challenge) {
    return jsonError("Invalid Meta webhook verification request.", 400);
  }

  const isValidToken = await verifyMetaWebhookToken(verifyToken);

  if (!isValidToken) {
    return jsonError("Meta webhook verify token is invalid.", 403);
  }

  return new NextResponse(challenge, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
    status: 200,
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const signatureResult = verifyMetaWebhookSignature({
    rawBody,
    signatureHeader: signature,
  });

  if (!signatureResult.ok) {
    return jsonError(signatureResult.reason, 401);
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonError("Meta webhook payload must be valid JSON.", 400);
  }

  try {
    const result = await processMetaCloudWebhookPayload(payload);

    return NextResponse.json({
      ok: true,
      signature: signatureResult.reason,
      ...result,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "Unable to process Meta WhatsApp webhook.",
      400,
    );
  }
}
