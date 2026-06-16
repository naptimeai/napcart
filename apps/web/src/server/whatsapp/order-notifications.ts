import {
  WhatsappProvider,
  type Prisma,
  type WhatsappConnection,
} from "@prisma/client";
import { createMockWhatsappOrderLog } from "@/server/storefront/whatsapp";
import { createMetaCloudWhatsappOrderLog } from "@/server/whatsapp/meta-cloud";
import type { OrderForWhatsappMessage } from "@/server/whatsapp/message-format";

export async function createWhatsappOrderNotificationLog({
  tx,
  order,
  restaurantId,
  branchId,
  restaurantSlug,
  connection,
}: {
  tx: Prisma.TransactionClient;
  order: OrderForWhatsappMessage;
  restaurantId: string;
  branchId: string;
  restaurantSlug: string;
  connection: WhatsappConnection | null;
}) {
  if (connection?.provider === WhatsappProvider.META_CLOUD) {
    return createMetaCloudWhatsappOrderLog({
      tx,
      order,
      restaurantId,
      branchId,
      connection,
    });
  }

  return createMockWhatsappOrderLog({
    tx,
    order,
    restaurantId,
    branchId,
    restaurantSlug,
    connection,
  });
}
