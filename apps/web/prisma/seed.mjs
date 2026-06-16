import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";

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
  WhatsappProvider,
} from "@prisma/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { flattenSmogyiceCatalog } from "./smogyice-catalog.mjs";

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
const smogyiceAdminEmail =
  process.env.SMOGYICE_ADMIN_EMAIL ?? "owner@smogyice.napcart.local";
const smogyiceAdminPassword =
  process.env.SMOGYICE_ADMIN_PASSWORD ?? "SmogyIce123!";
const smogyiceAdminName = process.env.SMOGYICE_ADMIN_NAME ?? "Smogy Ice Owner";
const DASHBOARD_CUSTOMER_TARGET = 1000;

const FIRST_NAMES = [
  "Ayesha",
  "Ali",
  "Sara",
  "Hamza",
  "Zainab",
  "Usman",
  "Noor",
  "Hassan",
  "Fatima",
  "Bilal",
  "Mariam",
  "Talha",
  "Hira",
  "Ahmed",
  "Iqra",
  "Daniyal",
];

const LAST_NAMES = [
  "Khan",
  "Ahmed",
  "Malik",
  "Siddiqui",
  "Farooq",
  "Sheikh",
  "Raza",
  "Ali",
  "Javed",
  "Ansari",
  "Qureshi",
  "Aslam",
  "Butt",
  "Nawaz",
];

const PHONE_PREFIXES = [
  "300",
  "301",
  "302",
  "303",
  "304",
  "305",
  "306",
  "307",
  "308",
  "309",
  "310",
  "311",
  "312",
  "313",
  "314",
  "315",
];

function createSeededRandom(seed = 20260530) {
  let value = seed >>> 0;

  return () => {
    value = (1664525 * value + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function randomInt(rand, min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick(rand, values) {
  return values[randomInt(rand, 0, values.length - 1)];
}

async function createManyInChunks(createMany, rows, chunkSize = 250) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    await createMany(rows.slice(index, index + chunkSize));
  }
}

function createSupabaseAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

async function ensureAuthAdmin({ email, password, name }) {
  const supabase = createSupabaseAdminClient();

  const { data: usersPage, error: listError } =
    await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });

  if (listError) {
    throw listError;
  }

  const existingUser = usersPage.users.find((user) => user.email === email);
  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
        },
        app_metadata: {
          role: "restaurant_admin",
        },
      },
    );

    if (error || !data.user) {
      throw error ?? new Error(`Unable to update auth user ${email}.`);
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name,
    },
    app_metadata: {
      role: "restaurant_admin",
    },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Unable to create auth user ${email}.`);
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

function createDateDaysAgo(daysAgo, hour = 12, minute = 0) {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function buildDashboardMockDataset({
  branches,
  products,
  restaurant,
  whatsappConnections,
}) {
  const rand = createSeededRandom();
  const now = new Date();
  const customers = [];
  const addresses = [];
  const orders = [];
  const orderItems = [];
  const statusHistory = [];
  let orderSequence = 1;

  const branchConfigs = [
    {
      branch: branches.dha,
      connectionId: whatsappConnections.dha.id,
      deliveryFee: 150,
      areaName: "DHA Karachi",
    },
    {
      branch: branches.gulshan,
      connectionId: whatsappConnections.gulshan.id,
      deliveryFee: 180,
      areaName: "Gulshan-e-Iqbal Karachi",
    },
  ];

  const menuCatalog = [
    {
      productId: products.smashBurger.id,
      productNameSnapshot: products.smashBurger.name,
      variantNameSnapshot: "Single",
      unitPrice: 1250,
    },
    {
      productId: products.smashBurger.id,
      productNameSnapshot: products.smashBurger.name,
      variantNameSnapshot: "Double",
      unitPrice: 1450,
    },
    {
      productId: products.grilledPlatter.id,
      productNameSnapshot: products.grilledPlatter.name,
      variantNameSnapshot: "Regular",
      unitPrice: 2490,
    },
  ];

  for (let index = 0; index < DASHBOARD_CUSTOMER_TARGET; index += 1) {
    const bucket =
      index < 250
        ? [0, 29]
        : index < 500
          ? [30, 89]
          : index < 750
            ? [90, 179]
            : [180, 364];
    const daysAgo = randomInt(rand, bucket[0], bucket[1]);
    const createdAt = createDateDaysAgo(
      daysAgo,
      randomInt(rand, 10, 22),
      randomInt(rand, 0, 59),
    );
    const customerId = randomUUID();
    const prefix = pick(rand, PHONE_PREFIXES);
    const subscriber = String(1000000 + index).padStart(7, "0");
    const rawPhone = `0${prefix}${subscriber}`;
    const normalizedPhone = `+92${prefix}${subscriber}`;
    const name = `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`;
    const email = rand() < 0.22 ? `guest${index + 1}@napcart.demo` : null;
    const homeBranch = pick(rand, branchConfigs);

    let orderCount;
    const orderRoll = rand();
    if (orderRoll < 0.38) {
      orderCount = 1;
    } else if (orderRoll < 0.68) {
      orderCount = 2;
    } else if (orderRoll < 0.86) {
      orderCount = 3;
    } else if (orderRoll < 0.96) {
      orderCount = 4;
    } else {
      orderCount = randomInt(rand, 5, 6);
    }

    const orderDates = [new Date(createdAt)];
    const availableMs = Math.max(
      now.getTime() - createdAt.getTime(),
      1000 * 60 * 60 * 6,
    );

    for (let orderIndex = 1; orderIndex < orderCount; orderIndex += 1) {
      const fraction =
        orderIndex === orderCount - 1
          ? 0.62 + rand() * 0.38
          : 0.1 + rand() * 0.75;
      const orderDate = new Date(createdAt.getTime() + availableMs * fraction);
      orderDate.setMinutes(orderDate.getMinutes() + orderIndex * 7);
      orderDates.push(orderDate);
    }

    orderDates.sort((left, right) => left.getTime() - right.getTime());

    customers.push({
      id: customerId,
      restaurantId: restaurant.id,
      name,
      normalizedPhone,
      rawPhoneInput: rawPhone,
      email,
      totalOrdersCount: orderCount,
      firstOrderAt: orderDates[0],
      lastOrderAt: orderDates[orderDates.length - 1],
      createdAt,
      updatedAt: orderDates[orderDates.length - 1],
    });

    addresses.push({
      id: randomUUID(),
      customerId,
      label: "Home",
      addressText: `House ${100 + index}, ${homeBranch.areaName}`,
      deliveryNotes:
        rand() < 0.35
          ? "Call on arrival."
          : rand() < 0.18
            ? "Leave at gate."
            : null,
      isDefault: true,
      createdAt,
      updatedAt: orderDates[orderDates.length - 1],
    });

    for (let orderIndex = 0; orderIndex < orderDates.length; orderIndex += 1) {
      const placedAt = orderDates[orderIndex];
      const isLatestOrder = orderIndex === orderDates.length - 1;
      const orderAgeHours =
        (now.getTime() - placedAt.getTime()) / (1000 * 60 * 60);
      const statusRoll = rand();
      let status = OrderStatus.CONFIRMED;

      if (isLatestOrder && orderAgeHours <= 48) {
        if (statusRoll < 0.28) {
          status = OrderStatus.PENDING_CONFIRMATION;
        } else if (statusRoll < 0.84) {
          status = OrderStatus.CONFIRMED;
        } else {
          status = OrderStatus.CANCELLED;
        }
      } else {
        status =
          statusRoll < 0.82 ? OrderStatus.CONFIRMED : OrderStatus.CANCELLED;
      }

      const branchConfig = rand() < 0.58 ? branchConfigs[0] : branchConfigs[1];
      const menuItem = pick(rand, menuCatalog);
      const quantity =
        menuItem.productNameSnapshot === products.grilledPlatter.name
          ? randomInt(rand, 1, 2)
          : randomInt(rand, 1, 3);
      const extras =
        menuItem.productNameSnapshot === products.smashBurger.name &&
        rand() < 0.45
          ? rand() < 0.55
            ? 150
            : 230
          : 0;
      const subtotal = menuItem.unitPrice * quantity + extras;
      const fulfillmentType =
        rand() < 0.72 ? FulfillmentType.DELIVERY : FulfillmentType.PICKUP;
      const deliveryFee =
        fulfillmentType === FulfillmentType.DELIVERY
          ? branchConfig.deliveryFee
          : 0;
      const grandTotal = subtotal + deliveryFee;
      const orderId = randomUUID();
      const orderNumber = `NC-${String(orderSequence).padStart(6, "0")}`;
      orderSequence += 1;
      const processedAt = new Date(
        placedAt.getTime() + randomInt(rand, 8, 95) * 60 * 1000,
      );

      orders.push({
        id: orderId,
        restaurantId: restaurant.id,
        branchId: branchConfig.branch.id,
        customerId,
        whatsappConnectionId: branchConfig.connectionId,
        orderNumber,
        status,
        fulfillmentType,
        paymentMethod:
          fulfillmentType === FulfillmentType.DELIVERY
            ? PaymentMethod.CASH_ON_DELIVERY
            : PaymentMethod.CASH_ON_PICKUP,
        paymentStatus: PaymentStatus.UNPAID,
        customerNameSnapshot: name,
        customerPhoneSnapshot: normalizedPhone,
        addressTextSnapshot:
          fulfillmentType === FulfillmentType.DELIVERY
            ? `House ${100 + index}, ${branchConfig.areaName}`
            : null,
        deliveryNotes:
          fulfillmentType === FulfillmentType.DELIVERY && rand() < 0.25
            ? "Please hand over at reception."
            : null,
        branchNameSnapshot: branchConfig.branch.name,
        subtotal: new Prisma.Decimal(String(subtotal)),
        deliveryFee: new Prisma.Decimal(String(deliveryFee)),
        discountTotal: new Prisma.Decimal("0"),
        taxTotal: new Prisma.Decimal("0"),
        grandTotal: new Prisma.Decimal(String(grandTotal)),
        currency: "PKR",
        placedAt,
        confirmedAt: status === OrderStatus.CONFIRMED ? processedAt : null,
        cancelledAt: status === OrderStatus.CANCELLED ? processedAt : null,
        createdAt: placedAt,
        updatedAt:
          status === OrderStatus.PENDING_CONFIRMATION ? placedAt : processedAt,
      });

      orderItems.push({
        id: randomUUID(),
        orderId,
        productId: menuItem.productId,
        productNameSnapshot: menuItem.productNameSnapshot,
        variantNameSnapshot: menuItem.variantNameSnapshot,
        unitPrice: new Prisma.Decimal(String(menuItem.unitPrice + extras)),
        quantity,
        lineTotal: new Prisma.Decimal(String(subtotal)),
        itemNotes: extras ? "Includes extras." : null,
        createdAt: placedAt,
        updatedAt: placedAt,
      });

      statusHistory.push({
        id: randomUUID(),
        orderId,
        oldStatus: null,
        newStatus: OrderStatus.PENDING_CONFIRMATION,
        changeSource: OrderStatusChangeSource.SYSTEM,
        changedAt: placedAt,
        notes: "Order placed from seeded guest checkout flow.",
      });

      if (status !== OrderStatus.PENDING_CONFIRMATION) {
        statusHistory.push({
          id: randomUUID(),
          orderId,
          oldStatus: OrderStatus.PENDING_CONFIRMATION,
          newStatus: status,
          changeSource: OrderStatusChangeSource.WHATSAPP_STAFF_ACTION,
          changedAt: processedAt,
          notes:
            status === OrderStatus.CONFIRMED
              ? "Confirmed by seeded restaurant staff action."
              : "Cancelled by seeded restaurant staff action.",
        });
      }
    }
  }

  return {
    addresses,
    customers,
    orderItems,
    orders,
    statusHistory,
  };
}

async function upsertSmogyiceDemo() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "smogyice-demo" },
    update: {
      name: "Smogy Ice",
      logoUrl: "/storefront/smogyice/smogyice-logo.png",
      supportPhone: "+92 301 1417221",
      contactEmail: "orders@smogyice.demo",
      isActive: true,
    },
    create: {
      name: "Smogy Ice",
      slug: "smogyice-demo",
      logoUrl: "/storefront/smogyice/smogyice-logo.png",
      supportPhone: "+92 301 1417221",
      contactEmail: "orders@smogyice.demo",
      defaultCurrency: "PKR",
      defaultLanguage: "English",
      timezone: "Asia/Karachi",
    },
  });

  await prisma.restaurantSettings.upsert({
    where: { restaurantId: restaurant.id },
    update: {
      isAcceptingOrders: true,
      isGloballyClosed: false,
      minimumOrderAmount: new Prisma.Decimal("500"),
      pickupEnabled: true,
      deliveryEnabled: true,
      showBranchSelection: true,
      customerNotificationsEnabled: false,
      taxEnabled: false,
    },
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

  const branchInputs = [
    {
      name: "Wapda Town",
      slug: "wapda-town",
      phone: "+92 301 1417221",
      addressText: "Rehmat Chowk, Wapda Town, Lahore",
      latitude: "31.4392400",
      longitude: "74.2729800",
      displayOrder: 1,
      fee: "150",
      maxDistanceKm: "5",
    },
    {
      name: "DHA Phase 8",
      slug: "dha-phase-8",
      phone: "+92 301 1417221",
      addressText: "Eden City Neon Square, DHA Phase 8, Lahore",
      latitude: "31.4742200",
      longitude: "74.4672400",
      displayOrder: 2,
      fee: "180",
      maxDistanceKm: "8",
    },
    {
      name: "Walton Road",
      slug: "walton-road",
      phone: "+92 301 1417221",
      addressText: "Walton Road, Lahore",
      latitude: "31.4938000",
      longitude: "74.3689300",
      displayOrder: 3,
      fee: "160",
      maxDistanceKm: "6",
    },
    {
      name: "Sheikhupura",
      slug: "sheikhupura",
      phone: "+92 301 1417221",
      addressText: "Sheikhupura Branch, Lahore Road",
      latitude: "31.7166600",
      longitude: "73.9850200",
      displayOrder: 4,
      fee: "200",
      maxDistanceKm: "8",
    },
  ];

  const branches = [];
  for (const branchInput of branchInputs) {
    const branch = await prisma.branch.upsert({
      where: {
        restaurantId_slug: {
          restaurantId: restaurant.id,
          slug: branchInput.slug,
        },
      },
      update: {
        name: branchInput.name,
        phone: branchInput.phone,
        addressText: branchInput.addressText,
        latitude: new Prisma.Decimal(branchInput.latitude),
        longitude: new Prisma.Decimal(branchInput.longitude),
        isActive: true,
        isAcceptingOrders: true,
        isTemporarilyClosed: false,
        displayOrder: branchInput.displayOrder,
      },
      create: {
        restaurantId: restaurant.id,
        name: branchInput.name,
        slug: branchInput.slug,
        phone: branchInput.phone,
        addressText: branchInput.addressText,
        latitude: new Prisma.Decimal(branchInput.latitude),
        longitude: new Prisma.Decimal(branchInput.longitude),
        displayOrder: branchInput.displayOrder,
      },
    });
    branches.push(branch);

    await prisma.deliveryZone.upsert({
      where: {
        branchId_name: {
          branchId: branch.id,
          name: `${branchInput.name} delivery radius`,
        },
      },
      update: {
        maxDistanceKm: new Prisma.Decimal(branchInput.maxDistanceKm),
        fee: new Prisma.Decimal(branchInput.fee),
        minimumOrderAmount: new Prisma.Decimal("500"),
        isActive: true,
        sortOrder: 1,
      },
      create: {
        branchId: branch.id,
        name: `${branchInput.name} delivery radius`,
        maxDistanceKm: new Prisma.Decimal(branchInput.maxDistanceKm),
        fee: new Prisma.Decimal(branchInput.fee),
        minimumOrderAmount: new Prisma.Decimal("500"),
        sortOrder: 1,
      },
    });
  }

  await prisma.branchOperatingHour.deleteMany({
    where: {
      branchId: { in: branches.map((branch) => branch.id) },
    },
  });
  await prisma.branchOperatingHour.createMany({
    data: branches.flatMap((branch) => operatingHoursInput(branch.id)),
  });

  const defaultWhatsapp = await prisma.whatsappConnection.upsert({
    where: { id: `30000000-0000-4000-8000-${restaurant.id.slice(-12)}` },
    update: {
      businessName: "Smogy Ice Main Ops",
      displayPhoneNumber: "+92 301 1417221",
      isActive: true,
      isDefaultForRestaurant: true,
    },
    create: {
      id: `30000000-0000-4000-8000-${restaurant.id.slice(-12)}`,
      restaurantId: restaurant.id,
      provider: WhatsappProvider.MOCK,
      businessName: "Smogy Ice Main Ops",
      displayPhoneNumber: "+92 301 1417221",
      isDefaultForRestaurant: true,
    },
  });

  for (let index = 0; index < branches.length; index += 1) {
    const branch = branches[index];
    await prisma.whatsappConnection.upsert({
      where: {
        id: `3${index + 1}000000-0000-4000-8000-${branch.id.slice(-12)}`,
      },
      update: {
        businessName: `Smogy Ice ${branch.name} Ops`,
        displayPhoneNumber: branch.phone ?? defaultWhatsapp.displayPhoneNumber,
        isActive: true,
        branchId: branch.id,
      },
      create: {
        id: `3${index + 1}000000-0000-4000-8000-${branch.id.slice(-12)}`,
        restaurantId: restaurant.id,
        branchId: branch.id,
        provider: WhatsappProvider.MOCK,
        businessName: `Smogy Ice ${branch.name} Ops`,
        displayPhoneNumber: branch.phone ?? defaultWhatsapp.displayPhoneNumber,
      },
    });
  }

  const catalog = flattenSmogyiceCatalog();
  const seededProducts = [];

  for (const categoryInput of catalog) {
    const category = await prisma.category.upsert({
      where: {
        restaurantId_slug: {
          restaurantId: restaurant.id,
          slug: categoryInput.slug,
        },
      },
      update: {
        name: categoryInput.name,
        description: `Smogy Ice ${categoryInput.name} menu.`,
        sortOrder: categoryInput.sortOrder,
        isActive: true,
      },
      create: {
        restaurantId: restaurant.id,
        name: categoryInput.name,
        slug: categoryInput.slug,
        description: `Smogy Ice ${categoryInput.name} menu.`,
        sortOrder: categoryInput.sortOrder,
      },
    });

    for (const productInput of categoryInput.products) {
      const product = await prisma.product.upsert({
        where: {
          restaurantId_slug: {
            restaurantId: restaurant.id,
            slug: productInput.slug,
          },
        },
        update: {
          categoryId: category.id,
          name: productInput.name,
          description: productInput.description,
          imageUrl: productInput.imageUrl,
          basePrice: new Prisma.Decimal(String(productInput.basePrice)),
          isActive: true,
          isAvailable: true,
          deliveryAvailable: true,
          pickupAvailable: true,
          displayOrder: productInput.displayOrder,
        },
        create: {
          restaurantId: restaurant.id,
          categoryId: category.id,
          name: productInput.name,
          slug: productInput.slug,
          description: productInput.description,
          imageUrl: productInput.imageUrl,
          basePrice: new Prisma.Decimal(String(productInput.basePrice)),
          displayOrder: productInput.displayOrder,
        },
      });
      seededProducts.push({ product, categorySlug: categoryInput.slug });

      for (const variantInput of productInput.variants) {
        await prisma.productVariant.upsert({
          where: {
            productId_name: {
              productId: product.id,
              name: variantInput.name,
            },
          },
          update: {
            fixedPrice: new Prisma.Decimal(String(variantInput.fixedPrice)),
            priceDelta: null,
            isDefault: variantInput.isDefault,
            isActive: true,
            sortOrder: variantInput.sortOrder,
          },
          create: {
            productId: product.id,
            name: variantInput.name,
            fixedPrice: new Prisma.Decimal(String(variantInput.fixedPrice)),
            isDefault: variantInput.isDefault,
            sortOrder: variantInput.sortOrder,
          },
        });
      }

      for (const branch of branches) {
        await prisma.productBranchAvailability.upsert({
          where: {
            productId_branchId: {
              productId: product.id,
              branchId: branch.id,
            },
          },
          update: {
            isAvailable: true,
            deliveryAvailable: true,
            pickupAvailable: true,
          },
          create: {
            productId: product.id,
            branchId: branch.id,
            isAvailable: true,
            deliveryAvailable: true,
            pickupAvailable: true,
          },
        });
      }

      if (["live-ice-cream", "signature-live"].includes(categoryInput.slug)) {
        const addonGroup = await prisma.addonGroup.upsert({
          where: {
            productId_name: {
              productId: product.id,
              name: "Extra Toppings",
            },
          },
          update: {
            minSelect: 0,
            maxSelect: 3,
            isRequired: false,
            isActive: true,
            sortOrder: 1,
          },
          create: {
            productId: product.id,
            name: "Extra Toppings",
            minSelect: 0,
            maxSelect: 3,
            sortOrder: 1,
          },
        });

        const addons = [
          ["Extra Oreo Crumbs", "80"],
          ["Chocolate Drizzle", "100"],
          ["Brownie Chunks", "150"],
        ];
        for (let addonIndex = 0; addonIndex < addons.length; addonIndex += 1) {
          const [name, price] = addons[addonIndex];
          await prisma.addon.upsert({
            where: {
              addonGroupId_name: {
                addonGroupId: addonGroup.id,
                name,
              },
            },
            update: {
              price: new Prisma.Decimal(price),
              isActive: true,
              sortOrder: addonIndex + 1,
            },
            create: {
              addonGroupId: addonGroup.id,
              name,
              price: new Prisma.Decimal(price),
              sortOrder: addonIndex + 1,
            },
          });
        }
      }
    }
  }

  await prisma.whatsappMessageLog.deleteMany({
    where: {
      restaurantId: restaurant.id,
    },
  });
  await prisma.order.deleteMany({
    where: {
      restaurantId: restaurant.id,
    },
  });
  await prisma.customer.deleteMany({
    where: {
      restaurantId: restaurant.id,
    },
  });

  return {
    restaurant,
    branches,
    productsCount: seededProducts.length,
  };
}

async function main() {
  const authAdmin = await ensureAuthAdmin({
    email: adminEmail,
    password: adminPassword,
    name: adminName,
  });
  const smogyiceAuthAdmin = await ensureAuthAdmin({
    email: smogyiceAdminEmail,
    password: smogyiceAdminPassword,
    name: smogyiceAdminName,
  });
  const smogyiceDemo = await upsertSmogyiceDemo();

  await prisma.adminUser.upsert({
    where: { authUserId: smogyiceAuthAdmin.id },
    update: {
      restaurantId: smogyiceDemo.restaurant.id,
      name: smogyiceAdminName,
      email: smogyiceAdminEmail,
      isActive: true,
    },
    create: {
      restaurantId: smogyiceDemo.restaurant.id,
      authUserId: smogyiceAuthAdmin.id,
      name: smogyiceAdminName,
      email: smogyiceAdminEmail,
      isActive: true,
    },
  });

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

  const [restaurantWhatsapp, dhaWhatsapp, gulshanWhatsapp] = await Promise.all([
    prisma.whatsappConnection.upsert({
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
    }),
    prisma.whatsappConnection.upsert({
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
    }),
    prisma.whatsappConnection.upsert({
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
    }),
  ]);

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
      description:
        "Two smashed beef patties with lettuce, onions, and house sauce.",
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

  for (const product of [smashBurger, grilledPlatter]) {
    for (const branch of [dhaBranch, gulshanBranch]) {
      await prisma.productBranchAvailability.upsert({
        where: {
          productId_branchId: {
            productId: product.id,
            branchId: branch.id,
          },
        },
        update: {
          isAvailable: true,
          deliveryAvailable: true,
          pickupAvailable: true,
        },
        create: {
          productId: product.id,
          branchId: branch.id,
          isAvailable: true,
          deliveryAvailable: true,
          pickupAvailable: true,
        },
      });
    }
  }

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

  await prisma.whatsappMessageLog.deleteMany({
    where: {
      restaurantId: restaurant.id,
    },
  });

  await prisma.order.deleteMany({
    where: {
      restaurantId: restaurant.id,
    },
  });

  await prisma.customer.deleteMany({
    where: {
      restaurantId: restaurant.id,
    },
  });

  const dataset = buildDashboardMockDataset({
    restaurant,
    branches: {
      dha: dhaBranch,
      gulshan: gulshanBranch,
    },
    whatsappConnections: {
      restaurant: restaurantWhatsapp,
      dha: dhaWhatsapp,
      gulshan: gulshanWhatsapp,
    },
    products: {
      smashBurger,
      grilledPlatter,
    },
  });

  await createManyInChunks(
    (rows) => prisma.customer.createMany({ data: rows }),
    dataset.customers,
    250,
  );
  await createManyInChunks(
    (rows) => prisma.customerAddress.createMany({ data: rows }),
    dataset.addresses,
    250,
  );
  await createManyInChunks(
    (rows) => prisma.order.createMany({ data: rows }),
    dataset.orders,
    150,
  );
  await createManyInChunks(
    (rows) => prisma.orderItem.createMany({ data: rows }),
    dataset.orderItems,
    250,
  );
  await createManyInChunks(
    (rows) => prisma.orderStatusHistory.createMany({ data: rows }),
    dataset.statusHistory,
    250,
  );

  console.log("Seed complete.");
  console.log(
    JSON.stringify(
      {
        restaurant: restaurant.slug,
        branches: [dhaBranch.slug, gulshanBranch.slug],
        adminEmail,
        adminPassword,
        customerCount: dataset.customers.length,
        orderCount: dataset.orders.length,
        confirmedOrders: dataset.orders.filter(
          (item) => item.status === OrderStatus.CONFIRMED,
        ).length,
        pendingOrders: dataset.orders.filter(
          (item) => item.status === OrderStatus.PENDING_CONFIRMATION,
        ).length,
        cancelledOrders: dataset.orders.filter(
          (item) => item.status === OrderStatus.CANCELLED,
        ).length,
        sampleOrder: dataset.orders[0]?.orderNumber,
        addonGroupId: burgerAddons.id,
        storefrontDemo: {
          restaurant: smogyiceDemo.restaurant.slug,
          branches: smogyiceDemo.branches.map((branch) => branch.slug),
          products: smogyiceDemo.productsCount,
          url: `/storefront/${smogyiceDemo.restaurant.slug}`,
          adminEmail: smogyiceAdminEmail,
          adminPassword: smogyiceAdminPassword,
        },
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
