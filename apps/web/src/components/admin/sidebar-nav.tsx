"use client";

import {
  Boxes,
  LayoutDashboard,
  ReceiptText,
  Settings2,
  Store,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardRangeSession } from "@/hooks/use-dashboard-range-session";
import { ADMIN_NAV_ITEMS } from "@/lib/constants/admin";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const sidebarMenuLinkClassName =
  "peer/menu-button group/menu-button flex h-12 w-full items-center gap-2.5 overflow-hidden rounded-[11px] px-3.5 text-left text-sm font-semibold ring-white/30 outline-hidden transition-[background,color,box-shadow] focus-visible:ring-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 [&_svg]:size-5 [&_svg]:shrink-0";

const ICONS: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Orders: ReceiptText,
  Branches: Store,
  Catalog: Boxes,
  Settings: Settings2,
  Customers: UsersRound,
};

export function SidebarNav() {
  const pathname = usePathname();
  const { dashboardHref } = useDashboardRangeSession();

  return (
    <SidebarGroup className="px-3">
      <SidebarGroupLabel className="mb-2.5 px-1 text-xs font-semibold text-white/45 group-data-[collapsible=icon]:sr-only">
        Operations
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = item.matchPrefixes.some((prefix) =>
              prefix === "/admin"
                ? pathname === prefix
                : pathname.startsWith(prefix),
            );
            const Icon = ICONS[item.label];
            const children = "children" in item ? item.children : undefined;

            return (
              <SidebarMenuItem className="space-y-1.5" key={item.href}>
                <Link
                  className={cn(
                    sidebarMenuLinkClassName,
                    isActive
                      ? "!bg-white !text-[#111] shadow-[0_18px_34px_rgba(0,0,0,0.28)]"
                      : "!text-white/80 hover:bg-white/10 hover:!text-white",
                  )}
                  data-sidebar="menu-button"
                  data-size="default"
                  data-slot="sidebar-menu-button"
                  href={item.href === "/admin" ? dashboardHref : item.href}
                >
                  <Icon aria-hidden="true" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                </Link>
                {children && isActive ? (
                  <div className="ml-5 grid gap-1 border-l border-white/10 pl-3.5 group-data-[collapsible=icon]:hidden">
                    {children.map((child) => {
                      const childActive =
                        "matchExact" in child && child.matchExact
                          ? pathname === child.href
                          : pathname.startsWith(child.href);

                      return (
                        <Link
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-white/62 transition hover:bg-white/10 hover:text-white",
                            childActive && "!bg-white/15 !text-white",
                          )}
                          href={child.href}
                          key={child.href}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
