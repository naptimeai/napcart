"use server";

import { DayOfWeek, WhatsappProvider } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { DAY_ORDER } from "@/lib/constants/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";
import { getPrisma } from "@/server/db/prisma";
import { runInTransaction } from "@/server/db/transaction";
import { findAdminUserByAuthUserId } from "@/server/repositories/admin-users";
import { uploadRestaurantAsset } from "@/server/storage/restaurant-assets";

const optionalString = z.string().trim().optional().or(z.literal(""));

const restaurantIdentitySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: optionalString,
  supportPhone: z.string().trim().min(5).max(32),
  contactEmail: optionalString.refine(
    (value) => !value || z.email().safeParse(value).success,
    "Please enter a valid email address.",
  ),
});

const restaurantOperationalSchema = z.object({
  minimumOrderAmount: optionalString,
});

const branchSchema = z.object({
  branchId: optionalString,
  name: z.string().trim().min(2).max(120),
  slug: optionalString,
  phone: optionalString,
  addressText: z.string().trim().min(5).max(300),
  displayOrder: optionalString,
});

const whatsappConnectionSchema = z.object({
  connectionId: optionalString,
  branchId: optionalString,
  provider: z.enum([WhatsappProvider.MOCK, WhatsappProvider.META_CLOUD]),
  businessName: z.string().trim().min(2).max(120),
  displayPhoneNumber: z.string().trim().min(5).max(32),
  whatsappBusinessAccountId: optionalString,
  phoneNumberId: optionalString,
  apiBaseUrl: optionalString,
  accessToken: optionalString,
  webhookVerifyToken: optionalString,
});

function normalizeOptionalString(value?: string) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : null;
}

function normalizeOptionalNumber(value?: string) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return null;
  }

  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : null;
}

async function buildUniqueRestaurantSlug(baseSlug: string, restaurantId: string) {
  const prisma = getPrisma();
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.restaurant.findFirst({
      where: {
        slug: candidate,
        NOT: { id: restaurantId },
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function buildUniqueBranchSlug(
  restaurantId: string,
  baseSlug: string,
  branchId?: string,
) {
  const prisma = getPrisma();
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.branch.findFirst({
      where: {
        restaurantId,
        slug: candidate,
        NOT: branchId ? { id: branchId } : undefined,
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function revalidateAdminPhaseTwoPaths() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/branches");
  revalidatePath("/admin/whatsapp");
}

async function assertBranchOwnership(branchId: string, restaurantId: string) {
  const branch = await getPrisma().branch.findFirst({
    where: {
      id: branchId,
      restaurantId,
    },
    select: {
      id: true,
    },
  });

  if (!branch) {
    throw new Error("Branch not found for this restaurant.");
  }
}

async function assertConnectionOwnership(
  connectionId: string,
  restaurantId: string,
) {
  const connection = await getPrisma().whatsappConnection.findFirst({
    where: {
      id: connectionId,
      restaurantId,
    },
  });

  if (!connection) {
    throw new Error("WhatsApp connection not found for this restaurant.");
  }

  return connection;
}

export async function loginToAdmin(formData: FormData) {
  const parsed = z
    .object({
      email: z.email().trim(),
      password: z.string().min(8).max(128),
      next: optionalString,
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next"),
    });

  if (!parsed.success) {
    redirect("/login?error=Please%20enter%20a%20valid%20email%20and%20password.");
  }

  const supabase = await createClient();
  const { email, password, next } = parsed.data;

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !user) {
    redirect("/login?error=Invalid%20email%20or%20password.");
  }

  const adminUser = await findAdminUserByAuthUserId(user.id);

  if (!adminUser || !adminUser.isActive) {
    await supabase.auth.signOut();
    redirect("/login?error=This%20account%20is%20not%20authorized%20for%20NapCart%20admin.");
  }

  revalidatePath("/", "layout");
  redirect(next && next.startsWith("/") ? next : "/admin");
}

export async function logoutFromAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateRestaurantIdentity(formData: FormData) {
  const session = await requireAdminSession();
  const parsed = restaurantIdentitySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    supportPhone: formData.get("supportPhone"),
    contactEmail: formData.get("contactEmail"),
  });

  if (!parsed.success) {
    throw new Error("Invalid restaurant identity input.");
  }

  const slugBase = slugify(parsed.data.slug || parsed.data.name) || "restaurant";
  const uniqueSlug = await buildUniqueRestaurantSlug(slugBase, session.restaurantId);
  const maybeLogoFile = formData.get("logo");
  let uploadedLogoUrl: string | null = null;

  if (maybeLogoFile instanceof File && maybeLogoFile.size > 0) {
    const upload = await uploadRestaurantAsset({
      restaurantSlug: uniqueSlug,
      scope: "branding",
      file: maybeLogoFile,
    });

    uploadedLogoUrl = upload?.publicUrl ?? null;
  }

  await getPrisma().restaurant.update({
    where: { id: session.restaurantId },
    data: {
      name: parsed.data.name,
      slug: uniqueSlug,
      supportPhone: parsed.data.supportPhone,
      contactEmail: normalizeOptionalString(parsed.data.contactEmail),
      logoUrl: uploadedLogoUrl ?? undefined,
    },
  });

  revalidateAdminPhaseTwoPaths();
}

export async function updateRestaurantOperationalSettings(formData: FormData) {
  const session = await requireAdminSession();
  const parsed = restaurantOperationalSchema.safeParse({
    minimumOrderAmount: formData.get("minimumOrderAmount"),
  });

  if (!parsed.success) {
    throw new Error("Invalid operational settings input.");
  }

  await getPrisma().restaurantSettings.upsert({
    where: { restaurantId: session.restaurantId },
    update: {
      isAcceptingOrders: formData.get("isAcceptingOrders") === "on",
      isGloballyClosed: formData.get("isGloballyClosed") === "on",
      pickupEnabled: formData.get("pickupEnabled") === "on",
      deliveryEnabled: formData.get("deliveryEnabled") === "on",
      minimumOrderAmount: normalizeOptionalNumber(parsed.data.minimumOrderAmount),
    },
    create: {
      restaurantId: session.restaurantId,
      isAcceptingOrders: formData.get("isAcceptingOrders") === "on",
      isGloballyClosed: formData.get("isGloballyClosed") === "on",
      pickupEnabled: formData.get("pickupEnabled") === "on",
      deliveryEnabled: formData.get("deliveryEnabled") === "on",
      minimumOrderAmount: normalizeOptionalNumber(parsed.data.minimumOrderAmount),
    },
  });

  revalidateAdminPhaseTwoPaths();
}

export async function createOrUpdateBranch(formData: FormData) {
  const session = await requireAdminSession();
  const parsed = branchSchema.safeParse({
    branchId: formData.get("branchId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    phone: formData.get("phone"),
    addressText: formData.get("addressText"),
    displayOrder: formData.get("displayOrder"),
  });

  if (!parsed.success) {
    throw new Error("Invalid branch input.");
  }

  const branchId = normalizeOptionalString(parsed.data.branchId) ?? undefined;
  const slugBase = slugify(parsed.data.slug || parsed.data.name) || "branch";
  const uniqueSlug = await buildUniqueBranchSlug(
    session.restaurantId,
    slugBase,
    branchId,
  );

  if (branchId) {
    await assertBranchOwnership(branchId, session.restaurantId);

    await getPrisma().branch.update({
      where: { id: branchId },
      data: {
        name: parsed.data.name,
        slug: uniqueSlug,
        phone: normalizeOptionalString(parsed.data.phone),
        addressText: parsed.data.addressText,
        displayOrder: Number.parseInt(parsed.data.displayOrder || "0", 10) || 0,
        isActive: formData.get("isActive") === "on",
        isAcceptingOrders: formData.get("isAcceptingOrders") === "on",
        isTemporarilyClosed: formData.get("isTemporarilyClosed") === "on",
      },
    });
  } else {
    await runInTransaction(async (tx) => {
      const branch = await tx.branch.create({
        data: {
          restaurantId: session.restaurantId,
          name: parsed.data.name,
          slug: uniqueSlug,
          phone: normalizeOptionalString(parsed.data.phone),
          addressText: parsed.data.addressText,
          displayOrder: Number.parseInt(parsed.data.displayOrder || "0", 10) || 0,
          isActive: true,
          isAcceptingOrders: true,
          isTemporarilyClosed: false,
        },
      });

      await tx.branchOperatingHour.createMany({
        data: DAY_ORDER.map((dayOfWeek, index) => ({
          branchId: branch.id,
          dayOfWeek: dayOfWeek as DayOfWeek,
          openTime: index < 5 ? "11:00" : "12:00",
          closeTime: "23:00",
          isClosed: false,
        })),
      });
    });
  }

  revalidateAdminPhaseTwoPaths();
}

export async function updateBranchOperatingHours(formData: FormData) {
  const session = await requireAdminSession();
  const branchId = String(formData.get("branchId") ?? "").trim();

  if (!branchId) {
    throw new Error("Branch is required.");
  }

  await assertBranchOwnership(branchId, session.restaurantId);

  await runInTransaction(async (tx) => {
    for (const day of DAY_ORDER) {
      const dayOfWeek = day as DayOfWeek;
      const openTime = String(formData.get(`${day}_openTime`) ?? "").trim();
      const closeTime = String(formData.get(`${day}_closeTime`) ?? "").trim();
      const isClosed = formData.get(`${day}_isClosed`) === "on";

      await tx.branchOperatingHour.upsert({
        where: {
          branchId_dayOfWeek: {
            branchId,
            dayOfWeek,
          },
        },
        update: {
          isClosed,
          openTime: isClosed ? null : openTime || "11:00",
          closeTime: isClosed ? null : closeTime || "23:00",
        },
        create: {
          branchId,
          dayOfWeek,
          isClosed,
          openTime: isClosed ? null : openTime || "11:00",
          closeTime: isClosed ? null : closeTime || "23:00",
        },
      });
    }
  });

  revalidateAdminPhaseTwoPaths();
}

export async function archiveBranch(formData: FormData) {
  const session = await requireAdminSession();
  const branchId = String(formData.get("branchId") ?? "").trim();

  if (!branchId) {
    throw new Error("Branch is required.");
  }

  await assertBranchOwnership(branchId, session.restaurantId);

  const prisma = getPrisma();
  const existingOrders = await prisma.order.count({
    where: { branchId },
  });

  if (existingOrders > 0) {
    await prisma.branch.update({
      where: { id: branchId },
      data: {
        isActive: false,
        isAcceptingOrders: false,
        isTemporarilyClosed: true,
      },
    });
  } else {
    await prisma.branch.delete({
      where: { id: branchId },
    });
  }

  revalidateAdminPhaseTwoPaths();
}

export async function createOrUpdateWhatsappConnection(formData: FormData) {
  const session = await requireAdminSession();
  const parsed = whatsappConnectionSchema.safeParse({
    connectionId: formData.get("connectionId"),
    branchId: formData.get("branchId"),
    provider: formData.get("provider"),
    businessName: formData.get("businessName"),
    displayPhoneNumber: formData.get("displayPhoneNumber"),
    whatsappBusinessAccountId: formData.get("whatsappBusinessAccountId"),
    phoneNumberId: formData.get("phoneNumberId"),
    apiBaseUrl: formData.get("apiBaseUrl"),
    accessToken: formData.get("accessToken"),
    webhookVerifyToken: formData.get("webhookVerifyToken"),
  });

  if (!parsed.success) {
    throw new Error("Invalid WhatsApp connection input.");
  }

  const connectionId = normalizeOptionalString(parsed.data.connectionId);
  const isDefaultForRestaurant = formData.get("isDefaultForRestaurant") === "on";
  const isActive = formData.get("isActive") === "on";

  await runInTransaction(async (tx) => {
    if (isDefaultForRestaurant) {
      await tx.whatsappConnection.updateMany({
        where: { restaurantId: session.restaurantId },
        data: { isDefaultForRestaurant: false },
      });
    }

    const existing = connectionId
      ? await assertConnectionOwnership(connectionId, session.restaurantId)
      : null;

    const normalizedBranchId = normalizeOptionalString(parsed.data.branchId);

    if (normalizedBranchId) {
      await assertBranchOwnership(normalizedBranchId, session.restaurantId);
    }

    const data = {
      restaurantId: session.restaurantId,
      branchId: normalizedBranchId,
      provider: parsed.data.provider,
      businessName: parsed.data.businessName,
      displayPhoneNumber: parsed.data.displayPhoneNumber,
      whatsappBusinessAccountId: normalizeOptionalString(
        parsed.data.whatsappBusinessAccountId,
      ),
      phoneNumberId: normalizeOptionalString(parsed.data.phoneNumberId),
      apiBaseUrl: normalizeOptionalString(parsed.data.apiBaseUrl),
      accessTokenEncrypted:
        normalizeOptionalString(parsed.data.accessToken) ??
        existing?.accessTokenEncrypted ??
        null,
      webhookVerifyTokenEncrypted:
        normalizeOptionalString(parsed.data.webhookVerifyToken) ??
        existing?.webhookVerifyTokenEncrypted ??
        null,
      isActive,
      isDefaultForRestaurant,
    };

    if (connectionId) {
      await tx.whatsappConnection.update({
        where: { id: connectionId },
        data,
      });
    } else {
      await tx.whatsappConnection.create({
        data,
      });
    }
  });

  revalidateAdminPhaseTwoPaths();
}

export async function deleteWhatsappConnection(formData: FormData) {
  const session = await requireAdminSession();
  const connectionId = String(formData.get("connectionId") ?? "").trim();

  if (!connectionId) {
    throw new Error("Connection is required.");
  }

  await assertConnectionOwnership(connectionId, session.restaurantId);

  await getPrisma().whatsappConnection.delete({
    where: { id: connectionId },
  });

  revalidateAdminPhaseTwoPaths();
}
