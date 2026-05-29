export const ADMIN_NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Operations overview",
  },
  {
    href: "/admin/settings",
    label: "Restaurant",
    description: "Identity and controls",
  },
  {
    href: "/admin/branches",
    label: "Branches",
    description: "Locations and hours",
  },
  {
    href: "/admin/whatsapp",
    label: "WhatsApp",
    description: "Routing and provider setup",
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
