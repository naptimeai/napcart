"use client";

import * as React from "react";

type StoredDashboardRange = {
  range: string;
  from: string;
  to: string;
};

const DASHBOARD_RANGE_EVENT = "napcart-dashboard-range-change";
let currentStoredDashboardRange: StoredDashboardRange | null = null;

function isStoredDashboardRange(value: unknown): value is StoredDashboardRange {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.range === "string" &&
    typeof candidate.from === "string" &&
    typeof candidate.to === "string"
  );
}

export function readStoredDashboardRange(): StoredDashboardRange | null {
  return currentStoredDashboardRange;
}

export function writeStoredDashboardRange(value: StoredDashboardRange) {
  if (typeof window === "undefined") {
    return;
  }

  currentStoredDashboardRange = isStoredDashboardRange(value) ? value : null;
  window.dispatchEvent(new Event(DASHBOARD_RANGE_EVENT));
}

export function buildDashboardHref(
  storedRange: StoredDashboardRange | null,
  pathname = "/admin",
) {
  if (!storedRange) {
    return pathname;
  }

  const params = new URLSearchParams();
  params.set("range", storedRange.range);
  params.set("from", storedRange.from);
  params.set("to", storedRange.to);

  return `${pathname}?${params.toString()}`;
}

export function isSameDashboardRange(
  left: StoredDashboardRange | null,
  right: StoredDashboardRange | null,
) {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.range === right.range &&
    left.from === right.from &&
    left.to === right.to
  );
}

function subscribeToDashboardRange(callback: () => void) {
  window.addEventListener(DASHBOARD_RANGE_EVENT, callback);

  return () => {
    window.removeEventListener(DASHBOARD_RANGE_EVENT, callback);
  };
}

function getDashboardRangeSnapshot() {
  return readStoredDashboardRange();
}

function getServerSnapshot() {
  return null;
}

export function useDashboardRangeSession() {
  const storedRange = React.useSyncExternalStore(
    subscribeToDashboardRange,
    getDashboardRangeSnapshot,
    getServerSnapshot,
  );

  return {
    storedRange,
    dashboardHref: buildDashboardHref(storedRange),
  };
}
