export const ADMIN_NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Operations overview",
    matchPrefixes: ["/admin"],
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description: "Order review, status history, and WhatsApp logs",
    matchPrefixes: ["/admin/orders"],
  },
  {
    href: "/admin/catalog",
    label: "Catalog",
    description: "Categories, products, variations, and add-ons",
    matchPrefixes: ["/admin/catalog"],
    children: [
      {
        href: "/admin/catalog",
        label: "Overview",
        matchExact: true,
      },
      {
        href: "/admin/catalog/categories",
        label: "Categories",
      },
      {
        href: "/admin/catalog/products",
        label: "Products",
      },
      {
        href: "/admin/catalog/settings",
        label: "Settings",
      },
    ],
  },
  {
    href: "/admin/branches",
    label: "Branches",
    description: "Branch operations, hours, and delivery",
    matchPrefixes: ["/admin/branches"],
    children: [
      {
        href: "/admin/branches",
        label: "Branch management",
        matchExact: true,
      },
      {
        href: "/admin/branches/delivery",
        label: "Delivery",
      },
      {
        href: "/admin/branches/settings",
        label: "Settings",
      },
    ],
  },
  {
    href: "/admin/customers",
    label: "Customers",
    description: "Guest customer records",
    matchPrefixes: ["/admin/customers"],
  },
  {
    href: "/admin/settings",
    label: "Settings",
    description: "Restaurant and NapCart setup",
    matchPrefixes: ["/admin/settings", "/admin/whatsapp"],
  },
] as const;

export const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const DAY_LABELS: Record<(typeof DAY_ORDER)[number], string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};
