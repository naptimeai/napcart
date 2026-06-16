import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AdminAccountPanel } from "@/components/admin/admin-account-panel";
import { AdminHeaderControls } from "@/components/admin/header-controls";
import { AdminSearchLauncher } from "@/components/admin/admin-search-launcher";
import { PersistentDashboardLink } from "@/components/admin/persistent-dashboard-link";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getAdminSearchIndex } from "@/server/repositories/restaurant-admin";

const sidebarMenuLinkClassName =
  "peer/menu-button group/menu-button flex w-full items-center gap-3 overflow-hidden rounded-[14px] p-3 text-left text-sm ring-white/30 outline-hidden transition-[width,height,padding,background,color] hover:bg-white/10 focus-visible:ring-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 [&>span:last-child]:truncate";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const session = await requireAdminSession();
  const searchBranches = await getAdminSearchIndex(session.restaurantId);

  return (
    <TooltipProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 60)",
            "--sidebar-width-icon": "calc(var(--spacing) * 22)",
          } as React.CSSProperties
        }
      >
        <Sidebar
          className="border-r-0 [&_[data-sidebar=sidebar]]:bg-[#101111] [&_[data-sidebar=sidebar]]:text-white"
          variant="inset"
          collapsible="icon"
        >
          <SidebarHeader className="px-4 pt-7">
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <PersistentDashboardLink
                  className={`${sidebarMenuLinkClassName} min-h-14 text-white hover:text-white`}
                  data-sidebar="menu-button"
                  data-size="lg"
                  data-slot="sidebar-menu-button"
                  prefetch={false}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black tracking-tight text-[#111]">
                    N
                  </span>
                  <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="block text-[21px] font-semibold tracking-normal text-white">
                      NapCart
                    </span>
                    <span className="block truncate text-sm text-white/55">
                      Restaurant OS
                    </span>
                  </div>
                </PersistentDashboardLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent className="pt-5">
            <SidebarNav />
          </SidebarContent>

          <SidebarFooter className="px-4 pb-7">
            <div className="group-data-[collapsible=icon]:hidden">
              <AdminAccountPanel
                adminEmail={session.adminEmail}
                adminName={session.adminName}
                restaurantLogoUrl={session.restaurantLogoUrl}
                restaurantName={session.restaurantName}
                restaurantSlug={session.restaurantSlug}
                triggerVariant="sidebar-expanded"
              />
            </div>
            <div className="hidden justify-center group-data-[collapsible=icon]:flex">
              <AdminAccountPanel
                adminEmail={session.adminEmail}
                adminName={session.adminName}
                restaurantLogoUrl={session.restaurantLogoUrl}
                restaurantName={session.restaurantName}
                restaurantSlug={session.restaurantSlug}
                triggerVariant="sidebar-collapsed"
              />
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="min-w-0 min-h-svh bg-[#f3f3f1] peer-data-[variant=inset]:border-0">
          <div className="flex min-h-svh flex-col gap-4 p-3 md:p-4">
            <header className="sticky top-3 z-30 flex min-h-16 flex-col gap-3 rounded-[22px] border border-[#e5e5df] bg-white/95 px-4 py-3 shadow-[0_18px_50px_rgba(16,18,16,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="flex w-full min-w-0 items-center gap-3 md:w-auto">
                <SidebarTrigger className="size-10 rounded-[14px] border border-[#deded8] bg-[#f7f7f3] text-[#111] hover:bg-[#efefea]" />
                <AdminSearchLauncher branches={searchBranches} />
              </div>
              <AdminHeaderControls
                adminEmail={session.adminEmail}
                adminName={session.adminName}
                restaurantLogoUrl={session.restaurantLogoUrl}
                restaurantName={session.restaurantName}
                restaurantSlug={session.restaurantSlug}
              />
            </header>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
