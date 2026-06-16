"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useDashboardRangeSession } from "@/hooks/use-dashboard-range-session";

export function PersistentDashboardLink({
  children,
  className,
  prefetch = false,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href"> & {
  children: ReactNode;
}) {
  const { dashboardHref } = useDashboardRangeSession();

  return (
    <Link {...props} className={className} href={dashboardHref} prefetch={prefetch}>
      {children}
    </Link>
  );
}
