"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { AdminAccountPanel } from "@/components/admin/admin-account-panel";
import { Button } from "@/components/ui/button";
import {
  isSameDashboardRange,
  useDashboardRangeSession,
  writeStoredDashboardRange,
} from "@/hooks/use-dashboard-range-session";
import {
  DASHBOARD_DATE_PRESETS,
  formatDateRangeLabel,
  getPresetRange,
  resolveDashboardDateRange,
} from "@/lib/admin-dashboard-date-range";
import { cn } from "@/lib/utils";

export function AdminHeaderControls({
  adminEmail,
  adminName,
  restaurantLogoUrl,
  restaurantName,
  restaurantSlug,
}: {
  adminEmail: string;
  adminName: string;
  restaurantLogoUrl: string | null;
  restaurantName: string;
  restaurantSlug: string;
}) {
  const pathname = usePathname();
  const isDashboardRoute = pathname === "/admin";

  return (
    <div className="flex items-center gap-2">
      {isDashboardRoute ? <DateRangeSelector /> : null}
      <ThemeModeToggle />
      <AdminAccountPanel
        adminEmail={adminEmail}
        adminName={adminName}
        restaurantLogoUrl={restaurantLogoUrl}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
        triggerVariant="header"
      />
    </div>
  );
}

function ThemeModeToggle() {
  React.useEffect(() => {
    const storedTheme = localStorage.getItem("napcart-theme");
    const shouldUseDark = storedTheme === "dark";

    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  function toggleTheme() {
    const nextValue = !document.documentElement.classList.contains("dark");

    document.documentElement.classList.toggle("dark", nextValue);
    localStorage.setItem("napcart-theme", nextValue ? "dark" : "light");
  }

  return (
    <Button
      aria-label="Toggle dark mode"
      className="size-8 border-[var(--admin-primary-border)] bg-background text-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)]"
      size="icon"
      type="button"
      variant="outline"
      onClick={toggleTheme}
    >
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
    </Button>
  );
}

function DateRangeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { storedRange } = useDashboardRangeSession();
  const [open, setOpen] = React.useState(false);
  const hasExplicitRange =
    searchParams.has("range") &&
    searchParams.has("from") &&
    searchParams.has("to");
  const resolvedRange = resolveDashboardDateRange({
    range: searchParams.get("range") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });
  const currentRange = resolvedRange.key;
  const currentFrom = resolvedRange.from;
  const currentTo = resolvedRange.to;
  const [customFrom, setCustomFrom] = React.useState(currentFrom);
  const [customTo, setCustomTo] = React.useState(currentTo);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  React.useEffect(() => {
    if (!hasExplicitRange) {
      return;
    }

    const currentValue = {
      range: currentRange,
      from: currentFrom,
      to: currentTo,
    };

    if (!isSameDashboardRange(storedRange, currentValue)) {
      writeStoredDashboardRange(currentValue);
    }
  }, [currentFrom, currentRange, currentTo, hasExplicitRange, storedRange]);

  const selectedPreset = DASHBOARD_DATE_PRESETS.find(
    (item) => item.key === currentRange,
  );
  const label =
    selectedPreset?.label ?? formatDateRangeLabel(currentFrom, currentTo);

  function applyRange(range: string, from: string, to: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    params.set("from", from);
    params.set("to", to);
    writeStoredDashboardRange({
      range,
      from,
      to,
    });
    setCustomFrom(from);
    setCustomTo(to);
    router.replace(`/admin?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div ref={popoverRef} className="relative">
      <Button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="h-8 min-w-32 justify-between gap-2 px-2.5"
        size="sm"
        type="button"
        variant="outline"
        onClick={() =>
          setOpen((value) => {
            const nextValue = !value;

            if (nextValue) {
              setCustomFrom(currentFrom);
              setCustomTo(currentTo);
            }

            return nextValue;
          })
        }
      >
        <CalendarDays className="size-3.5" aria-hidden="true" />
        <span className="truncate">{label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </Button>

      {open ? (
        <div
          className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
          role="dialog"
          aria-label="Dashboard date range"
        >
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">Dashboard date range</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Select the reporting period for dashboard stats.
            </p>
          </div>

          <div className="grid gap-1 p-2">
            {DASHBOARD_DATE_PRESETS.map((preset) => {
              const range = getPresetRange(preset.key);
              const isSelected = currentRange === preset.key;

              return (
                <button
                  className={cn(
                    "flex h-9 items-center justify-between rounded-lg px-2.5 text-left text-sm transition hover:bg-muted",
                    isSelected && "bg-muted font-medium",
                  )}
                  key={preset.key}
                  type="button"
                  onClick={() => applyRange(preset.key, range.from, range.to)}
                >
                  <span>{preset.label}</span>
                  {isSelected ? <Check className="size-4" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>

          <div className="border-t p-4">
            <p className="text-sm font-medium">Custom date range</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                From
                <input
                  className="h-9 rounded-lg border bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  max={customTo}
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                To
                <input
                  className="h-9 rounded-lg border bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  min={customFrom}
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                />
              </label>
            </div>
            <Button
              className="mt-3 w-full"
              size="sm"
              type="button"
              onClick={() => applyRange("custom", customFrom, customTo)}
            >
              Apply custom range
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
