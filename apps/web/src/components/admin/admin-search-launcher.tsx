"use client";

import * as React from "react";
import {
  Building2,
  Command,
  MapPinned,
  MessageCircleMore,
  ReceiptText,
  Search,
  Settings2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardRangeSession } from "@/hooks/use-dashboard-range-session";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBranch = {
  id: string;
  name: string;
  isActive: boolean;
  isAcceptingOrders: boolean;
  isTemporarilyClosed: boolean;
};

type SearchItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const baseSearchItems: SearchItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Open the NapCart operations overview.",
    href: "/admin",
    icon: Building2,
  },
  {
    id: "settings",
    label: "Restaurant settings",
    description: "Edit restaurant profile and master configuration.",
    href: "/admin/settings",
    icon: Settings2,
  },
  {
    id: "orders",
    label: "Orders",
    description: "Review order status, customer details, and WhatsApp logs.",
    href: "/admin/orders",
    icon: ReceiptText,
  },
  {
    id: "branches",
    label: "Branches",
    description: "Manage branch hours and branch-level operations.",
    href: "/admin/branches",
    icon: MapPinned,
  },
  {
    id: "whatsapp",
    label: "WhatsApp routing",
    description: "Manage default and branch-specific WhatsApp routes.",
    href: "/admin/whatsapp",
    icon: MessageCircleMore,
  },
  {
    id: "customers",
    label: "Customers",
    description: "Open the guest customer directory.",
    href: "/admin/customers",
    icon: UsersRound,
  },
];

export function AdminSearchLauncher({
  branches,
}: {
  branches: SearchBranch[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { dashboardHref } = useDashboardRangeSession();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const branchItems = React.useMemo<SearchItem[]>(
    () =>
      branches.map((branch) => ({
        id: branch.id,
        label: branch.name,
        description: branch.isTemporarilyClosed
          ? "Branch is temporarily closed."
          : branch.isAcceptingOrders
            ? "Branch is accepting orders."
            : "Branch is currently paused.",
        href: "/admin/branches",
        icon: MapPinned,
      })),
    [branches],
  );

  const filteredItems = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const items = [...baseSearchItems, ...branchItems];

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      `${item.label} ${item.description}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [branchItems, query]);

  function navigateTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href === "/admin" ? dashboardHref : href);
  }

  const trimmedQuery = query.trim();

  return (
    <>
      <button
        className="bg-background text-muted-foreground hover:bg-muted inline-flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border px-2.5 text-sm transition sm:min-w-64 md:flex-none"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" aria-hidden="true" />
        <span>Search</span>
        <kbd className="bg-muted ml-auto hidden rounded border px-1.5 text-[10px] font-medium sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-xl" side="top">
          <SheetHeader className="border-border border-b px-6 py-5">
            <SheetTitle>Search NapCart admin</SheetTitle>
            <SheetDescription>
              Jump to settings, open branch operations, or search orders and
              customer records.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-6 pb-6">
            <div className="relative mt-2">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                autoFocus
                className="h-11 rounded-xl pl-9"
                placeholder="Search pages, branches, or customers..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            {trimmedQuery ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  className="border-border bg-card hover:bg-muted flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition"
                  type="button"
                  onClick={() =>
                    navigateTo(
                      `/admin/orders?q=${encodeURIComponent(trimmedQuery)}`,
                    )
                  }
                >
                  <span className="bg-background mt-0.5 flex size-9 items-center justify-center rounded-lg border">
                    <ReceiptText className="text-muted-foreground size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block text-sm font-medium">
                      Search orders for “{trimmedQuery}”
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs leading-5">
                      Find order numbers, customers, phone numbers, or branches.
                    </span>
                  </span>
                </button>
                <button
                  className="border-border bg-card hover:bg-muted flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition"
                  type="button"
                  onClick={() =>
                    navigateTo(
                      `/admin/customers?q=${encodeURIComponent(trimmedQuery)}`,
                    )
                  }
                >
                  <span className="bg-background mt-0.5 flex size-9 items-center justify-center rounded-lg border">
                    <UsersRound className="text-muted-foreground size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block text-sm font-medium">
                      Search customers for “{trimmedQuery}”
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs leading-5">
                      Open the customer directory filtered by this search term.
                    </span>
                  </span>
                </button>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                Results
              </p>
              <div className="space-y-2">
                {filteredItems.length ? (
                  filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isCurrent =
                      item.href === "/admin"
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                      <button
                        key={item.id}
                        className={cn(
                          "border-border bg-card hover:bg-muted flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition",
                          isCurrent && "border-primary/30 bg-primary/5",
                        )}
                        type="button"
                        onClick={() => navigateTo(item.href)}
                      >
                        <span className="bg-background mt-0.5 flex size-9 items-center justify-center rounded-lg border">
                          <Icon className="text-muted-foreground size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-foreground block text-sm font-medium">
                            {item.label}
                          </span>
                          <span className="text-muted-foreground mt-1 block text-xs leading-5">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="border-border rounded-xl border border-dashed px-4 py-8 text-center">
                    <p className="text-foreground text-sm font-medium">
                      No matching results
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Try an order number, branch name, customer term, or
                      settings keyword.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/40 text-muted-foreground flex items-center justify-between rounded-xl px-4 py-3 text-xs">
              <span>Quick shortcut</span>
              <span className="bg-background inline-flex items-center gap-1 rounded-full border px-2 py-1">
                <Command className="size-3" /> + K
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
