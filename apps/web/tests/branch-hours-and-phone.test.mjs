import assert from "node:assert/strict";
import { describe, it } from "node:test";

const {
  formatOperatingHoursSummary,
  getBranchOperationalStatus,
  isWithinOperatingHours,
} = await import("../src/lib/branch-hours.ts");
const { normalizePakistanPhone } = await import("../src/server/storefront/phone.ts");
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??= "test-publishable-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role-key";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/postgres";
process.env.NAPCART_ORDER_ACCESS_SECRET = "test-order-access-secret";
const {
  signStorefrontOrderAccessToken,
  verifyStorefrontOrderAccessToken,
} = await import("../src/server/storefront/order-access.ts");
const { resolveSelectedAddons } = await import(
  "../src/server/storefront/addon-validation.ts"
);

const KARACHI = "Asia/Karachi";

function mondayHours({ openTime = "09:00", closeTime = "17:00", isClosed = false } = {}) {
  return [
    {
      dayOfWeek: "MONDAY",
      openTime,
      closeTime,
      isClosed,
    },
  ];
}

function everyDayHours({ openTime = "09:00", closeTime = "23:00" } = {}) {
  return [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ].map((dayOfWeek) => ({
    dayOfWeek,
    openTime,
    closeTime,
    isClosed: false,
  }));
}

describe("branch operating hours", () => {
  it("keeps legacy branches open when no hours are configured", () => {
    assert.equal(
      isWithinOperatingHours(undefined, KARACHI, new Date("2026-06-15T07:00:00.000Z")),
      true,
    );
  });

  it("detects whether a branch is inside regular same-day hours", () => {
    assert.equal(
      isWithinOperatingHours(
        mondayHours(),
        KARACHI,
        new Date("2026-06-15T07:00:00.000Z"),
      ),
      true,
    );
    assert.equal(
      isWithinOperatingHours(
        mondayHours(),
        KARACHI,
        new Date("2026-06-15T18:30:00.000Z"),
      ),
      false,
    );
  });

  it("supports overnight operating windows", () => {
    const hours = mondayHours({ openTime: "18:00", closeTime: "03:00" });

    assert.equal(
      isWithinOperatingHours(hours, KARACHI, new Date("2026-06-15T18:30:00.000Z")),
      true,
    );
    assert.equal(
      isWithinOperatingHours(hours, KARACHI, new Date("2026-06-15T21:30:00.000Z")),
      true,
    );
    assert.equal(
      isWithinOperatingHours(hours, KARACHI, new Date("2026-06-15T22:00:00.000Z")),
      false,
    );
    assert.equal(
      isWithinOperatingHours(hours, KARACHI, new Date("2026-06-15T07:00:00.000Z")),
      false,
    );
  });

  it("prioritizes temporary closures and paused accepting-orders state", () => {
    const branch = {
      isAcceptingOrders: true,
      isTemporarilyClosed: true,
      operatingHours: everyDayHours(),
    };

    assert.equal(
      getBranchOperationalStatus(branch, KARACHI, new Date("2026-06-15T07:00:00.000Z")),
      "closed",
    );

    assert.equal(
      getBranchOperationalStatus(
        { ...branch, isAcceptingOrders: false, isTemporarilyClosed: false },
        KARACHI,
        new Date("2026-06-15T07:00:00.000Z"),
      ),
      "paused",
    );
  });

  it("summarizes every-day and partial schedules clearly", () => {
    assert.deepEqual(formatOperatingHoursSummary(everyDayHours()), {
      hours: "09:00 - 23:00",
      label: "Every day",
    });

    assert.deepEqual(formatOperatingHoursSummary(mondayHours()), {
      hours: "09:00 - 17:00",
      label: "Monday",
    });

    assert.deepEqual(formatOperatingHoursSummary([]), {
      hours: "-",
      label: "Closed",
    });
  });
});

describe("Pakistan phone normalization", () => {
  it("normalizes common local and international phone formats", () => {
    assert.equal(normalizePakistanPhone("0301-1417221"), "+923011417221");
    assert.equal(normalizePakistanPhone("92 301 1417221"), "+923011417221");
    assert.equal(normalizePakistanPhone("0092 301 1417221"), "+923011417221");
    assert.equal(normalizePakistanPhone("+92 301 1417221"), "+923011417221");
  });

  it("keeps empty input empty and prefixes bare local mobile numbers", () => {
    assert.equal(normalizePakistanPhone(""), "");
    assert.equal(normalizePakistanPhone("3011417221"), "+923011417221");
  });
});

describe("storefront order access tokens", () => {
  const order = {
    orderId: "order-1",
    orderNumber: "NC-TEST-1",
    customerPhone: "+923011417221",
  };

  it("verifies a token generated for the same order and customer phone", () => {
    const token = signStorefrontOrderAccessToken(order);

    assert.equal(
      verifyStorefrontOrderAccessToken({
        ...order,
        token,
      }),
      true,
    );
  });

  it("rejects missing, mismatched, or tampered order access tokens", () => {
    const token = signStorefrontOrderAccessToken(order);

    assert.equal(verifyStorefrontOrderAccessToken({ ...order, token: null }), false);
    assert.equal(
      verifyStorefrontOrderAccessToken({
        ...order,
        customerPhone: "+923001111111",
        token,
      }),
      false,
    );
    assert.equal(
      verifyStorefrontOrderAccessToken({
        ...order,
        token: `${token}tampered`,
      }),
      false,
    );
  });
});

describe("storefront add-on selection validation", () => {
  const addonGroups = [
    {
      id: "required-group",
      name: "Sauce choice",
      isRequired: true,
      minSelect: 0,
      maxSelect: 1,
      addons: [
        { id: "garlic", price: 30 },
        { id: "chipotle", price: 40 },
      ],
    },
    {
      id: "optional-group",
      name: "Extras",
      isRequired: false,
      minSelect: 0,
      maxSelect: 0,
      addons: [
        { id: "cheese", price: 50 },
        { id: "nuts", price: 80 },
      ],
    },
  ];

  it("requires at least one selection for required groups even when minSelect is zero", () => {
    assert.throws(
      () =>
        resolveSelectedAddons({
          addonGroups,
          addonIds: ["cheese"],
          productName: "Chocolate Mystery",
        }),
      /requires Sauce choice/,
    );
  });

  it("rejects duplicate add-on ids before calculating totals", () => {
    assert.throws(
      () =>
        resolveSelectedAddons({
          addonGroups,
          addonIds: ["garlic", "cheese", "cheese"],
          productName: "Chocolate Mystery",
        }),
      /Duplicate add-ons/,
    );
  });

  it("treats maxSelect zero as all options allowed and enforces positive maxSelect", () => {
    const selected = resolveSelectedAddons({
      addonGroups,
      addonIds: ["garlic", "cheese", "nuts"],
      productName: "Chocolate Mystery",
    });

    assert.deepEqual(
      selected.map((match) => match.addon.id),
      ["garlic", "cheese", "nuts"],
    );

    assert.throws(
      () =>
        resolveSelectedAddons({
          addonGroups,
          addonIds: ["garlic", "chipotle"],
          productName: "Chocolate Mystery",
        }),
      /allows only 1 option/,
    );
  });
});
