export type DashboardDateRangeKey =
  | "today"
  | "yesterday"
  | "last-7-days"
  | "last-30-days"
  | "last-3-months"
  | "last-6-months"
  | "last-12-months"
  | "custom";

export type DashboardDateRange = {
  key: DashboardDateRangeKey;
  label: string;
  from: string;
  to: string;
  fromDate: Date;
  toDateExclusive: Date;
};

export const DASHBOARD_DATE_PRESETS: Array<{
  key: Exclude<DashboardDateRangeKey, "custom">;
  label: string;
  days: number;
}> = [
  { key: "today", label: "Today", days: 0 },
  { key: "yesterday", label: "Yesterday", days: 1 },
  { key: "last-7-days", label: "Last 7 Days", days: 6 },
  { key: "last-30-days", label: "Last 30 Days", days: 29 },
  { key: "last-3-months", label: "Last 3 months", days: 89 },
  { key: "last-6-months", label: "Last 6 months", days: 179 },
  { key: "last-12-months", label: "Last 12 months", days: 364 },
];

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dateKeyToStartOfDay(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`);
}

export function dateKeyToNextDay(dateKey: string) {
  const date = dateKeyToStartOfDay(dateKey);
  date.setDate(date.getDate() + 1);

  return date;
}

export function getPresetRange(
  key: DashboardDateRangeKey = "today",
  today = new Date(),
) {
  const preset =
    DASHBOARD_DATE_PRESETS.find((item) => item.key === key) ??
    DASHBOARD_DATE_PRESETS[0];
  const end = new Date(today);
  const start = new Date(today);

  if (preset.key === "yesterday") {
    start.setDate(today.getDate() - 1);
    end.setDate(today.getDate() - 1);
  } else {
    start.setDate(today.getDate() - preset.days);
  }

  return {
    key: preset.key,
    label: preset.label,
    from: toDateKey(start),
    to: toDateKey(end),
  };
}

export function formatDateRangeLabel(from: string, to: string) {
  const fromDate = dateKeyToStartOfDay(from);
  const toDate = dateKeyToStartOfDay(to);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: fromDate.getFullYear() === toDate.getFullYear() ? undefined : "numeric",
  });

  if (from === to) {
    return formatter.format(fromDate);
  }

  return `${formatter.format(fromDate)} - ${formatter.format(toDate)}`;
}

function isValidDateKey(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(dateKeyToStartOfDay(value).getTime());
}

export function resolveDashboardDateRange(params?: {
  range?: string | string[];
  from?: string | string[];
  to?: string | string[];
}) {
  const rangeValue = Array.isArray(params?.range)
    ? params?.range[0]
    : params?.range;
  const fromValue = Array.isArray(params?.from) ? params?.from[0] : params?.from;
  const toValue = Array.isArray(params?.to) ? params?.to[0] : params?.to;
  const preset = getPresetRange(rangeValue as DashboardDateRangeKey);
  const isCustom = rangeValue === "custom";
  const from = isCustom && isValidDateKey(fromValue) ? fromValue : preset.from;
  const to = isCustom && isValidDateKey(toValue) ? toValue : preset.to;
  const safeFrom = from <= to ? from : to;
  const safeTo = from <= to ? to : from;

  return {
    key: isCustom ? "custom" : preset.key,
    label: isCustom ? formatDateRangeLabel(safeFrom, safeTo) : preset.label,
    from: safeFrom,
    to: safeTo,
    fromDate: dateKeyToStartOfDay(safeFrom),
    toDateExclusive: dateKeyToNextDay(safeTo),
  } satisfies DashboardDateRange;
}
