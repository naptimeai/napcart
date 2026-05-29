import { existsSync } from "node:fs";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  DayOfWeek,
  FulfillmentType,
  OrderStatus,
  OrderStatusChangeSource,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  PrismaClient,
  WhatsappMessageDirection,
  WhatsappMessageStatus,
  WhatsappProvider,
} from "@prisma/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

if (existsSync(".env.local")) {
  loadEnv({ path: ".env.local", override: true });
}

loadEnv();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const adminEmail = process.env.DEMO_ADMIN_EMAIL ?? "owner@demo.napcart.local";
const adminPassword = process.env.DEMO_ADMIN_PASSWORD ?? "ChangeMe123!";
const adminName = process.env.DEMO_ADMIN_NAME ?? "Demo Restaurant Owner";

async function ensureAuthAdmin() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) {
    throw listError;
  }

  const existingUser = usersPage.users.find((user) => user.email === adminEmail);
  if (existingUser) {
    return existingUser;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: adminName,
    },
    app_metadata: {
      role: "restaurant_admin",
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("Unable to create demo admin auth user.");
  }

  return data.user;
}

function operatingHoursInput(branchId) {
  return Object.values(DayOfWeek).map((dayOfWeek) => ({
    branchId,
    dayOfWeek,
    openTime: "11:00",
    closeTime: "23:00",
    isClosed: false,
  }));
}

async function main() {
  const authAdmin = await ensureAuthAdmin();

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "demo-napcart-kitchen" },
    update: {
      name: "Demo NapCart Kitchen",
      supportPhone: "+92 300 0000000",
      contactEmail: "hello@napcart.demo",
    },
    create: {
      name: "Demo NapCart Kitchen",
      slug: "demo-napcart-kitchen",
      supportPhone: "+92 300 0000000",
      contactEmail: "hello@napcart.demo",
      defaultCurrency: "PKR",
      defaultLanguage: "English",
      timezone: "Asia/Karachi",
    },
  });

  await prisma.restaurantSettings.upsert({
    where: { restaurantId: restaurant.id },
    update: {},
    create: {
      restaurantId: restaurant.id,
      isAcceptingOrders: true,
      isGloballyClosed: false,
      minimumOrderAmount: new Prisma.Decimal("500"),
      pickupEnabled: true,
      deliveryEnabled: true,
      showBranchSelection: true,
      customerNotificationsEnabled: false,
      taxEnabled: false,
    },
  });

  const [dhaBranch, gulshanBranch] = await Promise.all([
    prisma.branch.upsert({
      where: {
        restaurantId_slug: {
          restaurantId: restaurant.id,
          slug: "dha-branch",
        },
      },
      update: {},
      create: {
        restaurantId: restaurant.id,
        name: "DHA Branch",
        slug: "dha-branch",
        phone: "+92 300 0000001",
        addressText: "Phase 6, DHA, Karachi",
        displayOrder: 1,
      },
    }),
    prisma.branch.upsert({
      where: {
        restaurantId_slug: {
          restaurantId: restaurant.id,
          slug: "gulshan-branch",
        },
      },
      update: {},
      create: {
        restaurantId: restaurant.id,
        name: "Gulshan Branch",
        slug: "gulshan-branch",
        phone: "+92 300 0000002",
        addressText: "Block 13-D, Gulshan-e-Iqbal, Karachi",
        displayOrder: 2,
      },
    }),
  ]);

  await prisma.branchOperatingHour.deleteMany({
    where: {
      branchId: { in: [dhaBranch.id, gulshanBranch.id] },
    },
  });

  await prisma.branchOperatingHour.createMany({
    data: [
      ...operatingHoursInput(dhaBranch.id),
      ...operatingHoursInput(gulshanBranch.id),
    ],
  });

  await prisma.deliveryZone.upsert({
    where: {
      branchId_name: {
        branchId: dhaBranch.id,
        name: "DHA up to 5 km",
      },
    },
    update: {
      maxDistanceKm: new Prisma.Decimal("5"),
      fee: new Prisma.Decimal("150"),
      minimumOrderAmount: new Prisma.Decimal("500"),
      sortOrder: 1,
      isActive: true,
    },
    create: {
      branchId: dhaBranch.id,
      name: "DHA up to 5 km",
      maxDistanceKm: new Prisma.Decimal("5"),
      fee: new Prisma.Decimal("150"),
      minimumOrderAmount: new Prisma.Decimal("500"),
      sortOrder: 1,
    },
  });

  await prisma.deliveryZone.upsert({
    where: {
      branchId_name: {
        branchId: gulshanBranch.id,
        name: "Gulshan up to 8 km",
      },
    },
    update: {
      maxDistanceKm: new Prisma.Decimal("8"),
      fee: new Prisma.Decimal("180"),
      minimumOrderAmount: new Prisma.Decimal("600"),
      sortOrder: 1,
      isActive: true,
    },
    create: {
      branchId: gulshanBranch.id,
      name: "Gulshan up to 8 km",
      maxDistanceKm: new Prisma.Decimal("8"),
      fee: new Prisma.Decimal("180"),
      minimumOrderAmount: new Prisma.Decimal("600"),
      sortOrder: 1,
    },
  });

  const restaurantWhatsapp = await prisma.whatsappConnection.upsert({
    where: { id: `00000000-0000-4000-8000-${restaurant.id.slice(-12)}` },
    update: {},
    create: {
      id: `00000000-0000-4000-8000-${restaurant.id.slice(-12)}`,
      restaurantId: restaurant.id,
      provider: WhatsappProvider.MOCK,
      businessName: "NapCart Demo Ops",
      displayPhoneNumber: "+92 300 1111111",
      isDefaultForRestaurant: true,
    },
  });

  await prisma.whatsappConnection.upsert({
    where: { id: `10000000-0000-4000-8000-${dhaBranch.id.slice(-12)}` },
    update: {},
    create: {
      id: `10000000-0000-4000-8000-${dhaBranch.id.slice(-12)}`,
      restaurantId: restaurant.id,
      branchId: dhaBranch.id,
      provider: WhatsappProvider.MOCK,
      businessName: "NapCart DHA Ops",
      displayPhoneNumber: "+92 300 2222222",
    },
  });

  await prisma.whatsappConnection.upsert({
    where: { id: `20000000-0000-4000-8000-${gulshanBranch.id.slice(-12)}` },
    update: {},
    create: {
      id: `20000000-0000-4000-8000-${gulshanBranch.id.slice(-12)}`,
      restaurantId: restaurant.id,
      branchId: gulshanBranch.id,
      provider: WhatsappProvider.MOCK,
      businessName: "NapCart Gulshan Ops",
      displayPhoneNumber: "+92 300 3333333",
    },
  });

  await prisma.adminUser.upsert({
    where: { authUserId: authAdmin.id },
    update: {
      restaurantId: restaurant.id,
      name: adminName,
      email: adminEmail,
      isActive: true,
    },
    create: {
      restaurantId: restaurant.id,
      authUserId: authAdmin.id,
      name: adminName,
      email: adminEmail,
      isActive: true,
    },
  });

  const burgersCategory = await prisma.category.upsert({
    where: {
      restaurantId_slug: {
        restaurantId: restaurant.id,
        slug: "burgers",
      },
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: "Burgers",
      slug: "burgers",
      sortOrder: 1,
    },
  });

  const plattersCategory = await prisma.category.upsert({
    where: {
      restaurantId_slug: {
        restaurantId: restaurant.id,
        slug: "platters",
      },
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: "Platters",
      slug: "platters",
      sortOrder: 2,
    },
  });

  const smashBurger = await prisma.product.upsert({
    where: {
      restaurantId_slug: {
        restaurantId: restaurant.id,
        slug: "double-smash-burger",
      },
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      categoryId: burgersCategory.id,
      name: "Double Smash Burger",
      slug: "double-smash-burger",
      description: "Two smashed beef patties with lettuce, onions, and house sauce.",
      basePrice: new Prisma.Decimal("1450"),
      displayOrder: 1,
    },
  });

  const grilledPlatter = await prisma.product.upsert({
    where: {
      restaurantId_slug: {
        restaurantId: restaurant.id,
        slug: "mixed-grill-platter",
      },
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      categoryId: plattersCategory.id,
      name: "Mixed Grill Platter",
      slug: "mixed-grill-platter",
      description: "Chicken, kebab, fries, and garlic dip.",
      basePrice: new Prisma.Decimal("2490"),
      displayOrder: 1,
    },
  });

  await prisma.productVariant.upsert({
    where: {
      productId_name: {
        productId: smashBurger.id,
        name: "Single",
      },
    },
    update: {
      fixedPrice: new Prisma.Decimal("1250"),
      priceDelta: null,
      isDefault: false,
      isActive: true,
      sortOrder: 1,
    },
    create: {
      productId: smashBurger.id,
      name: "Single",
      fixedPrice: new Prisma.Decimal("1250"),
      isDefault: false,
      sortOrder: 1,
    },
  });

  await prisma.productVariant.upsert({
    where: {
      productId_name: {
        productId: smashBurger.id,
        name: "Double",
      },
    },
    update: {
      fixedPrice: new Prisma.Decimal("1450"),
      priceDelta: null,
      isDefault: true,
      isActive: true,
      sortOrder: 2,
    },
    create: {
      productId: smashBurger.id,
      name: "Double",
      fixedPrice: new Prisma.Decimal("1450"),
      isDefault: true,
      sortOrder: 2,
    },
  });

  await prisma.productVariant.upsert({
    where: {
      productId_name: {
        productId: grilledPlatter.id,
        name: "Regular",
      },
    },
    update: {
      fixedPrice: new Prisma.Decimal("2490"),
      priceDelta: null,
      isDefault: true,
      isActive: true,
      sortOrder: 1,
    },
    create: {
      productId: grilledPlatter.id,
      name: "Regular",
      fixedPrice: new Prisma.Decimal("2490"),
      isDefault: true,
      sortOrder: 1,
    },
  });

  const burgerAddons = await prisma.addonGroup.upsert({
    where: {
      productId_name: {
        productId: smashBurger.id,
        name: "Extras",
      },
    },
    update: {
      minSelect: 0,
      maxSelect: 3,
      isRequired: false,
      sortOrder: 1,
      isActive: true,
    },
    create: {
      productId: smashBurger.id,
      name: "Extras",
      minSelect: 0,
      maxSelect: 3,
      sortOrder: 1,
    },
  });

  await prisma.addon.upsert({
    where: {
      addonGroupId_name: {
        addonGroupId: burgerAddons.id,
        name: "Extra Cheese",
      },
    },
    update: {
      price: new Prisma.Decimal("150"),
      isActive: true,
      sortOrder: 1,
    },
    create: {
      addonGroupId: burgerAddons.id,
      name: "Extra Cheese",
      price: new Prisma.Decimal("150"),
      sortOrder: 1,
    },
  });

  await prisma.addon.upsert({
    where: {
      addonGroupId_name: {
        addonGroupId: burgerAddons.id,
        name: "Jalapenos",
      },
    },
    update: {
      price: new Prisma.Decimal("80"),
      isActive: true,
      sortOrder: 2,
    },
    create: {
      addonGroupId: burgerAddons.id,
      name: "Jalapenos",
      price: new Prisma.Decimal("80"),
      sortOrder: 2,
    },
  });

  const customer = await prisma.customer.upsert({
    where: {
      restaurantId_normalizedPhone: {
        restaurantId: restaurant.id,
        normalizedPhone: "+923001112233",
      },
    },
    update: {
      name: "Ayesha Khan",
      rawPhoneInput: "0300 1112233",
      totalOrdersCount: 1,
      firstOrderAt: new Date(),
      lastOrderAt: new Date(),
    },
    create: {
      restaurantId: restaurant.id,
      name: "Ayesha Khan",
      normalizedPhone: "+923001112233",
      rawPhoneInput: "0300 1112233",
      totalOrdersCount: 1,
      firstOrderAt: new Date(),
      lastOrderAt: new Date(),
    },
  });

  const existingHomeAddress = await prisma.customerAddress.findFirst({
    where: {
      customerId: customer.id,
      label: "Home",
    },
  });

  if (existingHomeAddress) {
    await prisma.customerAddress.update({
      where: { id: existingHomeAddress.id },
      data: {
        addressText: "Street 12, DHA Karachi",
        deliveryNotes: "Ring the bell once.",
        isDefault: true,
      },
    });
  } else {
    await prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        label: "Home",
        addressText: "Street 12, DHA Karachi",
        deliveryNotes: "Ring the bell once.",
        isDefault: true,
      },
    });
  }

  const order = await prisma.order.upsert({
    where: {
      restaurantId_orderNumber: {
        restaurantId: restaurant.id,
        orderNumber: "NC-0001",
      },
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      branchId: dhaBranch.id,
      customerId: customer.id,
      whatsappConnectionId: restaurantWhatsapp.id,
      orderNumber: "NC-0001",
      status: OrderStatus.CONFIRMED,
      fulfillmentType: FulfillmentType.DELIVERY,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.UNPAID,
      customerNameSnapshot: "Ayesha Khan",
      customerPhoneSnapshot: "+923001112233",
      addressTextSnapshot: "Street 12, DHA Karachi",
      deliveryNotes: "Ring the bell once.",
      branchNameSnapshot: dhaBranch.name,
      subtotal: new Prisma.Decimal("1600"),
      deliveryFee: new Prisma.Decimal("150"),
      discountTotal: new Prisma.Decimal("0"),
      taxTotal: new Prisma.Decimal("0"),
      grandTotal: new Prisma.Decimal("1750"),
      currency: "PKR",
      confirmedAt: new Date(),
      items: {
        create: {
          productId: smashBurger.id,
          productNameSnapshot: smashBurger.name,
          variantNameSnapshot: "Double",
          unitPrice: new Prisma.Decimal("1450"),
          quantity: 1,
          lineTotal: new Prisma.Decimal("1450"),
          addons: {
            create: {
              addonNameSnapshot: "Extra Cheese",
              addonPriceSnapshot: new Prisma.Decimal("150"),
              quantity: 1,
              lineTotal: new Prisma.Decimal("150"),
            },
          },
        },
      },
      statusHistory: {
        createMany: {
          data: [
            {
              oldStatus: null,
              newStatus: OrderStatus.PENDING_CONFIRMATION,
              changeSource: OrderStatusChangeSource.SYSTEM,
              notes: "Order placed from storefront.",
            },
            {
              oldStatus: OrderStatus.PENDING_CONFIRMATION,
              newStatus: OrderStatus.CONFIRMED,
              changeSource: OrderStatusChangeSource.WHATSAPP_STAFF_ACTION,
              notes: "Confirmed by restaurant staff.",
            },
          ],
        },
      },
      whatsappMessageLogs: {
        createMany: {
          data: [
            {
              restaurantId: restaurant.id,
              branchId: dhaBranch.id,
              whatsappConnectionId: restaurantWhatsapp.id,
              direction: WhatsappMessageDirection.OUTBOUND,
              messageType: "order_notification",
              payloadJson: {
                orderNumber: "NC-0001",
                branch: dhaBranch.name,
              },
              status: WhatsappMessageStatus.SENT,
              sentAt: new Date(),
            },
            {
              restaurantId: restaurant.id,
              branchId: dhaBranch.id,
              whatsappConnectionId: restaurantWhatsapp.id,
              direction: WhatsappMessageDirection.INBOUND,
              messageType: "staff_action",
              payloadJson: {
                action: "confirm",
                orderNumber: "NC-0001",
              },
              status: WhatsappMessageStatus.PROCESSED,
              receivedAt: new Date(),
              processedAt: new Date(),
            },
          ],
        },
      },
    },
  });

  console.log("Seed complete.");
  console.log(
    JSON.stringify(
      {
        restaurant: restaurant.slug,
        branches: [dhaBranch.slug, gulshanBranch.slug],
        adminEmail,
        adminPassword,
        sampleOrder: order.orderNumber,
        addonGroupId: burgerAddons.id,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
