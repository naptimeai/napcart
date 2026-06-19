"use server";

import { DayOfWeek, Prisma, WhatsappProvider } from "@prisma/client";
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
import { encryptFieldValue } from "@/server/security/field-encryption";
import {
  deleteRestaurantAssetByPublicUrl,
  uploadRestaurantAsset,
} from "@/server/storage/restaurant-assets";
import {
  applyMockWhatsappStaffAction,
  type MockWhatsappStaffAction,
} from "@/server/storefront/whatsapp";

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

const catalogSettingsSchema = z.object({
  catalogName: optionalString,
  defaultLanguage: optionalString,
  timezone: optionalString,
  defaultCurrency: optionalString,
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

const categorySchema = z.object({
  categoryId: optionalString,
  name: z.string().trim().min(2).max(120),
  slug: optionalString,
  description: optionalString,
  sortOrder: optionalString,
});

const productSchema = z.object({
  productId: optionalString,
  categoryId: z.uuid(),
  name: z.string().trim().min(2).max(160),
  slug: optionalString,
  description: optionalString,
  basePrice: z.string().trim().min(1),
  displayOrder: optionalString,
});

const productBranchAvailabilitySchema = z.object({
  productId: z.uuid(),
});

const productVariantSchema = z.object({
  variantId: optionalString,
  productId: z.uuid(),
  name: z.string().trim().min(1).max(120),
  priceDelta: optionalString,
  fixedPrice: optionalString,
  sortOrder: optionalString,
});

const addonGroupSchema = z.object({
  addonGroupId: optionalString,
  productId: z.uuid(),
  name: z.string().trim().min(2).max(120),
  minSelect: optionalString,
  maxSelect: optionalString,
  sortOrder: optionalString,
});

const addonSchema = z.object({
  addonId: optionalString,
  addonGroupId: z.uuid(),
  productId: z.uuid(),
  name: z.string().trim().min(1).max(120),
  price: z.string().trim().min(1),
  sortOrder: optionalString,
});

const deliveryZoneSchema = z.object({
  deliveryZoneId: optionalString,
  branchId: z.uuid(),
  name: z.string().trim().min(2).max(120),
  maxDistanceKm: z.string().trim().min(1),
  fee: z.string().trim().min(1),
  minimumOrderAmount: optionalString,
  sortOrder: optionalString,
});

const mockWhatsappActionSchema = z.object({
  redirectTo: optionalString,
  orderNumber: z.string().trim().min(1),
  action: z.enum(["confirm", "cancel"]),
  token: z.string().trim().min(20),
});

const changePasswordSchema = z
  .object({
    redirectTo: optionalString,
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "New password confirmation does not match.",
    path: ["confirmPassword"],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "New password must be different from the current password.",
    path: ["newPassword"],
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

function normalizeRequiredMoney(value: string) {
  const number = Number.parseFloat(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}

function normalizeOptionalInt(value?: string) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return 0;
  }

  const number = Number.parseInt(normalized, 10);
  return Number.isFinite(number) ? number : 0;
}

function buildRedirectPath(pathname: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return `${pathname}?${searchParams.toString()}`;
}

function resolveAdminRedirectTarget(value?: string | null) {
  if (isSafeAdminRedirect(value)) {
    return value;
  }

  return "/admin";
}

function resolveFormRedirectTarget(formData: FormData, fallback: string) {
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();

  if (isSafeAdminRedirect(redirectTo)) {
    return redirectTo;
  }

  return fallback;
}

function isSafeAdminRedirect(value?: string | null): value is string {
  return (
    value === "/admin" ||
    Boolean(value?.startsWith("/admin/")) ||
    Boolean(value?.startsWith("/admin?"))
  );
}

function redirectWithError(pathname: string, message: string): never {
  return redirect(
    buildRedirectPath(pathname, {
      error: message,
    }),
  );
}

function redirectWithNotice(pathname: string, message: string): never {
  return redirect(
    buildRedirectPath(pathname, {
      notice: message,
    }),
  );
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

async function buildUniqueCategorySlug(
  restaurantId: string,
  baseSlug: string,
  categoryId?: string,
) {
  const prisma = getPrisma();
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        restaurantId,
        slug: candidate,
        NOT: categoryId ? { id: categoryId } : undefined,
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

async function buildUniqueProductSlug(
  restaurantId: string,
  baseSlug: string,
  productId?: string,
) {
  const prisma = getPrisma();
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        restaurantId,
        slug: candidate,
        NOT: productId ? { id: productId } : undefined,
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

function revalidateAdminPaths() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/branches");
  revalidatePath("/admin/branches/delivery");
  revalidatePath("/admin/branches/delivery/zones");
  revalidatePath("/admin/branches/settings");
  revalidatePath("/admin/whatsapp");
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/catalog/categories");
  revalidatePath("/admin/catalog/products");
  revalidatePath("/admin/catalog/products/new");
  revalidatePath("/admin/catalog/settings");
  revalidatePath("/admin/customers");
}

const revalidateAdminPhaseTwoPaths = revalidateAdminPaths;

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

async function assertCategoryOwnership(categoryId: string, restaurantId: string) {
  const category = await getPrisma().category.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    throw new Error("Category not found for this restaurant.");
  }
}

async function assertProductOwnership(productId: string, restaurantId: string) {
  const product = await getPrisma().product.findFirst({
    where: {
      id: productId,
      restaurantId,
    },
    select: {
      id: true,
      imageUrl: true,
    },
  });

  if (!product) {
    throw new Error("Product not found for this restaurant.");
  }

  return product;
}

async function assertAddonGroupOwnership(
  addonGroupId: string,
  restaurantId: string,
) {
  const addonGroup = await getPrisma().addonGroup.findFirst({
    where: {
      id: addonGroupId,
      product: {
        restaurantId,
      },
    },
    select: {
      id: true,
      productId: true,
    },
  });

  if (!addonGroup) {
    throw new Error("Add-on group not found for this restaurant.");
  }

  return addonGroup;
}

async function assertDeliveryZoneOwnership(
  deliveryZoneId: string,
  restaurantId: string,
) {
  const deliveryZone = await getPrisma().deliveryZone.findFirst({
    where: {
      id: deliveryZoneId,
      branch: {
        restaurantId,
      },
    },
    select: {
      id: true,
      branchId: true,
    },
  });

  if (!deliveryZone) {
    throw new Error("Delivery zone not found for this restaurant.");
  }

  return deliveryZone;
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
  redirect(resolveAdminRedirectTarget(next));
}

export async function logoutFromAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function changeAdminPassword(formData: FormData) {
  const session = await requireAdminSession();
  const parsed = changePasswordSchema.safeParse({
    redirectTo: formData.get("redirectTo"),
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  const redirectTo = resolveAdminRedirectTarget(
    String(formData.get("redirectTo") ?? "").trim(),
  );

  if (!parsed.success) {
    redirectWithError(
      redirectTo,
      parsed.error.issues[0]?.message ??
        "Please review the password fields and try again.",
    );
  }

  const supabase = await createClient();
  const verifyCurrentPassword = await supabase.auth.signInWithPassword({
    email: session.adminEmail,
    password: parsed.data.currentPassword,
  });

  if (verifyCurrentPassword.error) {
    redirectWithError(redirectTo, "Current password is incorrect.");
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error) {
    redirectWithError(
      redirectTo,
      "We could not update the password right now. Please try again.",
    );
  }

  revalidatePath("/", "layout");
  redirectWithNotice(redirectTo, "Password updated successfully.");
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
    redirectWithError(
      "/admin/settings",
      "Please review the restaurant profile fields and try again.",
    );
  }

  const slugBase = slugify(parsed.data.slug || parsed.data.name) || "restaurant";
  const uniqueSlug = await buildUniqueRestaurantSlug(slugBase, session.restaurantId);
  const maybeLogoFile = formData.get("logo");
  let uploadedLogoUrl: string | null = null;
  let previousLogoUrl: string | null = null;

  if (maybeLogoFile instanceof File && maybeLogoFile.size > 0) {
    const existingRestaurant = await getPrisma().restaurant.findUnique({
      where: { id: session.restaurantId },
      select: { logoUrl: true },
    });

    previousLogoUrl = existingRestaurant?.logoUrl ?? null;

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

  if (uploadedLogoUrl) {
    await deleteRestaurantAssetByPublicUrl(previousLogoUrl);
  }

  revalidateAdminPhaseTwoPaths();
  redirectWithNotice("/admin/settings", "Restaurant profile saved.");
}

export async function updateRestaurantOperationalSettings(formData: FormData) {
  const session = await requireAdminSession();
  const parsed = restaurantOperationalSchema.safeParse({
    minimumOrderAmount: formData.get("minimumOrderAmount"),
  });

  if (!parsed.success) {
    redirectWithError(
      "/admin/settings",
      "Please review the operational settings and try again.",
    );
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
  redirectWithNotice("/admin/settings", "Operational settings saved.");
}

export async function updateCatalogSettings(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/settings");
  const settingsSection = String(formData.get("settingsSection") ?? "");
  const parsed = catalogSettingsSchema.safeParse({
    catalogName: formData.get("catalogName"),
    defaultLanguage: formData.get("defaultLanguage"),
    timezone: formData.get("timezone"),
    defaultCurrency: formData.get("defaultCurrency"),
    minimumOrderAmount: formData.get("minimumOrderAmount"),
  });

  if (!parsed.success) {
    redirectWithError(redirectTo, "Please review the catalog settings.");
  }

  await runInTransaction(async (tx) => {
    const restaurantUpdate: {
      defaultLanguage?: string;
      timezone?: string;
      defaultCurrency?: string;
    } = {};

    const defaultLanguage = normalizeOptionalString(parsed.data.defaultLanguage);
    const timezone = normalizeOptionalString(parsed.data.timezone);
    const defaultCurrency = normalizeOptionalString(parsed.data.defaultCurrency);

    if (defaultLanguage) {
      restaurantUpdate.defaultLanguage = defaultLanguage;
    }

    if (timezone) {
      restaurantUpdate.timezone = timezone;
    }

    if (defaultCurrency) {
      restaurantUpdate.defaultCurrency = defaultCurrency;
    }

    if (Object.keys(restaurantUpdate).length) {
      await tx.restaurant.update({
        where: { id: session.restaurantId },
        data: restaurantUpdate,
      });
    }

    const settingsUpdate: {
      taxEnabled?: boolean;
      deliveryEnabled?: boolean;
      pickupEnabled?: boolean;
      showBranchSelection?: boolean;
      customerNotificationsEnabled?: boolean;
      minimumOrderAmount?: number | null;
    } = {};

    if (settingsSection === "behavior") {
      settingsUpdate.deliveryEnabled = formData.get("deliveryEnabled") === "on";
      settingsUpdate.pickupEnabled = formData.get("pickupEnabled") === "on";
      settingsUpdate.showBranchSelection =
        formData.get("showBranchSelection") === "on";
    }

    if (settingsSection === "notifications") {
      settingsUpdate.customerNotificationsEnabled =
        formData.get("customerNotificationsEnabled") === "on";
    }

    if (Object.keys(settingsUpdate).length) {
      await tx.restaurantSettings.upsert({
        where: { restaurantId: session.restaurantId },
        update: settingsUpdate,
        create: {
          restaurantId: session.restaurantId,
          ...settingsUpdate,
        },
      });
    }
  });

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, "Catalog settings saved.");
}

export async function createOrUpdateBranch(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/branches");
  const parsed = branchSchema.safeParse({
    branchId: formData.get("branchId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    phone: formData.get("phone"),
    addressText: formData.get("addressText"),
    displayOrder: formData.get("displayOrder"),
  });

  if (!parsed.success) {
    redirectWithError(
      redirectTo,
      "Please review the branch details and try again.",
    );
  }

  const branchId = normalizeOptionalString(parsed.data.branchId) ?? undefined;
  let savedBranchId = branchId;
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
      savedBranchId = branch.id;
    });
  }

  revalidateAdminPhaseTwoPaths();
  const finalRedirectTo = !branchId && savedBranchId
    ? redirectTo.includes("__BRANCH_ID__")
      ? redirectTo.replace("__BRANCH_ID__", savedBranchId)
      : `/admin/branches?branch=${savedBranchId}`
    : redirectTo;

  redirectWithNotice(
    finalRedirectTo,
    branchId ? "Branch profile saved." : "Branch created.",
  );
}

export async function updateBranchOperatingHours(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/branches");
  const branchId = String(formData.get("branchId") ?? "").trim();

  if (!branchId) {
    redirectWithError(redirectTo, "Branch is required.");
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
  redirectWithNotice(redirectTo, "Operating hours saved.");
}

export async function archiveBranch(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/branches");
  const branchId = String(formData.get("branchId") ?? "").trim();

  if (!branchId) {
    redirectWithError(redirectTo, "Branch is required.");
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
  redirectWithNotice(redirectTo, "Branch archived.");
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
    redirectWithError(
      "/admin/whatsapp",
      "Please review the WhatsApp route fields and try again.",
    );
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
        encryptFieldValue(normalizeOptionalString(parsed.data.accessToken)) ??
        existing?.accessTokenEncrypted ??
        null,
      webhookVerifyTokenEncrypted:
        encryptFieldValue(normalizeOptionalString(parsed.data.webhookVerifyToken)) ??
        existing?.webhookVerifyTokenEncrypted ??
        null,
      isActive,
      isDefaultForRestaurant,
    };

    if (isActive && normalizedBranchId) {
      await tx.whatsappConnection.updateMany({
        where: {
          restaurantId: session.restaurantId,
          branchId: normalizedBranchId,
          isActive: true,
          ...(connectionId ? { id: { not: connectionId } } : {}),
        },
        data: { isActive: false },
      });
    }

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
  redirectWithNotice(
    "/admin/whatsapp",
    connectionId ? "WhatsApp route updated." : "WhatsApp route saved.",
  );
}

export async function deleteWhatsappConnection(formData: FormData) {
  const session = await requireAdminSession();
  const connectionId = String(formData.get("connectionId") ?? "").trim();

  if (!connectionId) {
    redirectWithError("/admin/whatsapp", "Connection is required.");
  }

  await assertConnectionOwnership(connectionId, session.restaurantId);

  await getPrisma().whatsappConnection.update({
    where: { id: connectionId },
    data: {
      isActive: false,
      isDefaultForRestaurant: false,
    },
  });

  revalidateAdminPhaseTwoPaths();
  redirectWithNotice("/admin/whatsapp", "WhatsApp route archived.");
}

export async function createOrUpdateCategory(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/categories");
  const parsed = categorySchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    redirectWithError(redirectTo, "Please review the category fields.");
  }

  const categoryId = normalizeOptionalString(parsed.data.categoryId) ?? undefined;
  let savedCategoryId = categoryId;
  const slugBase = slugify(parsed.data.slug || parsed.data.name) || "category";
  const uniqueSlug = await buildUniqueCategorySlug(
    session.restaurantId,
    slugBase,
    categoryId,
  );

  if (categoryId) {
    await assertCategoryOwnership(categoryId, session.restaurantId);

    await getPrisma().category.update({
      where: { id: categoryId },
      data: {
        name: parsed.data.name,
        slug: uniqueSlug,
        description: normalizeOptionalString(parsed.data.description),
        sortOrder: normalizeOptionalInt(parsed.data.sortOrder),
        isActive: formData.get("isActive") === "on",
      },
    });
  } else {
    const category = await getPrisma().category.create({
      data: {
        restaurantId: session.restaurantId,
        name: parsed.data.name,
        slug: uniqueSlug,
        description: normalizeOptionalString(parsed.data.description),
        sortOrder: normalizeOptionalInt(parsed.data.sortOrder),
        isActive: true,
      },
    });
    savedCategoryId = category.id;
  }

  revalidateAdminPaths();
  const finalRedirectTo = savedCategoryId
    ? redirectTo.includes("__CATEGORY_ID__")
      ? redirectTo.replace("__CATEGORY_ID__", savedCategoryId)
      : `/admin/catalog/categories?category=${savedCategoryId}`
    : redirectTo;

  redirectWithNotice(
    finalRedirectTo,
    categoryId ? "Category saved." : "Category created.",
  );
}

export async function archiveCategory(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/categories");
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!categoryId) {
    redirectWithError(redirectTo, "Category is required.");
  }

  await assertCategoryOwnership(categoryId, session.restaurantId);

  await getPrisma().category.update({
    where: { id: categoryId },
    data: { isActive: false },
  });

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, "Category archived.");
}

export async function deleteCategory(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/categories");
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!categoryId) {
    redirectWithError(redirectTo, "Category is required.");
  }

  await assertCategoryOwnership(categoryId, session.restaurantId);

  const productCount = await getPrisma().product.count({
    where: {
      categoryId,
      restaurantId: session.restaurantId,
    },
  });

  if (productCount > 0) {
    redirectWithError(
      redirectTo,
      "Delete or move products in this category before deleting it.",
    );
  }

  await getPrisma().category.delete({
    where: { id: categoryId },
  });

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, "Category deleted.");
}

export async function createOrUpdateProduct(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/products");
  const parsed = productSchema.safeParse({
    productId: formData.get("productId"),
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    basePrice: formData.get("basePrice"),
    displayOrder: formData.get("displayOrder"),
  });

  if (!parsed.success) {
    redirectWithError(redirectTo, "Please review the product fields.");
  }

  await assertCategoryOwnership(parsed.data.categoryId, session.restaurantId);

  const basePrice = normalizeRequiredMoney(parsed.data.basePrice);
  if (basePrice === null) {
    redirectWithError(redirectTo, "Product price must be a valid amount.");
  }

  const productId = normalizeOptionalString(parsed.data.productId) ?? undefined;
  let savedProductId = productId ?? null;
  const slugBase = slugify(parsed.data.slug || parsed.data.name) || "product";
  const uniqueSlug = await buildUniqueProductSlug(
    session.restaurantId,
    slugBase,
    productId,
  );
  const restaurant = await getPrisma().restaurant.findUniqueOrThrow({
    where: { id: session.restaurantId },
    select: { slug: true },
  });
  const maybeProductImage = formData.get("image");
  let uploadedImageUrl: string | null = null;

  if (maybeProductImage instanceof File && maybeProductImage.size > 0) {
    const upload = await uploadRestaurantAsset({
      restaurantSlug: restaurant.slug,
      scope: "products",
      file: maybeProductImage,
    });

    uploadedImageUrl = upload?.publicUrl ?? null;
  }

  if (productId) {
    const existingProduct = await assertProductOwnership(productId, session.restaurantId);

    await getPrisma().product.update({
      where: { id: productId },
      data: {
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        slug: uniqueSlug,
        description: normalizeOptionalString(parsed.data.description),
        imageUrl: uploadedImageUrl ?? undefined,
        basePrice,
        displayOrder: normalizeOptionalInt(parsed.data.displayOrder),
        isActive: formData.get("isActive") === "on",
        isAvailable: formData.get("isAvailable") === "on",
        deliveryAvailable: formData.get("deliveryAvailable") === "on",
        pickupAvailable: formData.get("pickupAvailable") === "on",
      },
    });

    if (uploadedImageUrl) {
      await deleteRestaurantAssetByPublicUrl(existingProduct.imageUrl);
    }
  } else {
    const createdProduct = await getPrisma().product.create({
      data: {
        restaurantId: session.restaurantId,
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        slug: uniqueSlug,
        description: normalizeOptionalString(parsed.data.description),
        imageUrl: uploadedImageUrl,
        basePrice,
        displayOrder: normalizeOptionalInt(parsed.data.displayOrder),
        isActive: true,
        isAvailable: true,
        deliveryAvailable: true,
        pickupAvailable: true,
      },
      select: { id: true },
    });
    savedProductId = createdProduct.id;

    const branches = await getPrisma().branch.findMany({
      where: { restaurantId: session.restaurantId, isActive: true },
      select: { id: true },
    });

    if (branches.length) {
      await getPrisma().productBranchAvailability.createMany({
        data: branches.map((branch) => ({
          productId: createdProduct.id,
          branchId: branch.id,
          isAvailable: true,
          deliveryAvailable: true,
          pickupAvailable: true,
        })),
        skipDuplicates: true,
      });
    }
  }

  revalidateAdminPaths();
  const finalRedirectTo = redirectTo.replace(
    "__PRODUCT_ID__",
    savedProductId ?? "",
  );
  redirectWithNotice(
    finalRedirectTo,
    productId ? "Product saved." : "Product created.",
  );
}

export async function duplicateProduct(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/products");
  const productId = String(formData.get("productId") ?? "").trim();

  if (!productId) {
    redirectWithError(redirectTo, "Product is required.");
  }

  const product = await getPrisma().product.findFirst({
    where: {
      id: productId,
      restaurantId: session.restaurantId,
    },
    include: {
      variants: true,
      addonGroups: {
        include: {
          addons: true,
        },
      },
      branchAvailability: true,
    },
  });

  if (!product) {
    redirectWithError(redirectTo, "Product not found.");
  }

  const copyName = `${product.name} Copy`;
  const uniqueSlug = await buildUniqueProductSlug(
    session.restaurantId,
    slugify(copyName) || "product-copy",
  );

  await runInTransaction(async (tx) => {
    const copiedProduct = await tx.product.create({
      data: {
        restaurantId: session.restaurantId,
        categoryId: product.categoryId,
        name: copyName,
        slug: uniqueSlug,
        description: product.description,
        imageUrl: product.imageUrl,
        basePrice: product.basePrice,
        isActive: false,
        isAvailable: product.isAvailable,
        deliveryAvailable: product.deliveryAvailable,
        pickupAvailable: product.pickupAvailable,
        displayOrder: product.displayOrder + 1,
      },
      select: { id: true },
    });

    if (product.variants.length) {
      await tx.productVariant.createMany({
        data: product.variants.map((variant) => ({
          productId: copiedProduct.id,
          name: variant.name,
          sku: null,
          priceDelta: variant.priceDelta,
          fixedPrice: variant.fixedPrice,
          isDefault: variant.isDefault,
          isActive: variant.isActive,
          sortOrder: variant.sortOrder,
        })),
      });
    }

    for (const group of product.addonGroups) {
      const copiedGroup = await tx.addonGroup.create({
        data: {
          productId: copiedProduct.id,
          name: group.name,
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          isRequired: group.isRequired,
          sortOrder: group.sortOrder,
          isActive: group.isActive,
        },
        select: { id: true },
      });

      if (group.addons.length) {
        await tx.addon.createMany({
          data: group.addons.map((addon) => ({
            addonGroupId: copiedGroup.id,
            name: addon.name,
            price: addon.price,
            isActive: addon.isActive,
            sortOrder: addon.sortOrder,
          })),
        });
      }
    }

    if (product.branchAvailability.length) {
      await tx.productBranchAvailability.createMany({
        data: product.branchAvailability.map((availability) => ({
          productId: copiedProduct.id,
          branchId: availability.branchId,
          isAvailable: availability.isAvailable,
          deliveryAvailable: availability.deliveryAvailable,
          pickupAvailable: availability.pickupAvailable,
        })),
      });
    }
  });

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, "Product duplicated as a draft copy.");
}

export async function deleteProduct(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/products");
  const productId = String(formData.get("productId") ?? "").trim();

  if (!productId) {
    redirectWithError(redirectTo, "Product is required.");
  }

  await assertProductOwnership(productId, session.restaurantId);

  await getPrisma().product.delete({
    where: { id: productId },
  });

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, "Product deleted.");
}

export async function updateProductBranchAvailability(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/products");
  const parsed = productBranchAvailabilitySchema.safeParse({
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    redirectWithError(redirectTo, "Product is required.");
  }

  await assertProductOwnership(parsed.data.productId, session.restaurantId);

  const availableEverywhere = formData.get("availableEverywhere") === "on";
  const branches = await getPrisma().branch.findMany({
    where: { restaurantId: session.restaurantId, isActive: true },
    select: { id: true },
  });

  await runInTransaction(async (tx) => {
    for (const branch of branches) {
      await tx.productBranchAvailability.upsert({
        where: {
          productId_branchId: {
            productId: parsed.data.productId,
            branchId: branch.id,
          },
        },
        update: {
          isAvailable:
            availableEverywhere || formData.get(`${branch.id}_isAvailable`) === "on",
          deliveryAvailable:
            availableEverywhere ||
            formData.get(`${branch.id}_deliveryAvailable`) === "on",
          pickupAvailable:
            availableEverywhere ||
            formData.get(`${branch.id}_pickupAvailable`) === "on",
        },
        create: {
          productId: parsed.data.productId,
          branchId: branch.id,
          isAvailable:
            availableEverywhere || formData.get(`${branch.id}_isAvailable`) === "on",
          deliveryAvailable:
            availableEverywhere ||
            formData.get(`${branch.id}_deliveryAvailable`) === "on",
          pickupAvailable:
            availableEverywhere ||
            formData.get(`${branch.id}_pickupAvailable`) === "on",
        },
      });
    }
  });

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, "Branch availability saved.");
}

export async function createOrUpdateProductVariant(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/products");
  const parsed = productVariantSchema.safeParse({
    variantId: formData.get("variantId"),
    productId: formData.get("productId"),
    name: formData.get("name"),
    priceDelta: formData.get("priceDelta"),
    fixedPrice: formData.get("fixedPrice"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    redirectWithError(redirectTo, "Please review the variation fields.");
  }

  await assertProductOwnership(parsed.data.productId, session.restaurantId);

  const variantId = normalizeOptionalString(parsed.data.variantId);
  const priceDelta = normalizeOptionalNumber(parsed.data.priceDelta);
  const fixedPrice = normalizeOptionalNumber(parsed.data.fixedPrice);
  const isDefault = formData.get("isDefault") === "on";

  await runInTransaction(async (tx) => {
    if (isDefault) {
      await tx.productVariant.updateMany({
        where: { productId: parsed.data.productId },
        data: { isDefault: false },
      });
    }

    const data = {
      productId: parsed.data.productId,
      name: parsed.data.name,
      priceDelta,
      fixedPrice,
      isDefault,
      isActive: formData.get("isActive") === "on",
      sortOrder: normalizeOptionalInt(parsed.data.sortOrder),
    };

    if (variantId) {
      const existingVariant = await tx.productVariant.findFirst({
        where: {
          id: variantId,
          product: {
            restaurantId: session.restaurantId,
          },
        },
        select: { id: true },
      });

      if (!existingVariant) {
        throw new Error("Variation not found for this restaurant.");
      }

      await tx.productVariant.update({
        where: { id: variantId },
        data,
      });
    } else {
      await tx.productVariant.create({ data });
    }
  });

  revalidateAdminPaths();
  redirectWithNotice(
    redirectTo,
    variantId ? "Variation saved." : "Variation added.",
  );
}

export async function deleteProductVariant(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/products");
  const variantId = String(formData.get("variantId") ?? "").trim();

  if (!variantId) {
    redirectWithError(redirectTo, "Variation is required.");
  }

  const variant = await getPrisma().productVariant.findFirst({
    where: {
      id: variantId,
      product: { restaurantId: session.restaurantId },
    },
    select: { id: true },
  });

  if (!variant) {
    redirectWithError(redirectTo, "Variation not found.");
  }

  await getPrisma().productVariant.delete({ where: { id: variantId } });

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, "Variation removed.");
}

export async function createOrUpdateAddonGroup(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/products");
  const parsed = addonGroupSchema.safeParse({
    addonGroupId: formData.get("addonGroupId"),
    productId: formData.get("productId"),
    name: formData.get("name"),
    minSelect: formData.get("minSelect"),
    maxSelect: formData.get("maxSelect"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    redirectWithError(redirectTo, "Please review the add-on group fields.");
  }

  await assertProductOwnership(parsed.data.productId, session.restaurantId);

  const addonGroupId = normalizeOptionalString(parsed.data.addonGroupId);
  const minSelect = Math.max(0, normalizeOptionalInt(parsed.data.minSelect));
  const maxSelect = Math.max(1, normalizeOptionalInt(parsed.data.maxSelect) || 1);
  const data = {
    productId: parsed.data.productId,
    name: parsed.data.name,
    minSelect: Math.min(minSelect, maxSelect),
    maxSelect,
    isRequired: formData.get("isRequired") === "on",
    isActive: formData.get("isActive") === "on",
    sortOrder: normalizeOptionalInt(parsed.data.sortOrder),
  };

  if (addonGroupId) {
    await assertAddonGroupOwnership(addonGroupId, session.restaurantId);
    await getPrisma().addonGroup.update({
      where: { id: addonGroupId },
      data,
    });
  } else {
    await getPrisma().addonGroup.create({ data });
  }

  revalidateAdminPaths();
  redirectWithNotice(
    redirectTo,
    addonGroupId ? "Add-on group saved." : "Add-on group added.",
  );
}

export async function deleteAddonGroup(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/products");
  const addonGroupId = String(formData.get("addonGroupId") ?? "").trim();

  if (!addonGroupId) {
    redirectWithError(redirectTo, "Add-on group is required.");
  }

  await assertAddonGroupOwnership(addonGroupId, session.restaurantId);
  await getPrisma().addonGroup.delete({ where: { id: addonGroupId } });

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, "Add-on group removed.");
}

export async function createOrUpdateAddon(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/products");
  const parsed = addonSchema.safeParse({
    addonId: formData.get("addonId"),
    addonGroupId: formData.get("addonGroupId"),
    productId: formData.get("productId"),
    name: formData.get("name"),
    price: formData.get("price"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    redirectWithError(redirectTo, "Please review the add-on fields.");
  }

  await assertProductOwnership(parsed.data.productId, session.restaurantId);
  const addonGroup = await assertAddonGroupOwnership(
    parsed.data.addonGroupId,
    session.restaurantId,
  );

  if (addonGroup.productId !== parsed.data.productId) {
    redirectWithError(redirectTo, "Add-on group does not match product.");
  }

  const price = normalizeRequiredMoney(parsed.data.price);
  if (price === null) {
    redirectWithError(redirectTo, "Add-on price must be a valid amount.");
  }

  const addonId = normalizeOptionalString(parsed.data.addonId);
  const data = {
    addonGroupId: parsed.data.addonGroupId,
    name: parsed.data.name,
    price,
    isActive: formData.get("isActive") === "on",
    sortOrder: normalizeOptionalInt(parsed.data.sortOrder),
  };

  if (addonId) {
    const existingAddon = await getPrisma().addon.findFirst({
      where: {
        id: addonId,
        addonGroup: {
          product: {
            restaurantId: session.restaurantId,
          },
        },
      },
      select: { id: true },
    });

    if (!existingAddon) {
      redirectWithError(redirectTo, "Add-on not found.");
    }

    await getPrisma().addon.update({
      where: { id: addonId },
      data,
    });
  } else {
    await getPrisma().addon.create({ data });
  }

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, addonId ? "Add-on saved." : "Add-on added.");
}

export async function deleteAddon(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(formData, "/admin/catalog/products");
  const addonId = String(formData.get("addonId") ?? "").trim();

  if (!addonId) {
    redirectWithError(redirectTo, "Add-on is required.");
  }

  const addon = await getPrisma().addon.findFirst({
    where: {
      id: addonId,
      addonGroup: {
        product: {
          restaurantId: session.restaurantId,
        },
      },
    },
    select: { id: true },
  });

  if (!addon) {
    redirectWithError(redirectTo, "Add-on not found.");
  }

  await getPrisma().addon.delete({ where: { id: addonId } });

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, "Add-on removed.");
}

export async function createOrUpdateDeliveryZone(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(
    formData,
    "/admin/branches/delivery/zones",
  );
  const parsed = deliveryZoneSchema.safeParse({
    deliveryZoneId: formData.get("deliveryZoneId"),
    branchId: formData.get("branchId"),
    name: formData.get("name"),
    maxDistanceKm: formData.get("maxDistanceKm"),
    fee: formData.get("fee"),
    minimumOrderAmount: formData.get("minimumOrderAmount"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    redirectWithError(redirectTo, "Please review the delivery zone fields.");
  }

  await assertBranchOwnership(parsed.data.branchId, session.restaurantId);

  const deliveryZoneId = normalizeOptionalString(parsed.data.deliveryZoneId);
  let savedDeliveryZoneId = deliveryZoneId;
  const maxDistanceKm = normalizeRequiredMoney(parsed.data.maxDistanceKm);
  const fee = normalizeRequiredMoney(parsed.data.fee);

  if (maxDistanceKm === null || maxDistanceKm <= 0) {
    redirectWithError(redirectTo, "Delivery radius must be greater than zero.");
  }

  if (fee === null) {
    redirectWithError(redirectTo, "Delivery fee must be a valid amount.");
  }

  const data = {
    branchId: parsed.data.branchId,
    name: parsed.data.name,
    maxDistanceKm,
    areaLabel: `${parsed.data.maxDistanceKm} km radius`,
    fee,
    minimumOrderAmount: normalizeOptionalNumber(parsed.data.minimumOrderAmount),
    isActive: formData.get("isActive") === "on",
    sortOrder: normalizeOptionalInt(parsed.data.sortOrder),
  };

  if (deliveryZoneId) {
    const existing = await assertDeliveryZoneOwnership(
      deliveryZoneId,
      session.restaurantId,
    );

    if (existing.branchId !== parsed.data.branchId) {
      redirectWithError(redirectTo, "Delivery zone branch cannot be changed.");
    }

    try {
      await getPrisma().deliveryZone.update({
        where: { id: deliveryZoneId },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        redirectWithError(
          redirectTo,
          "A delivery zone with this name already exists for this branch.",
        );
      }

      throw error;
    }
  } else {
    try {
      const zone = await getPrisma().deliveryZone.create({ data });
      savedDeliveryZoneId = zone.id;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        redirectWithError(
          redirectTo,
          "A delivery zone with this name already exists for this branch.",
        );
      }

      throw error;
    }
  }

  revalidateAdminPaths();
  const finalRedirectTo = savedDeliveryZoneId
    ? `/admin/branches/delivery/zones?branch=${parsed.data.branchId}&zone=${savedDeliveryZoneId}`
    : redirectTo;

  redirectWithNotice(
    finalRedirectTo,
    deliveryZoneId ? "Delivery zone saved." : "Delivery zone added.",
  );
}

export async function deleteDeliveryZone(formData: FormData) {
  const session = await requireAdminSession();
  const redirectTo = resolveFormRedirectTarget(
    formData,
    "/admin/branches/delivery/zones",
  );
  const deliveryZoneId = String(formData.get("deliveryZoneId") ?? "").trim();

  if (!deliveryZoneId) {
    redirectWithError(redirectTo, "Delivery zone is required.");
  }

  await assertDeliveryZoneOwnership(deliveryZoneId, session.restaurantId);
  await getPrisma().deliveryZone.delete({ where: { id: deliveryZoneId } });

  revalidateAdminPaths();
  redirectWithNotice(redirectTo, "Delivery zone removed.");
}

export async function applyAdminMockWhatsappAction(formData: FormData) {
  const session = await requireAdminSession();
  const parsed = mockWhatsappActionSchema.safeParse({
    redirectTo: formData.get("redirectTo"),
    orderNumber: formData.get("orderNumber"),
    action: formData.get("action"),
    token: formData.get("token"),
  });
  const fallbackRedirectTo = "/admin/orders";
  const redirectTo = resolveFormRedirectTarget(formData, fallbackRedirectTo);

  if (!parsed.success) {
    redirectWithError(redirectTo, "Mock WhatsApp action payload is invalid.");
  }

  const restaurant = await getPrisma().restaurant.findUnique({
    where: { id: session.restaurantId },
    select: { slug: true },
  });

  if (!restaurant) {
    redirectWithError(redirectTo, "Restaurant admin scope was not found.");
  }

  let result: Awaited<ReturnType<typeof applyMockWhatsappStaffAction>>;

  try {
    result = await applyMockWhatsappStaffAction({
      restaurantSlug: restaurant.slug,
      orderNumber: parsed.data.orderNumber,
      action: parsed.data.action as MockWhatsappStaffAction,
      token: parsed.data.token,
    });
  } catch (error) {
    redirectWithError(
      redirectTo,
      error instanceof Error
        ? error.message
        : "Unable to apply mock WhatsApp action.",
    );
  }

  revalidateAdminPaths();
  redirectWithNotice(
    redirectTo,
    result.changed
      ? `Order ${parsed.data.action === "confirm" ? "confirmed" : "cancelled"} through the mock WhatsApp action.`
      : "Mock WhatsApp action was already applied.",
  );
}
